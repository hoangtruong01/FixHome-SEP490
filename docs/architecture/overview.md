# FixHome – Architecture Overview

## 1. System Architecture Diagram

```
+------------------------------------+         +--------------------------------------+
|             Vue.js Web             |         |          React Native Mobile         |
|  (Admin & Service Manager Portal)  |         |      (Customer & Technician App)     |
+------------------+-----------------+         +-------------------+------------------+
                   |                                               |
                   +-----------------------+-----------------------+
                                           | REST API (JWT + RBAC)
                                           v
                   +-----------------------------------------------+
                   |              NestJS Backend API               |
                   |           (Modular Architecture)              |
                   +-----------+-----------------------+-----------+
                               |                       |
                  TypeORM / SQL|                       | HTTP Client (Axios)
                               v                       v
                   +-----------+----------+  +---------+-----------+
                   | PostgreSQL Database  |  |  FastAPI AI Service |
                   |     (Postgres 16)    |  +---------+-----------+
                   +----------------------+            |
                                                       | Provider Abstraction
                                                       v
                                             +---------+-----------+
                                             | Gemini / OpenAI API |
                                             +---------------------+
```

---

## 2. Actor Platform Mapping

| Actor | Nền tảng chính | Trách nhiệm cốt lõi |
| :--- | :--- | :--- |
| **Customer** | Mobile App | Đăng ký, chụp ảnh chẩn đoán AI, đặt lịch Booking, duyệt báo giá, theo dõi trạng thái, đánh giá dịch vụ |
| **Technician** | Mobile App | Nhận công việc được phân công, cập nhật trạng thái đơn (Accepted -> En Route -> Under Repair -> Completed), tạo báo giá khảo sát thực tế |
| **Service Manager** | Web Admin Portal | Tiếp nhận Booking, phân công thợ kỹ thuật (theo AI gợi ý), duyệt báo giá, can thiệp xử lý sự cố |
| **Admin** | Web Admin Portal | Quản lý danh mục dịch vụ, bảng giá gốc, quản lý tài khoản, cấu hình hệ thống, xem báo cáo tổng thể |

---

## 3. Nguyên tắc AI Chẩn đoán (AI Advisory Principle)

1. **AI chỉ mang tính tham khảo (Advisory Only)**: Mọi kết quả chẩn đoán từ AI (nguyên nhân, mức độ khẩn cấp, khoảng giá dự tính) đều là gợi ý sơ bộ hỗ trợ khách hàng và thợ, không phải kết luận kỹ thuật tuyệt đối.
2. **Không chặn luồng nghiệp vụ (Non-blocking Fallback)**: Nếu AI Service gặp sự cố (timeout, lỗi provider, rate limit, ảnh không rõ...), hệ thống tự động kích hoạt fallback cho phép khách hàng tự chọn danh mục dịch vụ và tiếp tục tạo Booking bình thường.
3. **Cấu hình ngưỡng tin cậy (Confidence Threshold)**: Nếu điểm confidence của AI thấp hơn ngưỡng cấu hình (mặc định 0.6), hệ thống gắn cờ cảnh báo `isLowConfidence: true` để giao diện hiển thị ghi chú nhắc nhở người dùng.

---

## 4. Lifecycle & State Machine của Service Order

```
[ PENDING_CONFIRMATION ] ──(Cancel)──> [ CANCELLED ] (Terminal)
          │
      (Accepted)
          ↓
     [ ACCEPTED ] ─────────(Cancel)──> [ CANCELLED ] (Terminal)
          │
      (Technician En Route)
          ↓
     [ EN_ROUTE ]
          │
      (Technician Under Repair)
          ↓
   [ UNDER_REPAIR ]
          │
      (Technician Completed)
          ↓
    [ COMPLETED ] (Terminal)
```

Backend kiểm soát chặt chẽ tính hợp lệ của mọi bước chuyển trạng thái (State Transition Validation) và phân quyền theo từng vai trò (Customer, Technician, Service Manager, Admin).
