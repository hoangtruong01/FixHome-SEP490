import {
  ShieldCheck,
  DollarSign,
  Calendar,
  Award,
  PhoneCall,
} from 'lucide-vue-next';
import { FhCard } from '../../components';


<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
    <div class="text-center space-y-4">
      <span class="text-overline text-brand-700 uppercase font-semibold">Cộng đồng thợ lành nghề</span>
      <h1 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
        Hợp tác cùng nền tảng FixHome
      </h1>
      <p class="text-ink-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        Nhận đơn hàng liên tục trong khu vực hoạt động của bạn, minh bạch thu nhập và được bảo vệ quyền lợi khi làm việc.
      </p>
    </div>

    <!-- Benefits Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <FhCard class="space-y-3">
        <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-brand-50 text-brand-600 flex items-center justify-center">
          <DollarSign :size="20" />
        </div>
        <h3 class="text-base font-bold text-ink-900">Thu nhập xứng đáng</h3>
        <p class="text-xs text-ink-500 leading-relaxed">
          Tỷ lệ hoa hồng hợp lý, nhận tiền công đầy đủ ngay sau khi khách hàng xác nhận hoàn tất đơn hàng.
        </p>
      </FhCard>

      <FhCard class="space-y-3">
        <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-brand-50 text-brand-600 flex items-center justify-center">
          <Calendar :size="20" />
        </div>
        <h3 class="text-base font-bold text-ink-900">Chủ động thời gian</h3>
        <p class="text-xs text-ink-500 leading-relaxed">
          Tự do bật/tắt chế độ "Đang nhận việc", cài đặt lịch làm việc theo ngày trong tuần và đăng ký nghỉ phép linh hoạt.
        </p>
      </FhCard>

      <FhCard class="space-y-3">
        <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-brand-50 text-brand-600 flex items-center justify-center">
          <Award :size="20" />
        </div>
        <h3 class="text-base font-bold text-ink-900">Đánh giá công bằng</h3>
        <p class="text-xs text-ink-500 leading-relaxed">
          Điểm số uy tín (Reliability) và xếp hạng sao chỉ dựa trên đánh giá từ khách hàng thật của đơn hàng đã hoàn tất (D-09).
        </p>
      </FhCard>
    </div>

    <!-- Verification Info per P4.3 -->
    <div class="p-8 bg-ink-900 text-white rounded-[var(--radius-lg)] space-y-4">
      <div class="flex items-center gap-3">
        <ShieldCheck :size="24" class="text-brand-400" />
        <h3 class="text-lg font-bold">Quy trình gia nhập dành cho Kỹ thuật viên (P4.3)</h3>
      </div>
      <p class="text-sm text-ink-300 leading-relaxed">
        Để đảm bảo an toàn cho các hộ gia đình, tài khoản Kỹ thuật viên không mở đăng ký tự do trên web.
        Tất cả hồ sơ thợ đều do <strong>Service Manager (Quản lý khu vực)</strong> của FixHome phỏng vấn trực tiếp,
        kiểm tra chứng chỉ nghề, xác thực CCCD và kích hoạt sau khi hoàn thành khóa đào tạo văn hoá ứng xử.
      </p>
      <div class="pt-2 flex flex-col sm:flex-row items-center gap-4">
        <div class="text-sm text-brand-300 flex items-center gap-2">
          <PhoneCall :size="16" />
          Hotline tuyển thợ: <strong>0902 000 001</strong>
        </div>
        <span class="text-xs text-ink-400 sm:border-l sm:border-ink-700 sm:pl-4">
          Địa chỉ văn phòng tiếp nhận: 120 Pasteur, P. Bến Nghé, Quận 1, TP.HCM
        </span>
      </div>
    </div>
  </div>
</template>
