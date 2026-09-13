<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Wrench, PhoneCall, ShieldCheck, Search, Menu, X } from 'lucide-vue-next';

import { FhButton } from '../components';

const router = useRouter();
const isScrolled = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ink-50 text-ink-900">
    <!-- Header: Transparent -> Solid on scroll per P6.1 -->
    <header
      class="fixed top-0 left-0 right-0 z-40 transition-all duration-200"
      :class="[
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-ink-200 shadow-[var(--shadow-e1)] py-3.5'
          : 'bg-transparent py-5',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="inline-flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center text-white shadow-[var(--shadow-e1)]">
            <Wrench :size="22" :stroke-width="2" />
          </div>
          <div>
            <span class="text-xl font-bold text-ink-900 tracking-tight">Fix<span class="text-brand-600">Home</span></span>
            <span class="block text-[10px] font-medium text-ink-500 -mt-1 tracking-wider uppercase">Sửa chữa gia đình</span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-ink-700">
          <router-link to="/services" class="hover:text-brand-600 transition-colors">Dịch vụ</router-link>
          <router-link to="/how-it-works" class="hover:text-brand-600 transition-colors">Cách hoạt động</router-link>
          <router-link to="/for-technicians" class="hover:text-brand-600 transition-colors">Dành cho Thợ</router-link>
          <router-link to="/pricing-policy" class="hover:text-brand-600 transition-colors">Chính sách giá</router-link>
          <router-link to="/track" class="inline-flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <Search :size="15" />
            Tra cứu đơn
          </router-link>
        </nav>

        <!-- Actions -->
        <div class="hidden sm:flex items-center gap-3">
          <FhButton variant="ghost" size="sm" @click="router.push('/login')">
            Đăng nhập
          </FhButton>
          <FhButton variant="primary" size="sm" @click="router.push('/register')">
            Đăng ký ngay
          </FhButton>
        </div>

        <!-- Mobile Menu Trigger -->
        <button
          class="md:hidden p-2 text-ink-700 hover:text-ink-900 rounded-[var(--radius-sm)]"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Menu v-if="!mobileMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden bg-white border-b border-ink-200 px-4 py-6 space-y-4 shadow-[var(--shadow-e2)]"
      >
        <div class="flex flex-col space-y-3 text-base font-medium">
          <router-link to="/services" class="py-1 text-ink-800" @click="mobileMenuOpen = false">Dịch vụ</router-link>
          <router-link to="/how-it-works" class="py-1 text-ink-800" @click="mobileMenuOpen = false">Cách hoạt động</router-link>
          <router-link to="/for-technicians" class="py-1 text-ink-800" @click="mobileMenuOpen = false">Dành cho Thợ</router-link>
          <router-link to="/pricing-policy" class="py-1 text-ink-800" @click="mobileMenuOpen = false">Chính sách giá</router-link>
          <router-link to="/track" class="py-1 text-ink-800 flex items-center gap-2" @click="mobileMenuOpen = false">
            <Search :size="16" />
            Tra cứu đơn
          </router-link>
        </div>
        <div class="pt-4 border-t border-ink-100 flex flex-col gap-2">
          <FhButton variant="secondary" size="md" block @click="router.push('/login'); mobileMenuOpen = false;">
            Đăng nhập
          </FhButton>
          <FhButton variant="primary" size="md" block @click="router.push('/register'); mobileMenuOpen = false;">
            Đăng ký tài khoản
          </FhButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 pt-20">
      <router-view />
    </main>

    <!-- Comprehensive Footer per P6.1 -->
    <footer class="bg-white border-t border-ink-200 pt-16 pb-12 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <!-- Col 1: Brand -->
          <div class="space-y-4 md:col-span-1">
            <div class="inline-flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center text-white">
                <Wrench :size="20" />
              </div>
              <span class="text-xl font-bold text-ink-900 tracking-tight">Fix<span class="text-brand-600">Home</span></span>
            </div>
            <p class="text-sm text-ink-600 leading-relaxed">
              Nền tảng công nghệ kết nối thợ sửa chữa gia đình hàng đầu. Minh bạch tiền công và vật tư.
            </p>
            <div class="inline-flex items-center gap-2 text-xs text-ink-500">
              <ShieldCheck :size="16" class="text-success-600" />
              Bảo vệ quyền lợi khách hàng 100%
            </div>
          </div>

          <!-- Col 2: Services -->
          <div>
            <h4 class="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">Dịch vụ chính</h4>
            <ul class="space-y-2.5 text-sm text-ink-600">
              <li><router-link to="/services/dien-lanh" class="hover:text-brand-600 transition-colors">Sửa chữa máy lạnh</router-link></li>
              <li><router-link to="/services/dien-nuoc" class="hover:text-brand-600 transition-colors">Điện & Nước dân dụng</router-link></li>
              <li><router-link to="/services/thiet-bi-bep" class="hover:text-brand-600 transition-colors">Thiết bị bếp & gia dụng</router-link></li>
              <li><router-link to="/services/khoa-cua" class="hover:text-brand-600 transition-colors">Khoá cửa & An ninh</router-link></li>
            </ul>
          </div>

          <!-- Col 3: Links -->
          <div>
            <h4 class="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">Thông tin</h4>
            <ul class="space-y-2.5 text-sm text-ink-600">
              <li><router-link to="/how-it-works" class="hover:text-brand-600 transition-colors">Quy trình sửa chữa</router-link></li>
              <li><router-link to="/for-technicians" class="hover:text-brand-600 transition-colors">Gia nhập đội ngũ thợ</router-link></li>
              <li><router-link to="/pricing-policy" class="hover:text-brand-600 transition-colors">Chính sách công & vật tư</router-link></li>
              <li><router-link to="/track" class="hover:text-brand-600 transition-colors">Tra cứu tiến độ đơn</router-link></li>
            </ul>
          </div>

          <!-- Col 4: Contact -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">Hỗ trợ khẩn cấp</h4>
            <div class="flex items-center gap-3 text-brand-600 font-num font-bold text-lg">
              <PhoneCall :size="20" />
              1900 8888 (24/7)
            </div>
            <p class="text-xs text-ink-500">
              Tổng đài xử lý sự cố khẩn cấp và bảo hành toàn quốc.
            </p>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-500 gap-4">
          <div>© 2026 FixHome Vietnam. Đồ án tốt nghiệp SEP490.</div>
          <div class="flex gap-6">
            <span>Điều khoản sử dụng</span>
            <span>Chính sách bảo mật</span>
            <span>Chính sách giải quyết tranh chấp</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
