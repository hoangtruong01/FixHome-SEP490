<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  Sparkles,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
} from 'lucide-vue-next';
import { FhButton, FhCard } from '../../components';

const router = useRouter();

const steps = [
  {
    step: 'Bước 1',
    title: 'Gửi yêu cầu & AI chẩn đoán sơ bộ',
    desc: 'Chọn loại thiết bị hư hỏng, mô tả hiện tượng và tải lên ảnh hoặc video chụp trực tiếp. Mô hình AI của FixHome sẽ đối chiếu kho dữ liệu kỹ thuật để ước lượng mã linh kiện có thể hư và dự toán khung giá tham khảo.',
    icon: Sparkles,
  },
  {
    step: 'Bước 2',
    title: 'Ghép thợ gần nhất & Check-in GPS',
    desc: 'Hệ thống tự động lọc danh sách tối đa 5 thợ có kỹ năng tương ứng trong bán kính hoạt động. Khi đến nhà bạn, thợ bắt buộc phải thực hiện Check-in GPS qua ứng dụng trong vòng bán kính 300 mét (geofence).',
    icon: MapPin,
  },
  {
    step: 'Bước 3',
    title: 'Khảo sát hiện trường & Báo giá minh bạch',
    desc: 'Thợ chụp ảnh hiện trạng (BEFORE evidence) và tạo bảng báo giá chi tiết trên hệ thống, tách riêng từng đồng tiền công và tiền thiết bị/linh kiện thay thế. Bạn kiểm tra và bấm xác nhận trên điện thoại thì thợ mới được phép bắt tay vào sửa chữa.',
    icon: FileSpreadsheet,
  },
  {
    step: 'Bước 4',
    title: 'Nghiệm thu & Nhận bảo hành điện tử',
    desc: 'Sau khi sửa xong, thợ chụp ảnh hoàn thành (AFTER evidence) và kiểm tra vận hành trước sự chứng kiến của bạn. Hệ thống xuất hoá đơn điện tử có hiệu lực pháp lý và kích hoạt tem bảo hành điện tử từ 30 đến 90 ngày.',
    icon: ShieldCheck,
  },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <span class="text-overline text-brand-700 uppercase font-semibold">Quy chuẩn dịch vụ</span>
      <h1 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
        Cách thức hoạt động tại FixHome
      </h1>
      <p class="text-ink-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        Chúng tôi xây dựng quy trình sửa chữa khép kín, minh bạch và có bằng chứng xác thực ở từng bước để loại bỏ hoàn toàn tình trạng chặt chém.
      </p>
    </div>

    <!-- 4 Steps Details -->
    <div class="space-y-8">
      <FhCard
        v-for="s in steps"
        :key="s.step"
        class="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 items-start"
      >
        <div class="w-14 h-14 rounded-[var(--radius-md)] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200">
          <component :is="s.icon" :size="28" :stroke-width="1.75" />
        </div>

        <div class="space-y-2 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-700 font-num">{{ s.step }}</span>
          </div>
          <h3 class="text-xl font-bold text-ink-900">
            {{ s.title }}
          </h3>
          <p class="text-sm text-ink-600 leading-relaxed">
            {{ s.desc }}
          </p>
        </div>
      </FhCard>
    </div>

    <!-- Call to action -->
    <div class="text-center pt-6 space-y-4">
      <h3 class="text-xl font-bold text-ink-900">Bạn đã sẵn sàng trải nghiệm dịch vụ?</h3>
      <div class="flex justify-center gap-4">
        <FhButton variant="primary" size="lg" @click="router.push('/register')">
          Tạo yêu cầu sửa chữa
          <ArrowRight :size="18" />
        </FhButton>
      </div>
    </div>
  </div>
</template>
