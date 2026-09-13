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
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhStatusPill,
  FhCostBreakdown,
  FhMoney,
} from '../../components';
import { ordersApi, type ServiceOrderItem } from '../../api/orders.api';

const route = useRoute();
const router = useRouter();
const jobId = route.params.id as string;

const loading = ref(true);
const job = ref<ServiceOrderItem | null>(null);

// Workspace Steps State
const gpsCheckedIn = ref(true);
const beforePhotoUploaded = ref(true);
const afterPhotoUploaded = ref(false);
const isCompleted = ref(false);

// Quotation Items Form (D-02 Standard)
const quotationItems = ref([
  { type: 'LABOR', description: 'Công thông tắc máng thoát nước và xịt rửa', quantity: 1, unitPrice: 180000 },
  { type: 'PARTS', description: 'Đoạn ống thoát mềm bảo ôn 1.5m', quantity: 1, unitPrice: 120000 },
]);

const warrantyDays = ref(90);

onMounted(async () => {
  try {
    const data = await ordersApi.getOrder(jobId);
    job.value = data;
    if (data.status === 'COMPLETED') {
      isCompleted.value = true;
      afterPhotoUploaded.value = true;
    }
  } finally {
    loading.value = false;
  }
});

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

const laborTotal = () =>
  quotationItems.value
    .filter((i) => i.type === 'LABOR')
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

const partsTotal = () =>
  quotationItems.value
    .filter((i) => i.type === 'PARTS')
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

const handleCheckIn = () => {
  gpsCheckedIn.value = true;
  alert('Check-in GPS thành công! Tọa độ cách nhà khách 45m (hợp lệ trong bán kính 200m).');
};

const handleUploadBefore = () => {
  beforePhotoUploaded.value = true;
  alert('Đã tải lên ảnh BEFORE thành công! Đã mở khoá tính năng lập báo giá.');
};

const handleUploadAfter = () => {
  afterPhotoUploaded.value = true;
  alert('Đã tải lên ảnh AFTER thành công! Đã mở khoá hoàn tất đơn.');
};

const handleCompleteOrder = () => {
  if (!afterPhotoUploaded.value) {
    alert('Vui lòng chụp ảnh nghiệm thu AFTER trước khi hoàn tất đơn!');
    return;
  }
  isCompleted.value = true;
  if (job.value) job.value.status = 'COMPLETED';
  alert('Hoàn tất đơn sửa chữa thành công! Đã phát hành bảo hành điện tử 90 ngày cho khách hàng.');
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

    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang tải dữ liệu công việc...
    </div>

    <div v-else-if="job" class="space-y-6">
      <!-- Order Info Banner -->
      <FhCard>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
            <div>
              <div class="text-[11px] text-ink-400 font-mono">MÃ ĐƠN HÀNG:</div>
              <h1 class="text-xl font-bold font-mono text-ink-900">{{ job.code }}</h1>
            </div>

            <div class="text-right">
              <div class="text-[11px] text-ink-400">Khách hàng:</div>
              <div class="text-sm font-bold text-ink-900 flex items-center gap-2">
                {{ job.customerName }}
                <a :href="`tel:${job.customerPhone}`" class="text-brand-600 hover:underline inline-flex items-center gap-1 text-xs">
                  <Phone :size="13" /> Gọi điện
                </a>
              </div>
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
        <h3 class="text-base font-bold text-ink-900">Quy trình Thực thi Tiêu chuẩn (P5 / P6)</h3>

        <!-- Phase 1: GPS Check-In -->
        <FhCard title="1. Xác nhận có mặt tại hiện trường (GPS Geofence Check-in)">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <p class="text-ink-600 max-w-md">
              Bắt buộc check-in GPS trong bán kính ≤ 200m từ địa chỉ khách để mở khoá chụp ảnh hiện trạng và lập báo giá.
            </p>

            <FhButton
              :variant="gpsCheckedIn ? 'secondary' : 'primary'"
              size="sm"
              :disabled="gpsCheckedIn"
              @click="handleCheckIn"
            >
              <CheckCircle2 v-if="gpsCheckedIn" :size="15" class="mr-1.5 text-success-600" />
              <MapPin v-else :size="15" class="mr-1.5" />
              {{ gpsCheckedIn ? 'Đã check-in thành công' : 'Bấm Check-in GPS' }}
            </FhButton>
          </div>
        </FhCard>

        <!-- Phase 2: Evidence BEFORE -->
        <FhCard title="2. Bằng chứng hiện trạng lỗi (Evidence Gating BEFORE)">
          <div class="space-y-3 text-xs">
            <p class="text-ink-600">
              Quy chuẩn bắt buộc: Phải có ít nhất 1 ảnh BEFORE trước khi lập báo giá nhằm tránh tranh chấp.
            </p>

            <div class="flex items-center gap-4">
              <div
                class="w-24 h-24 rounded-[var(--radius-sm)] border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                :class="beforePhotoUploaded ? 'border-success-500 bg-success-50/50 text-success-700' : 'border-ink-300 hover:border-brand-500 text-ink-500'"
                @click="handleUploadBefore"
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
        <FhCard title="3. Lập báo giá phân tách Công & Phụ tùng (D-02 Standard)">
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

              <FhButton variant="primary" size="sm">
                <FileText :size="14" class="mr-1.5" /> Gửi báo giá cho khách duyệt
              </FhButton>
            </div>
          </div>
        </FhCard>

        <!-- Phase 4: Evidence AFTER & Electronic Warranty Definition -->
        <FhCard title="4. Ảnh hoàn tất AFTER & Kích hoạt bảo hành điện tử">
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
                :disabled="isCompleted"
                @click="handleCompleteOrder"
              >
                <ShieldCheck :size="16" class="mr-1.5" />
                {{ isCompleted ? 'Đơn hàng đã hoàn tất' : 'Xác nhận Hoàn tất & Kích hoạt bảo hành' }}
              </FhButton>
            </div>
          </div>
        </FhCard>
      </div>
    </div>
  </div>
</template>
