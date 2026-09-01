# FixHome – Booking vs Service Order Architecture

## 1. Phân biệt cốt lõi (Core Distinction)

Trong hệ thống FixHome, **Booking** và **Service Order** là 2 khái niệm thực thể tách biệt đại diện cho 2 giai đoạn khác nhau trong vòng đời dịch vụ:

```
+-------------------------------------------------------------------------+
|                                GIAI ĐOẠN 1                              |
|                    Customer Request & Scheduling (BOOKING)              |
|                                                                         |
|  Customer -> Chọn dịch vụ -> Ảnh/Mô tả (AI Advisory) -> Chọn giờ/địa chỉ|
|                                     ↓                                   |
|                           BOOKING CREATED (Pending)                     |
+-------------------------------------------------------------------------+
                                      ↓
+-------------------------------------------------------------------------+
|                                GIAI ĐOẠN 2                              |
|              Technician Assignment & Dispatching (ASSIGNMENT)           |
|                                                                         |
|             Service Manager điều phối (hoặc AI gợi ý thợ)               |
|                                     ↓                                   |
|                   Thợ nhận việc (Technician Accepted)                   |
+-------------------------------------------------------------------------+
                                      ↓
+-------------------------------------------------------------------------+
|                                GIAI ĐOẠN 3                              |
|                  Execution & State Machine (SERVICE ORDER)              |
|                                                                         |
|   PENDING_CONFIRMATION -> ACCEPTED -> EN_ROUTE -> UNDER_REPAIR -> COMPLETED |
|            (Khảo sát thực tế -> Báo giá Quotation -> Sửa chữa)         |
+-------------------------------------------------------------------------+
                                      ↓
+-------------------------------------------------------------------------+
|                                GIAI ĐOẠN 4                              |
|                      Post-Service (REVIEW & HISTORY)                    |
|                                                                         |
|  - Customer đánh giá thợ (Reviews & Ratings)                           |
|  - Lịch sử sửa chữa (Repair History = Query service_orders COMPLETED)   |
+-------------------------------------------------------------------------+
```

---

## 2. So sánh chi tiết

| Đặc điểm | Booking | Service Order |
| :--- | :--- | :--- |
| **Mục đích** | Ghi nhận nhu cầu đặt lịch của khách hàng | Quản lý toàn bộ quá trình thực hiện sửa chữa tại nhà |
| **Chủ thể khởi tạo**| Khách hàng (Customer) | Hệ thống / Service Manager sau khi tiếp nhận Booking |
| **Dữ liệu chính** | Dịch vụ mong muốn, thời gian hẹn, địa chỉ, mô tả, ảnh lỗi, kết quả AI tham khảo | Thợ phụ trách, trạng thái thực thi, báo giá chi tiết, ảnh nghiệm thu, thời gian thực hiện |
| **Trạng thái** | `PENDING`, `CONFIRMED`, `CANCELLED` | `PENDING_CONFIRMATION`, `ACCEPTED`, `EN_ROUTE`, `UNDER_REPAIR`, `COMPLETED`, `CANCELLED` |

---

## 3. Quy tắc State Machine của Service Order

```
[ PENDING_CONFIRMATION ] ──(Customer/Manager Cancel)──> [ CANCELLED ] (Terminal)
          │
      (Accepted)
          ↓
     [ ACCEPTED ] ─────────(Customer/Manager Cancel)──> [ CANCELLED ] (Terminal)
          │
      (Technician En Route)
          ↓
     [ EN_ROUTE ]
          │
      (Technician Starts Repair)
          ↓
   [ UNDER_REPAIR ]
          │
      (Technician Completes Job)
          ↓
    [ COMPLETED ] (Terminal)
```

> **Lưu ý kiến trúc**:
> - Không tạo bảng riêng cho `repair_history`. Toàn bộ lịch sử sửa chữa của khách hàng hoặc thiết bị được truy xuất trực tiếp từ bảng `service_orders` với điều kiện `status = 'completed'`.
