# FIXHOME v1.2 — TEST COVERAGE & ACCEPTANCE MATRIX

**Tài liệu:** Ma trận kiểm thử đơn vị, kiểm thử tích hợp và kịch bản E2E  
**Tiêu chuẩn chất lượng:** Vitest (Backend & Frontend)  
**Tình trạng hiện tại:** 15/15 test files pass (105 tests), Backend Typecheck Clean, Frontend Typecheck & Build Clean.  

---

## 1. Hiện trạng Test Suite hiện có (Backend)

| Test Suite File | Số Test Cases | Phạm vi kiểm tra | Trạng thái |
| :--- | :--- | :--- | :--- |
| `src/modules/service-orders/service-order-state-machine.spec.ts` | 15 tests | Chuyển đổi trạng thái, role guards, cancellation guards | PASS |
| `src/modules/auth/auth.service.spec.ts` | 15 tests | Đăng ký, đăng nhập bcrypt, refresh token, thu hồi token | PASS |
| `src/config/env.validation.spec.ts` | 12 tests | Validate biến môi trường, định dạng database URL | PASS |
| `src/modules/service-areas/service-areas.service.spec.ts` | 7 tests | CRUD khu vực hoạt động, filter theo tỉnh/huyện | PASS |
| `src/modules/technician-verifications/technician-verifications.service.spec.ts` | 7 tests | Nộp hồ sơ KYC, Admin phê duyệt/từ chối, trạng thái | PASS |
| `src/modules/services/services.service.spec.ts` | 7 tests | Lấy danh mục dịch vụ, lọc active, quản lý danh mục | PASS |
| `src/modules/users/users.service.spec.ts` | 7 tests | Quản lý người dùng, khóa/mở tài khoản, đình chỉ | PASS |
| `src/modules/users/addresses.service.spec.ts` | 6 tests | Quản lý sổ địa chỉ, địa chỉ mặc định, quyền sở hữu | PASS |
| `src/modules/categories/categories.service.spec.ts` | 6 tests | Phân cấp danh mục cha con, icon, thứ tự hiển thị | PASS |
| `src/common/guards/scope.guard.spec.ts` | 5 tests | Kiểm tra phạm vi dữ liệu theo tỉnh/thành phố | PASS |
| `src/common/guards/ownership.guard.spec.ts` | 4 tests | Kiểm tra chống truy cập chéo tài nguyên của user khác | PASS |
| `src/common/interceptors/transform.interceptor.spec.ts` | 4 tests | Chuẩn hóa cấu trúc response `{ data, meta }` | PASS |
| `src/modules/health/health.service.spec.ts` | 4 tests | Healthcheck database và services | PASS |
| `src/common/filters/http-exception.filter.spec.ts` | 3 tests | Chuẩn hóa mã lỗi và HTTP status | PASS |
| `src/modules/users/entities/user.entity.spec.ts` | 3 tests | Validate hashing password và entity lifecycle | PASS |

---

## 2. Các khoảng trống kiểm thử cần bổ sung cho v1.2 (`TESTING GAPS`)

### 2.1 Unit Tests cần bổ sung
1. **FIXED_PRICE Invoice Calculation (`generateInvoice`):**
   - Kiểm tra đơn giá snapshot x số lượng khi không có báo giá chính thức.
   - Kiểm tra cộng dồn chính xác chi phí phát sinh đã duyệt (`ApprovedAdditionalLabor` và `ApprovedAdditionalParts`).
   - Kiểm tra hoa hồng 10% chỉ tính trên tiền công (base + additional labor), không tính trên linh kiện.
2. **Sequential Invitation Logic:**
   - Kiểm tra chỉ 1 KTV duy nhất có trạng thái `PENDING` tại một thời điểm.
   - Kiểm tra tự động chuyển sang ứng viên #2 khi ứng viên #1 từ chối (`DECLINED`) hoặc hết hạn (`EXPIRED`).
3. **CommissionDue Gate & Eligibility Hard Filter:**
   - Kiểm tra thợ có `CommissionDue` trạng thái `PENDING` bị loại khỏi danh sách Candidate (`getCandidates`).
   - Kiểm tra thợ bị chặn bấm `ACCEPT` nếu có nợ hoa hồng chưa thanh toán.
4. **Reschedule Validation (`PATCH /bookings/:id/schedule`):**
   - Cho phép đổi lịch khi đơn chưa sửa chữa.
   - Chặn đổi lịch nếu đơn đã vào trạng thái `UNDER_REPAIR` hoặc `COMPLETED`.
   - Chặn đổi lịch nếu KTV đã có lịch trùng hoặc nghỉ phép (`TimeOff`).

### 2.2 Integration Tests cần bổ sung
1. **Pessimistic Lock & Race Condition khi Accept Lời mời:**
   - Giả lập 2 request đồng thời nhận cùng 1 booking; đảm bảo chỉ 1 KTV thành công, người thứ hai nhận lỗi `INVITATION_ALREADY_TAKEN`.
2. **Idempotency của Phê duyệt Báo giá / Phát sinh:**
   - Gửi 2 lần liên tiếp request `APPROVE` báo giá; đảm bảo không nhân đôi số tiền hay nhân đôi trạng thái.
3. **Cash Settlement Dual Confirmation:**
   - Luồng KTV khai báo số tiền -> Khách hàng bấm đồng ý -> Trạng thái chuyển thành `CONFIRMED` và sinh ra `CommissionDue` chính xác.
   - Luồng Khách hàng khiếu nại lệch tiền -> Trạng thái chuyển thành `DISPUTED` và tạo Support Case cho Service Manager.

---

## 3. Ma trận kiểm thử 9 Kịch bản E2E Spec v1.2

| Kịch bản E2E | Quy trình kiểm thử | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- |
| **Scenario 1: Happy Path INSPECTION_REQUIRED** | Booking → Hard filter → Shortlist #1..#5 → Tech #1 Accept → ServiceOrder(ACCEPTED) → EN_ROUTE → GPS Check-in → Ảnh BEFORE → Báo giá (Labor/Parts) → Khách duyệt → UNDER_REPAIR → Ảnh AFTER → Khách xác nhận → Invoice → Thanh toán Online → COMPLETED. | Mọi trạng thái chuyển dịch tuần tự server-side; hoa hồng 10% chỉ tính trên Labor; hóa đơn và bảo hành điện tử sinh đúng. |
| **Scenario 2: Happy Path FIXED_PRICE** | Booking chọn dịch vụ niêm yết (vd: Vệ sinh máy lạnh 180k x 2 máy = 360k) → Snapshot giá → Tech Accept → Đến nơi → Thực hiện sửa ngay không cần báo giá lại base scope → Hoàn tất → Thanh toán. | Không bắt buộc tạo Official Quotation cho base scope; hóa đơn tính đúng 360k tiền công; hoa hồng 36k. |
| **Scenario 3: AI Service Unavailable** | Đặt lịch khi AI Service offline hoặc timeout. | Khách vẫn chọn danh mục và dịch vụ thủ công bình thường; booking được tạo thành công không phụ thuộc AI. |
| **Scenario 4: 5 Lời mời đều thất bại** | Cả 5 ứng viên trong shortlist lần lượt từ chối hoặc hết hạn. | Hệ thống thông báo khách làm mới danh sách đề xuất để chọn đợt ứng viên mới trước khi cần SM can thiệp thủ công. |
| **Scenario 5: Khách từ chối báo giá** | Sau khi KTV kiểm tra thực tế và gửi báo giá, khách nhấn REJECT. | Tuyệt đối không bắt ép sửa; đơn đóng/hủy với lý do phù hợp; không phạt strike KTV. |
| **Scenario 6: Từ chối chi phí phát sinh** | KTV gửi yêu cầu phát sinh nhưng khách từ chối; phần việc cơ bản vẫn khả thi. | KTV tiếp tục thực hiện phạm vi cơ bản đã duyệt; chi phí phát sinh bị từ chối không được tính vào hóa đơn. |
| **Scenario 7: Thanh toán tiền mặt lệch số tiền** | Thợ khai thu 500k, khách khai chỉ trả 400k. | Đơn không tự động confirm; chuyển sang `DISPUTED` và tạo Support Case để Service Manager thẩm định. |
| **Scenario 8: Khách hủy đơn sau khi thợ đã đến nơi** | Thợ đã Check-in GPS hợp lệ tại địa chỉ khách, khách bấm hủy đơn. | Tạo ticket cho Service Manager; nếu xác định khách vi phạm: khách bị ghi nhận vi phạm, thợ được cộng điểm Priority Boost (không đền bù tiền tự động). |
| **Scenario 9: Khiếu nại bảo hành phát hiện lỗi mới** | Khách tạo yêu cầu bảo hành nhưng thợ kiểm tra phát hiện hỏng linh kiện khác hoàn toàn. | Lỗi mới không được miễn phí bảo hành; KTV tạo báo giá bổ sung riêng; khách duyệt mới tiến hành sửa. |
