import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role, AccountStatus } from '../../shared/enums';
import { normalizePhone } from '../../shared/validation/input.transforms';
import { RbacService } from '../rbac/rbac.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokenRefreshResponseDto,
  UserProfileDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Optional() private readonly rbacService?: RbacService,
  ) {}

  private async getPermissions(role: string): Promise<string[]> {
    if (!this.rbacService) return [];
    return this.rbacService.getPermissionsForRole(role);
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const role = dto.role ?? Role.CUSTOMER;
    if (role !== Role.CUSTOMER)
      throw new BadRequestException(
        'Only Customer accounts can self-register. Technician accounts are created by Service Managers or Admin.',
      );
    const email = dto.email.toLowerCase().trim();
    const phoneNumber = dto.phoneNumber
      ? normalizePhone(dto.phoneNumber)
      : null;
    if (await this.userRepository.findOne({ where: { email } }))
      throw new ConflictException('Email is already registered');
    if (
      phoneNumber &&
      (await this.userRepository.findOne({ where: { phoneNumber } }))
    )
      throw new ConflictException('Phone number is already registered');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.userRepository.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const user = await users.save(
        users.create({
          email,
          phoneNumber,
          passwordHash,
          fullName: dto.fullName.trim(),
          role,
          status: AccountStatus.ACTIVE,
          isActive: true,
        }),
      );
      const tokens = await this.issueTokens(
        user,
        manager,
        'Registration Session',
      );
      const permissions = await this.getPermissions(user.role);
      return { ...tokens, user: UserProfileDto.fromUser(user, permissions) };
    });
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (
      dto.email &&
      dto.identifier &&
      dto.email.trim() !== dto.identifier.trim()
    )
      throw new BadRequestException('Use one login identifier');
    const identifier = (dto.identifier ?? dto.email)?.trim();
    if (!identifier)
      throw new BadRequestException('Login identifier is required');
    const user = await this.userRepository.findOne({
      where: [
        { email: identifier.toLowerCase() },
        { phoneNumber: normalizePhone(identifier) },
      ],
      select: ['id', 'passwordHash'],
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid email or password');
    return this.userRepository.manager.transaction(async (manager) => {
      const current = await this.lockActiveUser(manager, user.id);
      const tokens = await this.issueTokens(current, manager, dto.deviceInfo);
      const permissions = await this.getPermissions(current.role);
      return { ...tokens, user: UserProfileDto.fromUser(current, permissions) };
    });
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenRefreshResponseDto> {
    let payload: { sub: string; exp: number };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
      });
      if (typeof payload.sub !== 'string' || !Number.isFinite(payload.exp))
        throw new Error();
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const tokenHash = this.hashToken(dto.refreshToken);
    return this.userRepository.manager.transaction(async (manager) => {
      // Same lock order as login/status/logout prevents issuing a session after revocation.
      const user = await this.lockActiveUser(manager, payload.sub);
      const sessions = manager.getRepository(RefreshToken);
      const record = await sessions.findOne({
        where: { tokenHash, userId: user.id, isRevoked: false },
      });
      if (!record || record.expiresAt.getTime() <= Date.now())
        throw new UnauthorizedException('Refresh token is expired or revoked');
      const consumed = await sessions.update(
        { id: record.id, isRevoked: false },
        { isRevoked: true },
      );
      if (consumed.affected !== 1)
        throw new UnauthorizedException('Refresh token has already been used');
      return this.issueTokens(user, manager, record.deviceInfo);
    });
  }

  async logout(
    userId: string,
    refreshToken?: string,
  ): Promise<{ loggedOut: boolean }> {
    await this.userRepository.manager.transaction(async (manager) => {
      await manager
        .getRepository(User)
        .findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });
      await manager
        .getRepository(RefreshToken)
        .update(
          refreshToken
            ? { userId, tokenHash: this.hashToken(refreshToken) }
            : { userId, isRevoked: false },
          { isRevoked: true },
        );
    });
    return { loggedOut: true };
  }

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User does not exist');
    const permissions = await this.getPermissions(user.role);
    return UserProfileDto.fromUser(user, permissions);
  }

  private async lockActiveUser(
    manager: EntityManager,
    id: string,
  ): Promise<User> {
    const user = await manager
      .getRepository(User)
      .findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!user) throw new UnauthorizedException('User does not exist');
    if (user.status !== AccountStatus.ACTIVE || !user.isActive)
      throw new ForbiddenException('Account is locked or suspended');
    return user;
  }

  private async issueTokens(
    user: User,
    manager: EntityManager,
    deviceInfo?: string,
  ): Promise<TokenRefreshResponseDto> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN',
        ),
        algorithm: 'HS256',
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
        algorithm: 'HS256',
        jwtid: randomUUID(),
      },
    );
    const { exp } = this.jwtService.decode(refreshToken) as { exp: number };
    const sessions = manager.getRepository(RefreshToken);
    await sessions.save(
      sessions.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(exp * 1000),
        isRevoked: false,
        deviceInfo: deviceInfo || null,
      }),
    );
    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
