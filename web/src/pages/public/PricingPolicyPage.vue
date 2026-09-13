<script setup lang="ts">
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-vue-next';
import {
  FhCard,
  FhCostBreakdown,
} from '../../components';
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <span class="text-overline text-brand-700 uppercase font-semibold">Quyết định nghiệp vụ D-02</span>
      <h1 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
        Chính sách giá & Tách bạch chi phí
      </h1>
      <p class="text-ink-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        FixHome là nền tảng đầu tiên tại Việt Nam áp dụng nguyên tắc bắt buộc tách riêng Tiền công và Tiền vật tư trên toàn bộ chu trình dịch vụ.
      </p>
    </div>

    <!-- Rule Highlight Card -->
    <div class="p-6 bg-brand-50 rounded-[var(--radius-lg)] border border-brand-200 flex flex-col sm:flex-row gap-5 items-start">
      <div class="w-12 h-12 rounded-[var(--radius-sm)] bg-brand-600 text-white flex items-center justify-center shrink-0">
        <ShieldCheck :size="24" />
      </div>
      <div class="space-y-2 text-sm text-brand-950">
        <h3 class="text-base font-bold text-brand-900">Cam kết 3 Không về Giá cả:</h3>
        <ul class="space-y-1.5 list-disc list-inside">
          <li><strong>Không gộp giá:</strong> Tuyệt đối không cho phép báo giá "trọn gói mập mờ" không tách rõ linh kiện.</li>
          <li><strong>Không tự ý phát sinh:</strong> Chi phí phát sinh trong lúc sửa bắt buộc phải lập phiếu yêu cầu và khách hàng bấm xác nhận trên app mới được tính tiền.</li>
          <li><strong>Không ép giá:</strong> Mọi dịch vụ đều có khung giá tham khảo (base price min / max) được công khai trong danh mục.</li>
        </ul>
      </div>
    </div>

    <!-- Cost Breakdown Interactive Component Demo -->
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-ink-900">Cách thể hiện báo giá trên hệ thống</h2>
      <p class="text-sm text-ink-600">
        Dưới đây là bảng báo giá mẫu chuẩn mực hiển thị trên điện thoại của khách hàng trước khi bấm đồng ý:
      </p>

      <FhCard class="max-w-lg mx-auto shadow-[var(--shadow-e2)] space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-ink-100">
          <div>
            <div class="text-xs font-num font-bold text-ink-500">MÃ ĐƠN: #FH-20260913-DEMO</div>
            <div class="text-sm font-bold text-ink-900">Thay tụ & nạp gas máy lạnh 1.5 HP</div>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded bg-warning-50 text-warning-700 border border-warning-200">
            Chờ bạn duyệt
          </span>
        </div>

        <FhCostBreakdown
          :labor-total="200000"
          :parts-total="350000"
        />

        <div class="text-[11px] text-ink-500 text-center italic">
          Bao gồm: Công kiểm tra & thay tụ (200.000 ₫) + Tụ kích 45uF chính hãng (350.000 ₫, BH 90 ngày).
        </div>
      </FhCard>
    </div>

    <!-- Additional Cost Sub-workflow -->
    <div class="space-y-4 pt-6 border-t border-ink-200">
      <h2 class="text-2xl font-bold text-ink-900">Quy định về chi phí phát sinh (Additional Cost)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-ink-700">
        <FhCard class="space-y-2">
          <h4 class="font-bold text-ink-900 flex items-center gap-2">
            <CheckCircle2 :size="16" class="text-success-600" />
            Khi nào được phát sinh?
          </h4>
          <p class="text-xs text-ink-600 leading-relaxed">
            Chỉ khi trong quá trình tháo lắp thực tế (trạng thái UNDER_REPAIR), thợ phát hiện thêm lỗi ẩn mà mắt thường không thấy lúc khảo sát ban đầu. Thợ phải chụp ảnh bằng chứng linh kiện hỏng.
          </p>
        </FhCard>

        <FhCard class="space-y-2">
          <h4 class="font-bold text-ink-900 flex items-center gap-2">
            <AlertCircle :size="16" class="text-danger-600" />
            Nếu khách hàng từ chối?
          </h4>
          <p class="text-xs text-ink-600 leading-relaxed">
            Khách hàng có quyền từ chối (Reject) chi phí phát sinh bất kỳ lúc nào. Thợ sẽ chỉ tiếp tục hoàn thiện theo đúng nội dung và số tiền của báo giá ban đầu đã duyệt.
          </p>
        </FhCard>
      </div>
    </div>
  </div>
</template>
