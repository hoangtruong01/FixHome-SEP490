<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, Search, MapPin, Power, Edit2 } from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhTable,
  FhStatusPill,
  FhConfirmDialog,
} from '../../components';
import { serviceAreasApi, type ServiceArea } from '../../api/service-areas.api';

const loading = ref(true);
const serviceAreas = ref<ServiceArea[]>([]);

// Filters
const selectedProvince = ref('ALL');
const searchQuery = ref('');

// Modals
const showModal = ref(false);
const isEditing = ref(false);
const areaForm = ref<Partial<ServiceArea>>({
  provinceCode: '01',
  provinceName: 'Hà Nội',
  districtCode: '',
  districtName: '',
  isActive: true,
});

const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmAction = ref<(() => Promise<void>) | null>(null);

const loadAreas = async () => {
  loading.value = true;
  try {
    const data = await serviceAreasApi.getServiceAreas();
    serviceAreas.value = data;
  } catch {
    // Fallback seed data if offline
    serviceAreas.value = [
      { id: '1', provinceCode: '01', provinceName: 'Hà Nội', districtCode: '001', districtName: 'Quận Ba Đình', isActive: true },
      { id: '2', provinceCode: '01', provinceName: 'Hà Nội', districtCode: '002', districtName: 'Quận Hoàn Kiếm', isActive: true },
      { id: '3', provinceCode: '01', provinceName: 'Hà Nội', districtCode: '005', districtName: 'Quận Cầu Giấy', isActive: true },
      { id: '4', provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '760', districtName: 'Quận 1', isActive: true },
      { id: '5', provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '769', districtName: 'Thành phố Thủ Đức', isActive: true },
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAreas();
});

const filteredAreas = computed(() => {
  return serviceAreas.value.filter((area) => {
    const matchProvince =
      selectedProvince.value === 'ALL' ||
      area.provinceCode === selectedProvince.value;
    const matchSearch =
      !searchQuery.value ||
      area.districtName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      area.districtCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      area.provinceName.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchProvince && matchSearch;
  });
});

const openAddArea = () => {
  isEditing.value = false;
  areaForm.value = {
    provinceCode: '01',
    provinceName: 'Hà Nội',
    districtCode: '',
    districtName: '',
    isActive: true,
  };
  showModal.value = true;
};

const openEditArea = (area: ServiceArea) => {
  isEditing.value = true;
  areaForm.value = { ...area };
  showModal.value = true;
};

const onProvinceChange = () => {
  if (areaForm.value.provinceCode === '01') {
    areaForm.value.provinceName = 'Hà Nội';
  } else if (areaForm.value.provinceCode === '79') {
    areaForm.value.provinceName = 'TP. Hồ Chí Minh';
  } else if (areaForm.value.provinceCode === '48') {
    areaForm.value.provinceName = 'Đà Nẵng';
  }
};

const saveArea = async () => {
  if (!areaForm.value.provinceCode || !areaForm.value.districtCode || !areaForm.value.districtName) {
    alert('Vui lòng điền đầy đủ thông tin khu vực.');
    return;
  }
  try {
    if (isEditing.value && areaForm.value.id) {
      await serviceAreasApi.updateServiceArea(areaForm.value.id, areaForm.value);
    } else {
      await serviceAreasApi.createServiceArea({
        provinceCode: areaForm.value.provinceCode!,
        provinceName: areaForm.value.provinceName || 'Hà Nội',
        districtCode: areaForm.value.districtCode!,
        districtName: areaForm.value.districtName!,
        isActive: areaForm.value.isActive ?? true,
      });
    }
    showModal.value = false;
    await loadAreas();
  } catch {
    alert('Không thể lưu khu vực hoạt động. Vui lòng kiểm tra mã quận/huyện.');
  }
};

const triggerToggle = (area: ServiceArea) => {
  confirmTitle.value = area.isActive ? 'Tạm dừng khu vực' : 'Mở lại khu vực';
  confirmMessage.value = `Bạn có chắc muốn ${area.isActive ? 'tạm dừng' : 'mở lại'} tiếp nhận đơn tại "${area.districtName}, ${area.provinceName}"?`;
  confirmAction.value = async () => {
    await serviceAreasApi.toggleStatus(area.id, !area.isActive);
    await loadAreas();
  };
  showConfirmModal.value = true;
};

const handleConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  showConfirmModal.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <MapPin class="text-brand-600" :size="24" />
          Khu vực Hoạt động & Phạm vi Phục vụ
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Cấu hình danh sách Tỉnh/Thành phố và Quận/Huyện mà mạng lưới FixHome tiếp nhận đơn và ghép thợ.
        </p>
      </div>

      <FhButton variant="primary" size="sm" @click="openAddArea">
        <Plus :size="16" class="mr-1.5" /> Thêm khu vực
      </FhButton>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-[var(--radius-sm)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="relative flex-1 min-w-[240px] max-w-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo tên quận/huyện hoặc mã..."
          class="w-full h-9 pl-9 pr-3 text-xs bg-ink-50 border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 focus:bg-white"
        />
        <Search :size="15" class="absolute left-3 top-2.5 text-ink-400" />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-ink-500">Tỉnh/Thành phố:</span>
        <select
          v-model="selectedProvince"
          class="h-9 px-3 text-xs bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-700 focus:outline-none focus:border-brand-600"
        >
          <option value="ALL">Tất cả Tỉnh/Thành</option>
          <option value="01">Hà Nội (01)</option>
          <option value="79">TP. Hồ Chí Minh (79)</option>
          <option value="48">Đà Nẵng (48)</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'province', label: 'Tỉnh / Thành phố' },
          { key: 'districtCode', label: 'Mã quận/huyện', width: '130px' },
          { key: 'districtName', label: 'Tên Quận / Huyện' },
          { key: 'status', label: 'Trạng thái hoạt động', width: '170px' },
          { key: 'actions', label: 'Thao tác', width: '120px' },
        ]"
        :rows="filteredAreas"
      >
        <template #cell-province="{ row }">
          <div class="font-semibold text-xs text-ink-900 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-brand-500"></span>
            {{ row.provinceName }}
            <span class="text-ink-400 text-[11px] font-mono">({{ row.provinceCode }})</span>
          </div>
        </template>

        <template #cell-districtCode="{ row }">
          <code class="text-xs px-2 py-0.5 rounded bg-ink-100 text-ink-700 font-mono">{{ row.districtCode }}</code>
        </template>

        <template #cell-districtName="{ row }">
          <span class="font-medium text-xs text-ink-900">{{ row.districtName }}</span>
        </template>

        <template #cell-status="{ row }">
          <FhStatusPill
            :status="row.isActive ? 'COMPLETED' : 'CANCELLED'"
            :label="row.isActive ? 'Đang phục vụ' : 'Tạm dừng'"
          />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1.5">
            <button
              class="p-1.5 text-ink-500 hover:text-brand-600 rounded hover:bg-ink-100 transition-colors"
              title="Sửa khu vực"
              @click="openEditArea(row)"
            >
              <Edit2 :size="15" />
            </button>
            <button
              class="p-1.5 rounded transition-colors"
              :class="row.isActive ? 'text-danger-500 hover:bg-danger-50' : 'text-success-600 hover:bg-success-50'"
              :title="row.isActive ? 'Tạm dừng' : 'Kích hoạt'"
              @click="triggerToggle(row)"
            >
              <Power :size="15" />
            </button>
          </div>
        </template>
      </FhTable>
    </FhCard>

    <!-- Modal: Area Edit/Create -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-md w-full p-6 shadow-xl space-y-5">
        <h3 class="text-lg font-bold text-ink-900">
          {{ isEditing ? 'Chỉnh sửa Khu vực' : 'Thêm Khu vực Mới' }}
        </h3>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-ink-700 mb-1">Tỉnh / Thành phố *</label>
            <select
              v-model="areaForm.provinceCode"
              class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
              @change="onProvinceChange"
            >
              <option value="01">Hà Nội (01)</option>
              <option value="79">TP. Hồ Chí Minh (79)</option>
              <option value="48">Đà Nẵng (48)</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-ink-700 mb-1">Mã Quận / Huyện *</label>
            <input
              v-model="areaForm.districtCode"
              type="text"
              :disabled="isEditing"
              class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 disabled:bg-ink-100 font-mono"
              placeholder="001, 760..."
            />
          </div>

          <div>
            <label class="block font-semibold text-ink-700 mb-1">Tên Quận / Huyện *</label>
            <input
              v-model="areaForm.districtName"
              type="text"
              class="w-full h-9 px-3 bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600"
              placeholder="Ví dụ: Quận Ba Đình, Quận 1..."
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-ink-100">
          <FhButton variant="ghost" size="sm" @click="showModal = false">
            Huỷ bỏ
          </FhButton>
          <FhButton variant="primary" size="sm" @click="saveArea">
            Lưu khu vực
          </FhButton>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <FhConfirmDialog
      :open="showConfirmModal"
      :title="confirmTitle"
      :consequence="confirmMessage"
      confirm-text="Xác nhận"
      cancel-text="Huỷ"
      @confirm="handleConfirm"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>
