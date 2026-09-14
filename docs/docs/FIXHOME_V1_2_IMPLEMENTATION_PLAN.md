# FIXHOME v1.2 — MASTER IMPLEMENTATION & REFACTORING PLAN

**Mục tiêu:** Kế hoạch hành động chi tiết từng bước (P0 → P3) để tái cấu trúc và hoàn thiện hệ thống FixHome bám sát **Master Project Specification v1.2**.  
**Nguyên tắc triển khai:** 
- Tái sử dụng tối đa kiến trúc hiện có, refactor từng bước nhỏ (incremental), không rewrite tùy tiện.
- Specification v1.2 là chân lý nghiệp vụ cao nhất: `CODE ≠ SPEC v1.2` thì `SPEC v1.2 THẮNG`.
- Kiểm thử và build pass sau mỗi giai đoạn; không chuyển sang P1 khi P0 chưa hoàn tất.

---

## 1. Giai đoạn P0: Các vấn đề cốt lõi & Tính toàn vẹn nghiệp vụ (Critical Business Integrity)

| Task ID | Task Description | Repo | Layer | Priority | Dependency | Files / Modules | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-P0-01** | Loại bỏ `PENDING_CONFIRMATION` khỏi `ServiceOrderStatus` và đặt `ACCEPTED` làm trạng thái mặc định ban đầu. | Backend | Domain / Enum / Entity | **P0** | None | `src/shared/enums/service-order-status.enum.ts`, `src/modules/service-orders/entities/service-order.entity.ts`, `src/modules/service-orders/service-order-state-machine.ts`, `src/modules/service-orders/service-orders.service.ts` | Trạng thái `ServiceOrder` chỉ gồm `ACCEPTED`, `EN_ROUTE`, `UNDER_REPAIR`, `COMPLETED`, `CANCELLED`. State machine và unit test chạy sạch không còn case `PENDING_CONFIRMATION`. |
| **TASK-P0-02** | Bổ sung `pricingMode`, `unit`, `fixedPrice`, `scopeDescription` vào `Service` entity và DTOs. | Backend | DB / Entity / DTO | **P0** | None | `src/shared/enums/service-pricing-mode.enum.ts`, `src/modules/services/entities/service.entity.ts`, `src/modules/services/dto/*`, `src/database/migrations/*` | Entity Service hỗ trợ đầy đủ phân loại `FIXED_PRICE` vs `INSPECTION_REQUIRED` cùng đơn vị tính và đơn giá chuẩn. Seed đầy đủ 17 dịch vụ niêm yết chuẩn. |
| **TASK-P0-03** | Bổ sung snapshot giá cố định (`pricingModeSnapshot`, `fixedUnitPriceSnapshot`, `quantity`, `scopeSnapshot`) vào `Booking` entity và DTO. | Backend | Domain / Booking | **P0** | TASK-P0-02 | `src/modules/bookings/entities/booking.entity.ts`, `src/modules/bookings/bookings.service.ts`, `src/modules/bookings/dto/*` | Khi khách đặt dịch vụ `FIXED_PRICE`, hệ thống tự động chụp lại đơn giá niêm yết, số lượng (máy/bình/cái) và phạm vi tại thời điểm tạo booking. |
| **TASK-P0-04** | Nâng cấp `generateInvoice` hỗ trợ tính tiền công `FIXED_PRICE` độc lập không cần Official Quotation. | Backend | Finance / Order | **P0** | TASK-P0-03 | `src/modules/service-orders/service-orders.service.ts` | Đối với đơn `FIXED_PRICE`, tiền công cơ sở được tính = `FixedUnitPriceSnapshot × Quantity`, cộng với phát sinh đã duyệt (nếu có); hoa hồng 10% tính đúng trên tổng tiền công này; linh kiện 0% hoa hồng. |
| **TASK-P0-05** | Tái cấu trúc luồng gửi lời mời tuần tự (`Sequential Invitations`) trong `InvitationsService`. | Backend | Matching / Invitation | **P0** | None | `src/modules/bookings/invitations.service.ts`, `src/modules/bookings/entities/booking-invitation.entity.ts` | Shortlist tiếp nhận tối đa 5 thợ; chỉ kích hoạt trạng thái `PENDING` cho KTV #1; khi #1 từ chối hoặc hết hạn TTL thì tự động re-check điều kiện và mời KTV #2. |
| **TASK-P0-06** | Tạo entity và logic xác nhận kép thanh toán tiền mặt (`CashSettlement`). | Backend | Finance / Payment | **P0** | TASK-P0-01 | `src/modules/service-orders/entities/cash-settlement.entity.ts`, `src/modules/service-orders/service-orders.service.ts`, `src/modules/service-orders/service-orders.controller.ts` | Thợ khai số tiền mặt đã nhận (`technician-confirm`); khách hàng nhận thông báo để xác nhận (`customer-confirm`); khi cả hai khớp thì đơn mới xác nhận `PAID`; nếu lệch thì chuyển sang `DISPUTED`. |
| **TASK-P0-07** | Tạo entity `CommissionDue` và cổng chặn KTV nợ hoa hồng (`CommissionDue Gate`). | Backend | Finance / Eligibility | **P0** | TASK-P0-06 | `src/modules/service-orders/entities/commission-due.entity.ts`, `src/modules/bookings/bookings.service.ts`, `src/modules/bookings/invitations.service.ts` | Khi đơn tiền mặt hoàn tất, tự động sinh công nợ 10% tiền công. KTV có nợ chưa trả bị loại khỏi danh sách ứng viên và bị chặn bấm `ACCEPT` đơn mới. |
| **TASK-P0-08** | Chuẩn hóa `orders.api.ts` trên Web gọi đúng endpoint backend và đồng bộ enum trạng thái. | Frontend | Web / API Client | **P0** | TASK-P0-01 | `src/api/orders.api.ts`, `src/types/order.types.ts` | Frontend gọi đúng `GET /service-orders/my` và `GET /service-orders/:id`, sử dụng đúng enum `ACCEPTED`, `EN_ROUTE`, `UNDER_REPAIR`, `COMPLETED`, `CANCELLED`. |
| **TASK-P0-09** | Kết nối các action thực tế trên trang `TechnicianJobDetailPage.vue` với Backend APIs. | Frontend | Web / Tech UI | **P0** | TASK-P0-08 | `src/pages/technician/TechnicianJobDetailPage.vue` | Các nút "Bắt đầu di chuyển", "Check-in GPS", "Tải ảnh nghiệm thu", "Lập báo giá" gọi trực tiếp API Backend thay vì dummy alert. |
| **TASK-P0-10** | Kết nối các action trên trang `CustomerOrderDetailPage.vue` với Backend APIs. | Frontend | Web / Customer UI | **P0** | TASK-P0-08 | `src/pages/customer/CustomerOrderDetailPage.vue` | Các nút "Phê duyệt báo giá", "Duyệt phát sinh", "Xác nhận tiền mặt" gọi trực tiếp Backend command API. |

---

## 2. Giai đoạn P1: Hoàn thiện tính năng danh mục, thợ và trải nghiệm (Important Features)

| Task ID | Task Description | Repo | Layer | Priority | Dependency | Files / Modules | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-P1-01** | Bổ sung `listedLaborPrice` và API `PUT /technicians/me/services/:serviceId`. | Backend | Tech / Service | **P1** | TASK-P0-02 | `src/modules/technicians/entities/technician-skill.entity.ts`, `src/modules/technicians/technicians.controller.ts`, `src/modules/technicians/technicians.service.ts` | KTV có thể cấu hình giá công tham khảo và thời gian bảo hành mẫu cho các dịch vụ `INSPECTION_REQUIRED` mà mình làm. |
| **TASK-P1-02** | Thêm trường `preferredTimeWindow` và API `PATCH /bookings/:id/schedule`. | Backend | Booking | **P1** | None | `src/modules/bookings/bookings.controller.ts`, `src/modules/bookings/bookings.service.ts` | Khách hàng có thể đổi khung giờ hẹn trước khi thợ bắt đầu sửa, backend kiểm tra hợp lệ với lịch làm việc của KTV. |
| **TASK-P1-03** | Hoàn thiện 10 tiêu chí Hard Filter trong `BookingsService.getCandidates`. | Backend | Matching | **P1** | TASK-P0-07 | `src/modules/bookings/bookings.service.ts` | Bộ lọc ứng viên kiểm tra chặt chẽ: skill, area, isAvailable, suspension, verified, schedule, timeOff, trùng đơn và không nợ CommissionDue. |
| **TASK-P1-04** | Cập nhật Web Admin `CatalogManagementPage.vue` hỗ trợ cấu hình `FIXED_PRICE`. | Frontend | Web / Admin UI | **P1** | TASK-P0-02 | `src/pages/console/CatalogManagementPage.vue`, `src/api/catalog.api.ts` | Admin có thể chọn Pricing Mode, nhập đơn giá cố định, đơn vị tính và mô tả phạm vi tiêu chuẩn khi tạo/sửa dịch vụ. |
| **TASK-P1-05** | Cập nhật Web Khách hàng `NewBookingWizardPage.vue` hiển thị đơn giá niêm yết và chọn số lượng. | Frontend | Web / Customer UI | **P1** | TASK-P0-03 | `src/pages/customer/NewBookingWizardPage.vue` | Khi khách chọn dịch vụ FIXED_PRICE, hiển thị đơn vị tính, đơn giá cố định và cho phép tăng/giảm số lượng thiết bị cần làm. |
| **TASK-P1-06** | Bổ sung màn hình quản lý công nợ hoa hồng cho KTV (`TechnicianEarningsPage.vue`). | Frontend | Web / Tech UI | **P1** | TASK-P0-07 | `src/pages/technician/TechnicianEarningsPage.vue` | KTV xem được danh sách đơn tiền mặt, số tiền hoa hồng 10% phải nộp lại và nút xác nhận đã chuyển khoản. |

---

## 3. Giai đoạn P2: Quy trình khiếu nại bảo hành & Dịch vụ ngoại lệ (Support & Warranty)

| Task ID | Task Description | Repo | Layer | Priority | Dependency | Files / Modules | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-P2-01** | Tạo entity `WarrantyClaim` và endpoint `POST /warranty-claims`. | Backend | Warranty | **P2** | None | `src/modules/service-orders/entities/warranty-claim.entity.ts`, `src/modules/service-orders/service-orders.controller.ts` | Khách hàng có thể mở khiếu nại bảo hành cho các hạng mục còn hạn bảo hành; KTV và Service Manager có thể phản hồi và xử lý. |
| **TASK-P2-02** | Hoàn thiện giao diện giải quyết khiếu nại và hủy đơn trên Console (`ConsoleCancellationsPage.vue`, `ConsoleStrikesPage.vue`). | Frontend | Web / SM UI | **P2** | TASK-P0-01 | `src/pages/console/ConsoleCancellationsPage.vue`, `src/pages/console/ConsoleStrikesPage.vue` | Service Manager có thể xem chi tiết lý do hủy, bằng chứng check-in GPS và đưa ra phán quyết ghi nhận vi phạm / cộng điểm Priority Boost. |

---

## 4. Giai đoạn P3: Tối ưu hóa kiểm thử & Hoàn thiện tài liệu (Testing & Polish)

| Task ID | Task Description | Repo | Layer | Priority | Dependency | Files / Modules | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-P3-01** | Bổ sung unit tests cho tính toán hóa đơn FIXED_PRICE, CommissionDue và Sequential Invitations. | Backend | Testing | **P3** | Giai đoạn P0 | `src/modules/service-orders/*.spec.ts`, `src/modules/bookings/*.spec.ts` | Toàn bộ các quy tắc tính toán tài chính và chuyển dịch trạng thái mới đều có unit test bao phủ; 100% test pass. |
| **TASK-P3-02** | Đồng bộ tài liệu kỹ thuật dự án và cập nhật checklist hoàn thành trong `CURRENT_TASKS.md`. | Docs | Documentation | **P3** | Tất cả | `Docs-FixHome/CURRENT_TASKS.md`, `Docs-FixHome/PROJECT_DOCUMENTATION.md` | Tài liệu phản ánh chính xác trạng thái mã nguồn thực tế và đáp ứng trọn vẹn tiêu chuẩn nghiệm thu của Spec v1.2. |
