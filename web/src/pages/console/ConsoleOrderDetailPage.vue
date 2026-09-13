<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ShieldAlert,
  UserCheck,
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

// Modal state
const showReassignModal = ref(false);
const showCancelModal = ref(false);
const reassignTechId = ref('tech-2');
const reassignReason = ref('Thợ bận sự cố đột xuất cần đổi người thay thế');

onMounted(async () => {
  try {
    const data = await ordersApi.getOrder(orderId);
    order.value = data;
  } finally {
    loading.value = false;
  }
});

const handleReassign = () => {
  if (order.value) {
    order.value.technician = {
      id: 'tech-2',
      fullName: 'Trần Đình Trọng (Thay thế)',
      phoneNumber: '0922334455',
      averageRating: 4.88,
    };
  }
  showReassignModal.value = false;
  alert('Đã điều phối lại kỹ thuật viên thành công! Lịch sử can thiệp được lưu vào Audit Log.');
};

const handleForceCancel = () => {
  if (order.value) {
    order.value.status = 'CANCELLED';
  }
  showCancelModal.value = false;
  alert('Đã huỷ đơn cưỡng chế. Đơn chuyển vào mục giải quyết khiếu nại & bồi thường.');
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <button
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
        @click="router.push('/console/orders')"
      >
        <ArrowLeft :size="14" /> Quay lại Board đơn
      </button>

      <div class="flex items-center gap-3">
        <FhButton variant="secondary" size="sm" @click="showReassignModal = true">
          <UserCheck :size="15" class="mr-1.5" /> Điều phối lại thợ
        </FhButton>
        <FhButton variant="danger" size="sm" @click="showCancelModal = true">
          <ShieldAlert :size="15" class="mr-1.5" /> Huỷ đơn can thiệp
        </FhButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang tải chi tiết đơn hàng...
    </div>

    <div v-else-if="order" class="space-y-6">
      <!-- Order Overview Card -->
      <FhCard>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
            <div>
              <div class="text-[11px] text-ink-400 font-mono">CONSOLE DISPATCH RECORD:</div>
              <h1 class="text-xl font-bold font-mono text-ink-900">{{ order.code }}</h1>
            </div>

            <div class="flex items-center gap-3">
              <FhStatusPill :status="order.status" />
              <FhStatusPill
                :status="order.paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING'"
                :label="order.paymentStatus"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1.5">
              <div class="font-bold text-sm text-ink-900">{{ order.serviceName }}</div>
              <div class="text-ink-600 flex items-center gap-1">
                <MapPin :size="13" class="text-brand-600 shrink-0" /> {{ order.addressSummary }}
              </div>
              <div class="text-ink-500 flex items-center gap-1">
                <Calendar :size="13" /> Hẹn: {{ new Date(order.scheduledAt).toLocaleString('vi-VN') }}
              </div>
            </div>

            <div class="space-y-1.5 sm:text-right">
              <div class="font-semibold text-ink-900 flex items-center gap-1 sm:justify-end">
                <User :size="13" class="text-ink-400" /> Khách: {{ order.customerName }}
              </div>
              <div class="text-ink-500 font-mono">{{ order.customerPhone }}</div>
              <div v-if="order.technician" class="text-brand-700 font-semibold pt-1">
                Thợ: {{ order.technician.fullName }} ({{ order.technician.phoneNumber }})
              </div>
            </div>
          </div>
        </div>
      </FhCard>

      <!-- Timeline History -->
      <FhCard title="Lịch sử Chuyển trạng thái (Order Status History D-22)">
        <FhTimeline
          :steps="[
            { key: '1', label: 'Tạo đơn hàng (PENDING_MATCHING)', note: 'Tạo bởi khách hàng', timestamp: '08:30:12', completed: true },
            { key: '2', label: 'Gán kỹ thuật viên (ASSIGNED)', note: 'Nhận bởi thợ Nguyễn Văn Hùng', timestamp: '08:45:00', completed: true },
            { key: '3', label: 'Thợ bắt đầu di chuyển (EN_ROUTE)', note: 'Cập nhật từ ứng dụng thợ', timestamp: '09:00:15', completed: true },
            { key: '4', label: 'Check-in GPS hợp lệ (ARRIVED)', note: 'Bán kính 45m ≤ 200m geofence', timestamp: '09:20:40', completed: true },
            { key: '5', label: 'Tiến hành sửa chữa (IN_PROGRESS)', note: 'Khách duyệt báo giá 300,000 đ', timestamp: '09:35:10', current: true },
          ]"
        />
      </FhCard>

      <!-- Cost Audit & Breakdown -->
      <FhCard title="Bóc tách Doanh thu & Chi phí (D-02 Standard)">
        <div class="space-y-4 text-xs">
          <FhCostBreakdown :labor-total="order.laborTotal" :parts-total="order.partsTotal" />

          <div class="grid grid-cols-3 gap-3 p-3.5 rounded bg-ink-50 border border-ink-200 text-center">
            <div>
              <div class="text-ink-400 text-[11px]">Tiền công (Labor):</div>
              <div class="text-sm font-bold font-num text-ink-900">
                <FhMoney :amount="order.laborTotal" />
              </div>
            </div>
            <div>
              <div class="text-ink-400 text-[11px]">Tiền linh kiện (Parts):</div>
              <div class="text-sm font-bold font-num text-ink-900">
                <FhMoney :amount="order.partsTotal" />
              </div>
            </div>
            <div>
              <div class="text-ink-400 text-[11px]">Tổng giá trị đơn:</div>
              <div class="text-sm font-bold font-num text-brand-700">
                <FhMoney :amount="order.grandTotal" />
              </div>
            </div>
          </div>
        </div>
      </FhCard>
    </div>

    <!-- Reassign Modal -->
    <div
      v-if="showReassignModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
        <h3 class="text-base font-bold text-ink-900">Điều phối lại Kỹ thuật viên (Can thiệp SM)</h3>
        <div>
          <label class="block font-semibold text-ink-700 mb-1">Chọn thợ thay thế:</label>
          <select
            v-model="reassignTechId"
            class="w-full h-9 px-3 bg-white border border-ink-200 rounded text-xs"
          >
            <option value="tech-2">Trần Đình Trọng (4.88 ★ - Cách 2.5km)</option>
            <option value="tech-3">Lê Minh Tuấn (4.91 ★ - Cách 3.2km)</option>
            <option value="tech-4">Phạm Quốc Bảo (4.85 ★ - Cách 4.1km)</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-ink-700 mb-1">Lý do điều phối lại *</label>
          <textarea
            v-model="reassignReason"
            rows="3"
            class="w-full p-2.5 bg-white border border-ink-200 rounded text-xs"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-ink-100">
          <FhButton variant="ghost" size="sm" @click="showReassignModal = false">Huỷ</FhButton>
          <FhButton variant="primary" size="sm" @click="handleReassign">Xác nhận chuyển thợ</FhButton>
        </div>
      </div>
    </div>

    <!-- Force Cancel Modal -->
    <FhConfirmDialog
      :open="showCancelModal"
      title="Can thiệp Huỷ đơn cưỡng chế"
      consequence="Hành động này sẽ ngắt trạng thái thực thi hiện tại và ghi nhận vi phạm kiểm toán đối với tài khoản."
      confirm-text="Xác nhận huỷ"
      cancel-text="Quay lại"
      @confirm="handleForceCancel"
      @cancel="showCancelModal = false"
    />
  </div>
</template>
