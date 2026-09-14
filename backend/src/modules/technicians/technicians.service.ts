// src/modules/technicians/technicians.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechnicianProfile } from './entities/technician-profile.entity';
import { TechnicianSkill } from './entities/technician-skill.entity';

export interface UpdateSkillPricingDto {
  listedLaborPrice?: number;
  typicalWarrantyDays?: number;
  level?: string;
  isActive?: boolean;
}

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(TechnicianProfile)
    private readonly profileRepo: Repository<TechnicianProfile>,
    @InjectRepository(TechnicianSkill)
    private readonly skillRepo: Repository<TechnicianSkill>,
  ) {}

  async getMyProfile(userId: string): Promise<TechnicianProfile> {
    let profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['skills', 'skills.service', 'serviceAreas'],
    });

    if (!profile) {
      profile = this.profileRepo.create({
        userId,
        isAvailable: true,
      });
      profile = await this.profileRepo.save(profile);
    }
    return profile;
  }

  async updateMyProfile(
    userId: string,
    dto: { bio?: string; isAvailable?: boolean; yearsExperience?: number },
  ): Promise<TechnicianProfile> {
    const profile = await this.getMyProfile(userId);
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.isAvailable !== undefined) profile.isAvailable = dto.isAvailable;
    if (dto.yearsExperience !== undefined) profile.yearsExperience = dto.yearsExperience;
    return this.profileRepo.save(profile);
  }

  async getMySkills(userId: string): Promise<TechnicianSkill[]> {
    const profile = await this.getMyProfile(userId);
    return this.skillRepo.find({
      where: { technicianId: profile.id },
      relations: ['service'],
    });
  }

  async setSkillPricing(
    userId: string,
    serviceId: string,
    dto: UpdateSkillPricingDto,
  ): Promise<TechnicianSkill> {
    const profile = await this.getMyProfile(userId);

    let skill = await this.skillRepo.findOne({
      where: { technicianId: profile.id, serviceId },
    });

    if (!skill) {
      skill = this.skillRepo.create({
        technicianId: profile.id,
        serviceId,
        level: dto.level || 'INTERMEDIATE',
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      });
    }

    if (dto.listedLaborPrice !== undefined) skill.listedLaborPrice = dto.listedLaborPrice;
    if (dto.typicalWarrantyDays !== undefined) skill.typicalWarrantyDays = dto.typicalWarrantyDays;
    if (dto.level !== undefined) skill.level = dto.level;
    if (dto.isActive !== undefined) skill.isActive = dto.isActive;

    return this.skillRepo.save(skill);
  }
}
