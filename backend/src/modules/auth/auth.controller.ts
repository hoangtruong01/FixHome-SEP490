// src/modules/auth/auth.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

// TODO: Implement auth endpoints
// - POST /auth/register
// - POST /auth/login
// - POST /auth/refresh
// - GET  /auth/profile

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Placeholder – implement when auth feature is requested
}
