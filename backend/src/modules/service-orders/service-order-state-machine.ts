// src/modules/service-orders/service-order-state-machine.ts
import { ServiceOrderStatus, Role } from '../../shared/enums';

export class ServiceOrderStateMachine {
  /**
   * Base lifecycle state transitions allowed by the system:
   * PENDING_CONFIRMATION -> ACCEPTED, CANCELLED
   * ACCEPTED -> EN_ROUTE, CANCELLED
   * EN_ROUTE -> UNDER_REPAIR
   * UNDER_REPAIR -> COMPLETED
   * COMPLETED -> (terminal)
   * CANCELLED -> (terminal)
   */
  private static readonly TRANSITIONS: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
    [ServiceOrderStatus.PENDING_CONFIRMATION]: [
      ServiceOrderStatus.ACCEPTED,
      ServiceOrderStatus.CANCELLED,
    ],
    [ServiceOrderStatus.ACCEPTED]: [
      ServiceOrderStatus.EN_ROUTE,
      ServiceOrderStatus.CANCELLED,
    ],
    [ServiceOrderStatus.EN_ROUTE]: [
      ServiceOrderStatus.UNDER_REPAIR,
    ],
    [ServiceOrderStatus.UNDER_REPAIR]: [
      ServiceOrderStatus.COMPLETED,
    ],
    [ServiceOrderStatus.COMPLETED]: [],
    [ServiceOrderStatus.CANCELLED]: [],
  };

  /**
   * Role-based permissions for state transitions:
   * - CUSTOMER: can cancel pending or accepted orders
   * - TECHNICIAN: can progress order (ACCEPTED -> EN_ROUTE -> UNDER_REPAIR -> COMPLETED)
   * - SERVICE_MANAGER / ADMIN: can accept, cancel, or progress
   */
  private static readonly ROLE_TRANSITIONS: Record<
    Role,
    Partial<Record<ServiceOrderStatus, ServiceOrderStatus[]>>
  > = {
    [Role.CUSTOMER]: {
      [ServiceOrderStatus.PENDING_CONFIRMATION]: [ServiceOrderStatus.CANCELLED],
      [ServiceOrderStatus.ACCEPTED]: [ServiceOrderStatus.CANCELLED],
    },
    [Role.TECHNICIAN]: {
      [ServiceOrderStatus.ACCEPTED]: [ServiceOrderStatus.EN_ROUTE],
      [ServiceOrderStatus.EN_ROUTE]: [ServiceOrderStatus.UNDER_REPAIR],
      [ServiceOrderStatus.UNDER_REPAIR]: [ServiceOrderStatus.COMPLETED],
    },
    [Role.SERVICE_MANAGER]: {
      [ServiceOrderStatus.PENDING_CONFIRMATION]: [
        ServiceOrderStatus.ACCEPTED,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.ACCEPTED]: [
        ServiceOrderStatus.EN_ROUTE,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.EN_ROUTE]: [ServiceOrderStatus.UNDER_REPAIR],
      [ServiceOrderStatus.UNDER_REPAIR]: [ServiceOrderStatus.COMPLETED],
    },
    [Role.ADMIN]: {
      [ServiceOrderStatus.PENDING_CONFIRMATION]: [
        ServiceOrderStatus.ACCEPTED,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.ACCEPTED]: [
        ServiceOrderStatus.EN_ROUTE,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.EN_ROUTE]: [ServiceOrderStatus.UNDER_REPAIR],
      [ServiceOrderStatus.UNDER_REPAIR]: [ServiceOrderStatus.COMPLETED],
    },
  };

  /**
   * Validate if a state transition is permitted.
   * @param currentStatus Current status of the service order
   * @param nextStatus Desired next status
   * @param role Optional role executing the transition
   * @returns boolean
   */
  static canTransition(
    currentStatus: ServiceOrderStatus,
    nextStatus: ServiceOrderStatus,
    role?: Role,
  ): boolean {
    if (!currentStatus || !nextStatus) {
      return false;
    }

    if (currentStatus === nextStatus) {
      return false;
    }

    // 1. General lifecycle validation
    const allowedNext = this.TRANSITIONS[currentStatus] || [];
    const isGenerallyAllowed = allowedNext.includes(nextStatus);

    if (!isGenerallyAllowed) {
      return false;
    }

    // 2. Role-specific validation if role is provided
    if (role) {
      const roleAllowed = this.ROLE_TRANSITIONS[role]?.[currentStatus] || [];
      return roleAllowed.includes(nextStatus);
    }

    return true;
  }

  /**
   * Get all allowed next states from the current status.
   */
  static getAllowedNextStates(
    currentStatus: ServiceOrderStatus,
    role?: Role,
  ): ServiceOrderStatus[] {
    if (!currentStatus) {
      return [];
    }

    if (role) {
      return this.ROLE_TRANSITIONS[role]?.[currentStatus] || [];
    }

    return this.TRANSITIONS[currentStatus] || [];
  }
}
