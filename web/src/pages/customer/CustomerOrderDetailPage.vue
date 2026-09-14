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
  AlertCircle,
  XCircle,
  DollarSign,
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
const actionLoading = ref(false);
const order = ref<ServiceOrderItem | null>(null);
const invoice = ref<{ id?: string; [key: string]: unknown } | null>(null);
const actionMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null);

// Modals
const showCancelModal = ref(false);
const showPaymentModal = ref(false);
const showWarrantyClaimModal = ref(false);
const warrantyClaimDescription = ref('');
const quotationApproved = ref(false);

// Cash Settlement State
const cashSettlement = ref<{
  id: string;
  declaredAmount: number;
  confirmedAmount?: number;
  status: 'pending_confirmation' | 'confirmed' | 'disputed';
  technicianNotes?: string;
} | null>(null);

const disputeReason = ref('');
const showDisputeModal = ref(false);

onMounted(async () => {
  await loadOrder();
});

const loadOrder = async () => {
  try {
    loading.value = true;
    const data = await ordersApi.getOrder(orderId);
    order.value = data;

    const qStatus = String(data.quotation?.status || '').toUpperCase();
    if (qStatus === 'ACCEPTED' || qStatus === 'APPROVED') {
      quotationApproved.value = true;
    }

    // Try load invoice
    try {
      invoice.value = await ordersApi.getInvoice(orderId);
    } catch {
      // Ignore
    }

    // Try load cash settlement
    try {
      const settlement = await ordersApi.getCashSettlement(orderId);
      if (settlement) {
        cashSettlement.value = settlement as unknown as {
          id: string;
          declaredAmount: number;
          confirmedAmount?: number;
          status: 'pending_confirmation' | 'confirmed' | 'disputed';
          technicianNotes?: string;
        };
      }
    } catch {
      // Ignore
    }
  } finally {
    loading.value = false;
  }
};

const handleApproveQuotation = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    if (order.value?.quotation?.id) {
      await ordersApi.approveQuotation(order.value.quotation.id);
    }
    quotationApproved.value = true;
    actionMessage.value = { type: 'success', text: 'Đã phê duyệt báo giá! Kỹ thuật viên sẽ tiến hành sửa chữa ngay.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể duyệt báo giá.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleRejectQuotation = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    if (order.value?.quotation?.id) {
      await ordersApi.rejectQuotation(order.value.quotation.id, 'Khách từ chối báo giá');
    }
    actionMessage.value = { type: 'success', text: 'Đã từ chối báo giá của kỹ thuật viên.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể từ chối báo giá.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleConfirmCashPayment = async (agreed: boolean) => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    await ordersApi.confirmCashSettlement(orderId, {
      agreed,
      disputeReason: agreed ? undefined : disputeReason.value,
    });

    if (agreed) {
      if (order.value) order.value.paymentStatus = 'PAID';
      if (cashSettlement.value) cashSettlement.value.status = 'confirmed';
      actionMessage.value = {
        type: 'success',
        text: 'Đã xác nhận thanh toán tiền mặt thành công! Hoá đơn và bảo hành điện tử đã kích hoạt.',
      };
    } else {
      if (cashSettlement.value) cashSettlement.value.status = 'disputed';
      showDisputeModal.value = false;
      actionMessage.value = {
        type: 'success',
        text: 'Đã ghi nhận khiếu nại số tiền mặt! Quản lý FixHome sẽ kiểm tra và đối soát ngay.',
      };
    }
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể xử lý xác nhận tiền mặt.' };
  } finally {
    actionLoading.value = false;
  }
};

const handlePay = () => {
  showPaymentModal.value = true;
};

const confirmPayment = async () => {
  try {
    actionLoading.value = true;
    if (invoice.value?.id) {
      await ordersApi.payInvoice(invoice.value.id);
    }
    if (order.value) {
      order.value.paymentStatus = 'PAID';
    }
    showPaymentModal.value = false;
    actionMessage.value = {
      type: 'success',
      text: 'Thanh toán online thành công! Hoá đơn và bảo hành điện tử đã được kích hoạt.',
    };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Thanh toán thất bại.' };
  } finally {
    actionLoading.value = false;
  }
};

const confirmCancel = async () => {
  try {
    actionLoading.value = true;
    await ordersApi.cancelOrder(orderId, 'Khách hàng huỷ đơn');
    if (order.value) {
      order.value.status = 'CANCELLED';
    }
    showCancelModal.value = false;
    actionMessage.value = { type: 'success', text: 'Đã gửi yêu cầu huỷ đơn thành công.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể huỷ đơn.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleCreateWarrantyClaim = async () => {
  if (!warrantyClaimDescription.value.trim()) {
    actionMessage.value = { type: 'error', text: 'Vui lòng mô tả vấn đề cần bảo hành!' };
    return;
  }
  try {
    actionLoading.value = true;
    await ordersApi.createWarrantyClaim(orderId, warrantyClaimDescription.value);
    showWarrantyClaimModal.value = false;
    warrantyClaimDescription.value = '';
    actionMessage.value = {
      type: 'success',
      text: 'Đã gửi yêu cầu bảo hành điện tử thành công! Kỹ thuật viên sẽ liên hệ lại.',
    };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể gửi yêu cầu bảo hành.' };
  } finally {
    actionLoading.value = false;
  }
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
          v-if="order && order.status === 'COMPLETED' && order.paymentStatus === 'PAID'"
          variant="secondary"
          size="sm"
          @click="showWarrantyClaimModal = true"
        >
          <ShieldCheck :size="14" class="mr-1 text-brand-600" />
          Yêu cầu bảo hành
        </FhButton>

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

    <!-- Alert / Action Banner -->
    <div
      v-if="actionMessage"
      class="p-3.5 rounded-lg text-xs font-medium flex items-center gap-2"
      :class="actionMessage.type === 'success' ? 'bg-success-50 text-success-800 border border-success-200' : 'bg-danger-50 text-danger-800 border border-danger-200'"
    >
      <CheckCircle2 v-if="actionMessage.type === 'success'" :size="16" class="text-success-600 shrink-0" />
      <AlertCircle v-else :size="16" class="text-danger-600 shrink-0" />
      <span>{{ actionMessage.text }}</span>
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
                :status="order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'COMPLETED' : 'PENDING'"
                :label="order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'"
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

      <!-- Spec v1.2: Cash Dual-Confirmation Alert Card -->
      <FhCard
        v-if="cashSettlement && cashSettlement.status === 'pending_confirmation'"
        class="border-2 border-brand-500 bg-brand-50/40"
      >
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-brand-900 font-bold text-sm">
            <DollarSign :size="18" class="text-brand-600" />
            <span>Xác nhận Thanh toán Tiền mặt (Dual-Confirmation)</span>
          </div>

          <p class="text-xs text-ink-700">
            Kỹ thuật viên đã khai báo đã thu số tiền mặt là:
            <strong class="text-brand-800 text-sm font-num"><FhMoney :amount="cashSettlement.declaredAmount" /></strong>
            {{ cashSettlement.technicianNotes ? `(Ghi chú: ${cashSettlement.technicianNotes})` : '' }}
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <FhButton
              variant="primary"
              size="sm"
              :disabled="actionLoading"
              @click="handleConfirmCashPayment(true)"
            >
              <CheckCircle2 :size="14" class="mr-1.5" />
              Xác nhận đúng số tiền đã trả
            </FhButton>

            <FhButton
              variant="danger"
              size="sm"
              :disabled="actionLoading"
              @click="showDisputeModal = true"
            >
              <XCircle :size="14" class="mr-1.5" />
              Báo sai / Khiếu nại số tiền
            </FhButton>
          </div>
        </div>
      </FhCard>

      <!-- Status Timeline (FhTimeline) -->
      <FhCard title="Tiến trình thực hiện (Timeline Spec v1.2)">
        <FhTimeline
          :steps="[
            { key: '1', label: 'Tiếp nhận yêu cầu', note: 'Đơn được tạo trên hệ thống', timestamp: '08:30', completed: true },
            { key: '2', label: 'Ghép kỹ thuật viên', note: order.technician?.fullName ? `Thợ ${order.technician.fullName} đã nhận đơn` : 'Đã ghép thợ', timestamp: '08:45', completed: true },
            { key: '3', label: 'Đang di chuyển (En Route)', note: 'Thợ đang trên đường tới nhà', timestamp: '09:00', completed: order.status !== 'ACCEPTED' },
            { key: '4', label: 'Bắt đầu sửa chữa (Under Repair)', note: 'Thợ đã check-in GPS và khảo sát', timestamp: '09:20', completed: order.status === 'UNDER_REPAIR' || order.status === 'COMPLETED' },
            { key: '5', label: 'Hoàn tất & Bảo hành điện tử', note: 'Nghiệm thu sau sửa và kích hoạt bảo hành', completed: order.status === 'COMPLETED' },
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
              <template v-if="order.quotation && !quotationApproved">
                <FhButton
                  variant="secondary"
                  size="md"
                  :disabled="actionLoading"
                  @click="handleRejectQuotation"
                >
                  Từ chối
                </FhButton>
                <FhButton
                  variant="primary"
                  size="md"
                  :disabled="actionLoading"
                  @click="handleApproveQuotation"
                >
                  <CheckCircle2 :size="16" class="mr-1.5" /> Duyệt báo giá này
                </FhButton>
              </template>

              <FhButton
                v-else-if="order.paymentStatus === 'UNPAID' || order.paymentStatus === 'unpaid'"
                variant="primary"
                size="md"
                :disabled="actionLoading"
                @click="handlePay"
              >
                Thanh toán Online (<FhMoney :amount="order.grandTotal" />)
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

    <!-- Dispute Modal -->
    <div
      v-if="showDisputeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-sm w-full p-6 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-ink-900">Khiếu nại Số tiền mặt</h3>
        <p class="text-xs text-ink-500">
          Vui lòng nhập lý do (ví dụ: thợ báo 300k nhưng thực tế tôi chỉ đưa 250k):
        </p>
        <textarea
          v-model="disputeReason"
          rows="3"
          placeholder="Nhập lý do khiếu nại..."
          class="w-full p-2.5 bg-white border border-ink-200 rounded text-xs"
        ></textarea>

        <div class="flex gap-2 pt-2">
          <FhButton variant="ghost" size="sm" class="flex-1" @click="showDisputeModal = false">
            Huỷ
          </FhButton>
          <FhButton
            variant="danger"
            size="sm"
            class="flex-1"
            :disabled="!disputeReason.trim() || actionLoading"
            @click="handleConfirmCashPayment(false)"
          >
            Gửi khiếu nại
          </FhButton>
        </div>
      </div>
    </div>

    <!-- Warranty Claim Modal -->
    <div
      v-if="showWarrantyClaimModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-sm w-full p-6 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-ink-900">Yêu cầu Bảo hành Điện tử</h3>
        <p class="text-xs text-ink-500">
          Mô tả hiện tượng lỗi tái phát hoặc sự cố thiết bị:
        </p>
        <textarea
          v-model="warrantyClaimDescription"
          rows="3"
          placeholder="Mô tả sự cố cần bảo hành..."
          class="w-full p-2.5 bg-white border border-ink-200 rounded text-xs"
        ></textarea>

        <div class="flex gap-2 pt-2">
          <FhButton variant="ghost" size="sm" class="flex-1" @click="showWarrantyClaimModal = false">
            Đóng
          </FhButton>
          <FhButton
            variant="primary"
            size="sm"
            class="flex-1"
            :disabled="actionLoading"
            @click="handleCreateWarrantyClaim"
          >
            Gửi yêu cầu
          </FhButton>
        </div>
      </div>
    </div>

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
            Cổng thanh toán điện tử FixHome (VNPay / Thẻ ngân hàng).
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
          <FhButton
            variant="primary"
            size="md"
            class="flex-1"
            :disabled="actionLoading"
            @click="confirmPayment"
          >
            Xác nhận thanh toán
          </FhButton>
        </div>
      </div>
    </div>
  </div>
</template>
