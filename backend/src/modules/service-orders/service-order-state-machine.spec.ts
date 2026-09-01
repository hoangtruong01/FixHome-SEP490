// src/modules/service-orders/service-order-state-machine.spec.ts
import { describe, it, expect } from 'vitest';
import { ServiceOrderStateMachine } from './service-order-state-machine';
import { ServiceOrderStatus, Role } from '../../shared/enums';

describe('ServiceOrderStateMachine', () => {
  describe('Valid Lifecycle Transitions', () => {
    it('should allow PENDING_CONFIRMATION -> ACCEPTED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.PENDING_CONFIRMATION,
          ServiceOrderStatus.ACCEPTED,
        ),
      ).toBe(true);
    });

    it('should allow PENDING_CONFIRMATION -> CANCELLED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.PENDING_CONFIRMATION,
          ServiceOrderStatus.CANCELLED,
        ),
      ).toBe(true);
    });

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

    it('should allow UNDER_REPAIR -> COMPLETED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.UNDER_REPAIR,
          ServiceOrderStatus.COMPLETED,
        ),
      ).toBe(true);
    });
  });

  describe('Invalid Lifecycle Transitions (Must Fail)', () => {
    it('should reject PENDING_CONFIRMATION -> COMPLETED', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.PENDING_CONFIRMATION,
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

    it('should reject TECHNICIAN from transitioning PENDING_CONFIRMATION -> ACCEPTED directly', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.PENDING_CONFIRMATION,
          ServiceOrderStatus.ACCEPTED,
          Role.TECHNICIAN,
        ),
      ).toBe(false);
    });

    it('should allow CUSTOMER to cancel PENDING_CONFIRMATION order', () => {
      expect(
        ServiceOrderStateMachine.canTransition(
          ServiceOrderStatus.PENDING_CONFIRMATION,
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
