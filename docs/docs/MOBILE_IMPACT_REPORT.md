# FIXHOME v1.2 — MOBILE IMPACT REPORT (READ-ONLY FREEZE)

**Chính sách:** Mobile Repository (`Mobi-FixHome`) tuân thủ nghiêm ngặt **FREEZE RULE** — tuyệt đối KHÔNG sửa code, không đổi navigation, không đổi màn hình mobile trong đợt refactor này.  
**Mục đích tài liệu:** Ghi nhận và hướng dẫn đội ngũ Mobile Engineer cách thức tích hợp API Backend chuẩn hóa theo Specification v1.2 khi mở đợt phát triển Mobile tiếp theo.

---

## 1. Hiện trạng tích hợp Mobile hiện tại

- Mobile repo (`Mobi-FixHome`) đã thiết lập sẵn `src/api/client.ts` (Axios instance với interceptor gắn Bearer Token và xử lý mã lỗi 401).
- Tuy nhiên, phần lớn các màn hình giao diện hiện tại của Mobile (ví dụ: `CustomerHomeScreen.tsx`, `TechnicianHomeScreen.tsx`, `CustomerBookingsScreen.tsx`) đang sử dụng state cục bộ hoặc dữ liệu mock giả lập để phục vụ demo UI/UX ban đầu, chưa trực tiếp gọi qua các API command của Backend.
- Do đó, việc tái cấu trúc Backend hoàn toàn **KHÔNG gây crash hay lỗi build** đối với repository Mobile hiện thời.

---

## 2. Bảng tác động hợp đồng API đối với Mobile (`API IMPACT TABLE`)

| Endpoint | Old Contract / Assumption | New Contract (Spec v1.2) | Mobile Impact | Required Future Change on Mobile |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/bookings` | Body chỉ gửi `{ serviceId, description, preferredAt }` | Body bổ sung `{ preferredTimeWindow, quantity }`. Tự động snapshot đơn giá nếu là `FIXED_PRICE`. | Không gây lỗi runtime nếu gửi thiếu (có default 1 và nullable). | Cập nhật màn hình đặt lịch để người dùng chọn số lượng (máy/bình/cái) và chọn khung giờ hẹn (ví dụ: "08:00 - 10:00"). |
| `GET /api/v1/services` | Trả về danh sách dịch vụ với `basePrice, minPrice, maxPrice`. | Bổ sung `pricingMode ('fixed_price' \| 'inspection_required')`, `unit`, `fixedPrice`, `scopeDescription`. | UI hiện tại có thể chỉ hiển thị dải giá chung. | Cập nhật giao diện phân loại rõ dịch vụ "Đơn giá niêm yết" (kèm đơn vị tính) và dịch vụ "Cần thợ kiểm tra báo giá". |
| `POST /api/v1/bookings/:id/shortlist` | Gửi danh sách thợ được chọn, hệ thống gửi đồng loạt lời mời. | Hệ thống tiếp nhận shortlist nhưng gửi **tuần tự** cho KTV #1 trước. | Không ảnh hưởng request gửi lên từ Mobile. | Màn hình chờ ghép thợ (Matching Screen) có thể hiển thị trạng thái đang chờ KTV số 1 phản hồi (kèm thời gian đếm ngược TTL 30 phút). |
| `GET /api/v1/invitations/my` | Thợ nhận tất cả các lời mời cùng một lúc. | Thợ chỉ nhận lời mời khi đến lượt ưu tiên của mình trong shortlist. | Hộp thư mời của Thợ gọn gàng và chuẩn nghiệp vụ hơn. | Thợ chỉ cần nhấn Chấp nhận (`ACCEPT`) hoặc Từ chối (`DECLINE`) như UI hiện tại. |
| `GET /api/v1/service-orders/my` | Đơn hàng có thể có trạng thái `PENDING_CONFIRMATION`. | Trạng thái bắt đầu là `ACCEPTED`. Không có `PENDING_CONFIRMATION`. | Logic hiển thị trạng thái trên Mobile cần loại bỏ case `PENDING_CONFIRMATION`. | Đồng bộ enum `ServiceOrderStatus`: `ACCEPTED`, `EN_ROUTE`, `UNDER_REPAIR`, `COMPLETED`, `CANCELLED`. |
| `POST /api/v1/cash-settlements/:orderId/technician-confirm` | Không có endpoint; thợ chỉ xác nhận đơn hoàn tất. | Thợ nhập số tiền mặt đã thu từ khách hàng để gửi yêu cầu xác nhận kép. | Cần thêm modal cho KTV nhập số tiền mặt thực nhận khi hoàn tất đơn. | Bổ sung modal nhập số tiền mặt trên `TechnicianHomeScreen.tsx` hoặc `TechnicianJobsScreen.tsx`. |
| `POST /api/v1/cash-settlements/:orderId/customer-confirm` | Không có endpoint; đơn tự động hoàn thành. | Khách hàng nhận thông báo kiểm tra số tiền thợ đã khai báo và nhấn "Xác nhận đúng". | Cần thêm thông báo và nút duyệt thanh toán tiền mặt cho khách. | Thêm popup/dialog xác nhận số tiền trên `CustomerCompletedScreen.tsx`. |
| `GET /api/v1/technicians/me/commission-dues` | Không có cơ chế theo dõi nợ hoa hồng. | KTV tra cứu danh sách nợ hoa hồng 10% sau các đơn tiền mặt. | Thợ có nợ chưa trả sẽ bị chặn bấm Accept đơn mới. | Thêm mục "Công nợ hoa hồng" trong màn hình `TechnicianProfileScreen.tsx` hoặc `TechnicianHomeScreen.tsx`. |

---

## 3. Khuyến nghị triển khai cho giai đoạn Mobile tiếp theo

1. Tích hợp `apiClient` từ `src/api/client.ts` vào các service chuyên biệt (`booking.service.ts`, `order.service.ts`, `auth.service.ts`).
2. Đồng bộ các file định nghĩa kiểu (`types/order.types.ts`, `types/booking.types.ts`) với backend DTOs theo đúng `API_V1_2_CHANGELOG.md`.
3. Giữ nguyên toàn bộ cấu trúc UI đẹp mắt và component hiện có, chỉ thay thế nguồn dữ liệu mock bằng API calls thực tế.
