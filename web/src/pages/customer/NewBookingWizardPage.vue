<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Wrench,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhMoney,
} from '../../components';
import { catalogApi, type ServiceCategory, type ServiceItem } from '../../api/catalog.api';
import { profileApi, type UserAddress } from '../../api/profile.api';
import { bookingsApi, type DiagnosisResult } from '../../api/bookings.api';

const router = useRouter();

const step = ref(1);
const loading = ref(false);

// Form State
const categories = ref<ServiceCategory[]>([]);
const selectedCategoryId = ref('');
const services = ref<ServiceItem[]>([]);
const selectedServiceId = ref('');
const description = ref('');
const urgency = ref<'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY'>('NORMAL');
const quantity = ref(1);
const preferredTimeWindow = ref('08:00 - 12:00');

const addresses = ref<UserAddress[]>([]);
const selectedAddressId = ref('');
const preferredDate = ref('TODAY');
const preferredTime = ref('EARLIEST');

// AI Diagnosis Result
const aiResult = ref<DiagnosisResult | null>(null);

const selectedService = computed(() => {
  for (const cat of categories.value) {
    const found = cat.services?.find((s) => s.id === selectedServiceId.value);
    if (found) return found;
  }
  return services.value.find((s) => s.id === selectedServiceId.value);
});

const isFixedPrice = computed(() => {
  const mode = selectedService.value?.pricingMode;
  return mode === 'FIXED_PRICE' || mode === 'fixed_price';
});

onMounted(async () => {
  try {
    const [cats, addrs] = await Promise.all([
      catalogApi.getCategories(true),
      profileApi.getAddresses(),
    ]);
    categories.value = cats;
    if (cats.length > 0) {
      selectedCategoryId.value = cats[0].id;
      services.value = cats[0].services ?? [];
      if (services.value.length > 0) {
        selectedServiceId.value = services.value[0].id;
      }
    }
    addresses.value = addrs;
    const defAddr = addrs.find((a) => a.isDefault);
    if (defAddr) selectedAddressId.value = defAddr.id;
    else if (addrs.length > 0) selectedAddressId.value = addrs[0].id;
  } catch {
    // Fallback if offline
    categories.value = [
      { id: 'cat-1', name: 'Điện lạnh', code: 'DIEN_LANH', sortOrder: 1, isActive: true },
      { id: 'cat-2', name: 'Điện & Nước', code: 'DIEN_NUOC', sortOrder: 2, isActive: true },
    ];
    services.value = [
      { id: 's1', categoryId: 'cat-1', name: 'Sửa điều hòa không mát / chảy nước', code: 'SUA_DH', estimatedMinutes: 60, isActive: true },
    ];
    selectedCategoryId.value = 'cat-1';
    selectedServiceId.value = 's1';
  }
});

const onCategorySelect = (catId: string) => {
  selectedCategoryId.value = catId;
  const cat = categories.value.find((c) => c.id === catId);
  services.value = cat?.services ?? [];
  if (services.value.length > 0) {
    selectedServiceId.value = services.value[0].id;
  } else {
    selectedServiceId.value = '';
  }
};

const goToStep2 = () => {
  if (!selectedServiceId.value) {
    window.alert('Vui lòng chọn một dịch vụ cụ thể.');
    return;
  }
  if (!description.value.trim()) {
    window.alert('Vui lòng mô tả sơ bộ tình trạng lỗi của thiết bị.');
    return;
  }
  step.value = 2;
};

const goToStep3 = async () => {
  if (!selectedAddressId.value && addresses.value.length > 0) {
    window.alert('Vui lòng chọn địa chỉ sửa chữa.');
    return;
  }
  step.value = 3;
  loading.value = true;
  try {
    const res = await bookingsApi.diagnoseAI({
      description: description.value,
      serviceId: selectedServiceId.value,
    });
    aiResult.value = res;
  } catch {
    aiResult.value = {
      possibleIssues: ['Lưới lọc bẩn hoặc thiếu gas'],
      possibleCauses: ['Chưa bảo dưỡng hơn 6 tháng'],
      suggestedPriceMin: 150000,
      suggestedPriceMax: 350000,
      confidence: 0.9,
    };
  } finally {
    loading.value = false;
  }
};

const createAndFindTech = async () => {
  loading.value = true;
  try {
    const booking = await bookingsApi.createBooking({
      serviceId: selectedServiceId.value,
      addressId: selectedAddressId.value || 'mock-addr',
      description: description.value,
      preferredAt: new Date().toISOString(),
      preferredTimeWindow: preferredTimeWindow.value,
      quantity: isFixedPrice.value ? quantity.value : 1,
      urgency: urgency.value,
    });
    router.push(`/app/bookings/${booking.id}/candidates`);
  } catch {
    window.alert('Không thể tạo yêu cầu đặt thợ. Vui lòng thử lại.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Stepper Navigation Header -->
    <div class="bg-white rounded-[var(--radius-md)] border border-ink-200 p-4 shadow-[var(--shadow-e1)]">
      <div class="flex items-center justify-between text-xs font-semibold">
        <div class="flex items-center gap-2" :class="step >= 1 ? 'text-brand-600 font-bold' : 'text-ink-400'">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" :class="step >= 1 ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'">1</span>
          <span>Dịch vụ & Lỗi</span>
        </div>
        <div class="w-10 h-0.5" :class="step >= 2 ? 'bg-brand-600' : 'bg-ink-200'"></div>
        <div class="flex items-center gap-2" :class="step >= 2 ? 'text-brand-600 font-bold' : 'text-ink-400'">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" :class="step >= 2 ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'">2</span>
          <span>Địa chỉ & Giờ</span>
        </div>
        <div class="w-10 h-0.5" :class="step >= 3 ? 'bg-brand-600' : 'bg-ink-200'"></div>
        <div class="flex items-center gap-2" :class="step >= 3 ? 'text-brand-600 font-bold' : 'text-ink-400'">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" :class="step >= 3 ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'">3</span>
          <span>AI Chẩn đoán</span>
        </div>
        <div class="w-10 h-0.5" :class="step >= 4 ? 'bg-brand-600' : 'bg-ink-200'"></div>
        <div class="flex items-center gap-2" :class="step >= 4 ? 'text-brand-600 font-bold' : 'text-ink-400'">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" :class="step >= 4 ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'">4</span>
          <span>Xác nhận</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Service & Issue Description -->
    <div v-if="step === 1" class="space-y-6">
      <FhCard title="Bước 1: Chọn loại sự cố & Mô tả hư hỏng">
        <div class="space-y-5 text-xs sm:text-sm">
          <!-- Categories Pill -->
          <div>
            <label class="block font-semibold text-ink-700 mb-2">Nhóm dịch vụ</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                class="px-3.5 py-2 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors"
                :class="selectedCategoryId === cat.id ? 'bg-brand-600 text-white shadow-sm' : 'bg-ink-50 text-ink-700 border border-ink-200 hover:bg-ink-100'"
                @click="onCategorySelect(cat.id)"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Specific Service Select -->
          <div>
            <label class="block font-semibold text-ink-700 mb-1.5">Dịch vụ cần sửa *</label>
            <select
              v-model="selectedServiceId"
              class="w-full h-10 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-600"
            >
              <option v-for="svc in services" :key="svc.id" :value="svc.id">
                {{ svc.name }} (~{{ svc.estimatedMinutes }} phút)
              </option>
            </select>
          </div>

          <!-- Spec v1.2 Fixed Price Package Info & Quantity Selector -->
          <div v-if="isFixedPrice" class="p-3.5 rounded bg-brand-50 border border-brand-200 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-600 text-white">
                  Gói trọn gói chuẩn
                </span>
                <span class="font-bold text-xs text-brand-900">
                  {{ selectedService?.name }}
                </span>
              </div>
              <div class="text-xs font-bold text-brand-700 font-num">
                <FhMoney :amount="selectedService?.fixedPrice || selectedService?.basePrice || 0" /> / {{ selectedService?.unit || 'thiết bị' }}
              </div>
            </div>
            <p v-if="selectedService?.scopeDescription" class="text-[11px] text-ink-600">
              <strong>Phạm vi gói:</strong> {{ selectedService.scopeDescription }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-brand-200 text-xs">
              <label class="font-semibold text-ink-700">Số lượng ({{ selectedService?.unit || 'thiết bị' }}):</label>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="w-7 h-7 rounded border border-ink-300 bg-white font-bold flex items-center justify-center hover:bg-ink-100"
                  @click="quantity = Math.max(1, quantity - 1)"
                >
                  -
                </button>
                <span class="font-bold font-num text-sm text-ink-900">{{ quantity }}</span>
                <button
                  type="button"
                  class="w-7 h-7 rounded border border-ink-300 bg-white font-bold flex items-center justify-center hover:bg-ink-100"
                  @click="quantity++"
                >
                  +
                </button>
                <div class="ml-2 font-bold text-brand-700 font-num">
                  = <FhMoney :amount="(selectedService?.fixedPrice || selectedService?.basePrice || 0) * quantity" />
                </div>
              </div>
            </div>
          </div>

          <!-- Issue Description -->
          <div>
            <label class="block font-semibold text-ink-700 mb-1.5">Mô tả hiện tượng hư hỏng *</label>
            <textarea
              v-model="description"
              rows="4"
              class="w-full p-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-600 leading-relaxed"
              placeholder="Ví dụ: Máy lạnh mở 18 độ nhưng cả phòng vẫn nóng, quạt dàn lạnh có tiếng kêu rè rè và nhỏ nước xuống góc tường..."
            ></textarea>
          </div>

          <!-- Urgency Level -->
          <div>
            <label class="block font-semibold text-ink-700 mb-2">Mức độ khẩn cấp</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                v-for="lvl in [
                  { key: 'LOW', label: 'Bình thường', hint: 'Trong 24-48h' },
                  { key: 'NORMAL', label: 'Tiêu chuẩn', hint: 'Trong ngày' },
                  { key: 'HIGH', label: 'Khẩn cấp', hint: 'Trong 1-2h' },
                  { key: 'EMERGENCY', label: 'Cực khẩn cấp', hint: 'Dưới 30 phút' },
                ]"
                :key="lvl.key"
                type="button"
                class="p-2.5 rounded-[var(--radius-sm)] border text-left transition-colors"
                :class="urgency === lvl.key ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-1 ring-brand-600' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'"
                @click="urgency = (lvl.key as any)"
              >
                <div class="font-bold text-xs">{{ lvl.label }}</div>
                <div class="text-[10px] text-ink-400 mt-0.5">{{ lvl.hint }}</div>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-5 mt-5 border-t border-ink-100">
          <FhButton variant="primary" size="md" @click="goToStep2">
            Tiếp tục <ArrowRight :size="15" class="ml-1.5" />
          </FhButton>
        </div>
      </FhCard>
    </div>

    <!-- Step 2: Address & Schedule -->
    <div v-if="step === 2" class="space-y-6">
      <FhCard title="Bước 2: Địa chỉ & Thời gian thực hiện">
        <div class="space-y-5 text-xs sm:text-sm">
          <div>
            <label class="block font-semibold text-ink-700 mb-2">Chọn địa chỉ sửa chữa</label>
            <div class="space-y-2">
              <div
                v-for="addr in addresses"
                :key="addr.id"
                class="p-3.5 rounded-[var(--radius-sm)] border cursor-pointer flex items-center justify-between transition-colors"
                :class="selectedAddressId === addr.id ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600' : 'border-ink-200 bg-white hover:bg-ink-50'"
                @click="selectedAddressId = addr.id"
              >
                <div class="space-y-0.5">
                  <div class="font-bold text-xs text-ink-900 flex items-center gap-1.5">
                    <MapPin :size="14" class="text-brand-600" />
                    {{ addr.label || 'Địa chỉ' }}
                  </div>
                  <div class="text-xs text-ink-700">{{ addr.line1 }}</div>
                  <div class="text-[11px] text-ink-400">{{ addr.district }}, {{ addr.province }}</div>
                </div>
                <CheckCircle2 v-if="selectedAddressId === addr.id" :size="18" class="text-brand-600 shrink-0" />
              </div>

              <router-link to="/app/profile" class="inline-flex items-center gap-1 text-xs text-brand-600 font-semibold pt-1 hover:underline">
                + Thêm địa chỉ mới vào danh bạ
              </router-link>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-ink-100">
            <div>
              <label class="block font-semibold text-ink-700 mb-1.5">Ngày hẹn</label>
              <select
                v-model="preferredDate"
                class="w-full h-10 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-600"
              >
                <option value="TODAY">Hôm nay (Càng sớm càng tốt)</option>
                <option value="TOMORROW">Ngày mai</option>
                <option value="WEEKEND">Cuối tuần này</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-ink-700 mb-1.5">Khung giờ mong muốn</label>
              <select
                v-model="preferredTime"
                class="w-full h-10 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-600"
              >
                <option value="EARLIEST">Sớm nhất (Thợ có mặt ngay)</option>
                <option value="MORNING">Buổi sáng (08:00 – 12:00)</option>
                <option value="AFTERNOON">Buổi chiều (13:30 – 17:30)</option>
                <option value="EVENING">Buổi tối (18:00 – 20:30)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-5 mt-5 border-t border-ink-100">
          <FhButton variant="ghost" size="md" @click="step = 1">
            <ArrowLeft :size="15" class="mr-1.5" /> Quay lại
          </FhButton>
          <FhButton variant="primary" size="md" @click="goToStep3">
            Phân tích AI <Sparkles :size="15" class="ml-1.5" />
          </FhButton>
        </div>
      </FhCard>
    </div>

    <!-- Step 3: AI Diagnosis -->
    <div v-if="step === 3" class="space-y-6">
      <FhCard title="Bước 3: Kết quả Chẩn đoán Sơ bộ bằng AI (FixHome Gemini)">
        <div v-if="loading" class="text-center py-10 space-y-3">
          <Sparkles class="animate-spin text-brand-600 mx-auto" :size="32" />
          <p class="text-xs text-ink-500 font-medium">AI đang đối chiếu triệu chứng với cơ sở dữ liệu 50,000+ ca sửa chữa...</p>
        </div>

        <div v-else-if="aiResult" class="space-y-5 text-xs sm:text-sm">
          <div class="p-4 rounded-[var(--radius-sm)] bg-brand-50 border border-brand-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-900 flex items-center gap-1.5 text-xs">
                <Sparkles :size="15" class="text-brand-600" /> Khả năng chẩn đoán chính xác: {{ Math.round(aiResult.confidence * 100) }}%
              </span>
              <span class="text-[11px] text-brand-700 font-medium">Model: Gemini 1.5 Flash</span>
            </div>

            <div>
              <div class="text-xs font-semibold text-brand-950 mb-1.5">Sự cố tiềm ẩn được phát hiện:</div>
              <ul class="list-disc list-inside space-y-1 text-xs text-brand-900">
                <li v-for="iss in aiResult.possibleIssues" :key="iss">{{ iss }}</li>
              </ul>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3.5 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200">
              <div class="font-semibold text-ink-800 text-xs mb-1">Nguyên nhân cốt lõi</div>
              <ul class="list-disc list-inside space-y-1 text-xs text-ink-600">
                <li v-for="c in aiResult.possibleCauses" :key="c">{{ c }}</li>
              </ul>
            </div>

            <div class="p-3.5 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200 flex flex-col justify-between">
              <div>
                <div class="font-semibold text-ink-800 text-xs mb-0.5">Ước tính công thợ tiêu chuẩn</div>
                <div class="text-xs text-ink-400">Không bao gồm phụ tùng thay mới</div>
              </div>
              <div class="text-lg font-bold font-num text-brand-700 mt-2">
                <FhMoney :amount="aiResult.suggestedPriceMin" /> – <FhMoney :amount="aiResult.suggestedPriceMax" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-5 mt-5 border-t border-ink-100">
          <FhButton variant="ghost" size="md" @click="step = 2">
            <ArrowLeft :size="15" class="mr-1.5" /> Quay lại
          </FhButton>
          <FhButton variant="primary" size="md" @click="step = 4">
            Xác nhận đặt đơn <ArrowRight :size="15" class="ml-1.5" />
          </FhButton>
        </div>
      </FhCard>
    </div>

    <!-- Step 4: Final Summary & Launch Matching -->
    <div v-if="step === 4" class="space-y-6">
      <FhCard title="Bước 4: Xác nhận & Kích hoạt Ghép thợ">
        <div class="space-y-4 text-xs sm:text-sm">
          <div class="p-4 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-ink-500">Dịch vụ yêu cầu:</span>
              <span class="font-bold text-ink-900">{{ services.find((s) => s.id === selectedServiceId)?.name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-ink-500">Thời gian mong muốn:</span>
              <span class="font-bold text-ink-900">Hôm nay (Sớm nhất có thể)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-ink-500">Mức độ khẩn cấp:</span>
              <span class="font-bold text-brand-700">{{ urgency }}</span>
            </div>
          </div>

          <div class="p-3.5 rounded-[var(--radius-sm)] bg-warning-50 border border-warning-200 text-warning-900 flex items-start gap-2.5">
            <AlertTriangle :size="16" class="text-warning-600 shrink-0 mt-0.5" />
            <p class="text-xs leading-relaxed">
              Hệ thống sẽ lọc ra các kỹ thuật viên gần bạn nhất, đáp ứng đầy đủ tiêu chí tay nghề và đang rảnh lịch. Bạn có thể duyệt hồ sơ và chọn tối đa 5 thợ vào danh sách gửi lời mời.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-5 mt-5 border-t border-ink-100">
          <FhButton variant="ghost" size="md" @click="step = 3">
            <ArrowLeft :size="15" class="mr-1.5" /> Quay lại
          </FhButton>
          <FhButton
            variant="primary"
            size="lg"
            :loading="loading"
            @click="createAndFindTech"
          >
            Tìm kỹ thuật viên ngay <Wrench :size="16" class="ml-1.5" />
          </FhButton>
        </div>
      </FhCard>
    </div>
  </div>
</template>
