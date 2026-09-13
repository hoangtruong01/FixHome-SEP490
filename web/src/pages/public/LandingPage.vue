<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  Wrench,
  Zap,
  Droplet,
  Sparkles,
  Key,
  ShieldCheck,
  Clock,
  ArrowRight,
  Star,
  ChevronRight,
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhCostBreakdown,
  FhStatusPill,
} from '../../components';

const router = useRouter();

const categories = [
  {
    name: 'Sửa điện lạnh & Máy lạnh',
    desc: 'Vệ sinh, nạp gas, sửa bo mạch, không lạnh',
    icon: Zap,
    count: '34 thợ sẵn sàng',
    price: 'từ 180.000 ₫',
  },
  {
    name: 'Điện & Nước dân dụng',
    desc: 'Rò rỉ nước, chập điện, lắp bóng đèn, máy bơm',
    icon: Droplet,
    count: '28 thợ sẵn sàng',
    price: 'từ 150.000 ₫',
  },
  {
    name: 'Thiết bị bếp & Gia dụng',
    desc: 'Bếp từ, máy giặt, lò vi sóng, máy hút mùi',
    icon: Wrench,
    count: '19 thợ sẵn sàng',
    price: 'từ 200.000 ₫',
  },
  {
    name: 'Khoá cửa & An ninh',
    desc: 'Khoá điện tử, khoá vân tay, bản lề cửa',
    icon: Key,
    count: '14 thợ sẵn sàng',
    price: 'từ 160.000 ₫',
  },
];

const steps = [
  {
    num: '01',
    title: 'Gửi sự cố & AI chẩn đoán',
    desc: 'Mô tả tình trạng lỗi và đính kèm hình ảnh. AI FixHome tự động ước tính nguyên nhân và khung giá.',
  },
  {
    num: '02',
    title: 'Ghép thợ trong 15 phút',
    desc: 'Hệ thống gợi ý tối đa 5 thợ gần nhất có tay nghề phù hợp. Thợ đến tận nơi với xác thực GPS geofence.',
  },
  {
    num: '03',
    title: 'Báo giá tách bạch rõ ràng',
    desc: 'Thợ chụp ảnh hiện trạng và lập bảng báo giá tách riêng tiền công thợ và thiết bị thay thế.',
  },
  {
    num: '04',
    title: 'Nghiệm thu & Bảo hành điện tử',
    desc: 'Chụp ảnh sau sửa chữa, hoá đơn điện tử minh bạch kèm thời hạn bảo hành cam kết từ 30-90 ngày.',
  },
];
</script>

<template>
  <div class="space-y-24 sm:space-y-32">
    <!-- Hero Section -->
    <section class="relative pt-6 sm:pt-12 pb-16 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <!-- Left Column: Copy & CTAs -->
          <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
              <Sparkles :size="15" class="text-brand-600" />
              <span>Chẩn đoán lỗi thông minh bằng AI · Báo giá minh bạch</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.15]">
              Sửa chữa nhà cửa <br />
              <span class="text-brand-600">minh bạch & uy tín</span> tận tâm
            </h1>

            <p class="text-base sm:text-lg text-ink-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Không còn nỗi lo ép giá, thợ vẽ bệnh. FixHome kết nối thợ chuyên nghiệp gần bạn nhất, báo giá tách riêng công thợ và vật tư với bảo hành chuẩn mực.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <FhButton
                variant="primary"
                size="lg"
                class="w-full sm:w-auto text-base shadow-[var(--shadow-e2)]"
                @click="router.push('/register')"
              >
                Đặt thợ ngay bây giờ
                <ArrowRight :size="18" />
              </FhButton>

              <FhButton
                variant="secondary"
                size="lg"
                class="w-full sm:w-auto text-base"
                @click="router.push('/how-it-works')"
              >
                Xem quy trình 4 bước
              </FhButton>
            </div>

            <!-- Trust Badges -->
            <div class="pt-6 border-t border-ink-200 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-ink-600">
              <div class="flex items-center gap-2">
                <ShieldCheck :size="18" class="text-success-600" />
                <span class="font-medium">100% thợ xác minh tay nghề</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock :size="18" class="text-brand-600" />
                <span class="font-medium">Đến nhanh trong 30-45 phút</span>
              </div>
              <div class="flex items-center gap-2">
                <Star :size="18" class="text-warning-600 fill-warning-600" />
                <span class="font-medium">4.9/5 đánh giá hài lòng</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Demonstration Card -->
          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto max-w-md">
              <!-- Decorative Ambient Glow -->
              <div class="absolute -top-10 -left-10 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />
              <div class="absolute -bottom-10 -right-10 w-72 h-72 bg-warning-200/40 rounded-full blur-3xl pointer-events-none" />

              <FhCard padding="none" class="relative z-10 shadow-[var(--shadow-e3)]">
                <!-- Card Header -->
                <div class="p-5 bg-gradient-to-r from-ink-900 to-ink-800 text-white flex items-center justify-between">
                  <div>
                    <span class="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Đơn hàng mẫu #FH-8821</span>
                    <h3 class="text-base font-bold">Vệ sinh & Bơm ga máy lạnh Inverter</h3>
                  </div>
                  <FhStatusPill status="UNDER_REPAIR" label="Đang sửa chữa" />
                </div>

                <!-- Card Content -->
                <div class="p-5 space-y-4">
                  <!-- Technician Snippet -->
                  <div class="flex items-center justify-between p-3 bg-ink-25 rounded-[var(--radius-sm)] border border-ink-100">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                        TV
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-ink-900">Trần Văn Hoàng</div>
                        <div class="text-xs text-ink-500">Thợ điện lạnh · 6 năm kinh nghiệm</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs font-bold text-warning-600 flex items-center gap-1 justify-end">
                        <Star :size="13" class="fill-warning-600" /> 4.95
                      </div>
                      <div class="text-[11px] text-ink-400">142 đơn hoàn thành</div>
                    </div>
                  </div>

                  <!-- Real-time Cost Breakdown per D-02 -->
                  <div>
                    <div class="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Báo giá minh bạch (D-02)</div>
                    <FhCostBreakdown
                      :labor-total="180000"
                      :parts-total="250000"
                    />
                  </div>

                  <div class="pt-2 text-center">
                    <FhButton variant="secondary" size="sm" block @click="router.push('/pricing-policy')">
                      Tìm hiểu chính sách bảo đảm giá
                    </FhButton>
                  </div>
                </div>
              </FhCard>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <h2 class="text-3xl font-bold text-ink-900 tracking-tight">Dịch vụ sửa chữa phổ biến</h2>
        <p class="text-ink-600 text-sm sm:text-base">
          Các hạng mục được phục vụ nhiều nhất với biểu giá tham khảo công khai và cam kết bảo hành dài hạn.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FhCard
          v-for="cat in categories"
          :key="cat.name"
          clickable
          class="group flex flex-col justify-between"
          @click="router.push('/services')"
        >
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-[var(--radius-sm)] bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <component :is="cat.icon" :size="24" :stroke-width="1.75" />
            </div>
            <h3 class="text-base font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
              {{ cat.name }}
            </h3>
            <p class="text-xs text-ink-500 leading-relaxed">
              {{ cat.desc }}
            </p>
          </div>

          <div class="pt-4 mt-4 border-t border-ink-100 flex items-center justify-between text-xs">
            <span class="font-num font-semibold text-brand-700">{{ cat.price }}</span>
            <span class="text-ink-400 group-hover:text-brand-600 transition-colors inline-flex items-center gap-0.5">
              Chi tiết <ChevronRight :size="13" />
            </span>
          </div>
        </FhCard>
      </div>
    </section>

    <!-- 4-Step Process -->
    <section class="bg-ink-100/60 py-20 border-y border-ink-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span class="text-overline text-brand-700 uppercase font-semibold">Quy trình vận hành</span>
          <h2 class="text-3xl font-bold text-ink-900 tracking-tight">Sửa nhà dễ dàng trong 4 bước</h2>
          <p class="text-ink-600 text-sm">
            Quy trình chuẩn mực được kiểm soát từ lúc tiếp nhận đến khi hết thời hạn bảo hành.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="step in steps"
            :key="step.num"
            class="relative p-6 bg-white rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e1)] space-y-3"
          >
            <div class="font-num text-3xl font-bold text-brand-300">
              {{ step.num }}
            </div>
            <h3 class="text-base font-bold text-ink-900">
              {{ step.title }}
            </h3>
            <p class="text-xs text-ink-600 leading-relaxed">
              {{ step.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA Card -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="bg-gradient-to-r from-brand-600 to-brand-700 rounded-[var(--radius-lg)] text-white p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[var(--shadow-e3)]">
        <div class="space-y-3 max-w-xl text-center md:text-left">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            Bạn đang gặp sự cố thiết bị tại nhà?
          </h2>
          <p class="text-brand-100 text-sm sm:text-base leading-relaxed">
            Đừng để sự cố kéo dài. Gọi thợ FixHome ngay hôm nay để nhận báo giá minh bạch và dịch vụ bảo hành chu đáo.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <FhButton
            variant="secondary"
            size="lg"
            class="bg-white text-brand-800 border-none hover:bg-brand-50"
            @click="router.push('/register')"
          >
            Đăng ký trải nghiệm
          </FhButton>
          <FhButton
            variant="ghost"
            size="lg"
            class="text-white border border-white/30 hover:bg-white/10"
            @click="router.push('/for-technicians')"
          >
            Gia nhập làm thợ FixHome
          </FhButton>
        </div>
      </div>
    </section>
  </div>
</template>
