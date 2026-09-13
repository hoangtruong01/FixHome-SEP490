// tests/components.spec.ts
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import FhButton from '../src/components/FhButton.vue';
import FhStatusPill from '../src/components/FhStatusPill.vue';
import FhMoney from '../src/components/FhMoney.vue';
import FhCostBreakdown from '../src/components/FhCostBreakdown.vue';

describe('FixHome Base Components', () => {
  describe('FhButton', () => {
    it('renders with default primary variant and md size', () => {
      const wrapper = mount(FhButton, {
        slots: { default: 'Click Me' },
      });
      expect(wrapper.text()).toContain('Click Me');
      expect(wrapper.classes()).toContain('bg-brand-600');
      expect(wrapper.classes()).toContain('h-[44px]');
    });

    it('shows loading spinner and disables button when loading', () => {
      const wrapper = mount(FhButton, {
        props: { loading: true },
        slots: { default: 'Saving...' },
      });
      expect(wrapper.find('svg').exists()).toBe(true);
      expect(wrapper.attributes('disabled')).toBeDefined();
    });
  });

  describe('FhStatusPill', () => {
    it('maps UNDER_REPAIR to orange tint per P7.5 exception', () => {
      const wrapper = mount(FhStatusPill, {
        props: { status: 'UNDER_REPAIR' },
      });
      expect(wrapper.text()).toContain('Đang sửa chữa');
      expect(wrapper.classes()).toContain('bg-brand-50');
      expect(wrapper.classes()).toContain('text-brand-700');
    });

    it('maps COMPLETED to success-50 and success-600', () => {
      const wrapper = mount(FhStatusPill, {
        props: { status: 'COMPLETED' },
      });
      expect(wrapper.text()).toContain('Hoàn thành');
      expect(wrapper.classes()).toContain('bg-success-50');
      expect(wrapper.classes()).toContain('text-success-600');
    });
  });

  describe('FhMoney', () => {
    it('formats numbers with dots in Vietnamese currency style', () => {
      const wrapper = mount(FhMoney, {
        props: { amount: 1250000 },
      });
      expect(wrapper.text()).toContain('1.250.000');
      expect(wrapper.text()).toContain('₫');
    });

    it('supports emphasis prop for total values', () => {
      const wrapper = mount(FhMoney, {
        props: { amount: 500000, emphasis: true },
      });
      expect(wrapper.classes()).toContain('font-bold');
    });
  });

  describe('FhCostBreakdown', () => {
    it('renders labor and parts totals separately (D-02 requirement)', () => {
      const wrapper = mount(FhCostBreakdown, {
        props: {
          laborTotal: 200000,
          partsTotal: 300000,
        },
      });
      expect(wrapper.text()).toContain('Tiền công thợ (Labor)');
      expect(wrapper.text()).toContain('Thiết bị & vật tư (Parts)');
      expect(wrapper.text()).toContain('200.000');
      expect(wrapper.text()).toContain('300.000');
      expect(wrapper.text()).toContain('500.000');
    });
  });
});
