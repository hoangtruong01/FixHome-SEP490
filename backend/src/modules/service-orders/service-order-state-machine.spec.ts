// src/modules/service-orders/service-order-state-machine.spec.ts
import { describe, it, expect } from 'vitest';
import { ServiceOrderStateMachine } from './service-order-state-machine';
import { ServiceOrderStatus, Role } from '../../shared/enums';

describe('ServiceOrderStateMachine', () => {
  describe('Valid Lifecycle Transitions', () => {
    it('should allow ACCEPTED -> EN_ROUTE', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.EN_ROUTE,
        ),
      ).toBe(true);
    });

    it('should allow ACCEPTED -> CANCELLED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.CANCELLED,
        ),
      ).toBe(true);
    });

    it('should allow EN_ROUTE -> UNDER_REPAIR', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.EN_ROUTE,
          ServiceOrderStatus.UNDER_REPAIR,
        ),
      ).toBe(true);
    });

    it('should allow EN_ROUTE -> CANCELLED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.EN_ROUTE,
          ServiceOrderStatus.CANCELLED,
        ),
      ).toBe(true);
    });

    it('should allow UNDER_REPAIR -> COMPLETED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.UNDER_REPAIR,
          ServiceOrderStatus.COMPLETED,
        ),
      ).toBe(true);
    });

    it('should allow UNDER_REPAIR -> CANCELLED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.UNDER_REPAIR,
          ServiceOrderStatus.CANCELLED,
        ),
      ).toBe(true);
    });
  });

  describe('Invalid Lifecycle Transitions (Must Fail)', () => {
    it('should reject ACCEPTED -> COMPLETED directly', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.COMPLETED,
        ),
      ).toBe(false);
    });

    it('should reject COMPLETED -> UNDER_REPAIR', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.COMPLETED,
          ServiceOrderStatus.UNDER_REPAIR,
        ),
      ).toBe(false);
    });

    it('should reject CANCELLED -> ACCEPTED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.CANCELLED,
          ServiceOrderStatus.ACCEPTED,
        ),
      ).toBe(false);
    });

    it('should reject COMPLETED -> ACCEPTED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.COMPLETED,
          ServiceOrderStatus.ACCEPTED,
        ),
      ).toBe(false);
    });

    it('should reject same state transitions', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.ACCEPTED,
        ),
      ).toBe(false);
    });
  });

  describe('Role-based Validation', () => {
    it('should allow TECHNICIAN to transition ACCEPTED -> EN_ROUTE', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.EN_ROUTE,
          Role.TECHNICIAN,
        ),
      ).toBe(true);
    });

    it('should allow CUSTOMER to cancel ACCEPTED order', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.CANCELLED,
          Role.CUSTOMER,
        ),
      ).toBe(true);
    });

    it('should reject CUSTOMER from setting UNDER_REPAIR -> COMPLETED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.UNDER_REPAIR,
          ServiceOrderStatus.COMPLETED,
          Role.CUSTOMER,
        ),
      ).toBe(false);
    });
  });
});
