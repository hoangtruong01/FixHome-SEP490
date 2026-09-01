# FixHome – Actors Specification

| Actor | Platform | Quyền hạn & Trách nhiệm chính |
|-------|----------|--------------------------------|
| **Customer** | Mobile App / Web | - Đăng ký/đăng nhập tài khoản<br>- Sử dụng AI Diagnosis để gửi ảnh/mô tả sự cố<br>- Đặt lịch hẹn sửa chữa (Booking)<br>- Xem báo giá (Quotation), xác nhận/từ chối<br>- Theo dõi trạng thái Service Order<br>- Đánh giá và chấm điểm thợ kỹ thuật |
| **Technician** | Mobile App | - Nhận thông báo công việc được phân công<br>- Cập nhật trạng thái đơn (Accepted, En Route, Under Repair, Completed)<br>- Khảo sát thực tế, tạo/điều chỉnh báo giá chi tiết<br>- Báo cáo hoàn thành công việc kèm hình ảnh nghiệm thu |
| **Service Manager** | Web Admin | - Quản lý và điều phối đơn dịch vụ<br>- Phân công thợ kỹ thuật dựa trên tay nghề/khu vực (AI gợi ý)<br>- Phê duyệt báo giá và giám sát tiến độ thực hiện<br>- Xử lý khiếu nại và tranh chấp phát sinh |
| **Admin** | Web Admin | - Quản trị toàn quyền hệ thống<br>- Quản lý danh mục dịch vụ, bảng giá gốc<br>- Quản lý tài khoản, phân quyền người dùng<br>- Xem báo cáo thống kê, doanh thu, hiệu suất |
