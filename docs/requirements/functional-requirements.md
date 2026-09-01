# FixHome – Functional Requirements (FR)

## FR-01: Quản lý xác thực & Phân quyền (Auth & RBAC)
- Đăng ký tài khoản (Customer)
- Đăng nhập (JWT access token)
- Phân quyền theo Role: Customer, Technician, Service Manager, Admin

## FR-02: AI Chẩn đoán sự cố (AI Diagnosis)
- Gửi ảnh chụp thiết bị hỏng + mô tả triệu chứng
- AI trả về: chẩn đoán nguyên nhân, mức độ khẩn cấp (Urgency), khoảng giá ước tính sơ bộ, gợi ý khắc phục an toàn ban đầu
- Gợi ý danh mục dịch vụ phù hợp

## FR-03: Đặt lịch sửa chữa (Booking)
- Chọn dịch vụ, thời gian, địa chỉ thực hiện
- Đính kèm kết quả AI chẩn đoán nếu có
- Quản lý danh sách lịch đã đặt

## FR-04: Đơn dịch vụ (Service Order)
- Khởi tạo Service Order từ Booking đã xác nhận
- Chuyển trạng thái theo State Machine:
  `Pending Confirmation` -> `Accepted` -> `En Route` -> `Under Repair` -> `Completed` / `Cancelled`
- Kiểm tra tính hợp lệ của state transition trên Backend

## FR-05: Báo giá & Nghiệm thu (Quotation)
- Thợ kỹ thuật gửi báo giá khảo sát thực tế (công thợ, linh kiện thay thế)
- Khách hàng xác nhận hoặc từ chối báo giá

## FR-06: Điều phối & Gợi ý Thợ (Technician Recommendation)
- Gợi ý thợ phù hợp theo chuyên môn, đánh giá, khoảng cách
- Service Manager phân công thợ cho đơn dịch vụ

## FR-07: Đánh giá & Phản hồi (Reviews)
- Khách hàng đánh giá sao (1-5) và bình luận sau khi hoàn thành đơn
- Tính điểm trung bình cho thợ kỹ thuật

## FR-08: Thông báo (Notifications)
- Thông báo thay đổi trạng thái đơn, báo giá mới, phân công thợ
