# FIXHOME v1.2 — API CHANGELOG & CONTRACT SPECIFICATION

**Tài liệu:** Nhật ký thay đổi và chuẩn hóa hợp đồng API  
**Phiên bản đích:** Specification v1.2  
**Đối tượng:** Backend Engineers, Frontend Engineers, Mobile Engineers (để đối chiếu trong tương lai)  

---

## 1. Nguyên tắc thiết kế API v1.2

1. **RESTful Command Endpoints:** Ưu tiên các endpoint mang ngữ nghĩa hành động rõ ràng (`POST /service-orders/:id/en-route`, `POST /service-orders/:id/arrival-check-ins`) thay vì `PATCH /orders/:id` với status tùy ý.
2. **Actor-Aware & Ownership Enforced:** Mọi endpoint đều chạy qua chuỗi 5 lớp bảo vệ:
   `JwtAuthGuard` → `PermissionGuard` → `OwnershipGuard` → `ScopeGuard` → `StateMachineGuard`.
3. **Idempotency:** Các endpoint phê duyệt báo giá, chi phí phát sinh, xác nhận thanh toán phải an toàn khi nhận trùng lặp request (double-click).

---

## 2. Danh sách Endpoints Sửa đổi & Thêm mới

### 2.1 Service Catalog & Pricing Mode

#### `GET /api/v1/services`
- **Thay đổi:** Response bổ sung các trường:
  - `pricingMode`: `'FIXED_PRICE' | 'INSPECTION_REQUIRED'`
  - `unit`: string (ví dụ: 'Máy', 'Bình', 'Cái',...)
  - `fixedPrice`: number (nếu là FIXED_PRICE)
  - `scopeDescription`: string (mô tả phạm vi tiêu chuẩn)

#### `POST /api/v1/admin/services` & `PATCH /api/v1/admin/services/:id`
- **Thay đổi:** Request Body bổ sung:
  - `pricingMode`: `'FIXED_PRICE' | 'INSPECTION_REQUIRED'` (required khi create)
  - `unit`: string (nullable)
  - `fixedPrice`: number (nullable, bắt buộc nếu là FIXED_PRICE)
  - `scopeDescription`: string (nullable)

---

### 2.2 Technician Service & Listed Labor Price

#### `PUT /api/v1/technicians/me/services/:serviceId` (Endpoint mới)
- **Actor:** TECHNICIAN
- **Mục tiêu:** Kỹ thuật viên khai báo hoặc cập nhật giá công tham khảo (`listedLaborPrice`) cho dịch vụ `INSPECTION_REQUIRED` mà mình cung cấp.
- **Request Body:**
  ```json
  {
    "listedLaborPrice": 250000,
    "typicalWarrantyDays": 30,
    "isActive": true
  }
  ```
- **Response:**
  ```json
  {
    "data": {
      "technicianId": "uuid",
      "serviceId": "uuid",
      "listedLaborPrice": 250000,
      "typicalWarrantyDays": 30,
      "isActive": true
    }
  }
  ```

---

### 2.3 Booking & Reschedule

#### `POST /api/v1/bookings`
- **Thay đổi:** Request Body bổ sung:
  - `preferredTimeWindow`: string (tùy chọn, ví dụ: "14:00 - 16:00")
  - `quantity`: number (mặc định 1)
- **Hành vi:**
  - Tự động lấy thông tin dịch vụ, nếu là `FIXED_PRICE` sẽ snapshot `pricingModeSnapshot = FIXED_PRICE`, `fixedUnitPriceSnapshot = service.fixedPrice`, `scopeSnapshot = service.scopeDescription`.

#### `PATCH /api/v1/bookings/:id/schedule` (Endpoint mới)
- **Actor:** CUSTOMER (chính chủ sở hữu booking)
- **Mục tiêu:** Đổi lịch hẹn trước khi việc sửa chữa bắt đầu.
- **Request Body:**
  ```json
  {
    "preferredAt": "2026-09-14T14:00:00.000Z",
    "preferredTimeWindow": "14:00 - 16:00"
  }
  ```
- **Precondition:** Booking chưa ở trạng thái `UNDER_REPAIR` hoặc `COMPLETED`. Nếu đã có KTV nhận đơn, kiểm tra thợ không vướng TimeOff hoặc lịch đơn khác.

---

### 2.4 Sequential Invitations

#### `POST /api/v1/bookings/:id/shortlist`
- **Thay đổi:**
  - Nhận mảng tối đa 5 `technicianIds` theo thứ tự ưu tiên #1..#5.
  - Lưu toàn bộ shortlist vào CSDL nhưng **chỉ kích hoạt lời mời (status = PENDING) cho KTV số #1**.
  - Các KTV còn lại ở trạng thái `QUEUED` / `STANDBY`. Khi #1 từ chối hoặc hết hạn TTL (30 phút), hệ thống tự động kiểm tra lại điều kiện (eligibility) và gửi lời mời tiếp cho #2.

#### `POST /api/v1/invitations/:id/accept` & `POST /api/v1/invitations/:id/decline`
- Hỗ trợ thêm 2 route chuẩn RESTful bên cạnh route cũ `POST /invitations/:id/respond` `{ action: 'ACCEPT' | 'DECLINE' }` để tương thích hoàn toàn cả 2 phong cách gọi.

---

### 2.5 Service Order Lifecycle & Removal of PENDING_CONFIRMATION

- Trạng thái hợp lệ của `ServiceOrder`: `ACCEPTED`, `EN_ROUTE`, `UNDER_REPAIR`, `COMPLETED`, `CANCELLED`.
- Không còn bất kỳ endpoint nào chấp nhận hoặc trả về trạng thái `PENDING_CONFIRMATION` cho `ServiceOrder`.

---

### 2.6 Cash Settlement Dual Confirmation

#### `POST /api/v1/cash-settlements/:orderId/technician-confirm` (Endpoint mới)
- **Actor:** TECHNICIAN (thợ được phân công đang active)
- **Request Body:**
  ```json
  {
    "declaredAmount": 450000,
    "technicianNotes": "Đã nhận đủ tiền mặt từ khách",
    "receiptEvidenceUrl": "https://storage.supabase.co/..."
  }
  ```
- **Hành vi:**
  - Tạo bản ghi `CashSettlement` trạng thái `pending_confirmation`.
  - Gửi thông báo nhắc khách hàng kiểm tra và xác nhận.

#### `POST /api/v1/cash-settlements/:orderId/customer-confirm` (Endpoint mới)
- **Actor:** CUSTOMER (chủ đơn)
- **Request Body:**
  ```json
  {
    "confirmedAmount": 450000,
    "agreed": true
  }
  ```
- **Hành vi:**
  - Nếu `agreed === true` và số tiền khớp:
    - Chuyển `CashSettlement` sang `CONFIRMED`.
    - Chuyển `Invoice.paymentStatus = 'PAID'`, `ServiceOrder.paymentStatus = 'PAID'`.
    - Tự động sinh bản ghi `CommissionDue` bằng 10% x `FinalLaborTotal`.
  - Nếu khách từ chối hoặc số tiền không khớp:
    - Chuyển `CashSettlement` sang `DISPUTED`.
    - Tạo Support Case cho Service Manager vào thẩm định.

---

### 2.7 CommissionDue & Payment

#### `GET /api/v1/technicians/me/commission-dues` (Endpoint mới)
- **Actor:** TECHNICIAN
- **Mục tiêu:** Xem danh sách các khoản hoa hồng tiền mặt cần thanh toán lại cho nền tảng.

#### `POST /api/v1/commission-dues/:id/pay` (Endpoint mới)
- **Actor:** TECHNICIAN
- **Request Body:**
  ```json
  {
    "paymentReference": "BANK_TRANS_9821038"
  }
  ```
- **Hành vi:** Đánh dấu đã thanh toán, giải phóng trạng thái chặn nhận đơn mới cho KTV.

---

### 2.8 Warranty Claims

#### `POST /api/v1/warranty-claims` (Endpoint mới)
- **Actor:** CUSTOMER
- **Request Body:**
  ```json
  {
    "warrantyCoverageId": "uuid",
    "serviceOrderId": "uuid",
    "issueDescription": "Máy điều hòa lại bị rò nước ở đúng ống xả sau 5 ngày sửa"
  }
  ```
- **Response:**
  ```json
  {
    "data": {
      "id": "uuid",
      "status": "OPEN",
      "createdAt": "..."
    }
  }
  ```

---

## 3. Bảng tổng hợp ánh xạ Endpoint Frontend và Backend

| Tính năng | Frontend Client cũ (Lỗi) | Endpoint Backend chuẩn v1.2 | Ghi chú |
| :--- | :--- | :--- | :--- |
| Danh sách đơn của tôi | `/orders/my` (404) | `GET /api/v1/service-orders/my` | Dùng chung cho cả Khách và Thợ dựa vào JWT Role |
| Chi tiết đơn hàng | `/orders/:id` (404) | `GET /api/v1/service-orders/:id` | Trả về thông tin đầy đủ gồm thợ, quotation, invoice |
| Đơn trên bàn điều phối | `/admin/orders` (404) | `GET /api/v1/service-orders` | Dành cho Service Manager và Admin |
| KTV bắt đầu di chuyển | Local stub | `POST /api/v1/service-orders/:id/en-route` | Chuyển trạng thái sang EN_ROUTE |
| KTV Check-in GPS | Local stub | `POST /api/v1/service-orders/:id/arrival-check-ins` | Gửi tọa độ lat/lng và độ chính xác |
| Tải ảnh nghiệm thu | Local stub | `POST /api/v1/service-orders/:id/evidence` | Tải ảnh BEFORE / AFTER kèm type |
| Phê duyệt báo giá | Local stub | `POST /api/v1/quotations/:id/decision` | Body `{ decision: 'APPROVE' \| 'REJECT' }` |
| Thợ báo nhận tiền mặt | Local stub | `POST /api/v1/cash-settlements/:orderId/technician-confirm` | Gửi số tiền thực nhận |
| Khách duyệt tiền mặt | Local stub | `POST /api/v1/cash-settlements/:orderId/customer-confirm` | Xác nhận khớp số tiền |
