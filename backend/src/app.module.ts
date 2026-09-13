// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { validate } from './config';

// Phase 0 — Bootstrap infrastructure
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { TechnicianAssignmentModule } from './modules/technician-assignment/technician-assignment.module';
import { ServiceAreasModule } from './modules/service-areas/service-areas.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AiDiagnosisModule } from './modules/ai-diagnosis/ai-diagnosis.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { TechnicianVerificationsModule } from './modules/technician-verifications/technician-verifications.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),

    // Database
    DatabaseModule,

    // Phase 0 — Bootstrap infrastructure (global modules)
    SystemConfigModule,
    RbacModule,
    AuditLogModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TechniciansModule,
    TechnicianAssignmentModule,
    ServiceAreasModule,
    ServicesModule,
    BookingsModule,
    AiDiagnosisModule,
    ServiceOrdersModule,
    QuotationsModule,
    NotificationsModule,
    ReviewsModule,
    CategoriesModule,
    MediaModule,
    DashboardModule,
    HealthModule,
    TechnicianVerificationsModule,
  ],
})
export class AppModule {}

