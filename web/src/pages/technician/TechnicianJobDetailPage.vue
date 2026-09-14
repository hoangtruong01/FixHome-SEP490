<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  MapPin,
  Camera,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Phone,
  Plus,
  Trash2,
  Navigation,
  DollarSign,
  AlertCircle,
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhStatusPill,
  FhCostBreakdown,
  FhMoney,
} from '../../components';
import { ordersApi, type ServiceOrderItem, type QuotationItemPayload } from '../../api/orders.api';

const route = useRoute();
const router = useRouter();
const jobId = route.params.id as string;

const loading = ref(true);
const actionLoading = ref(false);
const job = ref<ServiceOrderItem | null>(null);
const actionMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null);

// Workspace Steps State
const isEnRoute = ref(false);
const gpsCheckedIn = ref(false);
const beforePhotoUploaded = ref(false);
const quotationSubmitted = ref(false);
const afterPhotoUploaded = ref(false);
const isCompleted = ref(false);

// Cash Settlement State
const declaredCashAmount = ref<number>(0);
const technicianCashNotes = ref('');
const cashSettled = ref(false);
const cashSettlementStatus = ref<'pending_confirmation' | 'confirmed' | 'disputed' | null>(null);

// Quotation Items Form (D-02 Standard)
const quotationItems = ref<QuotationItemPayload[]>([
  { type: 'LABOR', description: 'Công thông tắc máng thoát nước và xịt rửa', quantity: 1, unitPrice: 180000 },
  { type: 'PARTS', description: 'Đoạn ống thoát mềm bảo ôn 1.5m', quantity: 1, unitPrice: 120000 },
]);

const warrantyDays = ref(90);

onMounted(async () => {
  await loadJob();
});

const loadJob = async () => {
  try {
    loading.value = true;
    const data = await ordersApi.getOrder(jobId);
    job.value = data;

    const status = String(data.status).toUpperCase();
    if (status === 'EN_ROUTE') {
      isEnRoute.value = true;
    } else if (status === 'UNDER_REPAIR') {
      isEnRoute.value = true;
      gpsCheckedIn.value = true;
      beforePhotoUploaded.value = true;
    } else if (status === 'COMPLETED') {
      isEnRoute.value = true;
      gpsCheckedIn.value = true;
      beforePhotoUploaded.value = true;
      afterPhotoUploaded.value = true;
      isCompleted.value = true;
    }

    if (data.grandTotal) {
      declaredCashAmount.value = data.grandTotal;
    }

    // Check cash settlement
    try {
      const settlement = await ordersApi.getCashSettlement(jobId);
      if (settlement) {
        cashSettled.value = true;
        cashSettlementStatus.value = String(settlement.status || 'pending_confirmation') as
          | 'pending_confirmation'
          | 'confirmed'
          | 'disputed';
        declaredCashAmount.value = Number(settlement.declaredAmount || 0);
      }
    } catch {
      // Ignored
    }
  } finally {
    loading.value = false;
  }
};

const laborTotal = () =>
  quotationItems.value
    .filter((i) => i.type === 'LABOR')
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

const partsTotal = () =>
  quotationItems.value
    .filter((i) => i.type === 'PARTS')
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

const addItem = (type: 'LABOR' | 'PARTS') => {
  quotationItems.value.push({
    type,
    description: type === 'LABOR' ? 'Hạng mục công kỹ thuật' : 'Tên linh kiện thay thế',
    quantity: 1,
    unitPrice: 50000,
  });
};

const removeItem = (idx: number) => {
  quotationItems.value.splice(idx, 1);
};

const handleEnRoute = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    await ordersApi.enRoute(jobId);
    isEnRoute.value = true;
    if (job.value) job.value.status = 'EN_ROUTE';
    actionMessage.value = { type: 'success', text: 'Đã cập nhật: Đang trên đường tới nhà khách!' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể chuyển trạng thái đang di chuyển' };
  } finally {
    actionLoading.value = false;
  }
};

const handleCheckIn = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;

    let coords = { lat: 21.0285, lng: 105.8542, accuracyMeters: 25 };
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy || 20),
        };
      } catch {
        // Fallback to sample coordinates
      }
    }

    await ordersApi.checkIn(jobId, coords);
    gpsCheckedIn.value = true;
    actionMessage.value = { type: 'success', text: 'Check-in GPS thành công! Đã ghi nhận tọa độ hiện trường.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Check-in thất bại hoặc ngoài bán kính cho phép.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleUploadBefore = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    const mediaUrl = 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&auto=format&fit=crop';
    await ordersApi.uploadEvidence(jobId, {
      phase: 'BEFORE',
      mediaUrl,
      caption: 'Ảnh hiện trạng lỗi trước khi sửa chữa',
    });
    beforePhotoUploaded.value = true;
    actionMessage.value = { type: 'success', text: 'Tải ảnh BEFORE thành công! Đã mở khoá lập báo giá.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể lưu ảnh hiện trạng.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleSubmitQuotation = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    const items = quotationItems.value.map((i) => ({
      type: i.type,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      warrantyDays: i.type === 'PARTS' ? warrantyDays.value : undefined,
    }));
    await ordersApi.submitQuotation(jobId, items);
    quotationSubmitted.value = true;
    actionMessage.value = { type: 'success', text: 'Đã gửi báo giá tới khách hàng! Chờ khách duyệt.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể gửi báo giá.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleStartRepair = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    await ordersApi.startRepair(jobId);
    if (job.value) job.value.status = 'UNDER_REPAIR';
    actionMessage.value = { type: 'success', text: 'Bắt đầu sửa chữa! Trạng thái: UNDER_REPAIR' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Chưa thể bắt đầu sửa chữa.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleUploadAfter = async () => {
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    const mediaUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop';
    await ordersApi.uploadEvidence(jobId, {
      phase: 'AFTER',
      mediaUrl,
      caption: 'Ảnh nghiệm thu sau khi hoàn tất sửa chữa',
    });
    afterPhotoUploaded.value = true;
    actionMessage.value = { type: 'success', text: 'Tải ảnh AFTER thành công! Đã mở khoá hoàn tất đơn.' };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể lưu ảnh nghiệm thu.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleCompleteOrder = async () => {
  if (!afterPhotoUploaded.value) {
    actionMessage.value = { type: 'error', text: 'Vui lòng chụp ảnh nghiệm thu AFTER trước khi hoàn tất đơn!' };
    return;
  }
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    await ordersApi.completeRepair(jobId, { completionNote: 'Hoàn tất nghiệm thu kỹ thuật' });
    isCompleted.value = true;
    if (job.value) job.value.status = 'COMPLETED';
    actionMessage.value = { type: 'success', text: 'Hoàn tất đơn sửa chữa! Hoá đơn và bảo hành điện tử đã được tạo.' };
    await loadJob();
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể hoàn tất đơn sửa chữa.' };
  } finally {
    actionLoading.value = false;
  }
};

const handleDeclareCash = async () => {
  if (!declaredCashAmount.value || declaredCashAmount.value <= 0) {
    actionMessage.value = { type: 'error', text: 'Vui lòng nhập số tiền mặt đã thu từ khách!' };
    return;
  }
  try {
    actionLoading.value = true;
    actionMessage.value = null;
    const res = await ordersApi.declareCashSettlement(jobId, {
      declaredAmount: declaredCashAmount.value,
      technicianNotes: technicianCashNotes.value,
    });
    cashSettled.value = true;
    cashSettlementStatus.value = String(res.status || 'pending_confirmation') as
      | 'pending_confirmation'
      | 'confirmed'
      | 'disputed';
    actionMessage.value = {
      type: 'success',
      text: 'Đã gửi khai báo thu tiền mặt! Chờ khách hàng bấm xác nhận trên ứng dụng.',
    };
  } catch (err) {
    actionMessage.value = { type: 'error', text: (err as Error)?.message || 'Không thể khai báo thu tiền mặt.' };
  } finally {
    actionLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-16">
    <!-- Top Navigation -->
    <div class="flex items-center justify-between">
      <button
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
        @click="router.push('/tech/jobs')"
      >
        <ArrowLeft :size="14" /> Quay lại danh sách việc
      </button>

      <FhStatusPill v-if="job" :status="job.status" />
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
      Đang tải dữ liệu công việc...
    </div>

    <div v-else-if="job" class="space-y-6">
      <!-- Order Info Banner -->
      <FhCard>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
            <div>
              <p class="text-[11px] font-mono text-ink-400">MÃ ĐƠN HÀNG: {{ job.code }}</p>
              <h1 class="text-base font-bold text-ink-900 mt-0.5">{{ job.customerName }}</h1>
            </div>

            <div class="flex items-center gap-2">
              <a
                v-if="job.customerPhone"
                :href="'tel:' + job.customerPhone"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors"
              >
                <Phone :size="13" /> {{ job.customerPhone }}
              </a>
            </div>
          </div>

          <div class="space-y-1 text-xs sm:text-sm">
            <h2 class="font-bold text-ink-900">{{ job.serviceName }}</h2>
            <p class="text-xs text-ink-600 flex items-center gap-1.5">
              <MapPin :size="14" class="text-brand-600 shrink-0" />
              {{ job.addressSummary }}
            </p>
          </div>
        </div>
      </FhCard>

      <!-- Workspace Workflow Stepper -->
      <div class="space-y-5">
        <h3 class="text-base font-bold text-ink-900">Quy trình Thực thi Tiêu chuẩn (Spec v1.2)</h3>

        <!-- Phase 0: En Route -->
        <FhCard title="1. Khởi hành đến nhà khách (En Route)">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <p class="text-ink-600 max-w-md">
              Cập nhật trạng thái khi bắt đầu di chuyển để khách hàng theo dõi thời gian dự kiến tới nơi.
            </p>

            <FhButton
              :variant="isEnRoute ? 'secondary' : 'primary'"
              size="sm"
              :disabled="isEnRoute || actionLoading"
              @click="handleEnRoute"
            >
              <CheckCircle2 v-if="isEnRoute" :size="15" class="mr-1.5 text-success-600" />
              <Navigation v-else :size="15" class="mr-1.5" />
              {{ isEnRoute ? 'Đang trên đường di chuyển' : 'Bấm Bắt đầu di chuyển' }}
            </FhButton>
          </div>
        </FhCard>

        <!-- Phase 1: GPS Check-In -->
        <FhCard title="2. Xác nhận có mặt tại hiện trường (GPS Geofence Check-in)">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <p class="text-ink-600 max-w-md">
              Bắt buộc check-in GPS trong bán kính ≤ 200m từ địa chỉ khách để mở khoá chụp ảnh hiện trạng và lập báo giá.
            </p>

            <FhButton
              :variant="gpsCheckedIn ? 'secondary' : 'primary'"
              size="sm"
              :disabled="gpsCheckedIn || !isEnRoute || actionLoading"
              @click="handleCheckIn"
            >
              <CheckCircle2 v-if="gpsCheckedIn" :size="15" class="mr-1.5 text-success-600" />
              <MapPin v-else :size="15" class="mr-1.5" />
              {{ gpsCheckedIn ? 'Đã check-in thành công' : 'Bấm Check-in GPS' }}
            </FhButton>
          </div>
        </FhCard>

        <!-- Phase 2: Evidence BEFORE -->
        <FhCard title="3. Bằng chứng hiện trạng lỗi (Evidence Gating BEFORE)">
          <div class="space-y-3 text-xs">
            <p class="text-ink-600">
              Quy chuẩn bắt buộc: Phải có ít nhất 1 ảnh BEFORE trước khi lập báo giá nhằm tránh tranh chấp.
            </p>

            <div class="flex items-center gap-4">
              <div
                class="w-24 h-24 rounded-[var(--radius-sm)] border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                :class="beforePhotoUploaded ? 'border-success-500 bg-success-50/50 text-success-700' : (!gpsCheckedIn ? 'border-ink-200 text-ink-300 cursor-not-allowed' : 'border-ink-300 hover:border-brand-500 text-ink-500')"
                @click="gpsCheckedIn && !beforePhotoUploaded ? handleUploadBefore() : null"
              >
                <Camera :size="22" />
                <span class="text-[10px] font-semibold">{{ beforePhotoUploaded ? 'Đã tải ảnh' : 'Chụp ảnh' }}</span>
              </div>

              <div v-if="beforePhotoUploaded" class="text-xs text-success-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 :size="16" /> Đã xác thực ảnh hiện trạng BEFORE
              </div>
            </div>
          </div>
        </FhCard>

        <!-- Phase 3: Quotation Submission (D-02 Standard) -->
        <FhCard title="4. Lập báo giá phân tách Công & Phụ tùng (D-02 Standard)">
          <div class="space-y-4 text-xs">
            <FhCostBreakdown :labor-total="laborTotal()" :parts-total="partsTotal()" />

            <div class="space-y-2">
              <div class="flex items-center justify-between font-semibold text-ink-700">
                <span>Hạng mục chi phí:</span>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1"
                    @click="addItem('LABOR')"
                  >
                    <Plus :size="13" /> Thêm công thợ
                  </button>
                  <button
                    type="button"
                    class="text-[11px] text-ink-700 font-bold hover:underline flex items-center gap-1"
                    @click="addItem('PARTS')"
                  >
                    <Plus :size="13" /> Thêm linh kiện
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(item, idx) in quotationItems"
                  :key="idx"
                  class="p-2.5 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200 flex items-center gap-2"
                >
                  <span
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                    :class="item.type === 'LABOR' ? 'bg-brand-100 text-brand-800' : 'bg-ink-200 text-ink-800'"
                  >
                    {{ item.type === 'LABOR' ? 'Công' : 'Linh kiện' }}
                  </span>

                  <input
                    v-model="item.description"
                    type="text"
                    class="flex-1 h-8 px-2 bg-white border border-ink-200 rounded text-xs"
                  />

                  <input
                    v-model.number="item.unitPrice"
                    type="number"
                    step="10000"
                    class="w-24 h-8 px-2 bg-white border border-ink-200 rounded text-xs font-num font-bold text-right"
                  />

                  <button
                    class="p-1 text-ink-400 hover:text-danger-500 rounded"
                    @click="removeItem(idx)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-ink-100 flex items-center justify-between">
              <div class="text-xs">
                <span class="text-ink-400">Tổng báo giá: </span>
                <span class="font-bold text-brand-700 font-num text-sm">
                  <FhMoney :amount="laborTotal() + partsTotal()" />
                </span>
              </div>

              <div class="flex gap-2">
                <FhButton
                  variant="secondary"
                  size="sm"
                  :disabled="actionLoading"
                  @click="handleStartRepair"
                >
                  Bắt đầu sửa chữa (UNDER_REPAIR)
                </FhButton>
                <FhButton
                  variant="primary"
                  size="sm"
                  :disabled="!beforePhotoUploaded || actionLoading"
                  @click="handleSubmitQuotation"
                >
                  <FileText :size="14" class="mr-1.5" /> Gửi báo giá cho khách duyệt
                </FhButton>
              </div>
            </div>
          </div>
        </FhCard>

        <!-- Phase 4: Evidence AFTER & Complete Repair -->
        <FhCard title="5. Ảnh hoàn tất AFTER & Kích hoạt bảo hành điện tử">
          <div class="space-y-4 text-xs">
            <div class="flex items-center gap-4">
              <div
                class="w-24 h-24 rounded-[var(--radius-sm)] border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                :class="afterPhotoUploaded ? 'border-success-500 bg-success-50/50 text-success-700' : 'border-ink-300 hover:border-brand-500 text-ink-500'"
                @click="handleUploadAfter"
              >
                <Camera :size="22" />
                <span class="text-[10px] font-semibold">{{ afterPhotoUploaded ? 'Đã có ảnh' : 'Chụp ảnh sau sửa' }}</span>
              </div>

              <div class="flex-1 space-y-2">
                <label class="block font-semibold text-ink-700">Thời hạn bảo hành linh kiện:</label>
                <select
                  v-model.number="warrantyDays"
                  class="h-9 px-3 bg-white border border-ink-200 rounded text-xs focus:outline-none focus:border-brand-600"
                >
                  <option :value="30">30 ngày (Tiêu chuẩn)</option>
                  <option :value="60">60 ngày</option>
                  <option :value="90">90 ngày (Khuyến nghị)</option>
                  <option :value="180">180 ngày (6 tháng)</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-ink-100 flex justify-end">
              <FhButton
                variant="primary"
                size="md"
                :disabled="isCompleted || actionLoading"
                @click="handleCompleteOrder"
              >
                <ShieldCheck :size="16" class="mr-1.5" />
                {{ isCompleted ? 'Đơn hàng đã hoàn tất' : 'Xác nhận Hoàn tất & Kích hoạt bảo hành' }}
              </FhButton>
            </div>
          </div>
        </FhCard>

        <!-- Phase 5: Cash Dual Confirmation (Spec v1.2) -->
        <FhCard title="6. Khai báo thu tiền mặt (Dual-Confirmation)">
          <div class="space-y-4 text-xs">
            <p class="text-ink-600">
              Quy tắc Spec v1.2: Khi thu tiền mặt trực tiếp từ khách, thợ phải khai báo chính xác số tiền đã nhận. Khách hàng sẽ bấm xác nhận trên điện thoại để hoàn tất thanh toán và sinh công nợ hoa hồng 10% tiền công.
            </p>

            <div v-if="cashSettled" class="p-3 bg-brand-50 rounded-lg border border-brand-200 space-y-1">
              <div class="flex items-center gap-2 font-semibold text-brand-900">
                <CheckCircle2 :size="16" class="text-brand-600" />
                <span>Trạng thái đối soát: {{ cashSettlementStatus === 'confirmed' ? 'Khách đã xác nhận (PAID)' : 'Đang chờ khách duyệt số tiền' }}</span>
              </div>
              <p class="text-brand-700 text-[11px]">
                Số tiền khai báo: <strong><FhMoney :amount="declaredCashAmount" /></strong>
              </p>
            </div>

            <div v-else class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-ink-700 mb-1">Số tiền mặt thực thu (VNĐ):</label>
                  <input
                    v-model.number="declaredCashAmount"
                    type="number"
                    step="10000"
                    placeholder="VD: 300000"
                    class="w-full h-9 px-3 bg-white border border-ink-200 rounded text-xs font-num font-bold text-ink-900"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-ink-700 mb-1">Ghi chú / Mã biên lai:</label>
                  <input
                    v-model="technicianCashNotes"
                    type="text"
                    placeholder="VD: Đã nhận đủ tiền mặt từ khách"
                    class="w-full h-9 px-3 bg-white border border-ink-200 rounded text-xs"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <FhButton
                  variant="primary"
                  size="sm"
                  :disabled="!isCompleted || actionLoading"
                  @click="handleDeclareCash"
                >
                  <DollarSign :size="14" class="mr-1" />
                  Khai báo đã thu tiền mặt
                </FhButton>
              </div>
            </div>
          </div>
        </FhCard>
      </div>
    </div>
  </div>
</template>
