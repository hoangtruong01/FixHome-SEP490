// src/shared/enums/service-order-status.enum.ts
export enum ServiceOrderStatus {
  PENDING_CONFIRMATION = 'pending_confirmation',
  ACCEPTED = 'accepted',
  EN_ROUTE = 'en_route',
  UNDER_REPAIR = 'under_repair',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// TODO: Implement state machine validation in ServiceOrdersService
// Valid transitions:
// PENDING_CONFIRMATION → ACCEPTED | CANCELLED
// ACCEPTED → EN_ROUTE | CANCELLED
// EN_ROUTE → UNDER_REPAIR | CANCELLED
// UNDER_REPAIR → COMPLETED | CANCELLED
// COMPLETED → (terminal)
// CANCELLED → (terminal)
