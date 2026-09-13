<script setup lang="ts">
import { ref } from 'vue';
import { Users, Lock, Unlock, Search } from 'lucide-vue-next';
import { FhCard, FhTable, FhStatusPill, FhConfirmDialog } from '../../../components';

const roleFilter = ref('ALL');
const searchQuery = ref('');

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
}

const users = ref<UserRecord[]>([
  {
    id: 'u-1',
    fullName: 'System Administrator',
    email: 'admin@fixhome.vn',
    phoneNumber: '0900000000',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
  },
  {
    id: 'u-2',
    fullName: 'Service Manager HCM',
    email: 'sm.hcm@fixhome.vn',
    phoneNumber: '0901111111',
    role: 'SERVICE_MANAGER',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
  },
  {
    id: 'u-3',
    fullName: 'Service Manager HN',
    email: 'sm.hn@fixhome.vn',
    phoneNumber: '0902222222',
    role: 'SERVICE_MANAGER',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
  },
  {
    id: 'u-4',
    fullName: 'Nguyễn Văn Hùng',
    email: 'tech1@fixhome.vn',
    phoneNumber: '0912345678',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    createdAt: '2026-09-05',
  },
  {
    id: 'u-5',
    fullName: 'Trần Thị Mai',
    email: 'customer1@fixhome.vn',
    phoneNumber: '0988123456',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-09-08',
  },
  {
    id: 'u-6',
    fullName: 'Khách hàng Vi Phạm',
    email: 'customer.suspended@fixhome.vn',
    phoneNumber: '0988999888',
    role: 'CUSTOMER',
    status: 'LOCKED',
    createdAt: '2026-09-09',
  },
]);

const showLockModal = ref(false);
const userToLock = ref<UserRecord | null>(null);

const triggerToggleStatus = (user: UserRecord) => {
  userToLock.value = user;
  showLockModal.value = true;
};

const confirmLockToggle = () => {
  if (userToLock.value) {
    userToLock.value.status = userToLock.value.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
  }
  showLockModal.value = false;
  window.alert('Đã cập nhật trạng thái tài khoản thành công! Hành động được ghi vào Audit Log.');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Users class="text-brand-600" :size="24" />
          Quản trị Danh bạ Người dùng (Admin Users)
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Quản lý toàn bộ 4 vai trò trong hệ thống: Admin, Service Manager, Kỹ thuật viên và Khách hàng.
        </p>
      </div>
    </div>

    <!-- Search & Role Filters -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-[var(--radius-sm)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="relative flex-1 min-w-[240px] max-w-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo tên, email hoặc SĐT..."
          class="w-full h-9 pl-9 pr-3 text-xs bg-ink-50 border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 focus:bg-white"
        />
        <Search :size="15" class="absolute left-3 top-2.5 text-ink-400" />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-ink-500">Vai trò:</span>
        <select
          v-model="roleFilter"
          class="h-9 px-3 text-xs bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-700"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SERVICE_MANAGER">SERVICE_MANAGER</option>
          <option value="TECHNICIAN">TECHNICIAN</option>
          <option value="CUSTOMER">CUSTOMER</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'name', label: 'Họ và tên' },
          { key: 'email', label: 'Email & SĐT' },
          { key: 'role', label: 'Vai trò', width: '150px' },
          { key: 'createdAt', label: 'Ngày tạo', width: '120px' },
          { key: 'status', label: 'Trạng thái', width: '130px' },
          { key: 'actions', label: 'Thao tác', width: '100px' },
        ]"
        :rows="users.filter((u) => roleFilter === 'ALL' || u.role === roleFilter)"
      >
        <template #cell-name="{ row }">
          <div class="font-bold text-xs text-ink-900">{{ row.fullName }}</div>
        </template>

        <template #cell-email="{ row }">
          <div class="text-xs text-ink-700 font-mono">{{ row.email }}</div>
          <div class="text-[11px] text-ink-400 font-num">{{ row.phoneNumber }}</div>
        </template>

        <template #cell-role="{ row }">
          <span
            class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
            :class="{
              'bg-purple-100 text-purple-800': row.role === 'ADMIN',
              'bg-blue-100 text-blue-800': row.role === 'SERVICE_MANAGER',
              'bg-brand-100 text-brand-800': row.role === 'TECHNICIAN',
              'bg-ink-100 text-ink-800': row.role === 'CUSTOMER',
            }"
          >
            {{ row.role }}
          </span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="text-xs text-ink-500 font-num">{{ row.createdAt }}</span>
        </template>

        <template #cell-status="{ row }">
          <FhStatusPill
            :status="row.status === 'ACTIVE' ? 'COMPLETED' : 'CANCELLED'"
            :label="row.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'"
          />
        </template>

        <template #cell-actions="{ row }">
          <button
            v-if="row.role !== 'ADMIN'"
            class="p-1.5 rounded transition-colors"
            :class="row.status === 'ACTIVE' ? 'text-danger-500 hover:bg-danger-50' : 'text-success-600 hover:bg-success-50'"
            :title="row.status === 'ACTIVE' ? 'Khoá tài khoản' : 'Mở khoá tài khoản'"
            @click="triggerToggleStatus(row)"
          >
            <Lock v-if="row.status === 'ACTIVE'" :size="15" />
            <Unlock v-else :size="15" />
          </button>
          <span v-else class="text-[11px] text-ink-400 italic">Hệ thống</span>
        </template>
      </FhTable>
    </FhCard>

    <!-- Confirm Lock Dialog -->
    <FhConfirmDialog
      :open="showLockModal"
      :title="userToLock?.status === 'ACTIVE' ? 'Khoá tài khoản người dùng' : 'Mở khoá tài khoản'"
      consequence="Tài khoản khi bị khoá sẽ không thể đăng nhập hoặc thực hiện bất kỳ giao dịch nào trên toàn hệ thống."
      :confirm-text="userToLock?.status === 'ACTIVE' ? 'Khoá tài khoản' : 'Mở khoá'"
      cancel-text="Quay lại"
      @confirm="confirmLockToggle"
      @cancel="showLockModal = false"
    />
  </div>
</template>
