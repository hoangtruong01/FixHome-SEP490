// src/shared/enums/service-order-status.enum.ts
export enum ServiceOrderStatus {
  ACCEPTED = 'accepted',
  EN_ROUTE = 'en_route',
  UNDER_REPAIR = 'under_repair',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Spec v1.2 Canonical Transitions:
// ACCEPTED → EN_ROUTE | CANCELLED
// EN_ROUTE → UNDER_REPAIR | CANCELLED
// UNDER_REPAIR → COMPLETED | CANCELLED
// COMPLETED → (terminal)
// CANCELLED → (terminal)
