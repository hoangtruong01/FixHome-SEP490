# FixHome – Project Scope

## 1. Mục tiêu dự án
FixHome là nền tảng Web + Mobile đặt lịch sửa chữa và bảo trì tại nhà, kết nối:
- Khách hàng (Customer)
- Thợ kỹ thuật (Technician)
- Quản lý dịch vụ (Service Manager)
- Quản trị viên (Admin)

Hệ thống tích hợp AI hỗ trợ chẩn đoán sơ bộ hư hỏng từ ảnh và mô tả để nâng cao độ chính xác khi phân loại và gợi ý dịch vụ/thợ.

## 2. Phạm vi hệ thống (In-Scope)
- **Quản lý người dùng & phân quyền (RBAC)**: Customer, Technician, Service Manager, Admin
- **Quản lý danh mục & dịch vụ**: Phân loại các dịch vụ sửa chữa/bảo trì (điện, nước, điện lạnh, đồ gia dụng...)
- **Đặt lịch (Booking)**: Khách hàng chọn dịch vụ, thời gian, nhập mô tả/ảnh sự cố
- **AI Chẩn đoán (AI Diagnosis)**: Phân tích ảnh/mô tả lỗi, dự đoán nguyên nhân, urgency, ước tính chi phí sơ bộ
- **Đơn dịch vụ (Service Order)**: Quản lý vòng đời đơn theo State Machine
- **Báo giá (Quotation)**: Lập báo giá chi tiết linh kiện/công thợ
- **Gợi ý (Recommendation)**: Gợi ý dịch vụ & thợ kỹ thuật phù hợp
- **Thông báo (Notification)**: Cập nhật trạng thái đơn dịch vụ
- **Đánh giá (Review/Rating)**: Đánh giá chất lượng sau khi hoàn thành

## 3. Ngoài phạm vi hiện tại (Out-of-Scope / Need Confirmation)
- [NEED CONFIRMATION] Phương thức thanh toán online / ví điện tử
- [NEED CONFIRMATION] Live GPS tracking thời gian thực liên tục (chỉ dùng status En Route + bản đồ)
- Tích hợp phần cứng IoT / Nhà thông minh
