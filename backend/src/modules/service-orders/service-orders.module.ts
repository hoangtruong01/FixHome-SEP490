// src/modules/service-orders/service-orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrder } from './entities/service-order.entity';
import { TechnicianAssignment } from './entities/technician-assignment.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ArrivalCheckIn } from './entities/arrival-check-in.entity';
import { RepairEvidence } from './entities/repair-evidence.entity';
import { Cancellation } from './entities/cancellation.entity';
import { CancellationStrike } from './entities/cancellation-strike.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { WarrantyCoverage } from './entities/warranty-coverage.entity';
import { AdditionalCostRequest } from './entities/additional-cost-request.entity';
import { AdditionalCostItem } from './entities/additional-cost-item.entity';
import { CashSettlement } from './entities/cash-settlement.entity';
import { CommissionDue } from './entities/commission-due.entity';
import { WarrantyClaim } from './entities/warranty-claim.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { QuotationItem } from '../quotations/entities/quotation-item.entity';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceOrder,
      TechnicianAssignment,
      OrderStatusHistory,
      ArrivalCheckIn,
      RepairEvidence,
      Cancellation,
      CancellationStrike,
      Invoice,
      InvoiceItem,
      WarrantyCoverage,
      AdditionalCostRequest,
      AdditionalCostItem,
      CashSettlement,
      CommissionDue,
      WarrantyClaim,
      Quotation,
      QuotationItem,
      User,
      TechnicianProfile,
    ]),
  ],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService],
  exports: [ServiceOrdersService],
})
export class ServiceOrdersModule {}
