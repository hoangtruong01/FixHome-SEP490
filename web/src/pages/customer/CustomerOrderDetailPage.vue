<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhStatusPill,
  FhCostBreakdown,
  FhMoney,
  FhTimeline,
  FhConfirmDialog,
} from '../../components';
import { ordersApi, type ServiceOrderItem } from '../../api/orders.api';

const route = useRoute();
const router = useRouter();
const orderId = route.params.id as string;

const loading = ref(true);
const order = ref<ServiceOrderItem | null>(null);

// Modals
const showCancelModal = ref(false);
const showPaymentModal = ref(false);
const quotationApproved = ref(false);

onMounted(async () => {
  try {
    const data = await ordersApi.getOrder(orderId);
    order.value = data;
    if (data.quotation?.status === 'ACCEPTED') {
      quotationApproved.value = true;
    }
  } finally {
    loading.value = false;
  }
});

const handleApproveQuotation = () => {
  quotationApproved.value = true;
  alert('Đã phê duyệt báo giá! Kỹ thuật viên sẽ tiến hành sửa chữa ngay.');
};

const handlePay = () => {
  showPaymentModal.value = true;
};

const confirmPayment = () => {
  if (order.value) {
    order.value.paymentStatus = 'PAID';
  }
  showPaymentModal.value = false;
  alert('Thanh toán thành công! Hoá đơn và bảo hành điện tử đã được kích hoạt.');
};

const confirmCancel = () => {
  if (order.value) {
    order.value.status = 'CANCELLED';
  }
  showCancelModal.value = false;
  alert('Đã gửi yêu cầu huỷ đơn.');
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Breadcrumb & Back Button -->
    <div class="flex items-center justify-between">
      <button
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
        @click="router.push('/app/orders')"
      >
        <ArrowLeft :size="14" /> Quay lại danh sách đơn
      </button>

      <div class="flex items-center gap-2">
        <FhButton
          v-if="order && order.status !== 'COMPLETED' && order.status !== 'CANCELLED'"
          variant="danger"
          size="sm"
          @click="showCancelModal = true"
        >
          Huỷ đơn
        </FhButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang tải chi tiết đơn hàng...
    </div>

    <div v-else-if="order" class="space-y-6">
      <!-- Order Header Card -->
      <FhCard>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
            <div>
              <div class="text-[11px] text-ink-400 font-mono">MÃ ĐƠN HÀNG:</div>
              <h1 class="text-xl font-bold font-mono text-ink-900">{{ order.code }}</h1>
            </div>

            <div class="flex items-center gap-3">
              <FhStatusPill :status="order.status" />
              <FhStatusPill
                :status="order.paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING'"
                :label="order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="space-y-2">
              <div class="font-bold text-sm text-ink-900">{{ order.serviceName }}</div>
              <div class="text-ink-600 flex items-center gap-1.5">
                <MapPin :size="14" class="text-brand-600 shrink-0" />
                {{ order.addressSummary }}
              </div>
              <div class="text-ink-500 flex items-center gap-1.5">
                <Calendar :size="14" />
                Hẹn lúc: {{ new Date(order.scheduledAt).toLocaleString('vi-VN') }}
              </div>
            </div>

            <!-- Technician Box -->
            <div v-if="order.technician" class="p-3 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {{ order.technician.fullName.charAt(0) }}
                </div>
                <div>
                  <div class="font-bold text-ink-900">{{ order.technician.fullName }}</div>
                  <div class="text-[11px] text-ink-500">★ {{ order.technician.averageRating }} • Kỹ thuật viên chính</div>
                </div>
              </div>

              <a
                :href="`tel:${order.technician.phoneNumber}`"
                class="p-2 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                title="Gọi thợ"
              >
                <Phone :size="16" />
              </a>
            </div>
          </div>
        </div>
      </FhCard>

      <!-- Status Timeline (FhTimeline) -->
      <FhCard title="Tiến trình thực hiện (Timeline)">
        <FhTimeline
          :steps="[
            { key: '1', label: 'Tiếp nhận yêu cầu', note: 'Đơn được tạo trên hệ thống', timestamp: '08:30', completed: true },
            { key: '2', label: 'Ghép kỹ thuật viên', note: 'Thợ Nguyễn Văn Hùng đã nhận đơn', timestamp: '08:45', completed: true },
            { key: '3', label: 'Đang di chuyển (En Route)', note: 'Thợ bắt đầu đi tới địa chỉ khách hàng', timestamp: '09:00', completed: true },
            { key: '4', label: 'Check-in tại hiện trường', note: 'Thợ check-in GPS trong bán kính 200m', timestamp: '09:20', completed: true },
            { key: '5', label: 'Báo giá & Khảo sát lỗi', note: 'Khách hàng duyệt báo giá', timestamp: '09:35', completed: quotationApproved, current: !quotationApproved },
            { key: '6', label: 'Hoàn tất & Bảo hành', note: 'Nghiệm thu sau sửa chữa', completed: false },
          ]"
        />
      </FhCard>

      <!-- Quotation & D-02 Cost Breakdown Card -->
      <FhCard title="Báo giá chi tiết & Linh kiện thay thế (D-02 Standard)">
        <template #action>
          <span class="text-xs font-semibold text-brand-700">Tách riêng Công & Phụ tùng</span>
        </template>

        <div class="space-y-4 text-xs">
          <!-- Ratio Bar -->
          <FhCostBreakdown
            :labor-total="order.laborTotal"
            :parts-total="order.partsTotal"
          />

          <!-- Items Table -->
          <div class="border border-ink-200 rounded-[var(--radius-sm)] overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-ink-50 text-ink-500 font-semibold border-b border-ink-200 text-[11px]">
                <tr>
                  <th class="p-2.5">Khoản mục</th>
                  <th class="p-2.5">Loại</th>
                  <th class="p-2.5 text-center">SL</th>
                  <th class="p-2.5 text-right">Đơn giá</th>
                  <th class="p-2.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                <tr
                  v-for="item in order.quotation?.items ?? []"
                  :key="item.description"
                  class="hover:bg-ink-50/50"
                >
                  <td class="p-2.5 font-medium text-ink-900">
                    {{ item.description }}
                    <span v-if="item.warrantyDays" class="block text-[10px] text-success-600 font-semibold">
                      ✓ Bảo hành {{ item.warrantyDays }} ngày
                    </span>
                  </td>
                  <td class="p-2.5">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      :class="item.type === 'LABOR' ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-700'"
                    >
                      {{ item.type === 'LABOR' ? 'Tiền công' : 'Linh kiện' }}
                    </span>
                  </td>
                  <td class="p-2.5 text-center font-num">{{ item.quantity }}</td>
                  <td class="p-2.5 text-right font-num text-ink-600">
                    <FhMoney :amount="item.unitPrice" />
                  </td>
                  <td class="p-2.5 text-right font-num font-bold text-ink-900">
                    <FhMoney :amount="item.lineTotal" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-ink-100">
            <div>
              <span class="text-xs text-ink-500">Tổng chi phí thanh toán:</span>
              <div class="text-xl font-bold font-num text-brand-700">
                <FhMoney :amount="order.grandTotal" />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <FhButton
                v-if="!quotationApproved"
                variant="primary"
                size="md"
                @click="handleApproveQuotation"
              >
                <CheckCircle2 :size="16" class="mr-1.5" /> Duyệt báo giá này
              </FhButton>

              <FhButton
                v-else-if="order.paymentStatus === 'UNPAID'"
                variant="primary"
                size="md"
                @click="handlePay"
              >
                Thanh toán ngay (<FhMoney :amount="order.grandTotal" />)
              </FhButton>
            </div>
          </div>
        </div>
      </FhCard>
    </div>

    <!-- Confirm Cancel Modal -->
    <FhConfirmDialog
      :open="showCancelModal"
      title="Huỷ đơn sửa chữa"
      consequence="Việc huỷ đơn khi thợ đã di chuyển có thể làm phát sinh phí bù trừ cho thợ theo quy định."
      confirm-text="Xác nhận huỷ"
      cancel-text="Quay lại"
      @confirm="confirmCancel"
      @cancel="showCancelModal = false"
    />

    <!-- Payment Modal -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-sm w-full p-6 space-y-4 shadow-xl">
        <div class="text-center space-y-2">
          <ShieldCheck :size="40" class="text-brand-600 mx-auto" />
          <h3 class="text-lg font-bold text-ink-900">Thanh toán Đơn hàng</h3>
          <p class="text-xs text-ink-500">
            Chế độ thanh toán Demo FixHome (TBD-PAY-01).
          </p>
        </div>

        <div class="p-3 rounded bg-ink-50 text-center">
          <div class="text-xs text-ink-400">Số tiền cần thanh toán:</div>
          <div class="text-2xl font-bold font-num text-brand-700">
            <FhMoney :amount="order?.grandTotal ?? 0" />
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <FhButton variant="ghost" size="md" class="flex-1" @click="showPaymentModal = false">
            Đóng
          </FhButton>
          <FhButton variant="primary" size="md" class="flex-1" @click="confirmPayment">
            Xác nhận thanh toán
          </FhButton>
        </div>
      </div>
    </div>
  </div>
</template>
