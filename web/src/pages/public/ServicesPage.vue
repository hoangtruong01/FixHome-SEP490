<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Clock } from 'lucide-vue-next';

import { FhButton, FhCard, FhMoney } from '../../components';

const router = useRouter();
const selectedCategory = ref('ALL');
const searchQuery = ref('');

const categories = [
  { id: 'ALL', name: 'Tất cả dịch vụ' },
  { id: 'DIEN_LANH', name: 'Điện lạnh' },
  { id: 'DIEN_NUOC', name: 'Điện nước' },
  { id: 'GIA_DUNG', name: 'Gia dụng' },
  { id: 'KHOA_CUA', name: 'Khoá cửa' },
];

const services = [
  {
    id: 'srv-01',
    category: 'DIEN_LANH',
    name: 'Vệ sinh máy lạnh treo tường (≤ 2.0 HP)',
    desc: 'Xịt rửa dàn nóng, dàn lạnh bằng bạt chuyên dụng, kiểm tra áp suất gas và độ ồn.',
    minPrice: 180000,
    maxPrice: 250000,
    duration: 45,
  },
  {
    id: 'srv-02',
    category: 'DIEN_LANH',
    name: 'Nạp gas bổ sung R32 / R410A',
    desc: 'Kiểm tra rò rỉ khớp nối zắc co, nạp gas bổ sung chuẩn áp suất kỹ thuật.',
    minPrice: 200000,
    maxPrice: 350000,
    duration: 30,
  },
  {
    id: 'srv-03',
    category: 'DIEN_NUOC',
    name: 'Sửa rò rỉ đường ống nước âm tường',
    desc: 'Dò tìm điểm rò rỉ, đục cắt và thay thế đoạn ống nhiệt PPR hoặc PVC hỏng.',
    minPrice: 250000,
    maxPrice: 450000,
    duration: 90,
  },
  {
    id: 'srv-04',
    category: 'DIEN_NUOC',
    name: 'Thay thế & lắp mới vòi sen, vòi lavabo',
    desc: 'Tháo dỡ thiết bị cũ, cuốn băng tan và lắp đặt thiết bị mới chống thấm.',
    minPrice: 150000,
    maxPrice: 220000,
    duration: 40,
  },
  {
    id: 'srv-05',
    category: 'GIA_DUNG',
    name: 'Sửa bo mạch máy giặt không vắt / lỗi mã',
    desc: 'Kiểm tra cảm biến mực nước, công tắc cửa và sửa chữa linh kiện điều khiển.',
    minPrice: 350000,
    maxPrice: 650000,
    duration: 60,
  },
  {
    id: 'srv-06',
    category: 'KHOA_CUA',
    name: 'Lắp đặt khoá điện tử / khoá vân tay',
    desc: 'Khoan đục cửa gỗ hoặc nhôm kính, cài đặt vân tay, mật mã và thẻ từ.',
    minPrice: 300000,
    maxPrice: 500000,
    duration: 60,
  },
];

const filteredServices = computed(() => {
  return services.filter((s) => {
    const matchCat = selectedCategory.value === 'ALL' || s.category === selectedCategory.value;
    const matchSearch =
      !searchQuery.value ||
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCat && matchSearch;
  });
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
    <div class="text-center space-y-4 max-w-2xl mx-auto">
      <h1 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
        Bảng giá dịch vụ tham khảo
      </h1>
      <p class="text-ink-600 text-sm sm:text-base">
        Biểu giá công thợ tham khảo theo tiêu chuẩn kỹ thuật FixHome. Giá thực tế phụ thuộc khảo sát và loại linh kiện thay thế.
      </p>

      <!-- Search Box -->
      <div class="relative max-w-md mx-auto pt-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm dịch vụ (ví dụ: máy lạnh, ống nước...)"
          class="w-full h-11 pl-10 pr-4 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-[var(--shadow-e1)]"
        />
        <Search class="absolute left-3.5 top-5 text-ink-400" :size="17" />
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex items-center justify-center gap-2 overflow-x-auto pb-2">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-semibold select-none transition-colors shrink-0"
        :class="[
          selectedCategory === cat.id
            ? 'bg-brand-600 text-white shadow-sm'
            : 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-100',
        ]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FhCard
        v-for="srv in filteredServices"
        :key="srv.id"
        class="flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs text-ink-500">
            <span class="flex items-center gap-1 font-num">
              <Clock :size="13" /> ~{{ srv.duration }} phút
            </span>
            <span class="text-success-600 font-semibold">Bảo hành 30-90 ngày</span>
          </div>

          <h3 class="text-base font-bold text-ink-900 leading-snug">
            {{ srv.name }}
          </h3>

          <p class="text-xs text-ink-600 leading-relaxed">
            {{ srv.desc }}
          </p>
        </div>

        <div class="pt-4 mt-4 border-t border-ink-100 flex items-center justify-between">
          <div>
            <div class="text-[11px] text-ink-400">Giá công tham khảo:</div>
            <div class="text-sm font-bold font-num text-brand-700">
              <FhMoney :amount="srv.minPrice" /> – <FhMoney :amount="srv.maxPrice" />
            </div>
          </div>

          <FhButton variant="primary" size="sm" @click="router.push('/register')">
            Đặt thợ
          </FhButton>
        </div>
      </FhCard>
    </div>
  </div>
</template>
