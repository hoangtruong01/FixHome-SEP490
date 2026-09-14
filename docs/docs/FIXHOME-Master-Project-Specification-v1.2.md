**MASTER PROJECT SPECIFICATION**

Business • Product • Functional • Architecture Direction • Implementation Guide

**Phiên bản: v1.2 \| Ngày: 13/09/2026 \| Trạng thái: CURRENT WORKING BASELINE**

| Mục tiêu: Đây là tài liệu onboarding và execution guide để BA/PM/PO/Developer/QA/Designer đọc cùng một nguồn, hiểu cùng một nghiệp vụ và triển khai nhất quán từ Requirement → Database → API → UI → Testing. |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

Nguồn nghiệp vụ: Business Baseline v3.1 (13/09/2026) + các quyết định nhóm chốt ngày 13/09/2026, bao gồm pricing mode FIXED_PRICE cho danh mục dịch vụ niêm yết. Những điểm mới được ghi rõ ở mục “Decision Delta”.

Tài liệu này không chứng minh feature đã được code. Nó mô tả business semantics và hướng triển khai hiện tại.

# 0. Document Control & Cách sử dụng

| **Mục**       | **Giá trị**                                                                              |
|---------------|------------------------------------------------------------------------------------------|
| Tên tài liệu  | FixHome – Master Project Specification                                                   |
| Version       | v1.2                                                                                     |
| Ngày          | 13/09/2026                                                                               |
| Nguồn chính   | Business Baseline v3.1 + quyết định mới nhất của nhóm trong cuộc trao đổi                |
| Đối tượng đọc | BA, PM, PO, Developer, QA/Tester, UX/UI, AI member, DevOps, giảng viên/hội đồng          |
| Mục tiêu      | Hiểu dự án, thiết kế nhất quán, chia task, implement, test và demo                       |
| Không phải    | Bản chứng nhận implementation đã hoàn thành hoặc tài liệu pháp lý/payment provider final |

## 0.1 Mức độ quyết định

| **Nhãn**                   | **Ý nghĩa**                                                                                                                |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------|
| FINALIZED                  | Đã chốt. Use Case/ERD/API/UI/code phải bám theo nếu chưa có quyết định mới.                                                |
| ADMIN CONFIG               | Semantics đã chốt nhưng giá trị cụ thể cấu hình bởi Admin; không hard-code business.                                       |
| TBD                        | Chưa chốt. Không được tự giả định thành requirement cuối.                                                                  |
| OPTIONAL                   | Có thể làm nếu còn scope; không là dependency của core MVP.                                                                |
| RECOMMENDED IMPLEMENTATION | Hướng kỹ thuật khuyến nghị để team Capstone triển khai; có thể normalize khi code nhưng không được đổi business semantics. |

## 0.2 Nguyên tắc source-of-truth

1.  Nếu tài liệu/diagram/code mâu thuẫn với business đã FINALIZED, phải tạo conflict note thay vì âm thầm chọn một bản.

2.  Business change phải cập nhật baseline/spec trước, sau đó mới sync Use Case, ERD, API, UI và Test Case.

3.  Không khôi phục Deposit/Booking Hold/Wallet Reserve/commission trên Parts nếu không có quyết định mới.

4.  TBD và ADMIN CONFIG không được tự biến thành requirement cố định trong code/report.

## 0.3 Mục lục nội dung

| **Phần** | **Nội dung**                                                                                                |
|----------|-------------------------------------------------------------------------------------------------------------|
| 1–6      | Tổng quan sản phẩm, scope, actors, modules, glossary và latest decisions                                    |
| 7–10     | End-to-end flow, functional specification, exception matrix và status families                              |
| 11–14    | RBAC/ownership, ERD direction, API direction và architecture/technology                                     |
| 15–19    | Backend enforcement, security/NFR, UX flow, roadmap và testing                                              |
| 20–25    | Business Rule Register, TBD/config, worked example, consistency checklist, Definition of Done và conclusion |

| Quick read: Developer 6→8→10→11→12→13→15→19 \| BA/PM/PO 1→3→6→7→9→20→21→23. |
|-----------------------------------------------------------------------------|

# 1. Executive Summary

FixHome là nền tảng Web + Mobile kết nối Customer với Technician đã được xác minh cho nhu cầu sửa chữa/bảo trì tại nhà. Hệ thống hỗ trợ AI để phân tích vấn đề ban đầu nhưng AI chỉ đóng vai trò advisory. Backend là authority cho eligibility, assignment, state transition, approvals, payment verification, commission và audit.

Customer mô tả lỗi + ảnh  
→ AI diagnosis/reference price (optional)  
→ Browse Service: FIXED_PRICE hoặc INSPECTION_REQUIRED + eligible Technicians  
→ Customer có thể chủ động liên hệ theo policy  
→ Create Booking (1 Primary Service + preferred time window)  
→ Hard Filter → Conventional Ranking → Optional AI soft re-ranking  
→ Customer shortlist max 5  
→ Sequential Invitation  
→ Technician Accept  
→ CREATE ServiceOrder = ACCEPTED + Assignment  
→ EN_ROUTE → Arrival Check-in → BEFORE Evidence  
→ FIXED_PRICE: thực hiện đúng fixed scope; không cần quote lại base price  
→ INSPECTION_REQUIRED: inspect → Official Quotation → Customer Approve  
→ UNDER_REPAIR → Additional Cost nếu có  
→ AFTER Evidence + Customer Confirmation  
→ Final Invoice → Online/Cash Payment  
→ COMPLETED → Rating/History/Warranty

| Quyết định mới quan trọng: ServiceOrder KHÔNG tồn tại trong giai đoạn matching. ServiceOrder chỉ được tạo khi một Technician Accept hợp lệ. |
|---------------------------------------------------------------------------------------------------------------------------------------------|

# 2. Product Vision, Business Boundary & Scope

## 2.1 Vai trò sản phẩm — FINALIZED

FixHome là intermediary marketplace/workflow platform. FixHome không trực tiếp trở thành đơn vị sửa chữa, nhà cung cấp linh kiện, kho inventory hoặc ví điện tử lưu tiền bảo đảm của Technician.

- Tạo và theo dõi Booking.

- Eligibility, recommendation/ranking, shortlist và sequential invitation.

- Assignment và ServiceOrder lifecycle.

- Quotation, Additional Cost, Invoice và payment integration.

- Commission 10% trên Labor; Parts không commission.

- Arrival verification, repair evidence và audit history.

- Cancellation/strike/suspension/Priority Boost.

- Warranty workflow và Service Manager exception handling.

- AI advisory diagnosis, reference price và optional soft ranking.

- Notifications/realtime, rating/review, repair history và dashboard phù hợp scope.

## 2.2 Ngoài current core scope

- Warehouse/inventory/supplier procurement của FixHome.

- Deposit/Booking Hold/Booking Guarantee.

- Technician prepaid reserve / minimum security balance / stored-value wallet.

- Commission trên Parts.

- Monetary compensation tự động khi Customer cancel sau arrival.

- OCR/FaceMatch/Liveness bắt buộc cho KYC.

- Complex payout hold/escrow 12h/24h.

- Realtime continuous model retraining.

- AI autonomous assignment.

- Voucher nếu chưa được nhóm tái xác nhận.

# 3. Actors, Ownership & Responsibilities

| **Actor**       | **Trách nhiệm chính**                                                                                                                                                                    | **Không được làm**                                                                                                      |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| Customer        | AI diagnosis; browse service/Tech; tạo Booking; shortlist; approve/reject Quote & Additional Cost; theo dõi order; payment; review; warranty claim.                                      | Chọn Tech fail hard filter; sửa approved financial data; giả payment success; truy cập order người khác.                |
| Technician      | Profile/KYC; skills/service area/schedule; listed labor price theo service; invitation; Accept/Decline; arrival; quote; repair; evidence; cash confirm; commission due; warranty rework. | Bypass verification; tự assign; sửa approved quote; nhận job khi suspension/unpaid CommissionDue; giả provider success. |
| Service Manager | Exception/support: matching exhausted, dispute, arrival abnormal, cash mismatch/non-response, mid-job interruption, warranty dispute, strike/priority review.                            | Thay quyền approve bình thường của Customer; forge payment; sửa approved quote không audit.                             |
| Admin           | RBAC/users; KYC approval; service catalog; configs; ranking weights; geofence; strike policy; warranty options; commission rate; audit/reporting.                                        | Retroactively mutate historical snapshots.                                                                              |

# 4. Core Modules & Ownership Map

| **\#** | **Module**                           | **Actors**                        | **Mục tiêu**                                                             |
|--------|--------------------------------------|-----------------------------------|--------------------------------------------------------------------------|
| 1      | Authentication + JWT + RBAC          | All actors                        | Login/register/token/authorization                                       |
| 2      | User & Technician Management         | Customer/Technician/Admin         | Profile, status, KYC, skills, service areas, schedules                   |
| 3      | Service Catalog                      | Customer/Technician/Admin         | Service/category/reference pricing; TechnicianService listed labor price |
| 4      | AI Diagnosis                         | Customer                          | Image/text diagnosis, urgency, reference price, disclaimer/fallback      |
| 5      | Booking                              | Customer                          | 1 Primary Service, media, address, preferred time window, reschedule     |
| 6      | Technician Recommendation/Assignment | Customer/Technician               | Hard filters, ranking, shortlist max 5, sequential invitation, Accept    |
| 7      | Service Order + State Machine        | Customer/Technician               | Execution lifecycle sau Accept                                           |
| 8      | Quotation & Additional Cost          | Technician/Customer               | LABOR/PARTS, approval, immutable revisions                               |
| 9      | Maps & Arrival                       | Technician/Customer               | Geocoding, route, GPS/geofence check-in                                  |
| 10     | Repair Evidence & Completion         | Technician/Customer               | BEFORE/AFTER, notes, confirmation                                        |
| 11     | Payments & Commission                | Customer/Technician/Manager/Admin | Online/cash, CommissionDue, ledger/audit                                 |
| 12     | Notifications + Realtime + Chat      | All                               | Persisted notifications, WebSocket, conversation authorization           |
| 13     | Ratings, Reviews & Repair History    | Customer/Technician               | Post-completion quality/history                                          |
| 14     | Warranty                             | Customer/Technician/Manager       | Coverage snapshot, claim, rework, dispute                                |
| 15     | Dashboard/Admin/Support              | Manager/Admin                     | Exception queue, configs, audit, operational views                       |

# 5. Domain Glossary

| **Term**             | **Meaning**                                                                                                                                                     |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Booking              | Yêu cầu dịch vụ ban đầu; tồn tại trước assignment; dùng cho matching. 1 Booking = 1 Primary Service.                                                            |
| Candidate            | Technician đã qua hard filters và có thể được xếp hạng/hiển thị.                                                                                                |
| Shortlist            | Danh sách tối đa 5 eligible Technicians do Customer chọn và sắp ưu tiên.                                                                                        |
| Invitation           | Lời mời tuần tự gửi cho một Candidate tại một thời điểm.                                                                                                        |
| Assignment           | Quan hệ active giữa Technician và ServiceOrder, tạo khi invitation Accept hợp lệ.                                                                               |
| ServiceOrder         | Đơn sửa chữa thực tế; chỉ được tạo khi Technician Accept; trạng thái đầu là ACCEPTED.                                                                           |
| Listed Labor Price   | Giá công chuẩn Technician khai theo từng Service để Customer tham khảo trước Booking; không phải Official Quotation.                                            |
| AI Estimate          | Giá/diagnosis tham khảo từ AI; non-binding.                                                                                                                     |
| Preliminary Estimate | Ước lượng sơ bộ từ Technician khi tương tác/invitation; non-binding, optional.                                                                                  |
| Official Quotation   | Báo giá sau arrival + inspection; binding khi Customer approve.                                                                                                 |
| LABOR                | Tiền công kỹ thuật; commission base.                                                                                                                            |
| PARTS_EQUIPMENT      | Linh kiện/vật tư/thiết bị; không commission.                                                                                                                    |
| Additional Cost      | Phát sinh ngoài approved scope, phải request + Customer decision.                                                                                               |
| CommissionDue        | Commission Technician còn phải trả FixHome sau cash settlement.                                                                                                 |
| Typical Warranty     | Warranty tham khảo trên profile/service.                                                                                                                        |
| WarrantyCoverage     | Warranty binding được snapshot cho approved job/item.                                                                                                           |
| Priority Boost       | Soft ranking benefit sau qualifying verified-arrival Customer cancellation; không bypass hard filters.                                                          |
| Fixed-Price Service  | Service có đơn giá và scope chuẩn do FixHome/Admin quản lý. Customer chấp nhận giá khi Booking; giá được snapshot. Base scope không cần Official Quotation lại. |

# 6. Latest Decision Delta (so với Business Baseline v3.1)

| **ID** | **Decision mới**                                                                                                                                                                      | **Trạng thái**       | **Tác động**                                                                         |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|--------------------------------------------------------------------------------------|
| D-01   | ServiceOrder chỉ tạo khi Technician Accept hợp lệ; không tạo lúc Customer submit Booking.                                                                                             | FINALIZED            | Booking quản lý matching; bỏ PENDING_CONFIRMATION khỏi ServiceOrder.                 |
| D-02   | 1 Booking = 1 Primary Service. Hạng mục liên quan nằm trong Quote/Additional Cost; Service khác hoàn toàn → Booking mới.                                                              | FINALIZED            | ERD/API/UI đơn giản và rõ ownership.                                                 |
| D-03   | Customer chọn preferred time window; cho reschedule trước khi repair bắt đầu, backend validate state + Technician availability.                                                       | FINALIZED            | Booking/Schedule API cần conflict validation.                                        |
| D-04   | Nếu hai bên không đạt thỏa thuận Quote hoặc Technician kiểm tra nhưng không thể làm, job dừng; Technician rời đi.                                                                     | FINALIZED high-level | Cancellation/closure reason phải lưu; finance/penalty đặc biệt chưa mở rộng.         |
| D-05   | Nếu Additional Cost bị reject: base scope còn khả thi thì tiếp tục; không khả thi thì dừng.                                                                                           | FINALIZED            | Không ép Customer trả phát sinh.                                                     |
| D-06   | Technician phải thiết lập Listed Labor Price cụ thể theo Service để Customer so sánh trước Booking.                                                                                   | FINALIZED            | Thêm TechnicianService pricing; giá này non-binding.                                 |
| D-07   | Customer có thể chủ động nhắn Technician từ danh sách trước Booking.                                                                                                                  | FINALIZED một phần   | Chi tiết Technician có được reply hay hoàn toàn không được trả lời đang TBD-CHAT-01. |
| D-08   | Cash: Tech nhập số tiền nhận; Customer confirm; evidence optional; timeout reminder; Manager quyết CONFIRMED/DISPUTED; không auto-confirm.                                            | FINALIZED            | CashSettlement cần PENDING_CONFIRMATION + manager resolution.                        |
| D-09   | Warranty chỉ cover lỗi/scope cũ thuộc coverage. Lỗi mới không liên quan → Additional Quotation riêng; Customer Approve/Reject.                                                        | FINALIZED            | Warranty claim phải phân loại covered/new issue.                                     |
| D-10   | Service Catalog hỗ trợ FIXED_PRICE và INSPECTION_REQUIRED. FIXED_PRICE dùng giá/scope do Admin quản lý; commission 10% trên fixed service subtotal; Parts phát sinh không commission. | FINALIZED            | Cập nhật Service/Booking snapshot, Quotation rule, Invoice/Commission và UI pricing. |

| Baseline v3.1 có PENDING_CONFIRMATION trong ServiceOrder. Quyết định D-01 mới hơn và được dùng trong tài liệu này; khi cập nhật canonical Business Baseline tiếp theo phải sync lại rule/status tương ứng. |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# 7. End-to-End Business Flow

## 7.1 Discovery & pre-booking

Browse/Search Service  
→ optional AI Diagnosis  
→ Backend finds eligible/nearby Technicians  
→ show profile + rating + distance + Listed Labor Price + Typical Warranty  
→ Customer may start pre-booking contact according to chat policy  
→ Customer decides to create Booking

## 7.2 Booking & matching

Create Booking  
- primaryServiceId  
- problemDescription  
- media  
- repairAddress  
- preferredTimeWindow  
  
→ Hard Filters  
→ Conventional Ranking  
→ Optional AI Soft Re-ranking  
→ Customer shortlist max 5  
→ Sequential Invitation \#1..#5  
→ re-check eligibility before each invitation  
→ Technician Accept  
→ transaction creates ServiceOrder(ACCEPTED) + TechnicianAssignment

## 7.3 On-site execution

ACCEPTED  
→ Technician marks EN_ROUTE  
→ GPS/geofence Arrival Check-in  
→ BEFORE Evidence  
→ Inspection  
→ Official Quotation (LABOR + PARTS + Warranty)  
→ Customer Approve?  
No: no agreement → close/cancel job  
Yes: UNDER_REPAIR  
→ Additional Cost if needed  
→ AFTER Evidence + completion note  
→ Customer confirmation  
→ Final Invoice

## 7.4 Payment & post-service

Online: full invoice → provider → webhook verify → PAID → settlement  
Cash: Customer pays Tech → Tech declares amount → Customer confirms → CashSettlement confirmed → CommissionDue  
  
→ ServiceOrder COMPLETED when completion/payment conditions satisfied  
→ Rating/Review + Repair History + WarrantyCoverage

# 8. Functional Specification by Module

## 8.1 Authentication, JWT & RBAC

| **Item**      | **Requirement**                                                                                                           |
|---------------|---------------------------------------------------------------------------------------------------------------------------|
| Actors        | Customer, Technician, Service Manager, Admin                                                                              |
| Core          | Register/Login/Logout/Refresh token/Reset password/Profile access                                                         |
| Authorization | Backend RBAC + ownership checks; role alone is not enough for order-specific access.                                      |
| Security      | Hash password, short-lived access token, refresh strategy, rate limit login/reset, audit sensitive admin/manager actions. |
| Validation    | Unique email/phone as chosen by team; active/suspended account check; revoked token strategy if implemented.              |

## 8.2 User & Technician Management / KYC

- Technician submits CCCD image(s) + face photo; Admin manually reviews → VERIFIED / REJECTED.

- Only VERIFIED Technician can enter matching hard-filter pass.

- Technician manages skills/services, working schedule, time off, service area and operational availability.

- KYC media stored private in Supabase Storage; only owner/authorized Admin access.

- Technician work suspension, account status and unpaid CommissionDue must be checked in eligibility.

## 8.3 Service Catalog & TechnicianService Pricing

Service Catalog là taxonomy do Admin quản lý. Mỗi Booking chọn đúng một Primary Service.

| **Entity/Field direction** | **Meaning**                                                                                                               |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Service                    | id, categoryId, name, description, pricingMode, unit, fixedPrice?, referencePriceRange?, scopeDescription, active         |
| TechnicianService          | technicianId + serviceId unique; active; listedLaborPrice only for INSPECTION_REQUIRED; typicalWarranty setting/reference |
| Listed Labor Price         | Chỉ áp dụng cho INSPECTION_REQUIRED; giá công tham khảo trước Booking, không phải Official Quotation.                     |

| Nếu thực tế khác standard scope, Official Quotation được phép khác Listed Labor Price nhưng UI nên yêu cầu Technician ghi reason/scope rõ để tránh bait pricing. |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|

### 8.3.1 Fixed-Price Service Catalog — FINALIZED

Các Service dưới đây dùng pricingMode = FIXED_PRICE. Giá là giá base theo đơn vị, do Admin quản lý và được snapshot khi Customer tạo Booking. Bảng cố ý rút gọn để team dễ dùng cho DB/API/UI.

| **Category**   | **Service**                             | **Đơn vị** | **Fixed Price** |
|----------------|-----------------------------------------|------------|-----------------|
| Điều hòa       | Vệ sinh điều hòa treo tường 1–1.5 HP    | Máy        | 180.000đ        |
| Điều hòa       | Vệ sinh điều hòa treo tường 2–2.5 HP    | Máy        | 220.000đ        |
| Điều hòa       | Vệ sinh điều hòa âm trần                | Máy        | 500.000đ        |
| Máy giặt       | Vệ sinh cửa trên ≤ 9kg                  | Máy        | 350.000đ        |
| Máy giặt       | Vệ sinh cửa trên \> 9kg                 | Máy        | 450.000đ        |
| Máy giặt       | Vệ sinh cửa ngang ≤ 9kg                 | Máy        | 550.000đ        |
| Máy giặt       | Vệ sinh cửa ngang \> 9kg                | Máy        | 650.000đ        |
| Máy sấy        | Vệ sinh máy sấy gia đình                | Máy        | 350.000đ        |
| Bình nóng lạnh | Vệ sinh/bảo dưỡng bình nóng lạnh        | Bình       | 250.000đ        |
| Điện           | Thay công tắc điện - tiền công          | Cái        | 100.000đ        |
| Điện           | Thay ổ cắm điện - tiền công             | Cái        | 100.000đ        |
| Điện           | Lắp đèn trần cơ bản - tiền công         | Cái        | 120.000đ        |
| Điện           | Lắp quạt treo tường - tiền công         | Cái        | 150.000đ        |
| Điện           | Lắp quạt trần cơ bản - tiền công        | Cái        | 250.000đ        |
| TV             | Lắp TV lên giá treo có sẵn              | TV         | 100.000đ        |
| Nước           | Thay vòi nước - tiền công               | Cái        | 120.000đ        |
| Nước           | Thay vòi sen - tiền công                | Bộ         | 150.000đ        |
| Nước           | Thay siphon/chống rò lavabo - tiền công | Bộ         | 150.000đ        |
| Thiết bị       | Lắp máy lọc nước cơ bản                 | Máy        | 250.000đ        |
| Kiểm tra       | Kiểm tra/chẩn đoán thiết bị tại nhà     | Lần        | 100.000đ        |

- Fixed-price rules: (1) FixedBaseAmount = FixedUnitPriceSnapshot × Quantity; (2) Customer chấp nhận base price/scope khi Booking; (3) Technician không được tự đổi fixedPrice; (4) phát sinh ngoài fixed scope phải qua Additional Cost; (5) vật tư/linh kiện phát sinh vẫn tách PARTS_EQUIPMENT và không commission.

## 8.4 AI Diagnosis

| **Input**                           | **Output**                                                                                | **Business constraints**                                                                    |
|-------------------------------------|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Ảnh + mô tả lỗi + context cần thiết | Possible issue/cause; suggested service; urgency; reference price; confidence/limitations | Advisory only; no assignment/quote/payment/state authority; AI failure không block Booking. |

- Backend lưu metadata cần thiết cho audit/debug: provider/model/version, timestamp, confidence, raw/normalized result phù hợp privacy.

- Fallback: Customer vẫn chọn Service/category thủ công khi AI fail/timeout/low confidence.

- AI soft ranking chỉ chạy sau hard filters và conventional ranking.

## 8.5 Technician Eligibility & Recommendation

Hard filters là authority trước ranking:

- VERIFIED

- account/working status active

- skill/service phù hợp

- working schedule phù hợp

- không approved time off

- không conflict assignment

- service area/location phù hợp

- operational availability

- không active work suspension

- không active unpaid CommissionDue

eligibleSet = hardFilter(allTechnicians)  
ranked = conventionalRank(eligibleSet)  
if aiEnabled and aiSuccess:  
ranked = aiSoftRerank(ranked)  
return ranked

Conventional ranking có thể dùng distance, rating, experience/service fit, workload/availability, Priority Boost và Admin-configured weights. Exact formula là ADMIN CONFIG/implementation detail.

## 8.6 Pre-booking Technician Discovery & Chat

- Customer được xem eligible/nearby Technician profile, rating, distance, Listed Labor Price và Typical Warranty.

- Customer có thể chủ động mở một pre-booking conversation từ danh sách/profile.

- Quyền gửi/reply của Technician trước Booking chưa được khóa; xem TBD-CHAT-01.

| TBD-CHAT-01: câu nghiệp vụ hiện tại “Customer có thể nhắn Technician chưa đặt lịch, còn Technician sẽ không nhắn lại” có thể hiểu (A) Tech không được initiate nhưng được reply sau khi Customer mở chat, hoặc (B) Tech hoàn toàn không được reply trước Booking. Tài liệu không tự chọn A/B. Cần nhóm xác nhận trước khi khóa Chat API/UI. |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

## 8.7 Booking & Scheduling

| **Rule**            | **Requirement**                                                                                      |
|---------------------|------------------------------------------------------------------------------------------------------|
| Primary Service     | Mỗi Booking đúng 1 Primary Service.                                                                  |
| Related work        | Hạng mục liên quan cùng service/job được đưa vào Quotation/Additional Cost của cùng ServiceOrder.    |
| Different service   | Service khác hoàn toàn → Customer tạo Booking mới.                                                   |
| Time                | Customer chọn preferred time window thay vì exact arrival minute.                                    |
| Reschedule          | Cho phép trước khi repair bắt đầu; backend validate current state + Tech schedule/time off/conflict. |
| No ServiceOrder yet | Trong matching, Booking tồn tại nhưng ServiceOrder chưa được tạo.                                    |

RECOMMENDED IMPLEMENTATION: Booking có lifecycle riêng như DRAFT/SUBMITTED/MATCHING/MATCHED/CANCELLED/CLOSED hoặc naming tương đương. Exact enum chưa khóa trong source và có thể normalize khi thiết kế.

## 8.8 Shortlist, Invitation & Assignment

- Customer chỉ shortlist Technician đã qua hard filters; tối đa 5; có thứ tự \#1..#5.

- Invitation gửi tuần tự; trước mỗi invitation backend re-check eligibility.

- Decline trước Accept không phải cancellation strike.

- Expired invitation không được accept stale.

- Accept hợp lệ = Customer không cần confirm Technician lần hai.

- Accept transaction phải chống double assignment/race condition.

BEGIN TRANSACTION  
lock current invitation / booking matching context  
validate invitation is active + Tech still eligible  
mark invitation ACCEPTED  
create ServiceOrder(status=ACCEPTED, bookingId=...)  
create TechnicianAssignment(status=ACTIVE, serviceOrderId=..., technicianId=...)  
close/cancel remaining open invitations  
COMMIT

Nếu cả 5 candidates fail: refresh eligible recommendations → Customer chọn lại → retry normal matching → chỉ escalate Service Manager nếu normal recovery exhausted.

## 8.9 ServiceOrder State Machine

ACCEPTED → EN_ROUTE → UNDER_REPAIR → COMPLETED  
↘ CANCELLED  
EN_ROUTE ↘ CANCELLED  
UNDER_REPAIR ↘ CANCELLED (exception/allowed rule only)

| **State**    | **Meaning**                                                                      |
|--------------|----------------------------------------------------------------------------------|
| ACCEPTED     | ServiceOrder vừa được tạo vì Technician Accept; assignment active.               |
| EN_ROUTE     | Assigned Technician đã bắt đầu di chuyển.                                        |
| UNDER_REPAIR | Customer đã approve official scope/quotation cần thiết và repair đang thực hiện. |
| COMPLETED    | Work + customer confirmation/payment conditions đã thỏa theo flow.               |
| CANCELLED    | Order dừng theo cancellation/no-agreement/unable-to-service/exception rule.      |

| Không dùng giant status cho ARRIVED/INSPECTING/QUOTE_PENDING/AWAITING_PAYMENT. Các milestone này nằm ở domain/status riêng. |
|-----------------------------------------------------------------------------------------------------------------------------|

## 8.10 Maps & Arrival Verification

- Mobile gửi latitude, longitude, accuracy, checkedInAt; backend tính/validate distance tới repair address snapshot.

- Google Maps hỗ trợ geocoding/route/map display; không phải sole proof Technician đã tới.

- Outside geofence/poor accuracy → không auto-verified; retry hoặc Manager/manual evidence review.

- Geofence radius/accuracy threshold là ADMIN CONFIG.

## 8.11 Repair Evidence

| **Type**                 | **Timing**                                      | **Purpose**                                                    |
|--------------------------|-------------------------------------------------|----------------------------------------------------------------|
| BEFORE                   | Sau arrival, trước repair theo official scope   | Tình trạng trước sửa; dispute/additional cost/warranty history |
| Additional Cost Evidence | Khi phát sinh scope/cost mới nếu policy yêu cầu | Justification cho delta                                        |
| AFTER                    | Sau repair trước completion                     | Kết quả sau sửa + completion note                              |

Binary/object lưu Supabase Storage; PostgreSQL chỉ giữ metadata/reference/owner/order/type/timestamps. Access bằng ownership/RBAC/private/signed policy.

## 8.12 Official Quotation

- Với INSPECTION_REQUIRED: chỉ Assigned Technician tạo Official Quotation sau arrival/check-in hợp lệ + real inspection.

- Line items bắt buộc phân loại LABOR hoặc PARTS_EQUIPMENT.

- Customer thấy scope, labor, parts, total, warranty cụ thể và notes.

- APPROVED quotation là binding base scope; không overwrite in-place. Revision/new quote hoặc Additional Cost nếu thay đổi sau approval.

- Nếu Customer và Technician không đạt thỏa thuận, không repair; ServiceOrder đóng/cancel với reason phù hợp.

Preliminary Estimate/Listed Labor Price/AI Estimate không thay thế Official Quotation của INSPECTION_REQUIRED. Với FIXED_PRICE, base price/scope đã được Customer chấp nhận tại Booking nên không quote lại base scope; chỉ phát sinh ngoài scope mới cần Additional Cost.

## 8.13 Additional Cost

Assigned Tech creates request  
→ reason + optional evidence  
→ LABOR/PARTS line items + warranty impact  
→ Customer APPROVE / REJECT

- Only APPROVED items được thực hiện và invoice.

- Approved request immutable; thay đổi mới tạo request/revision mới.

- Nếu REJECT nhưng base scope vẫn khả thi → tiếp tục base scope.

- Nếu REJECT làm job không thể hoàn thành → dừng/close/cancel theo reason; không ép Customer trả phát sinh.

- Decision endpoint phải idempotent.

## 8.14 Parts / Equipment

FixHome không sở hữu kho, không ứng vốn và không tạo supplier purchase order. Technician/Customer tự thu xếp procurement; hệ thống chỉ lưu approved amount/item để transparency, invoice, audit và warranty context. Parts không chịu platform commission.

## 8.15 Completion

- Repair/work step hoàn tất.

- AFTER evidence/completion note tồn tại theo policy.

- Customer confirmation hoặc audited exception resolution xác định completion.

- Payment được ghi nhận hợp lệ theo online/cash flow.

- Không còn required approval blocking completion.

CommissionDue sau cash là Technician obligation riêng và không giữ Customer ServiceOrder mở sau khi Customer-side completion/payment đã được resolved.

## 8.16 Pricing & Commission

INSPECTION_REQUIRED:  
FinalLaborTotal = BaseLabor + ApprovedAdditionalLabor  
FinalPartsTotal = BaseParts + ApprovedAdditionalParts  
  
FIXED_PRICE:  
FixedServiceSubtotal = FixedUnitPriceSnapshot × Quantity  
FinalLaborTotal = FixedServiceSubtotal + ApprovedAdditionalLabor  
FinalPartsTotal = ApprovedAdditionalParts  
  
FinalInvoiceAmount = FinalLaborTotal + FinalPartsTotal  
PlatformCommission = FinalLaborTotal × CommissionRateSnapshot  
Current CommissionRate = 10%

- FIXED_PRICE: FixHome lấy 10% trên giá trị dịch vụ niêm yết thực tế của đơn (FixedUnitPriceSnapshot × Quantity) và ApprovedAdditionalLabor nếu có. PARTS_EQUIPMENT không commission.

- Commission rate phải snapshot để config tương lai không làm đổi lịch sử.

- Mọi total phải trace được về approved quotation/additional items.

## 8.17 Online Payment

Create provider payment request  
→ Customer pays full FinalInvoiceAmount  
→ provider callback/webhook  
→ backend verifies signature/transaction/result  
→ idempotent PaymentTransaction = PAID  
→ commission calculation + settlement/payout record

- Client success screen không phải payment authority.

- Duplicate webhook không được duplicate settlement.

- Current Capstone không cần escrow/payout hold phức tạp.

## 8.18 Cash Payment / Cash Confirmation / CommissionDue

Customer pays cash directly to Technician  
→ Tech enters amount received + confirms  
→ optional receipt/invoice photo evidence  
→ Customer checks and confirms amount  
→ if both valid: CashSettlement CONFIRMED  
→ create CommissionDue = 10% × FinalLaborTotal

- Nếu một bên chưa confirm sau configured time → reminder; Payment/CashSettlement giữ PENDING_CONFIRMATION.

- Nếu tiếp tục không phản hồi hoặc có tranh chấp → Service Manager review Quotation, declared amounts, evidence, timeline.

- Manager quyết CONFIRMED hoặc DISPUTED theo audited resolution.

- Hệ thống không tự auto-confirm cash payment.

- Active unpaid CommissionDue block Technician nhận/Accept tất cả new booking; không block login/history/payment access.

## 8.19 Cancellation, Strike, Suspension & Priority Boost

- Cancellation event không tự động = strike. Policy/evidence phải xác định valid violation.

- 2 valid active strikes → temporary suspension; duration ADMIN CONFIG; hết suspension reset active counter, history giữ.

- Tech Decline invitation trước Accept không phải strike.

- Customer cancel/no-show sau verified arrival → Service Manager review; nếu violation confirmed: Customer +1 strike + Technician Priority Boost; không monetary compensation.

- Priority Boost chỉ là soft ranking signal sau hard filters; current policy kết thúc sau next suitable successful assignment.

- Quote không đạt thỏa thuận hoặc Tech thực sự unable to service không nên mặc định auto-strike; nếu có vi phạm riêng thì policy evaluator xử lý.

## 8.20 Technician Cancellation / Replacement

- Sau Accept nhưng trước arrival: end current assignment; evaluate strike; nếu còn candidate trong Customer priority list thì re-check + invite next.

- Sau arrival/inspection/repair hoặc dispute: Service Manager exception.

- Nếu replacement mid-job: giữ cùng ServiceOrder nếu vẫn là cùng job; end assignment cũ, create assignment mới, giữ full history.

| Chi tiết chia labor/commission/warranty giữa Technician cũ và mới trong replacement mid-job chưa được nhóm khóa. Để MVP: xử lý qua Service Manager manual resolution + audit; không xây settlement engine phức tạp trước. |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

## 8.21 Warranty

| **Khái niệm**     | **Rule**                                                                                                           |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| Typical Warranty  | Reference/comparative trên profile/service; không tự binding.                                                      |
| Proposed Warranty | Tech khai trong Official Quotation/Additional Cost trước Customer approval.                                        |
| WarrantyCoverage  | Khi approve: snapshot term/days/item; binding; không tự giảm; bắt đầu khi order completed/payment conditions thỏa. |
| Warranty Claim    | Customer claim trong coverage → Tech xử lý/rework trước → dispute/reject mới escalate Manager.                     |

Warranty chỉ cover lỗi/scope cũ đã được xác nhận thuộc coverage. Nếu Technician xác định lỗi mới không liên quan lần sửa trước, phải tạo Additional Quotation riêng gồm Labor + Parts. Customer Approve thì mới sửa và chịu khoản đó; Reject thì không sửa phần mới.

## 8.22 Ratings, Reviews & Repair History

- Customer chỉ review job thuộc quyền sở hữu và đã hoàn tất theo policy.

- Rating/review phải liên kết ServiceOrder/Technician để phục vụ trust và ranking signal.

- Repair History hiển thị timeline, service, Technician, approved financial summary, evidence references phù hợp quyền, warranty status và review.

- Không để thay đổi profile/service hiện tại làm mutate historical history snapshot.

## 8.23 Notifications & Realtime

validate business command  
→ persist domain transaction  
→ COMMIT  
→ create/publish notification event  
→ WebSocket + optional external adapter

- Persisted in-app notification là core direction.

- WebSocket là realtime transport.

- FCM/email provider optional adapter.

- External notification failure không rollback committed transaction.

## 8.24 Service Manager & Admin Operations

Service Manager là exception/support operator, không phải dispatcher bình thường. Admin quản config, verification, user/RBAC, service catalog, ranking/warranty/commission policy và audit.

# 9. Exception & Recovery Matrix

| **Case**                                | **Normal System Action**                        | **Manager?**               | **Outcome/Notes**                                                                       |
|-----------------------------------------|-------------------------------------------------|----------------------------|-----------------------------------------------------------------------------------------|
| 5 selected Tech đều fail                | Refresh eligible list; Customer chọn lại        | Sau normal retry exhausted | Không auto-dispatch thủ công ngay từ đầu.                                               |
| Tech decline trước Accept               | Invite next                                     | No                         | Không strike.                                                                           |
| Tech cancel sau Accept, trước arrival   | End assignment; next candidate if possible      | Nếu fallback fail/dispute  | Evaluate strike separately.                                                             |
| Customer cancel sau verified arrival    | Create support case                             | Yes                        | Manager review → possible customer strike + Tech Priority Boost; no money compensation. |
| GPS/geofence abnormal                   | Retry/manual evidence path                      | As needed                  | Không auto-verified.                                                                    |
| Quotation not agreed                    | No repair; close/cancel with reason             | Only dispute               | Không ép hai bên giao dịch.                                                             |
| Tech unable to service after inspection | No repair; close/cancel with reason             | Only abnormal/dispute      | Tech rời đi; no automatic violation assumption.                                         |
| Additional Cost rejected                | Continue base scope if feasible; otherwise stop | Only dispute               | Rejected items not invoiced.                                                            |
| Cash one side no response               | Reminder; keep pending                          | After timeout/non-response | Manager CONFIRMED or DISPUTED; no auto-confirm.                                         |
| Cash amount mismatch                    | Flag mismatch                                   | Yes                        | Use quote/invoice/evidence/timeline.                                                    |
| Warranty new unrelated issue            | Create Additional Quotation                     | Only dispute               | Not covered by old warranty.                                                            |
| Mid-job interruption                    | Preserve history                                | Yes                        | Manual reassignment/financial resolution for MVP.                                       |

# 10. Canonical Status Families

| **Domain**           | **Suggested/Current statuses**                                  |
|----------------------|-----------------------------------------------------------------|
| ServiceOrderStatus   | ACCEPTED, EN_ROUTE, UNDER_REPAIR, COMPLETED, CANCELLED          |
| InvitationStatus     | PENDING, ACCEPTED, DECLINED, EXPIRED, CANCELLED                 |
| AssignmentStatus     | ACTIVE/ACCEPTED, CANCELLED, REPLACED/ENDED                      |
| QuotationStatus      | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, SUPERSEDED         |
| AdditionalCostStatus | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, EXPIRED |
| PaymentStatus        | PENDING, PAID, FAILED, CANCELLED, REFUNDED                      |
| CashSettlementStatus | PENDING_CONFIRMATION, CONFIRMED, DISPUTED                       |
| CommissionDueStatus  | PENDING, PAID, FAILED                                           |
| WarrantyClaimStatus  | OPEN, REVIEWING, REWORK, RESOLVED, REJECTED                     |
| VerificationStatus   | PENDING, VERIFIED, REJECTED                                     |

| BookingStatus chưa được source khóa cụ thể. Khi thiết kế, team có thể normalize thành SUBMITTED/MATCHING/MATCHED/CANCELLED/CLOSED hoặc tương đương, miễn semantics rõ và không trùng ServiceOrder lifecycle. |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# 11. Authorization / RBAC & Ownership Matrix

| **Action**                           | **Customer**   | **Technician**       | **Service Manager** | **Admin**        |
|--------------------------------------|----------------|----------------------|---------------------|------------------|
| Create own Booking                   | Yes            | No                   | Support only        | No               |
| Browse eligible Tech profiles/prices | Yes            | Own/public           | Support             | Config/audit     |
| Start pre-booking chat               | Yes            | TBD-CHAT-01          | No                  | No               |
| Shortlist/order Tech                 | Booking owner  | No                   | No normal           | Policy only      |
| Respond invitation                   | No             | Current invited Tech | Support only        | No               |
| Accept → create order/assignment     | No             | Current invited Tech | No normal           | No               |
| View active order detail             | Owner          | Assigned Tech        | Exception scope     | Audit scope      |
| Create Official Quote                | No             | Assigned Tech        | No                  | No               |
| Approve Quote                        | Owner          | No                   | No normal           | No               |
| Create Additional Cost               | No             | Assigned Tech        | No normal           | No               |
| Approve Additional Cost              | Owner          | No                   | No normal           | No               |
| Upload repair evidence               | View own       | Assigned Tech        | Review              | Audit if allowed |
| Cash confirmation                    | Confirm paid   | Confirm received     | Resolve             | Audit            |
| Pay CommissionDue                    | No             | Due owner            | Support             | Audit            |
| Create Warranty Claim                | Coverage owner | No                   | Support             | Audit            |
| Warranty first handling              | No             | Responsible Tech     | Escalation          | No               |
| Review dispute/strike                | Submit/support | Submit/support       | Yes                 | Policy/audit     |
| Verify KYC                           | No             | Submit docs          | No                  | Yes              |
| Configure policy                     | No             | No                   | No                  | Yes              |

# 12. Database / ERD Direction — RECOMMENDED IMPLEMENTATION

Mục tiêu ERD: normalized, historical snapshot rõ, không duplicate authority field, state transitions validate backend, financial workflows có transaction/audit.

| **Entity**                             | **Responsibility**                                                                           |
|----------------------------------------|----------------------------------------------------------------------------------------------|
| Account/User                           | Identity, role, account status                                                               |
| CustomerProfile                        | Customer-specific profile                                                                    |
| TechnicianProfile                      | Public/professional profile, verification/work status                                        |
| TechnicianVerification                 | KYC submissions + Admin decision                                                             |
| ServiceCategory / Service              | Catalog taxonomy/reference pricing                                                           |
| TechnicianService                      | Tech↔Service, listedLaborPrice, active, typical warranty reference                           |
| TechnicianSkill                        | Normalized skill mapping if separate from Service                                            |
| WorkingSchedule / TimeOff              | Availability source                                                                          |
| ServiceArea                            | Tech geographic coverage                                                                     |
| RepairAddress                          | Customer addresses; Booking/Order should snapshot needed location fields                     |
| AIDiagnosis                            | Input refs, result, confidence, model metadata                                               |
| Booking                                | customerId, primaryServiceId, description, timeWindow, address snapshot/ref, matching status |
| BookingMedia                           | Problem images/media                                                                         |
| BookingShortlist / CandidatePreference | selected Tech + priority order                                                               |
| BookingInvitation                      | sequential invite lifecycle                                                                  |
| ServiceOrder                           | 0..1 per Booking; created only on Accept; execution status                                   |
| TechnicianAssignment                   | Assignment history; one ACTIVE per ServiceOrder                                              |
| ArrivalCheckIn                         | GPS/geofence audit                                                                           |
| RepairEvidence                         | BEFORE/AFTER/ADDITIONAL evidence metadata                                                    |
| Quotation / QuotationItem              | Versioned quote + LABOR/PARTS items + approval snapshot                                      |
| AdditionalCostRequest / Item           | Versioned approved delta                                                                     |
| CustomerServiceConfirmation            | Completion decision/timestamp                                                                |
| Invoice / InvoiceItem                  | Final immutable financial snapshot                                                           |
| PaymentTransaction                     | Provider transactions/webhook idempotency                                                    |
| CashSettlement                         | Tech declared amount + Customer confirmation + Manager resolution                            |
| CommissionDue                          | Cash commission obligation                                                                   |
| Cancellation / StrikeRecord            | Events + policy decision + actor/reason/evidence                                             |
| TechnicianPriorityBoost                | Source cancellation + active/consumed state                                                  |
| WarrantyCoverage                       | Approved warranty snapshot per job/item                                                      |
| WarrantyClaim                          | Claim/rework/dispute                                                                         |
| RatingReview                           | Post-service feedback                                                                        |
| Notification                           | Persisted in-app notification                                                                |
| Conversation / Message                 | Chat; authorization depends on TBD-CHAT-01 and booking/invitation/assignment context         |
| SupportCase / AuditLog                 | Manager/Admin manual actions + before/after/reason/evidence                                  |

## 12.1 Key cardinalities

Customer 1 ── \* Booking  
Booking \* ── 1 Service (primary)  
Booking 1 ── \* BookingInvitation  
Booking 1 ── \* ShortlistPreference (max 5 by business validation)  
Booking 1 ── 0..1 ServiceOrder  
ServiceOrder 1 ── \* TechnicianAssignment (history; max 1 ACTIVE)  
ServiceOrder 1 ── \* Quotation (versions)  
Quotation 1 ── \* QuotationItem  
ServiceOrder 1 ── \* AdditionalCostRequest  
ServiceOrder 1 ── 0..1 Invoice  
Invoice 1 ── \* InvoiceItem  
ServiceOrder 1 ── \* RepairEvidence  
ServiceOrder 1 ── \* WarrantyCoverage  
Technician \* ── \* Service via TechnicianService

## 12.2 DB constraints/indexes cần ưu tiên

- Unique(technicianId, serviceId) trên TechnicianService.

- Priority uniqueness within a Booking shortlist; application validation max 5.

- Partial/conditional unique logic hoặc transactional guard để chỉ 1 active assignment per ServiceOrder.

- ProviderTransactionId/equivalent unique cho idempotent payment webhook.

- Indexes cho Booking customer/status/time; Invitation technician/status/expiry; ServiceOrder status; CommissionDue technician/status; TechnicianService service/active; geospatial strategy tùy implementation.

- Approved financial records immutable qua service layer + audit; không dùng cascade delete thiếu kiểm soát cho financial/history.

# 13. API Direction — RESTful, Actor-aware

| **Endpoint direction**                             | **Actor**            | **Purpose**                                                   |
|----------------------------------------------------|----------------------|---------------------------------------------------------------|
| POST /auth/register, /login, /refresh              | Public/All           | Auth/JWT                                                      |
| GET /services                                      | All/Customer         | Browse catalog                                                |
| PUT /technicians/me/services/:serviceId            | Technician           | Set listed labor price/service offering                       |
| POST /ai/diagnoses                                 | Customer             | Image/text advisory diagnosis                                 |
| GET /technicians/recommendations                   | Customer             | Eligible/ranked technicians for context                       |
| POST /bookings                                     | Customer             | Create Booking with 1 primary service + preferred time window |
| PATCH /bookings/:id/schedule                       | Owner                | Reschedule if state/availability allow                        |
| PUT /bookings/:id/shortlist                        | Owner                | Set max-5 ordered priorities                                  |
| GET /invitations/me                                | Technician           | Current invitations                                           |
| POST /invitations/:id/decline                      | Current invited Tech | Decline invitation                                            |
| POST /invitations/:id/accept                       | Current invited Tech | Transactional Accept → ServiceOrder + Assignment              |
| POST /service-orders/:id/en-route                  | Assigned Tech        | ACCEPTED→EN_ROUTE                                             |
| POST /service-orders/:id/arrival-check-ins         | Assigned Tech        | GPS/geofence check-in                                         |
| POST /service-orders/:id/evidence                  | Assigned Tech        | BEFORE/AFTER evidence metadata                                |
| POST /service-orders/:id/quotations                | Assigned Tech        | Create draft quote                                            |
| POST /quotations/:id/submit                        | Assigned Tech        | Pending approval                                              |
| POST /quotations/:id/decision                      | Owner Customer       | Approve/Reject idempotently                                   |
| POST /service-orders/:id/additional-costs          | Assigned Tech        | Request additional scope/cost                                 |
| POST /additional-costs/:id/decision                | Owner Customer       | Approve/Reject idempotently                                   |
| POST /service-orders/:id/completion-confirmation   | Owner Customer       | Confirm work                                                  |
| POST /payments/online                              | Owner Customer       | Create provider payment request                               |
| POST /payments/webhooks/:provider                  | Provider/Internal    | Verify/idempotent update                                      |
| POST /cash-settlements/:orderId/technician-confirm | Assigned Tech        | Declare cash received                                         |
| POST /cash-settlements/:orderId/customer-confirm   | Owner Customer       | Confirm paid amount                                           |
| POST /commission-dues/:id/pay                      | Due owner Tech       | Pay platform commission                                       |
| POST /warranty-claims                              | Coverage owner       | Open claim                                                    |
| POST /reviews                                      | Owner Customer       | Review completed job                                          |
| GET /support/cases                                 | Service Manager      | Exception queue                                               |
| POST /support/cases/:id/resolve                    | Service Manager      | Audited resolution                                            |
| POST /admin/technicians/:id/verification-decision  | Admin                | KYC decision                                                  |
| PATCH /admin/config/:key                           | Admin                | Policy config + audit                                         |

| Endpoint names là direction, không phải contract cuối. API Specification phải định nghĩa DTO, validation, error codes, idempotency, transactions và ownership chi tiết. |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# 14. Architecture & Technology Direction

| **Layer/Component** | **Technology**                                   | **Responsibility**                                                            |
|---------------------|--------------------------------------------------|-------------------------------------------------------------------------------|
| Backend API         | NestJS + TypeScript                              | Business authority, modules, RBAC, state machines, transactions, integrations |
| Database            | Supabase PostgreSQL                              | Structured business data, constraints, ledger/history                         |
| Object Storage      | Supabase Storage                                 | Booking media, repair evidence, KYC, receipts                                 |
| Web                 | Vue.js + TailwindCSS                             | Customer/Admin/Manager web surfaces as scoped                                 |
| Mobile              | React Native                                     | Customer/Technician mobile workflows, media/GPS/realtime                      |
| AI Service          | FastAPI + Gemini/OpenAI or selected PoC provider | Advisory diagnosis + optional soft ranking; isolated from core authority      |
| Maps                | Google Maps API                                  | Geocoding, route, maps, supporting location data                              |
| Realtime            | WebSocket                                        | Notifications/chat/order timeline transport                                   |
| Payment             | Provider/Bank integration                        | Online invoice payment, CommissionDue, settlement/payout as provider supports |

## 14.1 High-level architecture

\[Vue Web\] ─┐  
\[React Native\] ─┼─\> \[NestJS Backend/API\] ──\> \[Supabase PostgreSQL\]  
│ │ \[Supabase Storage\]  
│ ├─\> \[WebSocket\]  
│ ├─\> \[Google Maps\]  
│ ├─\> \[Payment Provider/Bank\]  
│ └─\> \[FastAPI AI Service\] ─\> \[LLM/VLM Provider\]  
└────────────────────────────────────────────────────

AI Service tách riêng để AI timeout/error không phá core business transaction. Backend không giao quyền state mutation trực tiếp cho AI.

# 15. Backend Business Enforcement & Transaction Rules

| **Area**             | **Must enforce**                                                                                                   |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| State Machine        | Transition whitelist + actor/ownership + preconditions; reject illegal transitions server-side.                    |
| Invitation Accept    | Transaction/lock/recheck eligibility; create order+assignment atomically; prevent double assignment.               |
| Quotation approval   | Idempotent decision; immutable approved version; ownership check.                                                  |
| Additional Cost      | Idempotent decision; only approved items invoice.                                                                  |
| Payment webhook      | Signature/transaction verify; unique provider transaction; duplicate-safe.                                         |
| Cash settlement      | Dual confirmation; no auto-confirm; Manager audited fallback.                                                      |
| CommissionDue gate   | Eligibility query must exclude Tech with active unpaid due.                                                        |
| Historical snapshots | Quote/additional/invoice/commission/warranty/address/assignment/manual resolution must not mutate retrospectively. |
| Notifications        | Publish after commit; delivery failure does not rollback domain transaction.                                       |

# 16. Security, Privacy, Audit & NFR

- JWT + RBAC + object ownership checks.

- Sensitive KYC/private media must not be public URLs by default.

- Validate MIME/size/count for uploads; sanitize filenames/metadata; signed/private access.

- Rate limit auth, AI diagnosis and message endpoints as appropriate.

- Audit Admin/Manager sensitive actions with actor, timestamp, reason, evidence/ref, before/after state.

- Payment authority server-side; never trust client “success”.

- AI privacy: data minimization; external provider usage/consent/logging must match actual implementation.

- Availability/reschedule/assignment operations need concurrency protection.

- Soft delete/reference retention preferred for business history; avoid destructive cascades on financial/audit data.

## 16.1 Audit questions system must answer

- Ai tạo Booking, khi nào, Primary Service gì?

- Candidate nào pass hard filter và shortlist order thế nào?

- Ai được mời/response lúc nào?

- Tech nào Accept và assignment nào active/history?

- Arrival verified bằng gì?

- BEFORE/AFTER evidence nào?

- Quote/additional nào được approve?

- Labor/Parts từng khoản và final invoice?

- Commission rate snapshot?

- Online/cash payment confirmed bằng gì?

- CommissionDue paid chưa?

- Vì sao strike/boost?

- Warranty binding nào?

- Manager/Admin đã manual action gì?

# 17. Screen / UX Flow Direction

| **Actor**       | **Core screens/flows**                                                                                                                                                                                                                                              |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Customer        | Home/Service Search → AI Diagnosis → Technician List/Profile + Listed Price → optional pre-booking contact → Create Booking → shortlist/order → matching status → active order timeline → quote approval → additional approval → payment → review/history/warranty. |
| Technician      | Onboarding/KYC → Profile/Services/Listed Price → Schedule/Area → Invitation Inbox → Booking context allowed → Accept/Decline → En Route/Check-in → Evidence → Quote → Repair/Additional Cost → Completion/Cash confirmation → CommissionDue → Warranty cases.       |
| Service Manager | Exception Queue → Case Detail/Timeline/Evidence → payment/cancellation/warranty/reassignment resolution → audit outcome.                                                                                                                                            |
| Admin           | Dashboard → Users/RBAC → KYC Verification → Service Catalog → Configs → payment/commission audit → system audit/reporting.                                                                                                                                          |

| UI timeline chi tiết không cần map 1:1 ServiceOrderStatus. Có thể hiển thị Arrival Verified, Inspection, Quote Pending, Work Completed, Payment Confirmed dựa trên sub-domain records. |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# 18. Implementation Roadmap (Capstone-friendly)

| **Phase**               | **Deliverables**                                                                                                                    | **Why**                                       |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| P0 – Foundation         | Auth/JWT/RBAC; User; Service Catalog; Technician profile/KYC; common validation/config/API conventions                              | Nền cho mọi module.                           |
| P1 – Booking/Matching   | TechnicianService pricing; schedule/time off/service area; Booking; eligibility; ranking; shortlist; invitation; Accept transaction | Chứng minh marketplace flow.                  |
| P2 – Order Execution    | ServiceOrder state machine; maps/check-in; evidence; quotation; additional cost; completion                                         | Core repair workflow.                         |
| P3 – Finance            | Invoice; online payment integration; cash dual confirmation; CommissionDue; gates                                                   | Khóa revenue/settlement semantics.            |
| P4 – Quality/Exceptions | Cancellation/strike/boost; Service Manager support; warranty; review/history                                                        | Xử lý thực tế và audit.                       |
| P5 – AI/Realtime polish | AI diagnosis; optional soft ranking; WebSocket notifications/chat; dashboard                                                        | Tăng điểm demo nhưng không phá core fallback. |

## 18.1 Suggested team boundaries

| **Member/Stream**      | **Ownership**                                                                                                                                                                                                 |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Core/Leader            | Auth, JWT, RBAC, users, KYC verification plumbing, Service Catalog, shared config/validation, integration/code review                                                                                         |
| Booking/Order          | Booking, ServiceOrder, state machine, quotation, additional cost, cancellation, evidence, completion                                                                                                          |
| Technician/Matching    | Profile, TechnicianService price, skills, availability, schedule, area, recommendation, shortlist/invitation/assignment, maps/location domain                                                                 |
| AI/Realtime/Engagement | AI diagnosis, optional soft ranking adapter, chatbot if retained, notifications/WebSocket/chat, rating/review/history                                                                                         |
| UX/UI                  | Design system, customer/technician/admin-manager screens; consumes agreed API contracts, not duplicate business authority                                                                                     |
| Happy path fixed-price | Customer books fixed service × quantity → price snapshot → Tech Accept/arrival → base scope without quote → optional approved Additional Cost → invoice → commission 10% fixed service/labor, Parts excluded. |

# 19. Testing Strategy & Acceptance Focus

## 19.1 Unit tests

- Eligibility filter rules

- Ranking fallback when AI fails

- State transition guard

- Commission formulas

- Strike/suspension evaluator

- Warranty coverage check

- DTO/business validations

## 19.2 Integration tests

- Invitation Accept concurrency/double-click

- Quote approval idempotency

- Additional Cost approval

- Payment webhook duplicate

- Cash dual confirmation/non-response escalation

- CommissionDue eligibility gate

- Storage metadata ownership

## 19.3 End-to-End scenarios

| **Scenario**                           | **Expected**                                                                                                                                                             |
|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Happy path online                      | Booking→matching→Accept→quote→repair→online payment→Completed→review/warranty                                                                                            |
| Happy path cash                        | Cash dual confirm→CommissionDue created→order Completed→Tech blocked new jobs until due paid                                                                             |
| AI unavailable                         | Booking continues with manual service/conventional ranking                                                                                                               |
| 5 invitations fail                     | Refresh/reselect before Manager escalation                                                                                                                               |
| Quote rejected                         | No repair; close/cancel; no forced transaction                                                                                                                           |
| Additional rejected but base feasible  | Continue approved base scope only                                                                                                                                        |
| Cash one side silent                   | Pending + reminder + Manager resolution; no auto-confirm                                                                                                                 |
| Customer cancel after verified arrival | Manager review; possible strike + priority boost; no compensation                                                                                                        |
| Warranty new issue                     | Old coverage not applied; new Additional Quotation required                                                                                                              |
| BRX-047                                | Service supports pricingMode = FIXED_PRICE or INSPECTION_REQUIRED.                                                                                                       |
| BRX-048                                | FIXED_PRICE is Admin-managed per unit and scope; Booking snapshots fixed unit price, quantity and scope so later config changes do not mutate history.                   |
| BRX-049                                | FIXED_PRICE base scope does not require a new Official Quotation after arrival; work outside fixed scope requires Customer-approved Additional Cost.                     |
| BRX-050                                | For FIXED_PRICE, FixedServiceSubtotal = FixedUnitPriceSnapshot × Quantity and is commissionable at the snapshotted 10% rate; PARTS_EQUIPMENT remains non-commissionable. |

# 20. Current Business Rule Register (Execution Version)

| **ID**  | **Rule**                                                                                                                                 |
|---------|------------------------------------------------------------------------------------------------------------------------------------------|
| BRX-001 | No Deposit/Booking Hold is required to create Booking/matching.                                                                          |
| BRX-002 | AI diagnosis/reference price is advisory and cannot mutate business state.                                                               |
| BRX-003 | 1 Booking = 1 Primary Service.                                                                                                           |
| BRX-004 | Related items stay in same ServiceOrder via Quotation/Additional Cost; completely different Service requires new Booking.                |
| BRX-005 | Customer selects preferred time window; normal reschedule only before repair starts and must pass backend availability/state validation. |
| BRX-006 | Technician must pass all hard filters before ranking.                                                                                    |
| BRX-007 | Conventional ranking exists independently; AI soft re-ranking is optional and failure must fallback.                                     |
| BRX-008 | Customer shortlist max 5 eligible Technicians and orders priority.                                                                       |
| BRX-009 | Invitations are sequential and eligibility is re-checked before each invite.                                                             |
| BRX-010 | Decline before Accept is not Technician cancellation strike.                                                                             |
| BRX-011 | Valid Accept creates the ServiceOrder and active TechnicianAssignment atomically.                                                        |
| BRX-012 | ServiceOrder initial state is ACCEPTED; no PENDING_CONFIRMATION state in execution lifecycle.                                            |
| BRX-013 | Only one active TechnicianAssignment per ServiceOrder.                                                                                   |
| BRX-014 | Hết 5 candidates phải refresh/retry before Manager exception.                                                                            |
| BRX-015 | Technician sets Listed Labor Price per Service; it is reference, not Official Quotation.                                                 |
| BRX-016 | Official Quotation only after assignment + arrival/inspection.                                                                           |
| BRX-017 | Quote/Additional Cost/Invoice distinguish LABOR and PARTS_EQUIPMENT.                                                                     |
| BRX-018 | Customer must approve Official Quotation before UNDER_REPAIR/base scope binding.                                                         |
| BRX-019 | If quote is not agreed, no repair; job may close/cancel with reason.                                                                     |
| BRX-020 | Approved financial data is immutable/versioned; never overwrite history.                                                                 |
| BRX-021 | Additional Cost requires reason + LABOR/PARTS lines + Customer decision.                                                                 |
| BRX-022 | Only approved Additional Cost items are performed/invoiced.                                                                              |
| BRX-023 | If Additional Cost rejected and base scope feasible, continue base; otherwise stop.                                                      |
| BRX-024 | FixHome owns no parts inventory and does not finance parts.                                                                              |
| BRX-025 | Parts are not commissionable.                                                                                                            |
| BRX-026 | Commission = 10% × FinalLaborTotal; rate is snapshotted.                                                                                 |
| BRX-027 | Online Customer pays full invoice; success must be server-verified/idempotent.                                                           |
| BRX-028 | Cash is paid directly to Technician and requires Technician declaration + Customer confirmation.                                         |
| BRX-029 | Cash payment is never auto-confirmed; timeout/non-response/dispute escalates to Manager.                                                 |
| BRX-030 | Cash CommissionDue = commission on FinalLaborTotal.                                                                                      |
| BRX-031 | Active unpaid CommissionDue blocks all new work acceptance, not login/payment access.                                                    |
| BRX-032 | Cancellation event is not automatically a strike.                                                                                        |
| BRX-033 | 2 valid active strikes cause temporary suspension; reset active count after suspension while retaining history.                          |
| BRX-034 | Verified-arrival Customer cancellation requires Manager review before strike/Priority Boost; no monetary compensation.                   |
| BRX-035 | Priority Boost is soft ranking only and cannot bypass hard filters.                                                                      |
| BRX-036 | Arrival verification uses mobile location + backend geofence; Maps is not sole proof.                                                    |
| BRX-037 | BEFORE/AFTER evidence stored via Supabase Storage according to policy.                                                                   |
| BRX-038 | Typical Warranty is reference; binding warranty is approved/snapshotted job/item coverage.                                               |
| BRX-039 | Warranty only covers previous confirmed scope/error under coverage.                                                                      |
| BRX-040 | New unrelated issue during warranty requires separate Additional Quotation and Customer approval.                                        |
| BRX-041 | Technician verification current scope is CCCD + face photo + Admin manual approval.                                                      |
| BRX-042 | Only VERIFIED Technician can match.                                                                                                      |
| BRX-043 | External notification failure does not rollback committed business transaction.                                                          |
| BRX-044 | Historical financial/warranty/assignment/config-dependent values must be snapshotted/auditable.                                          |
| BRX-045 | Service Manager handles exceptions/disputes, not normal customer approval or dispatch.                                                   |
| BRX-046 | Customer may initiate pre-booking contact with Technician; all Technician pre-booking send/reply permissions remain TBD-CHAT-01.         |

# 21. Admin-configurable, TBD & Optional Boundaries

## 21.1 ADMIN CONFIG

- Invitation timeout

- Suspension duration

- Geofence radius/GPS accuracy

- Evidence min count/type

- Conventional ranking weights

- AI soft ranking timeout/weight

- Priority Boost weight/expiry

- Warranty allowed options/range

- Commission rate for future effective periods

- Cash confirmation reminder/timeout window

- Notification retry/details

## 21.2 TBD requiring future confirmation

| **ID**          | **Question**                                                                                               | **Current safe treatment**                                                            |
|-----------------|------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| TBD-CHAT-01     | Pre-booking: Tech may reply only after Customer starts conversation, or cannot reply at all until Booking? | Do not finalize Chat API permission until team confirms.                              |
| TBD-FIN-01      | Customer cancels after approved part was actually purchased: reimbursement/ownership rule?                 | Manager exception/manual evidence resolution for MVP; do not invent automatic charge. |
| TBD-REPL-01     | Mid-job replacement: split labor, commission and warranty between Tech A/B?                                | Manager manual resolution + audit for MVP.                                            |
| TBD-BOOK-STATUS | Exact BookingStatus enum naming/lifecycle.                                                                 | Design later; must remain separate from ServiceOrder lifecycle.                       |
| TBD-PROVIDER    | Exact payment/payout provider mechanics.                                                                   | Keep provider adapter; preserve server verification/idempotency semantics.            |
| TBD-AI          | Exact AI model/provider/training strategy.                                                                 | PoC decision; business semantics provider-independent.                                |

## 21.3 OPTIONAL

- Voucher/promotion

- Advanced AI chatbot

- External delivery channels beyond core in-app/WebSocket

- Advanced KYC OCR/FaceMatch/Liveness

- Complex analytics/dashboard metrics beyond capstone needs

# 22. Worked Example — Máy lạnh

1\) Customer: “Máy lạnh chạy nhưng không lạnh” + ảnh.  
2) AI: possible causes + reference price (advisory).  
3) Customer views nearby eligible Techs, e.g. A has Listed Labor Price 300k, rating, warranty reference.  
4) Customer creates Booking: Primary Service = Air Conditioner Repair, preferred 14:00–16:00.  
5) Backend hard-filter → rank → Customer shortlist A,B,C,D,E.  
6) A invited → Accept. In same transaction create ServiceOrder=ACCEPTED + Assignment A.  
7) A EN_ROUTE → GPS check-in → BEFORE evidence → inspect.  
8) Official Quote: Labor cleaning/check 300k; Parts 0; Warranty 30 days.  
9) Customer Approve → UNDER_REPAIR.  
10) Discover part 700k + additional labor 100k → Additional Cost.  
11) Customer Approve.  
12) FinalLaborTotal=400k; FinalPartsTotal=700k; Invoice=1.1m; Commission=40k.  
13a) Online: Customer pays 1.1m provider; backend verifies; settlement.  
13b) Cash: Customer pays Tech 1.1m; Tech declares; Customer confirms; CommissionDue=40k.  
14) AFTER evidence + confirmation/payment conditions → COMPLETED.  
15) Warranty: if same covered issue returns within 30 days → warranty flow. New unrelated board failure → separate Additional Quotation.

# 23. Cross-document Consistency Checklist

- [ ] No Deposit/Booking Hold in current flow.

- [ ] AI advisory only; fallback exists.

- [ ] Hard filters before ranking; conventional ranking independent of AI.

- [ ] Customer shortlist max 5; sequential invitations.

- [ ] ServiceOrder created only on Technician Accept; no PENDING_CONFIRMATION in ServiceOrder.

- [ ] 1 Booking = 1 Primary Service.

- [ ] Preferred time window + validated reschedule before repair.

- [ ] Listed Labor Price per TechnicianService is visible/reference, not binding quote.

- [ ] Official Quote only after arrival/inspection.

- [ ] LABOR/PARTS always separated.

- [ ] Parts not commissionable; commission current 10% Labor only.

- [ ] Online pays full invoice and is server-verified.

- [ ] Cash dual confirmation; no auto-confirm; CommissionDue blocks new work until paid.

- [ ] Quote disagreement/Tech unable → no forced repair.

- [ ] Additional Cost reject → continue base only if feasible.

- [ ] Cancellation not automatically strike; 2 valid strikes suspension.

- [ ] Verified-arrival cancellation → Manager review + Priority Boost, no compensation.

- [ ] Typical Warranty != binding WarrantyCoverage; new unrelated issue needs new quotation.

- [ ] KYC = CCCD + face photo + Admin manual review.

- [ ] Supabase PostgreSQL + Storage current direction.

- [ ] Service Manager is exception/support role.

- [ ] Historical approved data never overwritten.

- [ ] Chat pre-booking reply semantics remains explicitly TBD until confirmed.

- [ ] Service Catalog distinguishes FIXED_PRICE vs INSPECTION_REQUIRED.

- [ ] FIXED_PRICE has Admin-managed unit/fixedPrice/scope and Booking price snapshot.

- [ ] FIXED_PRICE base scope does not require Official Quotation; out-of-scope work uses Additional Cost.

- [ ] Commission remains 10% of commissionable labor/service value; Parts are excluded.

# 24. Definition of Done for “Business Stable Enough to Build”

- Business rule changes stop being patched directly in code/diagram; they go through baseline/spec update.

- Use Case actors/ownership match Section 3 and RBAC matrix.

- ERD cardinalities and ServiceOrder creation timing match Sections 8/12.

- API validates state machine, approvals and transactions server-side.

- UI labels clearly distinguish Listed Labor Price / AI Estimate / Preliminary Estimate / Official Quotation.

- Test cases cover happy path + exceptions in Section 19.

- Open TBDs are either explicitly deferred for MVP or resolved and versioned.

| Khuyến nghị PM/PO: từ mốc này không mở thêm business lớn nếu không thật sự cần cho Capstone. Ưu tiên khóa TBD quan trọng, sync Use Case/ERD/API/UI và bắt đầu implementation theo phase. |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# 25. Current Project Conclusion

FixHome hiện có core business tương đối ổn định và có thể triển khai theo kiến trúc modular/layered. Service Catalog hỗ trợ cả FIXED_PRICE cho các hạng mục chuẩn và INSPECTION_REQUIRED cho sửa chữa cần kiểm tra. Customer tạo Booking cho một Primary Service; backend hard-filter/rank Technician; Customer shortlist tối đa 5; invitations tuần tự; Technician Accept mới tạo ServiceOrder; fixed base scope dùng giá snapshot, còn repair cần inspection dùng Official Quotation tách Labor/Parts; Customer kiểm soát approvals; FixHome lấy commission 10% trên labor/service value và không lấy trên Parts; online/cash payment có authority/audit; evidence/GPS/warranty/Manager exception bảo vệ chất lượng mà không over-engineer.

Các member có thể dùng tài liệu này làm guide chung để chia module, thiết kế ERD/API/UI, viết test và demo. Những điểm được đánh dấu TBD phải được giữ nguyên là TBD cho tới khi nhóm ra quyết định mới.
