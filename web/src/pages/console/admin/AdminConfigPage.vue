<script setup lang="ts">
import { ref } from 'vue';
import { Sliders, Edit2, Search } from 'lucide-vue-next';
import { FhButton, FhCard, FhTable } from '../../../components';

const searchQuery = ref('');

interface SystemConfigItem {
  key: string;
  value: string;
  type: string;
  desc: string;
}

const configs = ref<SystemConfigItem[]>([
  { key: 'matching.invitation.ttl_seconds', value: '600', type: 'INTEGER', desc: 'Thời gian sống của lời mời nhận việc (giây)' },
  { key: 'matching.shortlist.max_candidates', value: '5', type: 'INTEGER', desc: 'Số lượng kỹ thuật viên tối đa khách được chọn vào shortlist' },
  { key: 'geofence.radius_meters', value: '200', type: 'INTEGER', desc: 'Bán kính hợp lệ cho phép thợ check-in GPS tại nhà khách' },
  { key: 'strike.max_allowed', value: '3', type: 'INTEGER', desc: 'Số lần vi phạm tối đa trước khi bị đình chỉ tài khoản' },
  { key: 'strike.suspension_days', value: '7', type: 'INTEGER', desc: 'Thời gian đình chỉ nhận đơn/đặt đơn khi đạt ngưỡng vi phạm' },
  { key: 'platform.commission_rate', value: '0.10', type: 'DECIMAL', desc: 'Tỷ lệ chiết khấu phí nền tảng FixHome (10%)' },
  { key: 'payment.mode', value: 'DEMO', type: 'STRING', desc: 'Chế độ thanh toán (DEMO cho đồ án tốt nghiệp)' },
  { key: 'warranty.default_days', value: '30', type: 'INTEGER', desc: 'Thời hạn bảo hành điện tử tối thiểu cho linh kiện thay mới' },
  { key: 'ai.diagnosis.rate_limit_per_hour', value: '5', type: 'INTEGER', desc: 'Giới hạn số lượt chẩn đoán AI miễn phí mỗi giờ cho mỗi khách' },
]);

const showEditModal = ref(false);
const configToEdit = ref<SystemConfigItem | null>(null);
const editValue = ref('');

const openEdit = (cfg: SystemConfigItem) => {
  configToEdit.value = cfg;
  editValue.value = cfg.value;
  showEditModal.value = true;
};

const saveConfig = () => {
  if (configToEdit.value) {
    configToEdit.value.value = editValue.value;
  }
  showEditModal.value = false;
  window.alert('Đã cập nhật tham số cấu hình thành công! Giá trị mới có hiệu lực tức thì (60s cache TTL).');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Sliders class="text-brand-600" :size="24" />
          Cấu hình Hệ thống (System Config D-24)
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Quản lý toàn bộ 24 tham số nghiệp vụ. Nghiêm cấm hard-code bất kỳ ngưỡng nào trong mã nguồn backend.
        </p>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white p-3.5 rounded-[var(--radius-sm)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="relative max-w-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo key hoặc mô tả..."
          class="w-full h-9 pl-9 pr-3 text-xs bg-ink-50 border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 focus:bg-white"
        />
        <Search :size="15" class="absolute left-3 top-2.5 text-ink-400" />
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'key', label: 'Tên khóa cấu hình (Key)' },
          { key: 'value', label: 'Giá trị cấu hình (Value)', width: '200px' },
          { key: 'desc', label: 'Ý nghĩa nghiệp vụ' },
          { key: 'actions', label: 'Sửa', width: '80px' },
        ]"
        :rows="configs.filter((c) => !searchQuery || c.key.includes(searchQuery) || c.desc.includes(searchQuery))"
      >
        <template #cell-key="{ row }">
          <code class="text-xs font-mono font-bold text-brand-800">{{ row.key }}</code>
          <span class="text-[10px] text-ink-400 block font-mono">Kiểu: {{ row.type }}</span>
        </template>

        <template #cell-value="{ row }">
          <span class="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded">
            {{ row.value }}
          </span>
        </template>

        <template #cell-desc="{ row }">
          <span class="text-xs text-ink-600 leading-relaxed">{{ row.desc }}</span>
        </template>

        <template #cell-actions="{ row }">
          <button
            class="p-1.5 text-ink-500 hover:text-brand-600 rounded hover:bg-ink-100 transition-colors"
            title="Chỉnh sửa cấu hình"
            @click="openEdit(row)"
          >
            <Edit2 :size="15" />
          </button>
        </template>
      </FhTable>
    </FhCard>

    <!-- Modal Edit -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-[var(--radius-md)] max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
        <h3 class="text-base font-bold text-ink-900">Chỉnh sửa Tham số Hệ thống</h3>

        <div>
          <label class="block font-semibold text-ink-700 mb-1">Khóa cấu hình:</label>
          <input
            :value="configToEdit?.key"
            disabled
            class="w-full h-9 px-3 bg-ink-100 border border-ink-200 rounded font-mono text-ink-600 cursor-not-allowed text-xs"
          />
        </div>

        <div>
          <label class="block font-semibold text-ink-700 mb-1">Giá trị mới *</label>
          <input
            v-model="editValue"
            type="text"
            class="w-full h-9 px-3 bg-white border border-ink-200 rounded font-mono text-xs focus:outline-none focus:border-brand-600"
          />
        </div>

        <p class="text-[11px] text-ink-500 leading-relaxed">
          {{ configToEdit?.desc }}
        </p>

        <div class="flex justify-end gap-2 pt-2 border-t border-ink-100">
          <FhButton variant="ghost" size="sm" @click="showEditModal = false">Huỷ</FhButton>
          <FhButton variant="primary" size="sm" @click="saveConfig">Lưu tham số</FhButton>
        </div>
      </div>
    </div>
  </div>
</template>
