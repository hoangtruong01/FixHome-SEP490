<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, Clock, MapPin, CheckCircle2, XCircle } from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhCountdown,
} from '../../components';
import { bookingsApi, type InvitationItem } from '../../api/bookings.api';

const router = useRouter();

const loading = ref(true);
const invitations = ref<InvitationItem[]>([]);
const responding = ref(false);

onMounted(async () => {
  try {
    const list = await bookingsApi.getMyInvitations();
    invitations.value = list;
  } finally {
    loading.value = false;
  }
});

const handleAccept = async (inv: InvitationItem) => {
  responding.value = true;
  try {
    await bookingsApi.respondInvitation(inv.id, 'ACCEPT');
    alert('Nhận đơn thành công! Đang chuyển bạn đến workspace thực thi công việc.');
    router.push('/tech/jobs');
  } catch {
    alert('Không thể nhận đơn (có thể đã có thợ khác nhận trước hoặc hết hạn).');
  } finally {
    responding.value = false;
  }
};

const handleDecline = async (inv: InvitationItem) => {
  try {
    await bookingsApi.respondInvitation(inv.id, 'DECLINE');
    invitations.value = invitations.value.filter((i) => i.id !== inv.id);
  } catch {
    invitations.value = invitations.value.filter((i) => i.id !== inv.id);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Mail class="text-brand-600" :size="24" />
          Hộp Thư Mời Nhận Việc (Inbox)
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Khách hàng đã chọn bạn vào danh sách đề xuất. Hãy phản hồi trước khi hết thời gian chờ (TTL).
        </p>
      </div>

      <span class="text-xs font-bold font-num px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
        {{ invitations.length }} lời mời đang chờ
      </span>
    </div>

    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang kiểm tra thư mời...
    </div>

    <div v-else-if="invitations.length === 0" class="text-center py-16 bg-white rounded-[var(--radius-md)] border border-ink-200 space-y-2">
      <Mail :size="40" class="mx-auto text-ink-300" />
      <h3 class="text-sm font-bold text-ink-800">Không có lời mời nào đang chờ</h3>
      <p class="text-xs text-ink-500">Khi có khách hàng ở khu vực của bạn cần thợ, thông báo sẽ hiển thị tại đây.</p>
    </div>

    <div v-else class="space-y-4">
      <FhCard
        v-for="inv in invitations"
        :key="inv.id"
        class="border-l-4 border-l-brand-600 space-y-4"
      >
        <!-- Top: TTL Countdown & Priority -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-brand-700">Ưu tiên số #{{ inv.priorityOrder }}</span>
            <span class="text-ink-400">•</span>
            <span class="text-ink-500">Mã đơn: {{ inv.bookingId }}</span>
          </div>

          <!-- Countdown Timer Component (P7.7) -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-ink-500 flex items-center gap-1">
              <Clock :size="14" class="text-danger-500" /> Hết hạn sau:
            </span>
            <FhCountdown :expires-at="inv.expiresAt" />
          </div>
        </div>

        <!-- Service & Address details -->
        <div class="space-y-2 text-xs sm:text-sm">
          <h3 class="font-bold text-base text-ink-900">
            {{ inv.booking?.serviceName }}
          </h3>

          <div class="text-xs text-ink-600 flex items-center gap-1.5">
            <MapPin :size="14" class="text-brand-600 shrink-0" />
            {{ inv.booking?.addressSummary }}
          </div>

          <p class="text-xs text-ink-700 p-3 rounded bg-ink-50 border border-ink-200 leading-relaxed">
            "{{ inv.booking?.description }}"
          </p>
        </div>

        <!-- Actions -->
        <div class="pt-3 border-t border-ink-100 flex items-center justify-end gap-3">
          <FhButton
            variant="ghost"
            size="md"
            @click="handleDecline(inv)"
          >
            <XCircle :size="16" class="mr-1.5 text-ink-400" /> Bỏ qua
          </FhButton>

          <FhButton
            variant="primary"
            size="md"
            :loading="responding"
            @click="handleAccept(inv)"
          >
            <CheckCircle2 :size="16" class="mr-1.5" /> Chấp nhận đơn này
          </FhButton>
        </div>
      </FhCard>
    </div>
  </div>
</template>
