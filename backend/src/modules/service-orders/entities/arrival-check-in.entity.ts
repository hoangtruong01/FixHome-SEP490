// src/modules/service-orders/entities/arrival-check-in.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CheckInResult } from '../../../shared/enums';

@Entity('arrival_check_ins')
export class ArrivalCheckIn extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lng: number;

  @Column({ name: 'accuracy_meters', type: 'decimal', precision: 8, scale: 2 })
  accuracyMeters: number;

  @Column({ name: 'distance_meters', type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceMeters?: number | null;

  @Column({ type: 'enum', enum: CheckInResult })
  result: CheckInResult;

  @Column({ name: 'checked_in_at', type: 'timestamptz', default: () => 'now()' })
  checkedInAt: Date;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo?: Record<string, unknown> | null;
}
