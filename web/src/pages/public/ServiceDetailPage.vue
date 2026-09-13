<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Clock, ShieldCheck, CheckCircle2, ChevronRight, Star, ArrowLeft, Wrench } from 'lucide-vue-next';
import { FhButton, FhCard, FhMoney, FhStatusPill } from '../../components';
import { catalogApi, type ServiceItem } from '../../api/catalog.api';

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;

const loading = ref(true);
const service = ref<ServiceItem | null>(null);

// Fallback mock if backend is unavailable
const fallbackService: ServiceItem = {
  id: 'mock-1',
  categoryId: 'cat-1',
  name: 'Vệ sinh & bảo dưỡng máy lạnh',
  code: 'VE_SINH_DIEU_HOA',
  slug: 've-sinh-dieu-hoa',
  description: 'Vệ sinh dàn nóng, dàn lạnh bằng máy xịt áp lực chuyên dụng, kiểm tra áp suất gas và độ ồn hoạt động.',
  basePrice: 200000,
  minPrice: 150000,
  maxPrice: 400000,
  basePriceMin: 150000,
  basePriceMax: 400000,
  estimatedMinutes: 45,
  isActive: true,
  category: {
    id: 'cat-1',
    name: 'Điện lạnh',
    code: 'DIEN_LANH',
    sortOrder: 1,
    isActive: true,
  },
};

onMounted(async () => {
  try {
    const data = await catalogApi.getService(slug);
    service.value = data;
  } catch {
    service.value = fallbackService;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-ink-500">
      <router-link to="/" class="hover:text-ink-900 transition-colors">Trang chủ</router-link>
      <ChevronRight :size="12" />
      <router-link to="/services" class="hover:text-ink-900 transition-colors">Bảng giá dịch vụ</router-link>
      <ChevronRight :size="12" />
      <span class="text-ink-900 font-medium truncate">{{ service?.name ?? 'Chi tiết dịch vụ' }}</span>
    </nav>

    <!-- Back button -->
    <button
      class="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
      @click="router.back()"
    >
      <ArrowLeft :size="14" /> Quay lại danh sách
    </button>

    <div v-if="service" class="space-y-8">
      <!-- Header Hero -->
      <div class="bg-white rounded-[var(--radius-md)] border border-ink-200 p-6 sm:p-8 shadow-[var(--shadow-e1)] space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 rounded-[var(--radius-sm)] bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Wrench :size="24" />
            </span>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <FhStatusPill status="COMPLETED" :label="service.category?.name ?? 'Dịch vụ chuẩn'" />
                <span class="flex items-center gap-1 text-xs text-amber-500 font-semibold font-num">
                  <Star :size="13" class="fill-amber-400" /> 4.9 (1.2k+ đánh giá)
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                {{ service.name }}
              </h1>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs text-ink-400">Giá công tham khảo:</div>
            <div class="text-xl sm:text-2xl font-bold font-num text-brand-700">
              <FhMoney :amount="service.minPrice ?? service.basePrice ?? 150000" />
              –
              <FhMoney :amount="service.maxPrice ?? service.basePrice ?? 400000" />
            </div>
          </div>
        </div>

        <p class="text-sm text-ink-600 leading-relaxed">
          {{ service.description }}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-ink-100">
          <div class="flex items-center gap-2.5 text-xs text-ink-600">
            <Clock :size="16" class="text-brand-600 shrink-0" />
            <span>Thời lượng ước tính: <strong>~{{ service.estimatedMinutes }} phút</strong></span>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-ink-600">
            <ShieldCheck :size="16" class="text-success-600 shrink-0" />
            <span>Bảo hành điện tử: <strong>30 – 90 ngày</strong></span>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-ink-600">
            <CheckCircle2 :size="16" class="text-brand-600 shrink-0" />
            <span>Thợ xác thực: <strong>100% kiểm tra lý lịch</strong></span>
          </div>
        </div>
      </div>

      <!-- Price Transparency Section (D-02 Standard) -->
      <FhCard title="Quy chuẩn chi phí minh bạch FixHome (D-02)">
        <div class="space-y-4 text-xs sm:text-sm text-ink-700 leading-relaxed">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-[var(--radius-sm)] bg-brand-50/60 border border-brand-200/60 space-y-2">
              <h4 class="font-bold text-brand-900 flex items-center gap-1.5">
                <CheckCircle2 :size="16" class="text-brand-600" /> Tiền công kỹ thuật (Labor)
              </h4>
              <p class="text-xs text-brand-950">
                Là phí kiểm tra, dò lỗi và thao tác kỹ thuật của thợ. Báo giá công luôn cố định theo bảng giá chuẩn niêm yết, cam kết không phát sinh vô lý.
              </p>
            </div>

            <div class="p-4 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200 space-y-2">
              <h4 class="font-bold text-ink-900 flex items-center gap-1.5">
                <CheckCircle2 :size="16" class="text-ink-600" /> Tiền linh kiện thay thế (Parts)
              </h4>
              <p class="text-xs text-ink-600">
                Chỉ tính khi linh kiện cũ hỏng cần thay mới. Thợ phải xuất trình mã linh kiện, giá đại lý và chỉ được mua khi có sự đồng ý của khách hàng.
              </p>
            </div>
          </div>
        </div>
      </FhCard>

      <!-- Booking CTA Box -->
      <div class="p-6 rounded-[var(--radius-md)] bg-gradient-to-r from-brand-600 to-brand-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 class="text-lg font-bold">Cần sửa chữa thiết bị này ngay?</h3>
          <p class="text-xs text-brand-100">
            Kỹ thuật viên gần bạn nhất sẽ tiếp nhận và có mặt trong 30 – 45 phút.
          </p>
        </div>

        <FhButton variant="secondary" size="lg" class="shrink-0 bg-white text-brand-700 hover:bg-brand-50" @click="router.push('/login')">
          Đặt thợ trực tiếp
        </FhButton>
      </div>
    </div>
  </div>
</template>
