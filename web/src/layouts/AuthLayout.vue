<script setup lang="ts">
import { ShieldCheck, Wrench, CheckCircle2 } from 'lucide-vue-next';
</script>


<template>
  <div class="min-h-screen flex bg-ink-50">
    <!-- Left Column: Authentication Form -->
    <div class="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:max-w-xl xl:max-w-2xl bg-white shadow-[var(--shadow-e1)] border-r border-ink-200">
      <div>
        <!-- Brand Header -->
        <router-link to="/" class="inline-flex items-center gap-2.5 group">
          <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center text-white shadow-[var(--shadow-e1)] group-hover:bg-brand-700 transition-colors">
            <Wrench :size="22" :stroke-width="2" />
          </div>
          <div>
            <span class="text-xl font-bold text-ink-900 tracking-tight">Fix<span class="text-brand-600">Home</span></span>
            <span class="block text-[11px] font-medium text-ink-500 -mt-1 tracking-wider uppercase">Dịch vụ sửa nhà</span>
          </div>
        </router-link>
      </div>

      <!-- Main Form Slot -->
      <div class="w-full max-w-md mx-auto my-8">
        <router-view />
      </div>

      <!-- Footer Info -->
      <div class="text-xs text-ink-500 text-center sm:text-left flex flex-wrap items-center justify-between gap-2 pt-6 border-t border-ink-100">
        <span>© 2026 FixHome. Nền tảng sửa chữa gia đình hàng đầu.</span>
        <div class="flex gap-4">
          <router-link to="/pricing-policy" class="hover:text-brand-600 transition-colors">Chính sách giá</router-link>
          <router-link to="/how-it-works" class="hover:text-brand-600 transition-colors">Hướng dẫn</router-link>
        </div>
      </div>
    </div>

    <!-- Right Column: Brand Feature Showcase (Desktop only) -->
    <div class="hidden lg:flex flex-1 relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
      <!-- Decorative Background Orbs -->
      <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -left-20 -bottom-20 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl pointer-events-none" />

      <!-- Top Badge -->
      <div class="relative z-10">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-brand-100 border border-white/20">
          <ShieldCheck :size="15" />
          Cam kết bảo hành & Minh bạch chi phí
        </span>
      </div>

      <!-- Center Hero Statement -->
      <div class="relative z-10 max-w-lg space-y-6">
        <h1 class="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
          Sửa chữa điện nước, điện lạnh uy tín & minh bạch tại nhà
        </h1>
        <p class="text-brand-100 text-base leading-relaxed">
          Kết nối thợ chuyên nghiệp đã qua xác minh trong 15 phút. Báo giá tách bạch tiền công và vật tư, bảo hành chuẩn mực.
        </p>

        <!-- Feature List -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-3">
            <CheckCircle2 :size="18" class="text-brand-300 shrink-0" />
            <span class="text-sm text-brand-50">100% thợ có chứng chỉ & xác minh danh tính</span>
          </div>
          <div class="flex items-center gap-3">
            <CheckCircle2 :size="18" class="text-brand-300 shrink-0" />
            <span class="text-sm text-brand-50">Tách rõ tiền công thợ và thiết bị thay thế</span>
          </div>
          <div class="flex items-center gap-3">
            <CheckCircle2 :size="18" class="text-brand-300 shrink-0" />
            <span class="text-sm text-brand-50">Chẩn đoán sự cố thông minh bằng AI FixHome</span>
          </div>
        </div>
      </div>

      <!-- Bottom Stats Grid -->
      <div class="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
        <div>
          <div class="font-num text-2xl font-bold">15<span class="text-brand-300">p</span></div>
          <div class="text-xs text-brand-200">Thợ nhận việc</div>
        </div>
        <div>
          <div class="font-num text-2xl font-bold">4.9<span class="text-brand-300">★</span></div>
          <div class="text-xs text-brand-200">Đánh giá thực tế</div>
        </div>
        <div>
          <div class="font-num text-2xl font-bold">30<span class="text-brand-300">n</span></div>
          <div class="text-xs text-brand-200">Bảo hành tối thiểu</div>
        </div>
      </div>
    </div>
  </div>
</template>
