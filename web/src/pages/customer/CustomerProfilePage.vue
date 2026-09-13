<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, MapPin, Plus, Trash2, Check, Star } from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhStatusPill,
  FhConfirmDialog,
} from '../../components';
import { profileApi, type UserAddress } from '../../api/profile.api';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const activeTab = ref<'profile' | 'addresses'>('profile');

const fullName = ref('');
const phoneNumber = ref('');
const avatarUrl = ref('');
const isSaving = ref(false);
const saveSuccess = ref(false);

const addresses = ref<UserAddress[]>([]);
const loadingAddresses = ref(false);

// Address Modal
const showAddressModal = ref(false);
const addressForm = ref({
  label: 'Nhà riêng',
  line1: '',
  ward: '',
  district: '',
  province: 'Hà Nội',
  isDefault: false,
});

// Delete Confirmation
const showDeleteConfirm = ref(false);
const addressToDelete = ref<string | null>(null);

onMounted(async () => {
  if (authStore.user) {
    fullName.value = authStore.user.fullName;
    phoneNumber.value = authStore.user.phoneNumber ?? '';
    avatarUrl.value = authStore.user.avatarUrl ?? '';
  }
  await loadAddresses();
});

const loadAddresses = async () => {
  loadingAddresses.value = true;
  try {
    const data = await profileApi.getAddresses();
    addresses.value = data;
  } catch {
    addresses.value = [];
  } finally {
    loadingAddresses.value = false;
  }
};

const handleSaveProfile = async () => {
  isSaving.value = true;
  saveSuccess.value = false;
  try {
    const updated = await profileApi.updateMe({
      fullName: fullName.value.trim(),
      phoneNumber: phoneNumber.value.trim() || undefined,
      avatarUrl: avatarUrl.value.trim() || undefined,
    });
    if (authStore.user && authStore.token) {
      authStore.setAuth(authStore.token, {
        ...authStore.user,
        ...updated,
        role: authStore.user.role,
      });
    }
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch {
    alert('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
  } finally {
    isSaving.value = false;
  }
};

const handleAddAddress = async () => {
  if (!addressForm.value.line1 || !addressForm.value.district || !addressForm.value.province) {
    alert('Vui lòng điền đủ địa chỉ số nhà, quận/huyện và tỉnh/thành.');
    return;
  }
  try {
    await profileApi.createAddress({
      label: addressForm.value.label,
      line1: addressForm.value.line1,
      ward: addressForm.value.ward || undefined,
      district: addressForm.value.district,
      province: addressForm.value.province,
      isDefault: addressForm.value.isDefault,
    });
    showAddressModal.value = false;
    addressForm.value = {
      label: 'Nhà riêng',
      line1: '',
      ward: '',
      district: '',
      province: 'Hà Nội',
      isDefault: false,
    };
    await loadAddresses();
  } catch {
    alert('Không thể lưu địa chỉ. Vui lòng thử lại.');
  }
};

const triggerDeleteAddress = (id: string) => {
  addressToDelete.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (addressToDelete.value) {
    try {
      await profileApi.deleteAddress(addressToDelete.value);
      await loadAddresses();
    } catch {
      alert('Không thể xoá địa chỉ.');
    }
  }
  showDeleteConfirm.value = false;
  addressToDelete.value = null;
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight">
          Hồ sơ cá nhân & Sổ địa chỉ
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Quản lý thông tin tài khoản và danh sách địa chỉ nhận thợ sửa chữa.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <FhStatusPill status="COMPLETED" :label="authStore.user?.role ?? 'CUSTOMER'" />
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-3 border-b border-ink-200">
      <button
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px"
        :class="[
          activeTab === 'profile'
            ? 'border-brand-600 text-brand-700'
            : 'border-transparent text-ink-500 hover:text-ink-800',
        ]"
        @click="activeTab = 'profile'"
      >
        <User :size="16" />
        <span>Thông tin cá nhân</span>
      </button>

      <button
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px"
        :class="[
          activeTab === 'addresses'
            ? 'border-brand-600 text-brand-700'
            : 'border-transparent text-ink-500 hover:text-ink-800',
        ]"
        @click="activeTab = 'addresses'"
      >
        <MapPin :size="16" />
        <span>Sổ địa chỉ ({{ addresses.length }})</span>
      </button>
    </div>

    <!-- Tab 1: Profile -->
    <div v-if="activeTab === 'profile'" class="space-y-6">
      <FhCard title="Thông tin định danh">
        <div class="space-y-5 text-xs sm:text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-ink-700 mb-1.5">Họ và tên</label>
              <input
                v-model="fullName"
                type="text"
                class="w-full h-10 px-3.5 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label class="block font-semibold text-ink-700 mb-1.5">Số điện thoại liên hệ</label>
              <input
                v-model="phoneNumber"
                type="text"
                class="w-full h-10 px-3.5 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 font-num"
                placeholder="0912345678"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-ink-700 mb-1.5">Email tài khoản</label>
              <input
                :value="authStore.user?.email"
                disabled
                type="email"
                class="w-full h-10 px-3.5 bg-ink-100 border border-ink-200 rounded-[var(--radius-sm)] text-ink-500 cursor-not-allowed"
              />
              <span class="text-[11px] text-ink-400 mt-1 block">Email là định danh cố định không thể đổi</span>
            </div>

            <div>
              <label class="block font-semibold text-ink-700 mb-1.5">URL ảnh đại diện (Avatar)</label>
              <input
                v-model="avatarUrl"
                type="text"
                class="w-full h-10 px-3.5 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="pt-4 border-t border-ink-100 flex items-center justify-between">
            <span v-if="saveSuccess" class="text-xs font-semibold text-success-600 flex items-center gap-1">
              <Check :size="15" /> Đã lưu thay đổi thành công!
            </span>
            <span v-else></span>

            <FhButton
              variant="primary"
              size="md"
              :loading="isSaving"
              @click="handleSaveProfile"
            >
              Lưu thay đổi
            </FhButton>
          </div>
        </div>
      </FhCard>
    </div>

    <!-- Tab 2: Addresses -->
    <div v-if="activeTab === 'addresses'" class="space-y-6">
      <div class="flex items-center justify-between">
        <p class="text-xs text-ink-500">
          Địa chỉ đã lưu giúp bạn đặt thợ nhanh chóng chỉ bằng một chạm.
        </p>

        <FhButton variant="primary" size="sm" @click="showAddressModal = true">
          <Plus :size="16" class="mr-1.5" /> Thêm địa chỉ
        </FhButton>
      </div>

      <div v-if="addresses.length === 0" class="text-center py-12 bg-white rounded-[var(--radius-md)] border border-ink-200">
        <MapPin :size="36" class="mx-auto text-ink-400 mb-2" />
        <h4 class="text-sm font-bold text-ink-800">Chưa có địa chỉ nào</h4>
        <p class="text-xs text-ink-500 max-w-sm mx-auto mt-1 mb-4">
          Hãy thêm địa chỉ nhà riêng hoặc nơi làm việc để kỹ thuật viên thuận tiện khảo sát.
        </p>
        <FhButton variant="secondary" size="sm" @click="showAddressModal = true">
          <Plus :size="15" class="mr-1" /> Thêm ngay
        </FhButton>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="p-4 rounded-[var(--radius-sm)] bg-white border border-ink-200 shadow-[var(--shadow-e1)] flex flex-col justify-between space-y-3"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-ink-900 flex items-center gap-1.5">
                <MapPin :size="14" class="text-brand-600" /> {{ addr.label || 'Địa chỉ' }}
              </span>
              <span
                v-if="addr.isDefault"
                class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200"
              >
                <Star :size="11" class="fill-brand-600" /> Mặc định
              </span>
            </div>

            <p class="text-xs text-ink-800 font-medium">
              {{ addr.line1 }}
            </p>

            <p class="text-[11px] text-ink-500">
              {{ addr.ward ? addr.ward + ', ' : '' }}{{ addr.district }}, {{ addr.province }}
            </p>
          </div>

          <div class="pt-2 border-t border-ink-100 flex items-center justify-end">
            <button
              class="p-1.5 text-ink-400 hover:text-danger-500 rounded transition-colors"
              title="Xoá địa chỉ"
              @click="triggerDeleteAddress(addr.id)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add Address -->
    <div
      v-if="showAddressModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-md w-full p-6 shadow-xl space-y-5">
        <h3 class="text-lg font-bold text-ink-900">
          Thêm Địa chỉ Mới
        </h3>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-ink-700 mb-1">Tên nhãn gợi nhớ</label>
            <input
              v-model="addressForm.label"
              type="text"
              class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
              placeholder="Nhà riêng, Văn phòng, Nhà bố mẹ..."
            />
          </div>

          <div>
            <label class="block font-semibold text-ink-700 mb-1">Số nhà, tên đường / tòa nhà *</label>
            <input
              v-model="addressForm.line1"
              type="text"
              class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
              placeholder="Ví dụ: Số 25 Ngõ 12 Đội Cấn"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-ink-700 mb-1">Phường / Xã</label>
              <input
                v-model="addressForm.ward"
                type="text"
                class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
                placeholder="Phường Đội Cấn"
              />
            </div>
            <div>
              <label class="block font-semibold text-ink-700 mb-1">Quận / Huyện *</label>
              <input
                v-model="addressForm.district"
                type="text"
                class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
                placeholder="Quận Ba Đình"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-ink-700 mb-1">Tỉnh / Thành phố *</label>
            <select
              v-model="addressForm.province"
              class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
            >
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>

          <label class="flex items-center gap-2 cursor-pointer pt-1">
            <input
              v-model="addressForm.isDefault"
              type="checkbox"
              class="rounded text-brand-600 focus:ring-brand-500"
            />
            <span class="text-xs text-ink-700 font-medium">Đặt làm địa chỉ mặc định khi tạo đơn</span>
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-ink-100">
          <FhButton variant="ghost" size="sm" @click="showAddressModal = false">
            Huỷ bỏ
          </FhButton>
          <FhButton variant="primary" size="sm" @click="handleAddAddress">
            Lưu địa chỉ
          </FhButton>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <FhConfirmDialog
      :open="showDeleteConfirm"
      title="Xoá địa chỉ"
      consequence="Địa chỉ này sẽ bị xoá vĩnh viễn khỏi sổ địa chỉ của bạn."
      confirm-text="Xoá"
      cancel-text="Giữ lại"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
