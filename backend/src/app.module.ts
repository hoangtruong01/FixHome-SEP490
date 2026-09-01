// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

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

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    DatabaseModule,

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
  ],
})
export class AppModule {}
