// src/modules/service-areas/service-areas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceAreasController } from './service-areas.controller';
import { ServiceAreasService } from './service-areas.service';
import { ServiceArea } from './entities/service-area.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceArea]),
    AuditLogModule,
    RbacModule,
  ],
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
  exports: [ServiceAreasService],
})
export class ServiceAreasModule {}
