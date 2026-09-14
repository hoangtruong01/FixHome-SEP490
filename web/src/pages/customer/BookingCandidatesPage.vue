<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Send,
  Users,
} from 'lucide-vue-next';
import {
  FhButton,
  FhStatusPill,
} from '../../components';
import { bookingsApi, type TechnicianCandidate } from '../../api/bookings.api';

const route = useRoute();
const router = useRouter();
const bookingId = (route.params.id as string) || 'bk-829102';

const loading = ref(true);
const sending = ref(false);
const candidates = ref<TechnicianCandidate[]>([]);
const selectedIds = ref<string[]>([]);
const inviteSent = ref(false);

onMounted(async () => {
  try {
    const list = await bookingsApi.getCandidates(bookingId);
    candidates.value = list;
    // Preselect top 3 by default
    selectedIds.value = list.slice(0, 3).map((c) => c.id);
  } finally {
    loading.value = false;
  }
});

const toggleSelect = (id: string) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  } else {
    if (selectedIds.value.length >= 5) {
      alert('Theo quy định FixHome, bạn chỉ có thể chọn tối đa 5 kỹ thuật viên cho 1 lần ghép thợ.');
      return;
    }
    selectedIds.value.push(id);
  }
};

const handleSendShortlist = async () => {
  if (selectedIds.value.length === 0) {
    alert('Vui lòng chọn ít nhất 1 kỹ thuật viên.');
    return;
  }
  sending.value = true;
  try {
    await bookingsApi.sendShortlist(bookingId, selectedIds.value);
    inviteSent.value = true;
    setTimeout(() => {
      router.push('/app/orders');
    }, 2500);
  } catch {
    alert('Không thể gửi lời mời. Vui lòng thử lại.');
  } finally {
    sending.value = false;
  }
};

const selectedCount = computed(() => selectedIds.value.length);
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Users class="text-brand-600" :size="24" />
          Kỹ thuật viên Phù hợp gần bạn
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Hệ thống đã lọc danh sách thợ có tay nghề phù hợp, đang rảnh lịch và ở cự ly gần nhất.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-ink-600">Shortlist:</span>
        <span class="text-xs font-bold font-num px-2.5 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200">
          {{ selectedCount }} / 5 thợ
        </span>
      </div>
    </div>

    <!-- Rule Banner (Spec v1.2 Sequential Dispatch ≤5) -->
    <div class="p-3.5 rounded-[var(--radius-sm)] bg-brand-50/70 border border-brand-200 text-brand-900 flex items-start gap-2.5 text-xs">
      <ShieldCheck :size="16" class="text-brand-600 shrink-0 mt-0.5" />
      <div class="leading-relaxed">
        <strong>Cơ chế gửi lời mời tuần tự (Sequential Dispatch Spec v1.2):</strong> Hệ thống gửi lời mời lần lượt theo thứ tự ưu tiên của bạn. Thợ số 1 có 30 phút để xác nhận. Nếu từ chối hoặc hết giờ, hệ thống sẽ tự động chuyển sang thợ tiếp theo trong danh sách ưu tiên.
      </div>
    </div>

    <!-- Candidate List -->
    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang tải danh sách thợ phù hợp...
    </div>

    <div v-else class="space-y-3.5">
      <div
        v-for="tech in candidates"
        :key="tech.id"
        class="p-4 sm:p-5 rounded-[var(--radius-md)] border bg-white shadow-[var(--shadow-e1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
        :class="selectedIds.includes(tech.id) ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-ink-200 hover:border-ink-300'"
      >
        <div class="flex items-center gap-4">
          <input
            type="checkbox"
            :checked="selectedIds.includes(tech.id)"
            class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            @change="toggleSelect(tech.id)"
          />

          <div class="w-12 h-12 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm relative">
            {{ tech.fullName.charAt(0) }}
            <span
              v-if="selectedIds.includes(tech.id)"
              class="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
            >
              #{{ selectedIds.indexOf(tech.id) + 1 }}
            </span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm text-ink-900">{{ tech.fullName }}</h3>
              <FhStatusPill status="COMPLETED" label="ĐÃ XÁC THỰC" />
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span class="flex items-center gap-1 font-semibold text-amber-600">
                <Star :size="13" class="fill-amber-400" /> {{ tech.averageRating }} ({{ tech.ratingCount }})
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <Briefcase :size="13" class="text-ink-400" /> {{ tech.yearsExperience }} năm KN
              </span>
              <span v-if="tech.distanceKm != null">•</span>
              <span v-if="tech.distanceKm != null" class="flex items-center gap-1 text-brand-700 font-semibold font-num">
                <MapPin :size="13" /> Cách ~{{ tech.distanceKm }} km
              </span>
            </div>

            <div v-if="tech.listedLaborPrice" class="text-[11px] text-brand-800 font-medium pt-0.5">
              Giá công tham chiếu: <strong class="font-num font-bold text-brand-900"><FhMoney :amount="tech.listedLaborPrice" /></strong>
              <span v-if="tech.typicalWarrantyDays" class="text-ink-500 text-[10px] ml-1.5">
                (BH cam kết {{ tech.typicalWarrantyDays }} ngày)
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-ink-100">
          <div class="text-right hidden sm:block">
            <div class="text-[11px] text-ink-400">Độ tin cậy:</div>
            <div class="text-xs font-bold text-success-600 font-num">{{ tech.reliabilityScore }}%</div>
          </div>

          <FhButton
            :variant="selectedIds.includes(tech.id) ? 'primary' : 'secondary'"
            size="sm"
            @click="toggleSelect(tech.id)"
          >
            {{ selectedIds.includes(tech.id) ? `Ưu tiên #${selectedIds.indexOf(tech.id) + 1}` : 'Chọn thợ' }}
          </FhButton>
        </div>
      </div>
    </div>

    <!-- Success Feedback Modal -->
    <div
      v-if="inviteSent"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
        <CheckCircle2 :size="48" class="text-success-600 mx-auto" />
        <h3 class="text-lg font-bold text-ink-900">Đã gửi lời mời thành công!</h3>
        <p class="text-xs text-ink-600 leading-relaxed">
          Lời mời đang được chuyển tới {{ selectedCount }} kỹ thuật viên. Đang chuyển hướng bạn tới trang quản lý đơn...
        </p>
      </div>
    </div>

    <!-- Floating Sticky Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink-200 p-3.5 shadow-lg">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-4 px-4">
        <div class="text-xs text-ink-600">
          Đã chọn <strong class="text-brand-700 font-num text-sm">{{ selectedCount }}</strong> kỹ thuật viên (Tối đa 5)
        </div>

        <FhButton
          variant="primary"
          size="md"
          :disabled="selectedCount === 0"
          :loading="sending"
          @click="handleSendShortlist"
        >
          <Send :size="15" class="mr-1.5" /> Gửi lời mời đồng thời
        </FhButton>
      </div>
    </div>
  </div>
</template>
