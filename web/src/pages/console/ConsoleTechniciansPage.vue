<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckCircle2, XCircle, FileText, ShieldCheck } from 'lucide-vue-next';
import { FhButton, FhCard, FhTable, FhStatusPill, FhConfirmDialog } from '../../components';

const statusFilter = ref('ALL');
const searchQuery = ref('');

interface TechDoc {
  name: string;
  url: string;
}

interface TechItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  experienceYears: number;
  skills: string[];
  citizenId: string;
  status: string;
  documents: TechDoc[];
}

const technicians = ref<TechItem[]>([
  {
    id: 't-01',
    fullName: 'Lê Hoàng Long',
    phoneNumber: '0934567890',
    email: 'tech.long@fixhome.vn',
    experienceYears: 4,
    skills: ['Điện lạnh', 'Điện dân dụng'],
    citizenId: '001095012345',
    status: 'PENDING',
    documents: [
      { name: 'CCCD Mặt trước', url: '#' },
      { name: 'CCCD Mặt sau', url: '#' },
      { name: 'Chứng chỉ nghề Điện Lạnh ĐH CN', url: '#' },
    ],
  },
  {
    id: 't-02',
    fullName: 'Nguyễn Văn Hùng',
    phoneNumber: '0912345678',
    email: 'tech1@fixhome.vn',
    experienceYears: 6,
    skills: ['Điện lạnh', 'Khóa thông minh'],
    citizenId: '001088009876',
    status: 'APPROVED',
    documents: [
      { name: 'CCCD Mặt trước', url: '#' },
      { name: 'Chứng chỉ thợ điện bậc 4', url: '#' },
    ],
  },
  {
    id: 't-03',
    fullName: 'Đỗ Văn Toàn',
    phoneNumber: '0977889900',
    email: 'tech.toan@fixhome.vn',
    experienceYears: 1,
    skills: ['Điện nước'],
    citizenId: '001102005432',
    status: 'REJECTED',
    documents: [{ name: 'CCCD Mặt trước', url: '#' }],
  },
]);

const filteredTechnicians = computed(() => {
  return technicians.value.filter((t) => {
    const matchesStatus = statusFilter.value === 'ALL' || t.status === statusFilter.value;
    const matchesSearch = !searchQuery.value ||
      t.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.phoneNumber.includes(searchQuery.value) ||
      t.citizenId.includes(searchQuery.value);
    return matchesStatus && matchesSearch;
  });
});

const showRejectModal = ref(false);
const techToReject = ref<string | null>(null);
const rejectReason = ref('');

const openDoc = (name: string) => {
  window.alert(`Mở tài liệu: ${name}`);
};

const handleApprove = (tech: TechItem) => {
  tech.status = 'APPROVED';
  window.alert(`Đã duyệt thành công hồ sơ cho kỹ thuật viên "${tech.fullName}". Tài khoản đã được cấp quyền nhận đơn.`);
};

const openReject = (tech: TechItem) => {
  techToReject.value = tech.id;
  rejectReason.value = 'Hồ sơ chưa đủ chứng chỉ kỹ thuật hành nghề';
  showRejectModal.value = true;
};

const confirmReject = () => {
  const t = technicians.value.find((item) => item.id === techToReject.value);
  if (t) t.status = 'REJECTED';
  showRejectModal.value = false;
  techToReject.value = null;
  window.alert('Đã từ chối hồ sơ và gửi lý do tới email của kỹ thuật viên.');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <ShieldCheck class="text-brand-600" :size="24" />
          Xác thực & Thẩm định Kỹ thuật viên
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Quy trình thẩm định 100% lý lịch tư pháp, căn cước công dân và bằng cấp chứng chỉ thợ FixHome.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo tên, SĐT, CCCD..."
          class="h-9 px-3 text-xs bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-700 w-48 sm:w-60 focus:outline-none focus:border-brand-500"
        />
        <select
          v-model="statusFilter"
          class="h-9 px-3 text-xs bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-700 focus:outline-none focus:border-brand-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ thẩm định (Pending)</option>
          <option value="APPROVED">Đã xác thực (Approved)</option>
          <option value="REJECTED">Từ chối (Rejected)</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'tech', label: 'Kỹ thuật viên' },
          { key: 'experience', label: 'Kinh nghiệm', width: '120px' },
          { key: 'skills', label: 'Kỹ năng đăng ký' },
          { key: 'documents', label: 'Hồ sơ chứng chỉ' },
          { key: 'status', label: 'Trạng thái', width: '130px' },
          { key: 'actions', label: 'Thao tác', width: '160px' },
        ]"
        :rows="filteredTechnicians"
      >
        <template #cell-tech="{ row }">
          <div class="font-semibold text-xs text-ink-900">{{ row.fullName }}</div>
          <div class="text-[11px] text-ink-500 font-mono">{{ row.phoneNumber }} • CCCD: {{ row.citizenId }}</div>
        </template>

        <template #cell-experience="{ row }">
          <span class="text-xs font-num font-semibold text-ink-700">{{ row.experienceYears }} năm</span>
        </template>

        <template #cell-skills="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="s in row.skills"
              :key="s"
              class="px-2 py-0.5 rounded text-[10px] font-semibold bg-ink-100 text-ink-700"
            >
              {{ s }}
            </span>
          </div>
        </template>

        <template #cell-documents="{ row }">
          <div class="space-y-0.5 text-[11px]">
            <a
              v-for="d in row.documents"
              :key="d.name"
              href="#"
              class="text-brand-600 hover:underline flex items-center gap-1"
              @click.prevent="openDoc(d.name)"
            >
              <FileText :size="12" /> {{ d.name }}
            </a>
          </div>
        </template>

        <template #cell-status="{ row }">
          <FhStatusPill
            :status="row.status === 'APPROVED' ? 'COMPLETED' : row.status === 'PENDING' ? 'PENDING' : 'CANCELLED'"
            :label="row.status === 'APPROVED' ? 'ĐÃ DUYỆT' : row.status === 'PENDING' ? 'CHỜ DUYỆT' : 'TỪ CHỐI'"
          />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <FhButton
              v-if="row.status !== 'APPROVED'"
              variant="primary"
              size="sm"
              @click="handleApprove(row)"
            >
              <CheckCircle2 :size="14" class="mr-1" /> Duyệt
            </FhButton>

            <FhButton
              v-if="row.status !== 'REJECTED'"
              variant="danger"
              size="sm"
              @click="openReject(row)"
            >
              <XCircle :size="14" class="mr-1" /> Từ chối
            </FhButton>
          </div>
        </template>
      </FhTable>
    </FhCard>

    <!-- Reject Confirmation Dialog -->
    <FhConfirmDialog
      :open="showRejectModal"
      title="Từ chối hồ sơ Kỹ thuật viên"
      consequence="Tài khoản này sẽ không được cấp quyền nhận đơn từ khách hàng."
      confirm-text="Xác nhận từ chối"
      cancel-text="Quay lại"
      @confirm="confirmReject"
      @cancel="showRejectModal = false"
    />
  </div>
</template>
