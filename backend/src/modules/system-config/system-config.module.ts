// src/modules/system-config/system-config.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { BusinessConfigService } from './business-config.service';

/**
 * Global module so that any service can inject BusinessConfigService
 * without importing SystemConfigModule explicitly.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  providers: [BusinessConfigService],
  exports: [BusinessConfigService],
})
export class SystemConfigModule {}
