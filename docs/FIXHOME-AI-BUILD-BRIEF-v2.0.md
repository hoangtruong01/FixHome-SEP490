# FIXHOME — AI BUILD BRIEF (MASTER)

> **Tài liệu này là gì:** bản đặc tả kỹ thuật + thiết kế duy nhất để giao cho AI agent (Antigravity / Claude Code / Copilot) build toàn bộ `backend` + `web` của FixHome.
> Không phải tài liệu để đọc chơi — mỗi phần được viết ở dạng **chỉ thị thực thi**.

| | |
|---|---|
| Version | `2.0` — 2026-09-13 |
| Nguồn gốc | Business Baseline v2.0 (2026-09-12) + **PROJECT_OVERVIEW.md** + RBAC doc v1 + audit 5 repo `FixHome-SEP490` |
| Scope | `backend` (NestJS) + `web` (Vue 3) — đủ 4 role + landing. `mobile` (React Native) và `ai-service` (FastAPI) chỉ định nghĩa contract, không build trong brief này |
| AI | Chạy demo bằng API key Gemini/OpenAI. Model tự train cắm sau qua adapter, **không sửa domain** |
| Trạng thái | `DRAFT FOR BUILD` — build được ngay; 9 điểm OPEN ITEM đã được hạ xuống thành **config có default**, không chặn tiến độ |

## Changelog v1.0 → v2.0

Hợp nhất `PROJECT_OVERVIEW.md`. Những thay đổi có ảnh hưởng tới code:

| # | Thay đổi | Ảnh hưởng |
|---|---|---|
| 1 | **Quy ước tên permission đổi** sang `resource:action_scope` (`booking:read_own`) theo §7 Overview, thay cho `resource:action:scope` của v1.0 | Viết lại toàn bộ P5.2, seed permission, decorator |
| 2 | **RBAC chuyển sang DB-backed**: thêm 3 bảng `roles`, `permissions`, `role_permissions` (Overview §24) thay vì chỉ hard-code enum | P3.2, P5.1 |
| 3 | Thêm bảng **`order_status_history`** — Overview §26 và §31 bắt buộc ghi history trong cùng transaction với transition | P3.2, P4.7, P11 |
| 4 | Thêm module **AI Chatbot** (Overview §23) — trước đây thiếu hoàn toàn. Phân biệt rõ với chat người-người | P3.2, P4.6, P4.10, P6 |
| 5 | **Repair History là read model dẫn xuất**, không tạo bảng mới (Overview §20 cấm duplicate Order) | P3.2, P4.7 |
| 6 | Chốt **quy ước đặt tên endpoint** khi Baseline v2.0 và Overview §25 gọi khác nhau (`/orders` vs `/service-orders`, `/approve`+`/reject` vs `/decision`) | P4.1 có bảng ánh xạ |
| 7 | Bổ sung **4 OPEN ITEM** từ Overview §35 (scope của Service Manager theo khu vực, settlement tiền mặt, payment gateway, chiến lược AI model/prompt) | P2.2 |
| 8 | Bổ sung **luật làm việc của AI agent** từ Overview §29/§37: đọc codebase trước, đề xuất thay đổi nhỏ nhất, không rewrite, báo cáo theo 9 mục | P0.3, Phụ lục C |
| 9 | Thay **Source of Truth priority** bằng thang 7 bậc của Overview §38 | P1.2 |
| 10 | Chốt storage (**Cloudinary/Firebase**), maps (**Google Maps**), AI service (**FastAPI**), mobile (**React Native**), realtime (**WebSocket**) | P1.1, P9, P12 |
| 11 | Bổ sung test case từ Overview §32 (duplicate rating, approve 2 lần, rating khi chưa Completed) | P11.2 |
| 12 | Definition of Done gộp 16 mục của Overview §36 với 8 mục của v1.0 | Phụ lục B |

Không có quyết định nghiệp vụ nào của Baseline v2.0 bị đảo. Overview không mâu thuẫn Baseline ở tầng nghiệp vụ — chỉ khác ở tầng quy ước kỹ thuật, và mọi khác biệt đó đã được chốt tường minh ở P4.1 và P5.2.

---

# P0 — CÁCH DÙNG FORM NÀY

## 0.1 Ba chế độ chạy

| Mode | Khi nào | Prompt mở đầu |
|---|---|---|
| **BOOTSTRAP** | Dựng khung repo lần đầu | "Đọc P0–P3, P12 của BUILD-BRIEF. Thực thi Phase 0." |
| **FEATURE** | Build 1 module/1 màn hình | "Đọc P3, P4, P5 (+P7, P8 nếu là web). Thực thi ticket `<ID>`." |
| **FIX/AUDIT** | Sửa lệch, review | "Đọc P5, P11. Audit `<module>` theo checklist, báo cáo sai lệch trước khi sửa." |

## 0.2 Thứ tự phase (không được nhảy cóc)

```
Phase 0  Bootstrap: config module, error envelope, seed, CI xanh
Phase 1  Auth + Users + RBAC guard + audit log          ← nền móng, sai là hỏng hết
Phase 2  Service catalog + Categories + Service area
Phase 3  Booking + AI diagnosis adapter (stub trước, API key sau)
Phase 4  Matching: candidate/invitation + shortlist ≤5 + chat + atomic assign
Phase 5  Order state machine + En Route + Arrival check-in (geofence)
Phase 6  Evidence gating + Quotation + Additional Cost + Warranty
Phase 7  Invoice + Payment stub + Cancellation/strike/suspension
Phase 8  Dashboard + Review + Repair history + Admin config UI
```

Web đi **song song lệch 1 phase** so với backend (web Phase N bắt đầu khi backend Phase N đã merge contract).

## 0.3 Luật bắt buộc cho AI agent

1. **Đọc trước khi sửa:** `AGENTS.md` + `docs/AI-TECHNICAL-GUIDE.md` của chính repo đó. Brief này **không ghi đè** governance sẵn có; khi mâu thuẫn → dừng, hỏi người.
2. **Không tự chế business rule.** Gặp case chưa có trong brief → tạo ticket `OPEN-QUESTION`, không đoán.
3. **Không hard-code** bất kỳ ngưỡng/số tiền/thời gian nào. Tất cả qua bảng `system_config` (P2.3).
4. **Không tạo field tiền gộp.** Mọi nơi có tiền đều phải tách `labor` / `parts`.
5. **Không tin client.** Không nhận `role`, `status`, `price`, `userId` từ body request.
6. **Mỗi PR phải xanh 5 gate:** `lint` → `typecheck` → `test` → `build` → `test:e2e`.
7. **Mỗi PR đụng business rule phải kèm:** test case mới + cập nhật P13 docs.
8. **Không xoá dữ liệu giao dịch.** Soft delete + audit log.

### Luật bổ sung (Overview §29 + §37) — áp dụng cho mọi ticket

9. **Đọc codebase trước khi viết dòng nào.** Liệt kê module/entity/service/controller/guard đang có, đối chiếu với brief, báo cáo xung đột và phần trùng lặp **trước khi** sửa.
10. **Không rewrite toàn bộ.** Luôn đề xuất thay đổi an toàn nhỏ nhất. Ưu tiên sửa code hiện có hơn viết lại.
11. **Không đổi technology stack.** Không thêm role mới. Không thêm luồng payment/deposit. Không tự thêm core module ngoài danh sách P3/P4.
12. **Không tự giải quyết mâu thuẫn bằng cách đoán.** Gặp mâu thuẫn giữa các tài liệu → áp thang ưu tiên P1.2, nếu vẫn không rõ thì mở `OPEN-QUESTION` và dừng.
13. **Khi sửa DB** phải kiểm tra migration. **Khi sửa API** phải kiểm tra consumer ở `web`/`mobile`. **Khi sửa permission** phải kiểm tra Guard + Decorator + seed + DB. **Khi sửa order state** phải cập nhật test.
14. **Báo cáo thay đổi theo đúng 9 mục ở Phụ lục C.** Không báo cáo kiểu "đã xong".
15. **Giữ mức độ phù hợp đồ án (Overview §33).** Không microservices ngoài `ai-service`, không event-driven quá mức, không distributed transaction, không payment gateway thật, không realtime tracking liên tục, không pipeline train model.

---

# P1 — CONTEXT & SOURCE OF TRUTH

## 1.1 Hiện trạng 5 repo (audit 2026-09-13)

| Repo | Stack | Trạng thái thật |
|---|---|---|
| `backend` | NestJS · TypeScript · TypeORM · PostgreSQL 16 · JWT+RBAC · Vitest · Docker Compose · GH Actions | 7 commit — skeleton: `auth, users, bookings, service-orders, services, categories, technicians, quotations, reviews, notifications, media, dashboard, health` |
| `web` | Vue 3 · TypeScript · Vite · TailwindCSS 4 · Pinia · Vue Router | 2 commit — chỉ có `pages/auth/Login` + `pages/dashboard` |
| `mobile` | TypeScript (RN/Expo) | Ngoài scope brief |
| `ai-service` | Python | Chỉ định nghĩa contract (P9) |
| `docs` | JavaScript (site docs) | Đích đến của P13 |

## 1.1b Stack đã chốt (Overview §3 — không được đổi)

| Lớp | Công nghệ |
|---|---|
| Backend | NestJS · TypeScript · REST · JWT · RBAC · **WebSocket** cho realtime khi cần |
| Database | PostgreSQL 16 · quan hệ chuẩn hoá · PK/FK/Unique/Index rõ · transaction cho nghiệp vụ quan trọng |
| Web | Vue 3 · TailwindCSS 4 · Pinia · Vue Router |
| Mobile | React Native *(ngoài scope brief, dùng chung API)* |
| AI Service | **FastAPI**, tách khỏi backend chính · Gemini API hoặc OpenAI API |
| Storage | **Cloudinary hoặc Firebase Storage** — chọn 1, không dùng song song |
| Maps | Google Maps API — geocode, hiển thị, route, tính khoảng cách |

Nguyên tắc kiến trúc: backend chính giữ business logic / authorization / state machine / transaction. `ai-service` **chỉ** làm việc AI. Frontend không quyết định business rule.

## 1.2 Thứ tự ưu tiên khi mâu thuẫn (theo Overview §38)

```
1. Quyết định nghiệp vụ mới nhất được nhóm FixHome xác nhận
   → hiện tại là Business Baseline v2.0 (2026-09-12)
2. SRS / tài liệu requirement đã duyệt mới nhất
3. Tài liệu kiến trúc/thiết kế đã duyệt
   → BUILD-BRIEF này (P3 ERD, P4 API, P5 RBAC, P7 design system)
4. Database schema / migration hiện tại
5. Backend implementation hiện tại
6. Tài liệu cũ hơn (PROJECT_OVERVIEW ở tầng ví dụ, RBAC doc v1)
7. Suy luận của AI                                    ← thấp nhất
```

**AI không được âm thầm giải quyết mâu thuẫn bằng cách đoán.** Mâu thuẫn phải được ghi thành `OPEN-QUESTION` và đưa lên người quyết.

> Lưu ý cách đọc: `PROJECT_OVERVIEW.md` là bậc 3 ở phần nguyên tắc (RBAC, security, transaction, architecture) nhưng là bậc 6 ở phần ví dụ endpoint/entity — vì chính tài liệu đó nói rõ "endpoint thực tế phải thống nhất với codebase, không tạo duplicate chỉ vì tài liệu có ví dụ" (§25) và "high-level model, phải kiểm lại với ERD chính thức" (§24).

## 1.3 Sai lệch ĐÃ PHÁT HIỆN — phải xử lý, không được bỏ qua

| ID | Sai lệch | Xử lý trong brief này |
|---|---|---|
| `GAP-01` | Backend thiếu 8 module bắt buộc của Baseline v2.0 | P3/P4 định nghĩa đủ: `invitations`, `chat`, `arrival-check-in`, `evidence`, `additional-costs`, `warranty`, `cancellations`, `admin-config` |
| `GAP-02` | RBAC doc v1 §7 ghi "Pending → Accepted do Technician/vận hành"; Baseline v2.0 yêu cầu **atomic assignment từ shortlist** | P5.4 là phiên bản đúng, thay thế hoàn toàn §7 của doc cũ |
| `GAP-03` | RBAC doc v1 không có permission cho arrival check-in, evidence gating, strike/suspension, warranty snapshot | P5.2 bổ sung 11 permission mới |
| `GAP-04` | Baseline yêu cầu **chat giữa Customer và candidate Technician** nhưng không repo/doc nào có module chat | P3.2 + P4.6 định nghĩa module `chat` |
| `GAP-05` | 5 TBD tài chính đang chặn build | P2.2 hạ xuống thành config có default |
| `GAP-06` | README link chéo chết (`Frontend-FixHome`, `Backend-FixHome`, `Mobi-FixHome`, `AI-FixHome`, `Docs-FixHome`) trong khi repo thật là `web`, `backend`, `mobile`, `ai-service`, `docs` | Ticket `CHORE-001`, sửa cả 4 README |
| `GAP-07` | `web` README định vị "Admin Dashboard" nhưng scope đã chốt là 4 role + landing | Ticket `CHORE-002`, viết lại README + IA theo P6 |
| `GAP-08` | Chưa có quy ước tiền tệ → rủi ro float | P3.4: `bigint` VND, cấm `float`/`decimal` cho tiền |
| `GAP-09` | **AI Chatbot** là core module trong Overview §5/§23 nhưng không có trong repo, không có trong RBAC doc, và v1.0 brief cũng bỏ sót | P3.2 + P4.10: module `ai-chatbot`, 2 bảng, guardrail cấm chatbot đổi state/approve/assign |
| `GAP-10` | Overview §24/§26/§31 bắt buộc `OrderStatusHistory` ghi trong cùng transaction với transition — chưa ai định nghĩa | P3.2 bảng `order_status_history`, bắt buộc trong `StateMachineService` |
| `GAP-11` | Overview §24 coi `Role` và `Permission` là entity (RBAC động), v1.0 brief lại dùng enum cứng | `D-18`: DB-backed, 3 bảng + seed, guard đọc qua cache |
| `GAP-12` | Quy ước tên permission khác nhau giữa 2 tài liệu (`booking:read_own` vs `booking:read:own`) | `D-17` chốt theo Overview §7. P5.2 đã viết lại toàn bộ |
| `GAP-13` | Tên endpoint khác nhau: Overview §25 dùng `/orders`, `/quotations/:id/approve`, `/ai/diagnosis`; Baseline v2.0 dùng `/service-orders`, `/decision`, `/ai/diagnoses` | `D-19` + bảng ánh xạ ở P4.1 |
| `GAP-14` | Overview §20 cấm duplicate Order nhưng §24 lại liệt kê entity `RepairHistory` → dễ bị hiểu thành tạo bảng thừa | `D-20`: Repair History là **read model dẫn xuất**, không tạo bảng |

## 1.4 Glossary (dùng đúng tên này trong code, DB, UI, docs)

| Term | Nghĩa | Tên code |
|---|---|---|
| Booking | Yêu cầu do Customer tạo, trước khi có Technician | `Booking` |
| ServiceOrder | Đơn thực thi, 1-1 với Booking sau khi assign | `ServiceOrder` |
| Candidate / Invitation | Lời mời gửi Technician trong lúc matching (tối đa 5) | `BookingInvitation` |
| Assignment | Kết quả cuối: đúng 1 Technician active/order | `TechnicianAssignment` |
| Quotation | Báo giá gốc trước khi sửa | `Quotation` |
| Additional Cost | Phát sinh trong lúc sửa, phải Customer approve | `AdditionalCostRequest` |
| Arrival Check-in | Xác thực GPS/geofence khi Technician tới nơi | `ArrivalCheckIn` |
| Strike | 1 lần huỷ vi phạm chính sách | `CancellationStrike` |
| Suspension | Khoá tạm quyền theo ngưỡng strike | `*_suspended_until` |
| Warranty snapshot | Bản đông cứng thời hạn BH tại thời điểm approve | `warrantyDaysSnapshot` |

---

# P2 — LOCKED DECISIONS & CONFIG

## 2.1 Quyết định đã khoá (agent không được đổi)

| ID | Quyết định |
|---|---|
| `D-01` | **Không có deposit / booking guarantee.** Xoá mọi field `deposit*`, `bookingGuarantee*`, `noDeposit*` khỏi schema |
| `D-02` | Mọi tiền tách đôi `LABOR` và `PARTS_EQUIPMENT`. Cấm field `additionalCostAmount` gộp |
| `D-03` | Shortlist tối đa 5 candidate. Là matching workflow, **không sinh 5 ServiceOrder** |
| `D-04` | Đúng **1 active assignment / ServiceOrder**, enforce bằng partial unique index + transaction |
| `D-05` | Order states: `PENDING_CONFIRMATION → ACCEPTED → EN_ROUTE → UNDER_REPAIR → COMPLETED`, cộng `CANCELLED`. Không thêm state cho additional cost |
| `D-06` | Additional Cost là sub-workflow trong `UNDER_REPAIR`: `PENDING_APPROVAL → APPROVED/REJECTED/EXPIRED/CANCELLED` |
| `D-07` | Không vào `UNDER_REPAIR` nếu thiếu BEFORE evidence. Không `COMPLETED` nếu thiếu AFTER evidence |
| `D-08` | Warranty do Technician khai, phải hiển thị **trước** khi Customer approve, snapshot vào invoice item, **không được rút ngắn hồi tố** |
| `D-09` | Cancellation **không** ảnh hưởng `averageRating`. Chỉ ảnh hưởng `reliabilityScore` + suspension |
| `D-10` | Arrival Compensation chỉ phát sinh khi có check-in **hợp lệ** (trong geofence). Google Maps chỉ để geocode/hiển thị/route, **không** là bằng chứng |
| `D-11` | Sau khi Customer approve, Technician **không** được sửa giá. Chỉ được tạo revision mới → audit trail |
| `D-12` | AI chỉ hỗ trợ chẩn đoán. Mọi output AI kèm disclaimer "chỉ tham khảo", **không** tự động thành quotation |
| `D-13` | Tiền: `bigint` VND, đơn vị đồng, không phần thập phân. Cấm `float`/`double`/`number` cho tiền |
| `D-14` | Thời gian: lưu `timestamptz` UTC, hiển thị `Asia/Ho_Chi_Minh` |
| `D-15` | Backend là nguồn kiểm soát state machine duy nhất. Frontend chỉ ẩn/hiện, không phải bảo mật |
| `D-16` | Web phục vụ đủ 4 role + landing public. Mobile là bản song song, dùng chung API |
| `D-17` | **Tên permission theo `resource:action_scope`** (Overview §7): `booking:read_own`, `order:update_status`, `additional_cost:approve`. Không dùng dấu `:` thứ hai |
| `D-18` | **RBAC lưu trong DB**: 3 bảng `roles`, `permissions`, `role_permissions`, seed ở Phase 0. Enum `UserRole` vẫn giữ cho typing nhưng **quyền được quyết bởi DB**, không phải bởi `if (role === 'ADMIN')` rải rác |
| `D-19` | **Tên endpoint canonical là bản của Baseline v2.0** (`/service-orders`, `/decision`, `/ai/diagnoses`). Ví dụ ở Overview §25 là minh hoạ, không phải hợp đồng. Xem bảng ánh xạ P4.1 |
| `D-20` | **Repair History không có bảng riêng.** Là read model dẫn xuất từ `service_orders` + `invoices` + `reviews` (Overview §20) |
| `D-21` | **AI Chatbot không được** đổi order state, approve additional cost, assign technician, hay thực hiện hành động quản trị. Chatbot chỉ trả lời và **điều hướng** người dùng tới màn hình có quyền tương ứng (Overview §23) |
| `D-22` | **Mọi transition state phải ghi `order_status_history` trong cùng transaction** với việc đổi state. Thiếu history = bug, không phải thiếu tính năng |
| `D-23` | Storage chọn **một** provider (Cloudinary **hoặc** Firebase), cấu hình qua env, truy cập qua `StoragePort` — không gọi SDK trực tiếp trong service nghiệp vụ |
| `D-24` | Không over-engineer (Overview §33): không microservice ngoài `ai-service`, không event sourcing, không distributed transaction, không payment gateway thật, không realtime tracking liên tục |

## 2.2 Giải 5 điểm TBD → hạ xuống thành config (không chặn build)

| TBD gốc | Quyết định tạm để build | Ghi chú cho PO |
|---|---|---|
| `TBD-FIN-01` commission 10% trên toàn invoice hay chỉ labor? | Config `commission.base = LABOR`, `commission.rate = 10%`. Parts là **pass-through**, không ăn hoa hồng | Khuyến nghị BA: giữ `LABOR`. Đổi sang `TOTAL` chỉ cần đổi config, không đổi code |
| `TBD-CANCEL-01` khoá bao lâu, cửa sổ tính strike? | `customer.suspension.hours = 72`, `technician.suspension.hours = 72`, `strike.window.days = 30` | Demo có thể set 24h cho dễ quay video |
| `TBD-CANCEL-02` compensation bao nhiêu, quỹ nào? | `compensation.arrival.amount = 50000` VND, trạng thái `ELIGIBLE` — **chưa chi tiền thật** ở Phase 1, chỉ ghi nhận + priority boost | Nguồn quỹ để PO chốt; code đã có chỗ cắm |
| `TBD-MATCH-01` mời 5 người đồng thời hay tuần tự? | `matching.mode = SIMULTANEOUS` + accept **atomic**. Người accept đầu tiên thắng, 4 invitation còn lại tự `EXPIRED` | Đã có sẵn nhánh `SEQUENTIAL` dùng `priorityOrder`, bật bằng config |
| `TBD-PAY-01` payout hold 12h + wallet còn giữ? | **Ngoài scope Phase 1.** `payment.mode = DEMO` (đánh dấu đã thanh toán thủ công). Wallet/settlement để Phase 2 | Không xoá entity, chỉ không build UI |

### 4 OPEN ITEM bổ sung từ Overview §35 — **cấm suy diễn**

| ID | Câu hỏi chưa chốt | Cách xử lý tạm để không chặn build |
|---|---|---|
| `OPEN-SM-01` | Service Manager có scope theo khu vực/chi nhánh hay toàn hệ thống? | Build `scopeType = GLOBAL` mặc định, nhưng **đã có sẵn cột `scopeProvinceCodes`** trong `user_scopes` để bật sau mà không phải migrate lại. Không hard-code `SM thấy tất cả` trong query |
| `OPEN-PAY-02` | Settlement khi khách trả tiền mặt nhiều lần? | Ngoài scope Phase 1. `payment.mode = DEMO`. Không tạo bảng transaction tiền mặt |
| `OPEN-PAY-03` | Payment gateway nào, payout timing sau Completed? | **Cấm suy diễn payout timing** (Overview §16/§35). Không code hold 12h, không code wallet |
| `OPEN-AI-04` | Model/prompt/chiến lược train cuối cùng? | Adapter ở P9 đã cô lập. Prompt hiện tại coi là tạm, version hoá trong `ai_prompts` config, không nhúng cứng trong code |

> ⚠️ Trong UI Admin, 5 mục TBD tài chính + 4 OPEN ITEM này hiển thị badge **"Chờ PO chốt"** để không ai nhầm là quyết định chính thức.

## 2.3 Bảng `system_config` (seed bắt buộc ở Phase 0)

| key | default | kiểu | ai sửa |
|---|---|---|---|
| `matching.max_shortlist` | `5` | int | Admin |
| `matching.mode` | `SIMULTANEOUS` | enum | Admin |
| `matching.invitation_ttl_minutes` | `30` | int | Admin |
| `geofence.radius_meters` | `300` | int | Admin |
| `geofence.min_gps_accuracy_meters` | `100` | int | Admin |
| `evidence.before.min_count` | `1` | int | Admin |
| `evidence.after.min_count` | `1` | int | Admin |
| `evidence.max_file_mb` | `10` | int | Admin |
| `strike.window.days` | `30` | int | Admin |
| `strike.customer.threshold` | `2` | int | Admin |
| `strike.technician.threshold` | `2` | int | Admin |
| `customer.suspension.hours` | `72` | int | Admin |
| `technician.suspension.hours` | `72` | int | Admin |
| `cancel.grace_minutes_after_accept` | `15` | int | Admin |
| `compensation.arrival.amount` | `50000` | bigint VND | Admin *(chờ PO)* |
| `commission.base` | `LABOR` | enum | Admin *(chờ PO)* |
| `commission.rate_bps` | `1000` (=10%) | int | Admin *(chờ PO)* |
| `additional_cost.approval_ttl_minutes` | `60` | int | Admin |
| `warranty.default_days` | `30` | int | Admin |
| `warranty.max_days` | `365` | int | Admin |
| `ai.provider` | `stub` | enum | Admin |
| `ai.timeout_ms` | `15000` | int | Admin |
| `ai.rate_limit_per_user_per_hour` | `10` | int | Admin |
| `payment.mode` | `DEMO` | enum | Admin |

Quy tắc đọc config: **service layer đọc qua `ConfigService.getBusiness(key)` có cache 60s**, không đọc trực tiếp DB trong vòng lặp, không đọc từ `.env`.

---

# P3 — DOMAIN MODEL

## 3.1 Enum (định nghĩa 1 chỗ duy nhất: `src/shared/enums/`)

```ts
UserRole            = CUSTOMER | TECHNICIAN | SERVICE_MANAGER | ADMIN
UserStatus          = ACTIVE | SUSPENDED | LOCKED | PENDING_VERIFICATION
OrderStatus         = PENDING_CONFIRMATION | ACCEPTED | EN_ROUTE | UNDER_REPAIR | COMPLETED | CANCELLED
InvitationStatus    = PENDING | ACCEPTED | DECLINED | EXPIRED | CANCELLED
CostItemType        = LABOR | PARTS_EQUIPMENT
AdditionalCostStatus= PENDING_APPROVAL | APPROVED | REJECTED | EXPIRED | CANCELLED
QuotationStatus     = DRAFT | SENT | APPROVED | REJECTED | SUPERSEDED
EvidenceType        = BEFORE | ADDITIONAL | AFTER
CheckInResult       = VALID | OUT_OF_GEOFENCE | LOW_ACCURACY | FAILED
CancelActor         = CUSTOMER | TECHNICIAN | SERVICE_MANAGER | ADMIN
StrikeStatus        = ACTIVE | WAIVED | EXPIRED
CompensationStatus  = NOT_ELIGIBLE | ELIGIBLE | GRANTED | REJECTED
WarrantyStatus      = PENDING | ACTIVE | EXPIRED | VOIDED
UrgencyLevel        = LOW | MEDIUM | HIGH | CRITICAL
PaymentStatus       = UNPAID | PAID | REFUNDED
```

## 3.2 Bảng dữ liệu

Ký hiệu: 🆕 = chưa có trong repo, phải tạo mới.

| Bảng | Field chính | Ghi chú |
|---|---|---|
| `users` | `id, email, phone, passwordHash, role, status, fullName, avatarUrl, bookingSuspendedUntil, createdAt` | `email` + `phone` unique, case-insensitive email |
| `addresses` | `id, userId, label, line1, ward, district, province, lat, lng, isDefault` | lat/lng từ geocoding |
| `technician_profiles` | `id, userId, verificationStatus, yearsExperience, bio, averageRating, ratingCount, reliabilityScore, workSuspendedUntil, isAvailable` | `averageRating` **chỉ** từ review thật (`D-09`) |
| `technician_skills` | `technicianId, serviceId, level` | dùng cho hard-filter |
| `technician_service_areas` | `technicianId, provinceCode, districtCode` | |
| `technician_schedules` | `technicianId, dayOfWeek, startTime, endTime` | |
| `technician_time_off` | `technicianId, startAt, endAt, reason` | |
| `categories` | `id, name, slug, iconKey, sortOrder, isActive` | |
| `services` | `id, categoryId, name, slug, description, basePriceMin, basePriceMax, estimatedMinutes, isActive` | giá tham khảo, **không** phải quotation |
| `bookings` | `id, customerId, serviceId, addressId, description, preferredAt, urgency, status, createdAt` | |
| `booking_media` | `bookingId, url, mimeType, sizeBytes` | ảnh lỗi Customer upload |
| `ai_diagnoses` | `id, bookingId, provider, model, requestHash, possibleIssues(jsonb), possibleCauses(jsonb), urgency, priceRangeMin, priceRangeMax, suggestedServiceId, confidence, latencyMs, rawResponse(jsonb), createdAt` | 🆕 log đầy đủ để audit AI |
| `booking_invitations` 🆕 | `id, bookingId, technicianId, priorityOrder, status, invitedAt, respondedAt, expiresAt` | unique `(bookingId, technicianId)`; tối đa 5 row/booking |
| `service_orders` | `id, bookingId, code, status, scheduledAt, startedAt, completedAt, cancelledAt, laborTotal, partsTotal, grandTotal, paymentStatus` | `code` dạng `FH-20260913-0001` |
| `technician_assignments` | `id, serviceOrderId, technicianId, assignedAt, isActive, unassignedAt, unassignReason` | **partial unique index** `WHERE isActive` |
| `message_threads` 🆕 | `id, bookingId, customerId, technicianId, isOpen, closedReason` | **Chat người ↔ người.** 1 thread/candidate. Đổi tên từ `chat_threads` của v1.0 để không lẫn với AI Chatbot |
| `messages` 🆕 | `id, threadId, senderId, body, attachmentUrl, readAt, createdAt` | |
| `quotations` | `id, serviceOrderId, technicianId, status, laborTotal, partsTotal, note, sentAt, decidedAt` | |
| `quotation_items` | `id, quotationId, type, description, quantity, unitPrice, lineTotal, warrantyDaysSnapshot` | `type` = `CostItemType` |
| `additional_cost_requests` 🆕 | `id, serviceOrderId, technicianId, status, reason, totalLaborDelta, totalPartsDelta, createdAt, decidedAt, decidedByCustomerId, expiresAt, supersedesId` | `supersedesId` cho revision (`D-11`) |
| `additional_cost_items` 🆕 | `id, requestId, type, description, quantity, unitPrice, lineTotal, warrantyDays` | |
| `repair_evidences` 🆕 | `id, serviceOrderId, uploaderId, type, mediaUrl, note, capturedAt, createdAt` | |
| `arrival_check_ins` 🆕 | `id, serviceOrderId, technicianId, lat, lng, accuracyMeters, distanceMeters, result, checkedInAt, deviceInfo` | |
| `cancellations` 🆕 | `id, serviceOrderId, actor, actorUserId, reason, stateAtCancel, strikeApplied, compensationStatus, reviewedByUserId, createdAt` | |
| `cancellation_strikes` 🆕 | `id, userId, cancellationId, role, status, expiresAt, waivedByUserId, waiveReason` | strike hết hạn theo `strike.window.days` |
| `invoices` | `id, serviceOrderId, laborTotal, partsTotal, grandTotal, commissionBase, commissionAmount, paymentStatus, issuedAt, paidAt` | |
| `invoice_items` | `id, invoiceId, sourceType(QUOTATION\|ADDITIONAL), sourceItemId, type, description, quantity, unitPrice, lineTotal, warrantyDaysSnapshot` | |
| `warranty_coverages` 🆕 | `id, serviceOrderId, invoiceItemId, warrantyDaysSnapshot, note, startsAt, expiresAt, status` | |
| `reviews` | `id, serviceOrderId, customerId, technicianId, rating, comment, isModerated, createdAt` | 1 review/order |
| `notifications` | `id, userId, type, title, body, payload(jsonb), readAt, createdAt` | |
| `system_configs` | `key, value, valueType, description, updatedByUserId, updatedAt` | P2.3 |
| `audit_logs` | `id, actorUserId, actorRole, action, resourceType, resourceId, before(jsonb), after(jsonb), ip, userAgent, createdAt` | append-only |
| **`roles`** 🆕 | `id, code, name, description, isSystem` | `D-18`. `code` ∈ `UserRole`, unique |
| **`permissions`** 🆕 | `id, code, resource, action, description` | `code` theo `D-17` (`booking:read_own`), unique |
| **`role_permissions`** 🆕 | `roleId, permissionId` | PK kép; seed đầy đủ ở Phase 0 từ bảng P5.2 |
| **`user_scopes`** 🆕 | `userId, scopeType, scopeProvinceCodes(text[])` | `OPEN-SM-01`. Mặc định `GLOBAL`, có sẵn chỗ cho scope khu vực |
| **`order_status_history`** 🆕 | `id, serviceOrderId, fromStatus, toStatus, actorUserId, actorRole, reason, createdAt` | `D-22`. Ghi **trong cùng transaction** với transition. Nguồn dữ liệu cho `FhTimeline` |
| **`ai_conversations`** 🆕 | `id, userId, title, contextType(GENERAL\|BOOKING\|ORDER), contextId, createdAt, lastMessageAt` | Module AI Chatbot (`GAP-09`) |
| **`ai_chat_messages`** 🆕 | `id, conversationId, role(USER\|ASSISTANT), content, tokensIn, tokensOut, latencyMs, createdAt` | Dùng để Admin giám sát chi phí & chất lượng |
| ~~`repair_histories`~~ | — | **Không tạo bảng** (`D-20`). Repair History là read model dẫn xuất từ `service_orders` + `invoices` + `reviews` + `repair_evidences` |

## 3.3 Ràng buộc DB bắt buộc

```sql
-- D-04: đúng 1 assignment active
CREATE UNIQUE INDEX uq_active_assignment
  ON technician_assignments (service_order_id) WHERE is_active = true;

-- D-03: chống mời quá 5 (enforce cả ở service layer bằng transaction)
CREATE UNIQUE INDEX uq_invitation
  ON booking_invitations (booking_id, technician_id);

-- 1 booking -> 1 order
CREATE UNIQUE INDEX uq_order_booking ON service_orders (booking_id);

-- 1 review / order
CREATE UNIQUE INDEX uq_review_order ON reviews (service_order_id);

-- tra cứu nóng
CREATE INDEX ix_order_status_created ON service_orders (status, created_at DESC);
CREATE INDEX ix_invitation_tech_status ON booking_invitations (technician_id, status);
CREATE INDEX ix_evidence_order_type ON repair_evidences (service_order_id, type);
CREATE INDEX ix_strike_user_status ON cancellation_strikes (user_id, status);

-- D-18: RBAC DB-backed
CREATE UNIQUE INDEX uq_permission_code ON permissions (code);
CREATE UNIQUE INDEX uq_role_code       ON roles (code);

-- D-22: history bắt buộc, truy vấn theo order
CREATE INDEX ix_status_history_order ON order_status_history (service_order_id, created_at);

-- AI chatbot
CREATE INDEX ix_ai_conv_user ON ai_conversations (user_id, last_message_at DESC);
```

## 3.4 Quy tắc tiền & thời gian

- Tiền: cột `bigint`, tên kết thúc bằng `Total` / `Amount` / `Price` / `Delta`. **Cấm `float`, `double precision`, `real`.** Trong TS dùng `number` nhưng validate `Number.isInteger` + `>= 0`.
- Công thức bất biến (viết thành pure function + unit test riêng):
  ```
  FinalLaborTotal = BaseLabor + Σ(ApprovedAdditionalLabor)
  FinalPartsTotal = BaseParts + Σ(ApprovedAdditionalParts)
  GrandTotal      = FinalLaborTotal + FinalPartsTotal
  CommissionAmount= (commission.base === 'LABOR' ? FinalLaborTotal : GrandTotal) * rate_bps / 10000
  ```
- Item bị `REJECTED`/`EXPIRED` **không bao giờ** vào invoice.
- Thời gian: `timestamptz`, UTC ở DB, format `Asia/Ho_Chi_Minh` ở UI. Không lưu chuỗi ngày local.

---

# P4 — API CONTRACT

## 4.1 Convention

- Base: `/api/v1`. Swagger: `/api/docs`. Health: `/api/v1/health`.
- Response thành công:
  ```json
  { "data": {}, "meta": { "page": 1, "pageSize": 20, "total": 137 } }
  ```
- Response lỗi (bắt buộc có `code` máy đọc được):
  ```json
  { "error": { "code": "ORDER_INVALID_TRANSITION", "message": "...", "details": {} } }
  ```
- Phân trang: `?page=1&pageSize=20&sort=createdAt:desc`. `pageSize` max 100.
- Idempotency: các endpoint quyết định (`/decision`, `/respond`, `/check-in`, `/complete`, `/cancel`) nhận header `Idempotency-Key`; gọi lại cùng key trả về kết quả cũ, không tạo tác dụng phụ mới.
- HTTP: `401` chưa đăng nhập · `403` sai quyền · `404` không thuộc phạm vi (chống dò ID) · `409` vi phạm state machine / race · `422` validation.

### Ánh xạ tên endpoint — giải `GAP-13` / `D-19`

`PROJECT_OVERVIEW.md` §25 nêu một bộ tên khác với Baseline v2.0. **Chỉ dùng cột "Canonical".** Tuyệt đối không tạo cả hai (Overview §25 tự nói: không tạo duplicate endpoint chỉ vì tài liệu có ví dụ).

| Overview §25 (ví dụ) | Canonical — dùng cái này | Vì sao |
|---|---|---|
| `GET /orders/:id` | `GET /service-orders/:id` | Baseline v2.0 dùng `service-orders`; tên này phân biệt rõ với `booking` |
| `PATCH /orders/:id/status` | Endpoint hành động riêng: `/en-route`, `/check-in`, `/start-repair`, `/complete`, `/cancel` | Một endpoint `status` chung buộc backend tin `status` từ client — đúng thứ Overview §13/§27 cấm. Tách endpoint thì mỗi hành động có precondition riêng, dễ test và dễ phân quyền |
| `POST /quotations/:id/approve` + `/reject` | `POST /quotations/:id/decision` với body `{ action }` | 1 endpoint idempotent, tránh race "approve rồi reject" |
| `POST /additional-costs/:id/approve` + `/reject` | `POST /additional-costs/:id/decision` | như trên |
| `POST /ai/diagnosis` | `POST /ai/diagnoses` | Chuẩn REST số nhiều, đồng bộ với `GET /ai/diagnoses/:id` |
| `POST /orders/:id/rating` | `POST /service-orders/:id/reviews` | Bảng là `reviews`; giữ một tên duy nhất cho cả DB/API/UI |
| `POST /ai/chat` | `POST /ai/conversations/:id/messages` | Cần lưu hội thoại nhiều lượt (P4.10), không phải một lần gọi |

Nếu backend hiện tại **đã** implement tên theo Overview → **không đổi vội**. Mở ticket `CHORE-006`, đổi tên kèm cập nhật consumer ở `web`, theo đúng luật P0.3 #13.

## 4.2 Error code catalog (dùng đúng chuỗi này ở cả web)

| code | HTTP | Khi nào |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Sai email/mật khẩu |
| `AUTH_ACCOUNT_SUSPENDED` | 403 | `status = SUSPENDED`, kèm `suspendedUntil` |
| `RBAC_FORBIDDEN` | 403 | Role không có permission |
| `OWNERSHIP_DENIED` | 404 | Resource không thuộc actor |
| `SHORTLIST_LIMIT_EXCEEDED` | 422 | Vượt `matching.max_shortlist` |
| `INVITATION_EXPIRED` | 409 | Hết `expiresAt` |
| `INVITATION_ALREADY_TAKEN` | 409 | Technician khác đã accept trước |
| `ORDER_INVALID_TRANSITION` | 409 | Transition không hợp lệ |
| `EVIDENCE_REQUIRED_BEFORE` | 409 | Thiếu BEFORE evidence |
| `EVIDENCE_REQUIRED_AFTER` | 409 | Thiếu AFTER evidence |
| `CHECKIN_OUT_OF_GEOFENCE` | 422 | Ngoài bán kính |
| `CHECKIN_LOW_ACCURACY` | 422 | GPS accuracy kém |
| `ADDITIONAL_COST_ALREADY_DECIDED` | 409 | Đã approve/reject rồi |
| `ADDITIONAL_COST_IMMUTABLE` | 409 | Cố sửa giá đã approve (`D-11`) |
| `WARRANTY_CANNOT_SHORTEN` | 409 | Rút ngắn BH đã approve (`D-08`) |
| `BOOKING_SUSPENDED` | 403 | Customer đang bị khoá tạo booking |
| `WORK_SUSPENDED` | 403 | Technician đang bị khoá nhận việc |
| `AI_UNAVAILABLE` | 503 | Provider lỗi/timeout — web phải fallback sang nhập tay |

## 4.3 Endpoint — Auth & User

| Method | Path | Actor | Ghi chú |
|---|---|---|---|
| POST | `/auth/register` | Public | Chỉ tạo `CUSTOMER`. Technician do SM/Admin tạo + verify |
| POST | `/auth/login` | Public | Trả `accessToken` (15m) + `refreshToken` (7d, httpOnly cookie) |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | All | Revoke |
| GET | `/me` | All | Profile + permission list (web dùng để render menu) |
| PATCH | `/me` | All | Không cho đổi `role`, `status` |
| GET/POST/PATCH/DELETE | `/me/addresses` | Customer | |
| GET | `/users` | SM, Admin | Filter role/status |
| PATCH | `/users/:id/status` | Admin | Lock/unlock, audit bắt buộc |

## 4.4 Endpoint — Catalog

| Method | Path | Actor |
|---|---|---|
| GET | `/categories` · `/services` | Public |
| POST/PATCH/DELETE | `/categories` · `/services` | SM, Admin |
| GET | `/service-areas` | All |
| POST/PATCH | `/service-areas` | SM, Admin |

## 4.5 Endpoint — Booking, AI, Matching

| Method | Path | Actor | Ghi chú |
|---|---|---|---|
| POST | `/bookings` | Customer | Chặn nếu `bookingSuspendedUntil > now` → `BOOKING_SUSPENDED` |
| GET | `/bookings/my` | Customer | |
| GET | `/bookings/:id` | Owner / assigned Tech / SM / Admin | |
| POST | `/ai/diagnoses` | Customer | Body `{ bookingId, images[], description }`. Rate limit theo config |
| GET | `/ai/diagnoses/:id` | Owner + related | |
| GET | `/bookings/:id/technician-candidates` | Customer | Backend đã hard-filter + rank |
| POST | `/bookings/:id/shortlist` | Customer | Body `{ technicianIds[] }` ≤ 5, atomic |
| GET | `/invitations/my` | Technician | Inbox |
| POST | `/invitations/:id/respond` | Technician | `{ action: ACCEPT \| DECLINE }`. **Transaction:** lock booking → check chưa có assignment active → tạo assignment → set 4 invitation còn lại `EXPIRED` → tạo order `ACCEPTED`. Race thứ 2 nhận `INVITATION_ALREADY_TAKEN` |
| POST | `/technicians/:id/assign` | SM, Admin | Override thủ công, audit bắt buộc |

## 4.6 Endpoint — Messaging người ↔ người (GAP-04)

| Method | Path | Actor |
|---|---|---|
| GET | `/bookings/:id/threads` | Customer (all threads) / Technician (thread của mình) |
| GET | `/threads/:id/messages` | Thành viên thread, **chỉ khi `isOpen`** |
| POST | `/threads/:id/messages` | Thành viên thread |
| POST | `/threads/:id/read` | Thành viên thread |

> Đây **không phải** AI Chatbot. AI Chatbot ở P4.10, entity và permission hoàn toàn tách biệt.

> Khi assignment chốt: mọi thread của candidate thua bị `isOpen = false`, `closedReason = NOT_SELECTED` → đọc tiếp trả `OWNERSHIP_DENIED`.

## 4.7 Endpoint — Order lifecycle

| Method | Path | Actor | Precondition |
|---|---|---|---|
| GET | `/service-orders` | SM, Admin | Board vận hành |
| GET | `/service-orders/my` | Customer / Technician | Theo ownership |
| GET | `/service-orders/:id` | Related | |
| POST | `/service-orders/:id/en-route` | Assigned Tech | status = `ACCEPTED` |
| POST | `/service-orders/:id/check-in` | Assigned Tech | status = `EN_ROUTE`; body `{ lat, lng, accuracyMeters }` |
| POST | `/service-orders/:id/evidence` | Assigned Tech | multipart; `type` ∈ BEFORE/ADDITIONAL/AFTER |
| POST | `/service-orders/:id/start-repair` | Assigned Tech | check-in `VALID` + đủ BEFORE evidence → `UNDER_REPAIR` |
| POST | `/service-orders/:id/quotations` | Assigned Tech | items tách LABOR/PARTS + `warrantyDays` |
| POST | `/quotations/:id/decision` | Customer | `{ action: APPROVE \| REJECT }` |
| POST | `/service-orders/:id/additional-costs` | Assigned Tech | status = `UNDER_REPAIR` |
| POST | `/additional-costs/:id/decision` | Customer | idempotent |
| POST | `/additional-costs/:id/revise` | Assigned Tech | tạo request mới `supersedesId`, **không** overwrite |
| PUT | `/service-orders/:id/warranty` | Assigned Tech | chỉ trước khi Customer approve; không rút ngắn |
| POST | `/service-orders/:id/complete` | Assigned Tech | đủ AFTER evidence + mọi additional cost đã quyết → sinh invoice |
| POST | `/service-orders/:id/cancel` | Customer / Tech / SM / Admin | apply strike + compensation trong 1 transaction |
| GET | `/service-orders/:id/invoice` | Related | |
| POST | `/invoices/:id/pay` | Customer | `payment.mode = DEMO` → đánh dấu `PAID` |
| GET | `/service-orders/:id/warranties` | Related | |
| GET | `/service-orders/:id/status-history` | Related | `D-22`. Nguồn dữ liệu cho `FhTimeline` |
| POST | `/service-orders/:id/reviews` | Customer | status = `COMPLETED`, chưa có review (trùng → `409`) |
| GET | `/repair-history` | Customer (của mình) / Technician (đã làm) / SM / Admin | `D-20` — read model dẫn xuất, **không** có bảng riêng |

## 4.8 Endpoint — Vận hành & quản trị

| Method | Path | Actor |
|---|---|---|
| GET | `/cancellations` | SM, Admin |
| POST | `/cancellations/:id/review` | SM, Admin — waive strike, quyết compensation |
| GET | `/strikes?userId=` | SM, Admin |
| GET | `/dashboard/customer` · `/dashboard/technician` · `/dashboard/operations` · `/dashboard/system` | Theo role |
| GET/PATCH | `/admin/configs` | Admin — audit mọi lần đổi |
| GET | `/audit-logs` | Admin (SM nếu được cấp phạm vi) |
| GET | `/notifications` · POST `/notifications/:id/read` | Owner |

## 4.9b Endpoint — AI Chatbot (GAP-09)

| Method | Path | Actor | Ghi chú |
|---|---|---|---|
| GET | `/ai/conversations` | All | Hội thoại của chính mình |
| POST | `/ai/conversations` | All | `{ contextType, contextId? }` — gắn ngữ cảnh booking/order nếu mở từ màn đó |
| GET | `/ai/conversations/:id/messages` | Owner | Phân trang ngược |
| POST | `/ai/conversations/:id/messages` | Owner | Gửi câu hỏi, nhận trả lời. Rate limit dùng chung `ai.rate_limit_per_user_per_hour` |
| GET | `/admin/ai/usage` | Admin | Token, chi phí, latency, tỉ lệ lỗi |

**Guardrail bắt buộc (`D-21`, Overview §23).** Chatbot được phép: giải thích dịch vụ, hướng dẫn troubleshooting cơ bản, hướng dẫn quy trình đặt lịch, tra cứu trạng thái đơn **của chính người đang hỏi**. Chatbot **không** được: kết luận lỗi kỹ thuật dứt khoát, đổi order state, approve additional cost, assign technician, thực hiện hành động quản trị.

Cách enforce (không phải chỉ dặn trong prompt):
1. Chatbot **không có tool nào ghi dữ liệu**. Chỉ có tool đọc, và mọi tool đọc đều đi qua đúng `OwnershipGuard` như API thường.
2. Khi người dùng yêu cầu một hành động nghiệp vụ, chatbot trả về `suggestedAction = { label, route }` để web render nút điều hướng — người dùng tự bấm và tự thực hiện ở màn hình có quyền.
3. Mọi câu trả lời liên quan chẩn đoán kèm disclaimer như P8.3.

## 4.9 Payload mẫu (4 case rủi ro cao)

**Accept invitation (race-safe)**
```http
POST /api/v1/invitations/{id}/respond
Idempotency-Key: 5f2c...
{ "action": "ACCEPT" }
```
```json
{ "data": { "serviceOrderId": "...", "status": "ACCEPTED", "assignedAt": "2026-09-13T03:12:00Z" } }
```
Người thứ hai: `409 INVITATION_ALREADY_TAKEN`.

**Arrival check-in**
```json
{ "lat": 10.362, "lng": 106.664, "accuracyMeters": 18 }
→ { "data": { "result": "VALID", "distanceMeters": 42, "checkedInAt": "..." } }
```

**Tạo additional cost (bắt buộc tách loại)**
```json
{
  "reason": "Tụ đề hỏng, phải thay",
  "items": [
    { "type": "PARTS_EQUIPMENT", "description": "Tụ đề 35uF", "quantity": 1, "unitPrice": 180000, "warrantyDays": 90 },
    { "type": "LABOR",           "description": "Công thay tụ",  "quantity": 1, "unitPrice": 120000, "warrantyDays": 30 }
  ]
}
→ { "data": { "id": "...", "status": "PENDING_APPROVAL", "totalLaborDelta": 120000, "totalPartsDelta": 180000, "expiresAt": "..." } }
```

**Complete**
```json
{ "completionNote": "Đã thay tụ, chạy thử 15 phút ổn định" }
→ 409 EVIDENCE_REQUIRED_AFTER  (nếu thiếu ảnh sau sửa)
```

---

# P5 — RBAC v2.0

> Phiên bản này **thay thế** RBAC doc v1. Giữ 4 actor, bổ sung 11 permission còn thiếu (GAP-03), sửa state machine (GAP-02).

## 5.1 Năm lớp kiểm tra (thiếu 1 lớp = lỗ hổng)

```
JwtGuard
  → PermissionGuard   (code permission đọc từ DB: roles → role_permissions → permissions)
  → OwnershipGuard    (bản ghi có thuộc actor / có được assign không?)
  → ScopeGuard        (SM: user_scopes — hiện GLOBAL, sẵn sàng bật scope khu vực)
  → StateMachineGuard (transition hợp lệ?)
  → BusinessRuleGuard (evidence đủ? đang suspend? config cho phép?)
```

`D-18`: permission **đọc từ DB**, cache 60s, invalidate khi đổi `role_permissions`. Cấm viết `if (user.role === 'ADMIN')` trong service nghiệp vụ — chỉ `@RequirePermission('config:update')`.

## 5.2 Permission catalog — quy ước `resource:action_scope` (`D-17`)

| Permission code | CUSTOMER | TECHNICIAN | SERVICE_MANAGER | ADMIN |
|---|:--:|:--:|:--:|:--:|
| `profile:read_own` · `profile:update_own` | ✅ | ✅ | ✅ | ✅ |
| `user:read_all` | — | — | ✅ scope | ✅ |
| `user:lock` | — | — | — | ✅ |
| `technician:verify` | — | — | ✅ | ✅ |
| `technician:assign` | — | — | ✅ | ✅ |
| `service:read` | ✅ | ✅ | ✅ | ✅ |
| `service:manage` | — | — | ✅ | ✅ |
| `booking:create` | ✅ | — | — | — |
| `booking:read_own` | ✅ | — | — | — |
| `booking:read_invited` | — | ✅* | — | — |
| `booking:read_all` | — | — | ✅ | ✅ |
| `booking:cancel_own` | ✅ | — | — | — |
| `ai_diagnosis:create` | ✅ | — | — | — |
| `ai_diagnosis:read_related` | ✅ | ✅* | ✅ | ✅ |
| `invitation:shortlist` | ✅ | — | — | — |
| `invitation:respond` | — | ✅ | — | — |
| `assignment:override` | — | — | ✅ | ✅ |
| `message:read_thread` · `message:write_thread` 🆕 | ✅ | ✅* | — | ✅ chỉ đọc |
| `chatbot:use` 🆕 | ✅ | ✅ | ✅ | ✅ |
| `chatbot:monitor` 🆕 | — | — | — | ✅ |
| `order:read_related` | ✅ | ✅ | ✅ | ✅ |
| `order:update_status` | — | ✅ assigned | ✅ override | ✅ |
| `order:cancel` | ✅ own | ✅ assigned | ✅ | ✅ |
| `order:read_status_history` 🆕 | ✅ | ✅ | ✅ | ✅ |
| `arrival_checkin:create` 🆕 | — | ✅ assigned | — | — |
| `arrival_checkin:read_related` 🆕 | ✅ | ✅ | ✅ | ✅ |
| `evidence:upload` 🆕 | — | ✅ assigned | — | — |
| `evidence:read_related` 🆕 | ✅ | ✅ | ✅ | ✅ |
| `quotation:create` | — | ✅ assigned | — | — |
| `quotation:read_related` | ✅ | ✅ | ✅ | ✅ |
| `quotation:approve` · `quotation:reject` | ✅ own order | — | — | — |
| `additional_cost:create` | — | ✅ assigned | — | — |
| `additional_cost:approve` · `additional_cost:reject` | ✅ own order | — | — | — |
| `additional_cost:revise` 🆕 | — | ✅ assigned | — | — |
| `warranty:define` 🆕 | — | ✅ assigned | — | — |
| `warranty:read_related` 🆕 | ✅ | ✅ | ✅ | ✅ |
| `invoice:read_related` | ✅ | ✅ | ✅ | ✅ |
| `invoice:pay_own` | ✅ | — | — | — |
| `strike:read_all` 🆕 | — | — | ✅ | ✅ |
| `strike:waive` 🆕 | — | — | ✅ | ✅ |
| `compensation:decide` 🆕 | — | — | ✅ | ✅ |
| `rating:create_own_order` | ✅ | — | — | — |
| `rating:moderate` | — | — | ✅ | ✅ |
| `history:read_related` | ✅ | ✅ | ✅ | ✅ |
| `config:read` 🆕 | — | — | ✅ | ✅ |
| `config:update` 🆕 | — | — | — | ✅ |
| `audit:read` | — | — | ✅ scope | ✅ |
| `dashboard:read_own` | ✅ | ✅ | — | — |
| `dashboard:read_operational` | — | — | ✅ | ✅ |
| `dashboard:read_system` | — | — | — | ✅ |

`*` = chỉ trong thời gian invitation còn hiệu lực / thread còn mở.

> Seed 3 bảng RBAC từ đúng bảng này ở Phase 0. Test `AC-15`: đếm số row `role_permissions` khớp số ô ✅ trong bảng — lệch nghĩa là seed và tài liệu đã trôi khỏi nhau.

## 5.3 Ownership rule (viết thành helper dùng chung, không copy-paste)

| Resource | Điều kiện pass |
|---|---|
| Booking/Order | `customerId = actor` HOẶC `activeAssignment.technicianId = actor` HOẶC role ∈ {SM, ADMIN} |
| Invitation | `technicianId = actor` và `status = PENDING` và `expiresAt > now` |
| ChatThread | actor ∈ {customerId, technicianId} và `isOpen = true` |
| Evidence / CheckIn / AdditionalCost | theo ownership của order cha |
| Invoice / Warranty | theo ownership của order cha |

Vi phạm ownership → **`404 OWNERSHIP_DENIED`**, không phải 403, để không lộ sự tồn tại của record.

## 5.4 State machine guard (bảng này là chuẩn — thay §7 doc cũ)

| From → To | Actor | Precondition | Lỗi nếu sai |
|---|---|---|---|
| — → `PENDING_CONFIRMATION` | Customer | Không bị suspend; booking hợp lệ | `BOOKING_SUSPENDED` |
| `PENDING_CONFIRMATION` → `ACCEPTED` | **Hệ thống**, kích hoạt bởi Technician accept invitation, hoặc SM override | Chưa có assignment active; invitation còn hạn; transaction lock | `INVITATION_ALREADY_TAKEN` / `INVITATION_EXPIRED` |
| `ACCEPTED` → `EN_ROUTE` | Assigned Tech | Là assigned; không suspend | `RBAC_FORBIDDEN` |
| `EN_ROUTE` → `UNDER_REPAIR` | Assigned Tech | Check-in `VALID` **và** ≥ `evidence.before.min_count` ảnh BEFORE | `CHECKIN_*` / `EVIDENCE_REQUIRED_BEFORE` |
| `UNDER_REPAIR` → `COMPLETED` | Assigned Tech | ≥ `evidence.after.min_count` ảnh AFTER; không còn additional cost `PENDING_APPROVAL`; warranty đã snapshot | `EVIDENCE_REQUIRED_AFTER` / `ORDER_INVALID_TRANSITION` |
| `*` → `CANCELLED` | Customer / Tech / SM / Admin | Có `reason`; apply strike + compensation trong cùng transaction | `ORDER_INVALID_TRANSITION` |
| `COMPLETED` → bất kỳ | — | **Cấm.** Chỉ Admin, có lý do + audit log | `ORDER_INVALID_TRANSITION` |

**Cấm tuyệt đối:** nhảy `PENDING_CONFIRMATION → COMPLETED`, nhảy `ACCEPTED → COMPLETED`, quay ngược state (`COMPLETED → UNDER_REPAIR`, `COMPLETED → PENDING_CONFIRMATION`), hoặc để frontend quyết định transition.

**Mọi transition phải chạy trong 1 transaction gồm đủ 3 việc** (`D-22`, Overview §31):
```
BEGIN
  ├── UPDATE service_orders.status
  ├── INSERT order_status_history (from, to, actor, role, reason)
  └── (nếu cần) INSERT notification / cancellation / strike / compensation
COMMIT  → sau commit mới emit WebSocket event
```
Đổi state mà không ghi history = coi như bug chặn merge, không phải thiếu tính năng.

## 5.5 Cancellation & strike matrix

| Tình huống | Strike | Compensation | Ghi chú |
|---|---|---|---|
| Customer huỷ khi `PENDING_CONFIRMATION` | ❌ | ❌ | Huỷ sạch, đóng hết invitation |
| Customer huỷ trong `cancel.grace_minutes_after_accept` sau `ACCEPTED` | ❌ | ❌ | Cửa sổ ân hạn |
| Customer huỷ sau ân hạn / khi `EN_ROUTE` | ✅ Customer | ❌ | Technician được priority boost |
| Customer huỷ sau check-in `VALID` | ✅ Customer | ✅ `ELIGIBLE` | `D-10` |
| Customer no-show sau check-in `VALID` | ✅ Customer | ✅ `ELIGIBLE` | SM xác nhận |
| Technician `DECLINE` invitation | ❌ | ❌ | Là decline, **không** phải cancel |
| Technician huỷ sau `ACCEPTED` không lý do hợp lệ | ✅ Technician | ❌ | Ảnh hưởng `reliabilityScore` |
| Technician huỷ có lý do hợp lệ (SM duyệt) | ❌ | ❌ | Cần evidence |
| Đạt `strike.*.threshold` trong `strike.window.days` | → set `bookingSuspendedUntil` / `workSuspendedUntil` | | Thông báo + hiện banner đếm ngược trên web |

---

# P6 — INFORMATION ARCHITECTURE & SCREEN INVENTORY

Scope đã chốt: **4 role trên web + landing public.**

## 6.1 Layout

| Layout | Dùng cho | Cấu trúc |
|---|---|---|
| `PublicLayout` | Landing, services, tra cứu đơn | Header trong suốt → solid khi scroll, footer đầy đủ |
| `AuthLayout` | Login, register, quên mật khẩu | Split 2 cột: form trái, ảnh/illustration phải |
| `CustomerLayout` | Customer | Top nav + avatar menu, nội dung max-width 1120px |
| `TechnicianLayout` | Technician | Top nav + toggle "Đang nhận việc" + badge invitation |
| `ConsoleLayout` | SM, Admin | Sidebar trái collapse được (240/72px) + topbar + breadcrumb |

**`FhChatbotWidget`** gắn ở **mọi layout đã đăng nhập** (không có ở `PublicLayout`/`AuthLayout`): nút tròn góc dưới phải `56px`, mở panel `380×560`. Khi mở từ trang đơn thì tự gắn `contextType = ORDER`, `contextId`. Câu trả lời có `suggestedAction` thì render nút điều hướng — **chatbot không tự thực hiện hành động** (`D-21`).

## 6.2 Route table

### Public
| Route | Màn hình | Guard |
|---|---|---|
| `/` | Landing | — |
| `/services` · `/services/:slug` | Danh mục & chi tiết dịch vụ | — |
| `/how-it-works` · `/for-technicians` · `/pricing-policy` | Trang tĩnh | — |
| `/track` | Tra cứu đơn bằng mã + SĐT | — |
| `/login` · `/register` · `/forgot-password` · `/reset-password` | Auth | Guest only |

### Customer (`role = CUSTOMER`)
| Route | Màn hình |
|---|---|
| `/app` | Dashboard cá nhân |
| `/app/bookings/new` | Wizard tạo booking (4 bước) |
| `/app/bookings/:id/diagnosis` | Kết quả AI |
| `/app/bookings/:id/candidates` | Danh sách + shortlist ≤5 |
| `/app/bookings/:id/chat/:threadId` | Chat với candidate |
| `/app/orders` · `/app/orders/:id` | Đơn của tôi · chi tiết + timeline |
| `/app/orders/:id/quotation` | Xem/duyệt báo giá |
| `/app/orders/:id/additional-costs/:acId` | Duyệt phát sinh |
| `/app/orders/:id/invoice` | Hoá đơn + thanh toán |
| `/app/orders/:id/review` | Đánh giá |
| `/app/warranties` | Bảo hành còn hiệu lực |
| `/app/history` · `/app/addresses` · `/app/notifications` · `/app/profile` | Phụ trợ |

### Technician (`role = TECHNICIAN`)
| Route | Màn hình |
|---|---|
| `/tech` | Dashboard việc hôm nay |
| `/tech/invitations` · `/tech/invitations/:id` | Hộp thư mời (đếm ngược TTL) |
| `/tech/jobs` · `/tech/jobs/:id` | Đơn được giao · workspace thực thi |
| `/tech/jobs/:id/check-in` | Check-in GPS |
| `/tech/jobs/:id/evidence` | Upload BEFORE/AFTER |
| `/tech/jobs/:id/quotation` | Lập báo giá (tách labor/parts) |
| `/tech/jobs/:id/additional-cost` | Tạo/sửa phát sinh |
| `/tech/jobs/:id/complete` | Hoàn tất + warranty |
| `/tech/earnings` · `/tech/schedule` · `/tech/skills` · `/tech/profile` | Phụ trợ |

### Service Manager (`role = SERVICE_MANAGER`)
| Route | Màn hình |
|---|---|
| `/console` | Dashboard vận hành |
| `/console/orders` | Board đơn (kanban theo state) |
| `/console/orders/:id` | Chi tiết + can thiệp |
| `/console/matching` | Booking chưa có Technician |
| `/console/technicians` · `/console/technicians/:id` | Quản lý + verify |
| `/console/cancellations` | Huỷ đơn & dispute |
| `/console/strikes` | Strike & suspension, waive |
| `/console/catalog` | Danh mục & dịch vụ |
| `/console/service-areas` · `/console/reviews` | Phụ trợ |

### Admin (`role = ADMIN`) — kế thừa toàn bộ `/console` +
| Route | Màn hình |
|---|---|
| `/console/admin/users` | Toàn bộ user, lock/unlock |
| `/console/admin/config` | 24 key config (P2.3) |
| `/console/admin/ai-monitor` | Log AI, lỗi, confidence thấp, chi phí |
| `/console/admin/audit` | Audit log |
| `/console/admin/system` | Dashboard toàn hệ thống |

**Tổng: 52 màn hình.**

## 6.3 Router guard

```ts
meta: { requiresAuth: true, roles: ['CUSTOMER'], permission: 'booking:create' }
```
- Sai role → `/403`, **không** redirect ngầm về `/login` (gây hiểu nhầm là hết phiên).
- Hết token → refresh 1 lần; fail → `/login?redirect=<path>`.
- Đang suspend → vẫn vào được app nhưng banner đỏ + nút tạo booking `disabled` có tooltip lý do + thời điểm hết khoá.

---

# P7 — DESIGN SYSTEM (WARM ORANGE)

## 7.1 Nguyên tắc màu

Cam là **màu thương hiệu**, không phải màu trạng thái. Quy tắc:
- Cam đậm (`brand-600`) **chỉ** dùng cho: primary CTA, logo, active nav indicator.
- Trạng thái dùng bộ semantic riêng (xanh/đỏ/xanh dương/tím/hổ phách).
- Ngoại lệ duy nhất: trạng thái `UNDER_REPAIR` dùng **tint cam** (`brand-50` nền + `brand-700` chữ) vì đó là việc đang diễn ra, cần hút mắt trên board.
- Xám nền phải **ám ấm** (hơi ngả vàng), không dùng xám xanh — đặt cạnh cam sẽ bị lệch tông.

## 7.2 Tailwind 4 theme block

Đặt tại `src/assets/theme.css`, import trong `main.ts`.

```css
@import "tailwindcss";

@theme {
  /* ---- Brand: warm orange ---- */
  --color-brand-50:  #FFF6ED;
  --color-brand-100: #FFE9D5;
  --color-brand-200: #FED0A8;
  --color-brand-300: #FDB170;
  --color-brand-400: #FB8F3B;
  --color-brand-500: #F2740C;
  --color-brand-600: #DC5C06;   /* primary CTA */
  --color-brand-700: #B64409;
  --color-brand-800: #91370E;
  --color-brand-900: #76300F;

  /* ---- Neutral: warm-tinted ---- */
  --color-ink-25:  #FCFBF9;
  --color-ink-50:  #F7F5F2;     /* page background */
  --color-ink-100: #EFECE7;
  --color-ink-200: #E2DDD6;     /* border */
  --color-ink-300: #CBC4BA;
  --color-ink-400: #A69D91;     /* placeholder */
  --color-ink-500: #7D7468;     /* text tertiary */
  --color-ink-600: #5C554C;     /* text secondary */
  --color-ink-700: #443E37;
  --color-ink-800: #2B2722;
  --color-ink-900: #1A1714;     /* text primary */

  /* ---- Semantic ---- */
  --color-success-50:  #E7F6F0;  --color-success-600: #0E8A5F;
  --color-warning-50:  #FEF6E0;  --color-warning-600: #B07D00;
  --color-danger-50:   #FEECEB;  --color-danger-600:  #D92D20;
  --color-info-50:     #EAF1FE;  --color-info-600:    #175CD3;
  --color-violet-50:   #F3EEFE;  --color-violet-600:  #6335D9;

  /* ---- Radius: 3 bậc ---- */
  --radius-sm: 8px;    /* badge, input, icon tile */
  --radius-md: 14px;   /* card, button lớn */
  --radius-lg: 20px;   /* modal, panel */

  /* ---- Elevation: shadow ám ink, không dùng đen thuần ---- */
  --shadow-e1: 0 1px 2px rgba(26,23,20,.05), 0 1px 3px rgba(26,23,20,.06);
  --shadow-e2: 0 4px 8px rgba(26,23,20,.07), 0 2px 4px rgba(26,23,20,.05);
  --shadow-e3: 0 16px 32px rgba(26,23,20,.12), 0 4px 8px rgba(26,23,20,.06);

  /* ---- Type ---- */
  --font-sans: "Be Vietnam Pro", system-ui, sans-serif;
  --font-num:  "Space Grotesk", "Be Vietnam Pro", sans-serif;

  --text-2xs: 11px;  --text-xs: 12px;  --text-sm: 14px;
  --text-base: 16px; --text-lg: 20px;  --text-xl: 28px;  --text-2xl: 36px;
}
```

> Font tiếng Việt: **Be Vietnam Pro** (đủ dấu, không vỡ chữ Đ/ơ/ư). Số tiền/metric dùng **Space Grotesk** tabular để cột tiền thẳng hàng.

## 7.3 Thang typography

| Token | px / weight | Dùng cho |
|---|---|---|
| `display` | 36 / 700, `-0.02em` | Hero landing, số tiền lớn ở invoice |
| `h1` | 28 / 700 | Tiêu đề trang |
| `h2` | 20 / 600 | Tiêu đề section, tên card |
| `body` | 16 / 400 | Nội dung chính |
| `body-sm` | 14 / 400 | Nội dung phụ, bảng |
| `caption` | 12 / 500 | Metadata, timestamp |
| `overline` | 11 / 600, `+0.04em`, UPPERCASE | Nhãn nhóm, header cột |

Chỉ dùng 7 bậc này. Cấm 13px, 15px, 17px.

## 7.4 Spacing & grid

- Thang: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Không có giá trị lẻ.
- Page container: padding ngang `24px` (desktop) / `16px` (mobile). **Tiêu đề trang, nhãn section và card phải cùng một mép trái** — không thêm margin riêng cho tiêu đề.
- Card đang bọc list các row đã có padding → card **không** thêm padding dọc, tránh cộng dồn gap ở mép trên/dưới.
- Console content max-width `1440px`, form max-width `720px`, trang đọc max-width `760px`.

## 7.5 Bảng màu trạng thái (dùng NGUYÊN VĂN, không chế thêm)

| Trạng thái | Nền | Chữ | Chấm |
|---|---|---|---|
| `PENDING_CONFIRMATION` | `info-50` | `info-600` | ● xanh dương |
| `ACCEPTED` | `violet-50` | `violet-600` | ● tím |
| `EN_ROUTE` | `warning-50` | `warning-600` | ● hổ phách |
| `UNDER_REPAIR` | `brand-50` | `brand-700` | ● cam *(ngoại lệ duy nhất)* |
| `COMPLETED` | `success-50` | `success-600` | ● xanh lá |
| `CANCELLED` | `ink-100` | `ink-600` | ● xám |
| `PENDING_APPROVAL` (phát sinh) | `warning-50` | `warning-600` | ● hổ phách nhấp nháy chậm |
| `SUSPENDED` / dispute | `danger-50` | `danger-600` | ● đỏ |

Đỏ **chỉ** dành cho lỗi, huỷ vi phạm, hành động phá huỷ. Không dùng đỏ cho `CANCELLED` thường.

## 7.6 Icon

- Một bộ duy nhất: **Lucide**, stroke `1.75px`, kích thước `16 / 20 / 24`.
- Cấm trộn icon filled với icon line trên cùng màn hình.
- Trong list lặp: **hoặc tất cả row có icon, hoặc không row nào có.** Phủ icon một nửa nhìn cẩu thả hơn là không có icon.
- Icon tile: `32px` hoặc `40px`, `radius-sm` (nhỏ hơn radius của card chứa nó).

## 7.7 Component spec

| Component | Spec |
|---|---|
| `FhButton` | Size `sm 36px / md 44px / lg 52px`. Variant: `primary` (nền `brand-600`, chữ trắng) · `secondary` (viền `ink-200`, nền trắng) · `ghost` · `danger`. Bắt buộc có state `loading` (spinner + disable) và `disabled` (opacity 45%, bỏ shadow) |
| `FhStatusPill` | `radius-sm`, cao `24px`, padding `2/8`, chấm `6px` + nhãn `caption`. Map màu từ 7.5 |
| `FhCard` | Nền trắng, `radius-md`, viền `ink-200`, `shadow-e1`. Hover (nếu clickable) → `shadow-e2` + dịch lên `1px` |
| `FhStatCard` | Nhãn `overline` + số `display` font `--font-num` + delta (mũi tên ▲▼ + `+12%`) tô màu success/danger + sparkline 40×16. **Mọi stat card trong 1 hàng phải có đủ 3 phần** — không được cái có sparkline, cái không |
| `FhMoney` | Format `1.250.000 ₫`, font `--font-num`, `tabular-nums`. Prop `emphasis` cho tổng tiền |
| `FhCostBreakdown` | **Bắt buộc dùng ở mọi nơi hiện tiền.** Hiện 2 dòng Tiền công / Thiết bị–vật tư + 1 thanh segmented bar tỷ lệ (labor `brand-400`, parts `info-600`) + dòng tổng. Đây là hiện thân UI của `D-02` |
| `FhTable` | Header `overline` nền `ink-50` sticky, row cao `56px`, zebra tắt, hover `ink-25`. Cột tiền căn phải |
| `FhTimeline` | Dùng ở chi tiết đơn: mốc state + timestamp + actor + evidence thumbnail. Mốc đã qua `success-600`, mốc hiện tại `brand-600` có ring, mốc tương lai `ink-300` |
| `FhEvidenceUploader` | Drag & drop + chụp ảnh, preview lưới, đếm `2/1 ảnh tối thiểu`, chặn submit khi chưa đủ và **giải thích vì sao** |
| `FhCountdown` | Cho TTL invitation & TTL duyệt phát sinh. Dưới 5 phút chuyển `danger-600` |
| `FhMapPicker` | Google Maps: chọn/geocode địa chỉ + vẽ vòng geofence khi xem check-in |
| `FhEmptyState` | Icon `40px` trong tile `brand-50` + tiêu đề + 1 câu giải thích + CTA. **Cấm** empty state chỉ có chữ "Không có dữ liệu" |
| `FhSkeleton` | Skeleton theo đúng hình dạng nội dung thật, không dùng spinner toàn trang |
| `FhConfirmDialog` | Cho hành động không hoàn tác (huỷ đơn, reject phát sinh, lock user). Bắt buộc nêu hậu quả cụ thể, ví dụ "Bạn sẽ bị ghi 1 lần vi phạm (1/2)" |

## 7.8 Bộ trạng thái bắt buộc

Mọi màn hình có dữ liệu động **phải** thiết kế đủ 5 state, không được chỉ làm happy path:

| State | Yêu cầu |
|---|---|
| Loading | Skeleton đúng hình dạng, không nhảy layout khi có data |
| Empty | Giải thích cái gì sẽ hiện ở đây + CTA hành động đầu tiên |
| Error | Thông báo theo `error.code` + nút "Thử lại", không hiện lỗi kỹ thuật thô |
| Forbidden | Màn hình 403 riêng, nói rõ role hiện tại không có quyền gì |
| Overflow | Test với tên dài nhất, tiền lớn nhất, list 1 item và list 50 item |

## 7.9 Motion

- `fast 120ms` (hover, màu) · `base 200ms` (dropdown, tab) · `slow 320ms` (modal, drawer). Easing `cubic-bezier(.2,.8,.2,1)`.
- Chỉ animate `transform` và `opacity`.
- Tôn trọng `prefers-reduced-motion: reduce` → tắt mọi chuyển động không thiết yếu.

---

# P8 — ĐẶC TẢ MÀN HÌNH CHI TIẾT

Dưới đây là 10 màn hình rủi ro cao nhất. 42 màn còn lại theo cùng khuôn mẫu: mục đích → layout → field → validate → hành vi theo quyền → 5 state.

## 8.1 `/` Landing

**Mục đích:** chuyển người lạ thành booking, và tuyển Technician.

| Section | Nội dung | Ghi chú |
|---|---|---|
| Hero | H1 `display` + 1 câu phụ + form 1 dòng: [chọn dịch vụ ▾] [nhập địa chỉ] [Đặt lịch] | Form phải submit được ngay, không bắt đăng nhập trước |
| Trust bar | 4 chỉ số (số thợ đã xác minh, số đơn hoàn tất, đánh giá TB, thời gian phản hồi TB) | Dùng `FhStatCard` rút gọn — đủ 4 cái cùng format |
| Cách hoạt động | 4 bước có icon: Mô tả lỗi → AI gợi ý → Chọn thợ → Sửa & bảo hành | Icon cùng bộ, cùng stroke |
| Danh mục dịch vụ | Lưới 8 category, mỗi ô icon tile `brand-50` + tên + khoảng giá tham khảo | Khoảng giá **phải** có nhãn "giá tham khảo" |
| Cam kết | 3 cột: Không đặt cọc · Báo giá tách tiền công/vật tư · Bảo hành theo hạng mục | Đây là 3 điểm khác biệt thật của v2.0 |
| Dành cho thợ | Banner + CTA `/for-technicians` | |
| FAQ + Footer | Accordion 6 câu + footer đầy đủ | |

- Không dùng từ ngữ quảng cáo phóng đại kiểu "số 1", "tốt nhất Việt Nam".
- Hero mobile: form xếp dọc, CTA đủ `52px`.

## 8.2 `/app/bookings/new` — Wizard tạo booking

4 bước, có progress bar, **lưu nháp mỗi bước** (mất mạng không mất dữ liệu).

| Bước | Field | Validate |
|---|---|---|
| 1. Vấn đề | Category (lưới icon) → Service (radio card có khoảng giá) | Bắt buộc |
| 2. Mô tả | Textarea (min 20 ký tự, đếm ký tự) + upload ảnh (1–5 ảnh, ≤10MB, jpg/png/webp) + mức khẩn (4 chip) | Ảnh: preview + xoá được; nén client trước khi upload |
| 3. Địa điểm & thời gian | Chọn địa chỉ đã lưu **hoặc** thêm mới (`FhMapPicker`, auto geocode) + ngày/giờ mong muốn | Không cho chọn quá khứ; cảnh báo nếu ngoài vùng phục vụ |
| 4. Xác nhận | Tóm tắt + checkbox "Tôi hiểu giá cuối do Technician báo sau khi kiểm tra thực tế" | Checkbox bắt buộc |

- **Nút "Tạo yêu cầu" disable** nếu `bookingSuspendedUntil > now`, kèm banner đỏ: "Tài khoản đang tạm khoá đặt lịch đến `HH:mm dd/MM`. Lý do: 2 lần huỷ vi phạm."
- Không thu bất kỳ khoản tiền nào ở bước này (`D-01`). Nếu thấy UI cũ còn chữ "đặt cọc 50.000đ" → xoá.

## 8.3 `/app/bookings/:id/diagnosis` — Kết quả AI

- Banner cố định trên cùng: "Kết quả AI **chỉ mang tính tham khảo**. Giá và nguyên nhân cuối cùng do kỹ thuật viên xác định sau khi kiểm tra thực tế." — `warning-50`, icon info. **Không được ẩn, không được thu gọn.**
- Body: danh sách nguyên nhân khả thi (mỗi cái có thanh confidence, tất cả cùng format) + mức khẩn (`FhStatusPill`) + khoảng giá tham khảo (`FhCostBreakdown` ở chế độ "ước tính", nền gạch chéo nhẹ để phân biệt với báo giá thật) + dịch vụ gợi ý.
- **State `AI_UNAVAILABLE`:** không chặn luồng. Hiện: "Chưa phân tích được lúc này." + 2 nút `Thử lại` và `Bỏ qua, tìm thợ luôn`. Booking vẫn đi tiếp bình thường.
- Nút chính cuối trang: `Xem kỹ thuật viên phù hợp`.

## 8.4 `/app/bookings/:id/candidates` — Shortlist ≤5

**Đây là màn dễ sai nhất.**

- Header: "Đã chọn **2/5**" — dùng segmented strip 5 ô (ô đã chọn tô `brand-500`), không chỉ viết chữ.
- Mỗi Technician là 1 card: avatar, tên, badge đã xác minh, rating (sao + số lượt), số đơn đã làm, khoảng cách, kỹ năng khớp (chip), thời gian phản hồi TB, nút `Chọn` / `Bỏ chọn`.
- Mọi card phải có **cùng bộ thông tin**. Thiếu dữ liệu thì hiện `—`, không được bỏ trống dòng làm card cao thấp lệch nhau.
- Chọn ô thứ 6 → toast: "Tối đa 5 kỹ thuật viên." + rung nhẹ, không disable im lặng.
- Sau khi gửi lời mời: card chuyển sang trạng thái chờ, mỗi card có `FhCountdown` TTL và nút `Nhắn tin`.
- Khi 1 người accept: 4 card còn lại chuyển xám `CANCELLED`, hiện toast "Đã chốt kỹ thuật viên X", tự điều hướng sang `/app/orders/:id`. Realtime qua WebSocket; fallback polling 10s.
- Empty state: không có thợ phù hợp → giải thích lý do (ngoài vùng phục vụ / ngoài giờ làm) + CTA "Đổi thời gian mong muốn" hoặc "Liên hệ hỗ trợ".

## 8.5 `/app/orders/:id` — Chi tiết đơn (Customer)

Layout 2 cột (desktop `2fr / 1fr`), 1 cột trên mobile.

- **Cột trái:** `FhTimeline` toàn vòng đời (Tạo → Chốt thợ → Đang đến → Check-in `HH:mm` → Trước sửa (thumbnail) → Đang sửa → Phát sinh (nếu có) → Sau sửa → Hoàn tất). Mốc check-in hiện khoảng cách thật ("cách địa chỉ 42m ✓").
- **Cột phải, thứ tự từ trên xuống:**
  1. `FhStatusPill` + mã đơn + nút `Huỷ đơn` (ghost, không phải nút to màu đỏ).
  2. Card thợ: avatar, tên, SĐT (nút gọi), rating, nút `Nhắn tin`.
  3. `FhCostBreakdown`: Tiền công / Thiết bị–vật tư / thanh tỷ lệ / Tổng. Khi chưa có báo giá → "Chưa có báo giá".
  4. Card bảo hành: từng hạng mục + số ngày + ngày hết hạn.
- **Khi có phát sinh chờ duyệt:** banner dính đầu trang, `warning-50`, `FhCountdown`, 2 nút `Xem chi tiết` / `Duyệt`. Đây là hành động chặn tiến độ, phải nổi nhất trang.
- Nút `Huỷ đơn` mở `FhConfirmDialog` nói rõ hậu quả theo state hiện tại: ví dụ ở `EN_ROUTE` → "Kỹ thuật viên đang trên đường. Huỷ lúc này sẽ bị ghi **1 lần vi phạm (1/2)**. Đủ 2 lần sẽ tạm khoá đặt lịch 72 giờ." Bắt buộc nhập lý do.

## 8.6 `/app/orders/:id/additional-costs/:acId` — Duyệt phát sinh

Màn hình dính tiền, phải rõ ràng tuyệt đối.

| Khối | Nội dung |
|---|---|
| Lý do | Technician nhập, hiện nguyên văn |
| Bằng chứng | Lưới ảnh ADDITIONAL, bấm phóng to |
| Bảng hạng mục | Cột: Loại (pill LABOR/PARTS) · Mô tả · SL · Đơn giá · Thành tiền · Bảo hành |
| So sánh | 3 khối cạnh nhau: **Trước** (tiền công / vật tư) → **Tăng thêm** (+ màu `warning-600`) → **Sau khi duyệt** (`display`, đậm) |
| Bảo hành | Nêu rõ từng hạng mục được bảo hành bao nhiêu ngày |
| Hành động | `Từ chối` (secondary) · `Duyệt` (primary). `FhCountdown` TTL |

- Sau khi quyết: khoá màn hình ở chế độ chỉ đọc, gắn dấu `ĐÃ DUYỆT`/`ĐÃ TỪ CHỐI` + timestamp.
- Gọi lại API lần 2 → `ADDITIONAL_COST_ALREADY_DECIDED` → hiện trạng thái hiện tại, **không** báo lỗi đỏ.
- Nếu hết TTL → `EXPIRED`, hiện giải thích + gợi ý nhắn tin cho thợ tạo yêu cầu mới.

## 8.7 `/tech/invitations` — Hộp thư mời

- List row: tên dịch vụ + khoảng cách + thời gian mong muốn + `FhCountdown` + 2 nút `Từ chối` / `Nhận việc`.
- Row cao `~72px`, nút `36px`, icon `20px` — nút không được to hơn nội dung của chính row đó.
- Bấm vào row mở chi tiết: ảnh lỗi, mô tả, tóm tắt AI (kèm disclaimer), khoảng giá tham khảo, bản đồ, nút `Nhắn tin với khách`.
- **Thua race:** hiện dialog "Rất tiếc, đơn này đã được kỹ thuật viên khác nhận." + tự xoá row. Không hiện toast lỗi đỏ 409.
- Đang `workSuspendedUntil` → toàn bộ nút `Nhận việc` disabled + banner đếm ngược.

## 8.8 `/tech/jobs/:id` — Workspace thực thi

Đây là màn hình chính của Technician, thiết kế dạng **checklist tuần tự có khoá**, không phải form tự do.

```
[✓] 1. Nhận việc                              đã xong 09:12
[✓] 2. Bắt đầu di chuyển                      đã xong 09:20
[●] 3. Check-in tại nơi        ← đang làm     [Check-in GPS]
[ ] 4. Chụp ảnh trước sửa      (0/1)          🔒 cần hoàn tất bước 3
[ ] 5. Bắt đầu sửa                            🔒
[ ] 6. Phát sinh (nếu có)                     —
[ ] 7. Chụp ảnh sau sửa        (0/1)          🔒
[ ] 8. Hoàn tất + bảo hành                    🔒
```

- Bước bị khoá: opacity 45%, icon khoá, **kèm câu giải thích cần gì để mở** — không disable câm lặng.
- Check-in: xin quyền GPS, hiện độ chính xác đo được, sau khi gửi hiện "Cách địa chỉ 42m — Hợp lệ ✓". Nếu ngoài geofence: hiện khoảng cách thật + nút `Thử lại` + `Báo sự cố cho quản lý`, **không** cho tự xác nhận đã đến.
- Nút tạo phát sinh chỉ bật khi status = `UNDER_REPAIR`.
- Form hoàn tất: kết quả sửa + `warrantyDays` từng hạng mục (default từ config, max theo config) + ghi chú. Có warning nếu để BH ngắn bất thường (< 7 ngày).

## 8.9 `/console/orders` — Board vận hành (SM)

- Toolbar: ô tìm kiếm, filter (trạng thái, khu vực, thợ, khoảng ngày, cờ "có phát sinh chờ duyệt", "quá hạn"), chọn view Kanban ↔ Table.
- Kanban 6 cột theo state, màu header lấy đúng từ 7.5 — **màu ở filter chip, ở badge, ở cột phải trùng nhau tuyệt đối**.
- Card đơn trong cột: mã, dịch vụ, tên khách, tên thợ, thời gian ở state hiện tại, cờ cảnh báo (phát sinh chờ duyệt / check-in thất bại / quá hạn).
- Hàng stat trên cùng: 4 `FhStatCard` (Đơn hôm nay · Đang thực hiện · Chờ duyệt phát sinh · Huỷ hôm nay), **cả 4 đều có delta + sparkline**.
- Realtime: WebSocket đẩy update, card đổi cột có animation trượt `200ms`.

## 8.10 `/console/admin/config` — Cấu hình hệ thống

- Nhóm theo 6 mục: Matching · Geofence · Evidence · Cancellation & Strike · Tài chính · AI.
- Mỗi dòng: nhãn tiếng Việt dễ hiểu + key kỹ thuật (`caption`, màu `ink-500`) + input + đơn vị + giá trị mặc định + nút hoàn tác.
- **5 key thuộc TBD hiện badge `Chờ PO chốt`** màu `warning`.
- Đổi giá trị → dialog xác nhận nêu tác động: "Thay đổi này áp dụng cho đơn tạo **từ bây giờ**. Đơn đang chạy giữ giá trị cũ."
- Ghi audit log mọi lần đổi, hiện 5 thay đổi gần nhất ngay dưới mỗi nhóm.

---

# P9 — TÍCH HỢP AI (DEMO BẰNG API KEY)

## 9.1 Kiến trúc adapter (bắt buộc — để sau này thay model không đụng domain)

```ts
// src/modules/ai/ports/ai-diagnosis.port.ts
export interface AiDiagnosisPort {
  diagnose(input: DiagnoseInput): Promise<DiagnoseResult>;
}

export interface DiagnoseInput {
  images: { url: string; mimeType: string }[];
  description: string;
  serviceHint?: string;
}

export interface DiagnoseResult {
  possibleIssues:  { title: string; confidence: number }[];
  possibleCauses:  { title: string; confidence: number }[];
  urgency: UrgencyLevel;
  priceRangeMin: number;   // VND, integer
  priceRangeMax: number;
  suggestedServiceId?: string;
  modelInfo: { provider: string; model: string; latencyMs: number };
}
```

Adapter: `StubAdapter` (dev/test, deterministic) · `GeminiAdapter` · `OpenAiAdapter` · `FixHomeModelAdapter` (chỗ trống cho model tự train).
Chọn adapter bằng `system_config.ai.provider`, **không** bằng `if` rải rác trong service.

## 9.2 Luật cứng

1. Domain layer **chỉ** biết `AiDiagnosisPort`. Không import SDK provider ngoài `adapters/`.
2. Mọi output ép về JSON schema `DiagnoseResult`; parse fail → `AI_UNAVAILABLE`, **không** hiện text thô cho user.
3. Timeout `ai.timeout_ms`, retry tối đa 1 lần, không retry lỗi 4xx.
4. Rate limit `ai.rate_limit_per_user_per_hour` theo `userId`.
5. Log đầy đủ vào `ai_diagnoses` (provider, model, latency, confidence, rawResponse) để Admin monitor và để sau này làm dataset train.
6. API key **chỉ** ở `.env` của backend/ai-service. Cấm để ở `web`, cấm commit. `.env.example` chỉ có placeholder.
7. Giá AI trả về **không bao giờ** tự động thành `Quotation` (`D-12`).
8. Nếu `ai-service` (Python) chết → backend fallback thẳng sang `StubAdapter` ở môi trường demo, hoặc trả `AI_UNAVAILABLE` ở production. Không bao giờ để lỗi AI chặn tạo booking.

## 9.3 Env

```
AI_PROVIDER=stub|gemini|openai|fixhome
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TOKEN=<shared secret backend ↔ ai-service>
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

# P10 — NON-FUNCTIONAL

## 10.1 Security checklist

| # | Yêu cầu |
|---|---|
| 1 | Password `argon2id` (hoặc bcrypt cost ≥ 12) |
| 2 | Access token 15 phút; refresh 7 ngày trong httpOnly + SameSite=Lax cookie; rotate + revoke khi logout |
| 3 | **Không nhận** `role`/`status`/`userId`/`price` từ body — luôn lấy từ token và DB |
| 4 | `class-validator` + `whitelist: true` + `forbidNonWhitelisted: true` trên mọi DTO |
| 5 | Rate limit: login `5/phút/IP`, AI theo config, upload `20/giờ/user` |
| 6 | Upload: whitelist mime, giới hạn dung lượng, strip EXIF, tên file random, không dùng tên file gốc |
| 7 | Không lộ ID không thuộc phạm vi → trả `404` |
| 8 | Helmet, CORS whitelist origin cụ thể, **không** `origin: *` |
| 9 | Transaction bắt buộc cho: accept invitation, approve additional cost, complete order, cancel + strike |
| 10 | Audit log cho: lock user, assign override, đổi config, huỷ đơn, waive strike, thay đổi giá |
| 11 | Không log PII (mật khẩu, token, toạ độ chính xác) ra stdout |
| 12 | Secret chỉ qua env/GitHub Secrets; bật secret scanning trên repo |

## 10.2 Performance budget

| Chỉ số | Ngưỡng |
|---|---|
| API p95 (đọc) | < 300ms |
| API p95 (ghi) | < 600ms |
| AI diagnosis | < 15s (async, có skeleton) |
| Web LCP | < 2.5s (4G) |
| Bundle initial | < 250KB gzip; route lazy-load |
| Query N+1 | Cấm — dùng `relations` hoặc query builder, có test đếm query cho list endpoint |

## 10.3 i18n & a11y

- `vue-i18n`, key dạng `order.status.under_repair`. **Cấm hard-code chuỗi tiếng Việt trong component.** Mặc định `vi`, chuẩn bị sẵn `en`.
- Tiền: `Intl.NumberFormat('vi-VN')`. Ngày: `dd/MM/yyyy HH:mm`, timezone `Asia/Ho_Chi_Minh`.
- A11y: contrast ≥ 4.5:1 (kiểm tra riêng cam trên trắng — `brand-600` đạt, `brand-400` **không** đạt cho chữ nhỏ); focus ring `2px brand-500` nhìn thấy rõ; mọi icon-button có `aria-label`; modal khoá focus + đóng bằng `Esc`; form lỗi gắn `aria-describedby`.

---

# P11 — TEST PLAN

## 11.1 Tầng test & ngưỡng

| Tầng | Công cụ | Ngưỡng |
|---|---|---|
| Unit (backend) | Vitest | ≥ 80% ở `service/`, **100% ở money calculator và state machine** |
| Integration | Vitest + Postgres thật (docker) | Toàn bộ guard & transaction |
| E2E API | Vitest + supertest | 14 acceptance ở 11.3 |
| Unit (web) | Vitest + Vue Test Utils | Store, guard, formatter |
| E2E UI | Playwright | 5 luồng chính |

## 11.2 RBAC negative matrix (bắt buộc, mỗi ô là 1 test case)

| Hành vi tấn công | Kỳ vọng |
|---|---|
| Customer A đọc order của Customer B | `404 OWNERSHIP_DENIED` |
| Customer tự gọi `/en-route` | `403 RBAC_FORBIDDEN` |
| Technician không được assign gọi `/evidence` | `404` |
| Candidate thua đọc `/threads/:id/messages` | `404` (thread đã đóng) |
| Technician gọi `/additional-costs/:id/decision` | `403` |
| Customer sửa `unitPrice` của additional cost đã approve | `409 ADDITIONAL_COST_IMMUTABLE` |
| Technician PUT warranty giảm số ngày đã approve | `409 WARRANTY_CANNOT_SHORTEN` |
| Client gửi `role: ADMIN` trong `PATCH /me` | Bị strip, role không đổi |
| Client gửi `status: COMPLETED` trong `PATCH /orders/:id` | `409` / field bị từ chối |
| SM đổi `system_config` | `403` (chỉ Admin ghi) |
| Customer bị suspend gọi `POST /bookings` | `403 BOOKING_SUSPENDED` |
| Technician bị suspend gọi `/invitations/:id/respond` | `403 WORK_SUSPENDED` |
| Gọi bất kỳ API nào với JWT hỏng / hết hạn | `401` |
| Gọi API không kèm JWT | `401` |
| Approve additional cost đã `APPROVED` lần nữa | `409 ADDITIONAL_COST_ALREADY_DECIDED` |
| Customer approve additional cost của order Customer khác | `404 OWNERSHIP_DENIED` |
| Rating khi order chưa `COMPLETED` | `409 ORDER_INVALID_TRANSITION` |
| Rating lần thứ hai cho cùng order | `409` (unique constraint + check ở service) |
| Đổi state nhưng `order_status_history` không được ghi | Test integration: đếm row history sau mỗi transition, lệch → fail |
| Gán permission cho role qua API mà không phải Admin | `403` |

## 11.3 Acceptance — map 1-1 với Baseline v2.0 §13

| ID | Tiêu chí | Test |
|---|---|---|
| `AC-01` | Không còn yêu cầu thanh toán 50.000đ khi tạo booking | E2E: tạo booking thành công, response không có field nào chứa `deposit`; grep toàn repo không còn `deposit` |
| `AC-02` | Không shortlist quá 5 | Gửi 6 id → `422 SHORTLIST_LIMIT_EXCEEDED` |
| `AC-03` | 2 Technician accept đồng thời không tạo 2 assignment | Test song song 5 request: đúng 1 thành công, 4 nhận `409`; DB đúng 1 row `isActive` |
| `AC-04` | Candidate bị đóng invitation không truy cập được booking/chat | Sau assign, candidate thua gọi `GET /bookings/:id` và `/threads/:id/messages` → `404` |
| `AC-05` | Không vào Under Repair / Complete khi thiếu evidence | Bỏ ảnh → `409 EVIDENCE_REQUIRED_BEFORE` / `_AFTER` |
| `AC-06` | Additional cost line bắt buộc LABOR hoặc PARTS_EQUIPMENT | Gửi item thiếu `type` → `422` |
| `AC-07` | Reject phát sinh → item không vào invoice | Reject rồi complete: invoice không chứa item đó, tổng không đổi |
| `AC-08` | Approved additional cost không bị Technician sửa giá | PATCH giá → `409 ADDITIONAL_COST_IMMUTABLE`; revise tạo record mới có `supersedesId` |
| `AC-09` | Customer đủ 2 strike → chặn tạo booking | Seed 2 strike → `403 BOOKING_SUSPENDED`, `bookingSuspendedUntil` đúng +72h |
| `AC-10` | Technician quá 2 strike → chặn nhận việc | Tương tự với `workSuspendedUntil` |
| `AC-11` | Check-in ngoài geofence không đủ điều kiện compensation | Toạ độ cách 5km → `result = OUT_OF_GEOFENCE`; huỷ sau đó → `compensationStatus = NOT_ELIGIBLE` |
| `AC-12` | Huỷ sau check-in hợp lệ → compensation eligible + priority boost | `compensationStatus = ELIGIBLE`, `reliabilityScore` tăng |
| `AC-13` | Warranty được snapshot, không rút ngắn được | Approve 90 ngày → sửa còn 30 → `409`; `invoice_items.warrantyDaysSnapshot = 90` |
| `AC-14` | Invoice tính đúng labor và parts riêng | Kịch bản base(300k labor + 200k parts) + approved(120k labor + 180k parts) + rejected(500k) → `laborTotal = 420000`, `partsTotal = 380000`, `grandTotal = 800000` |

### Bổ sung v2.0 (từ PROJECT_OVERVIEW)

| ID | Tiêu chí | Test |
|---|---|---|
| `AC-15` | Seed RBAC khớp tài liệu | Đếm row `role_permissions` = số ô ✅ ở bảng P5.2; mọi `permissions.code` khớp regex `^[a-z_]+:[a-z_]+$` (`D-17`) |
| `AC-16` | Mọi transition ghi history trong cùng transaction | Chạy đủ 4 transition hợp lệ → `order_status_history` có đúng 4 row, đúng `fromStatus/toStatus/actor`. Giả lập lỗi giữa transaction → rollback cả state lẫn history |
| `AC-17` | Chatbot không thực hiện được hành động nghiệp vụ | Gửi "duyệt giúp tôi khoản phát sinh" → response chỉ có `suggestedAction`, DB không đổi; xác nhận chatbot không có tool ghi |
| `AC-18` | Repair History không phải bảng riêng | Grep schema: không tồn tại bảng `repair_histories`; `GET /repair-history` trả dữ liệu join từ order/invoice/review |

## 11.4 5 luồng E2E UI (Playwright)

1. Khách vãng lai → landing → đăng ký → tạo booking → AI → shortlist 3 → chat → được accept → theo dõi.
2. Technician nhận mời → en route → check-in → ảnh trước → sửa → phát sinh → chờ duyệt.
3. Customer duyệt phát sinh → Technician hoàn tất → invoice đúng số → thanh toán demo → đánh giá.
4. Customer huỷ sau check-in → strike ghi nhận → đủ 2 strike → bị chặn tạo booking, banner hiện đúng.
5. Admin đổi `geofence.radius_meters` → check-in mới áp ngưỡng mới → audit log ghi nhận.

## 11.5 Checklist UI trước khi coi là xong (chạy cho mọi màn hình)

| # | Câu hỏi |
|---|---|
| 1 | Có tái dùng component có sẵn không, hay tự dựng bản song song của card/badge/modal đã có? |
| 2 | Có khối nào 3+ dòng chữ cùng cỡ cùng weight không? Có dòng nào thực ra là tỷ lệ/trạng thái nên vẽ thành bar/pill? |
| 3 | Các phần tử anh em có cùng cách trình bày không (cái có icon cái không, cái có sparkline cái không)? |
| 4 | Mọi thứ bấm được có ≥ 44px và cách nhau đủ không? Có cái nào phình quá (>60px) không? |
| 5 | Có chỗ nào chật không — và cách sửa là thêm khoảng trắng hay bớt nội dung? |
| 6 | Màu trạng thái có khớp đúng bảng 7.5 ở cả filter, badge và cột không? |
| 7 | Container có padding bọc row đã có padding → gap ở mép có bị cộng dồn không? |
| 8 | Đã thiết kế đủ 5 state (loading/empty/error/forbidden/overflow) chưa, hay mới chỉ có happy path? |
| 9 | Tiêu đề trang, nhãn section và card có cùng một mép trái không? |
| 10 | Cỡ chữ dùng có nằm trong 7 bậc ở 7.3 không? |

---

# P12 — DEVOPS

## 12.1 Môi trường

| Env | DB | AI | Payment |
|---|---|---|---|
| `local` | Docker Postgres 16 | `stub` | `DEMO` |
| `ci` | Postgres service container | `stub` | `DEMO` |
| `staging` | Managed Postgres | `gemini`/`openai` (key demo) | `DEMO` |

Env bổ sung (`D-23`, Overview §3.6/§3.7):
```
STORAGE_PROVIDER=cloudinary|firebase     # chọn 1, không chạy song song
CLOUDINARY_URL=
FIREBASE_STORAGE_BUCKET=
GOOGLE_MAPS_API_KEY=                     # chỉ ở server; web dùng key riêng có HTTP referrer restriction
WS_ENABLED=true
```
Key Google Maps dùng ở `web` phải là key **riêng, đã giới hạn referrer + giới hạn API**, không dùng chung key server.

## 12.2 CI gate (cả 2 repo, chặn merge)

```yaml
jobs: lint → typecheck → test → build → test:e2e (backend, cần Postgres service)
```
Thêm: `npm audit --audit-level=high`, chặn file > 1MB, chặn commit chứa `API_KEY=` có giá trị thật.

## 12.3 Seed demo (bắt buộc, để quay video bảo vệ đồ án)

```
npm run seed:demo
```
Tạo: 24 config · 6 category · 18 service · 1 admin · 2 SM · 12 technician (có skill/area/schedule) · 8 customer (1 đang bị suspend để demo) · 15 order rải đủ 6 state · 3 additional cost (1 pending, 1 approved, 1 rejected) · 2 check-in (1 valid, 1 ngoài geofence) · 4 review · 30 audit log.
Tài khoản demo in ra console sau khi seed.

## 12.4 Git convention

- Branch: `feat/<phase>-<module>`, `fix/<issue>`, `chore/<task>`.
- Commit: Conventional Commits.
- PR template bắt buộc có: ticket ID · mục nào của brief · test đã thêm · docs đã cập nhật (P13) · ảnh chụp màn hình (nếu là web).
- Cấm push thẳng `main`. Cần 1 approve.

---

# P13 — CẬP NHẬT DOCS (thực hiện sau khi build xong mỗi phase)

## 13.1 File phải tạo/cập nhật trong repo `docs`

| File | Nội dung | Nguồn |
|---|---|---|
| `business/baseline-v2.md` | Giữ nguyên bản v2.0 | Có sẵn |
| `business/rbac-v2.md` | **Thay thế** RBAC v1 | P5 của brief này |
| `business/open-questions.md` | 5 TBD + default đang dùng + ai cần chốt | P2.2 |
| `architecture/overview.md` | Sơ đồ 5 repo, luồng gọi, ranh giới AI | P1, P9 |
| `architecture/erd.md` | ERD + bảng entity | P3 |
| `architecture/state-machine.md` | Bảng transition + guard | P5.4 |
| `api/contract.md` | Bảng endpoint + error catalog | P4 |
| `design/design-system.md` | Token, type scale, component spec | P7 |
| `design/screens.md` | Screen inventory 52 màn + spec | P6, P8 |
| `qa/test-plan.md` | Tầng test + RBAC negative matrix | P11.1–11.2 |
| `qa/acceptance.md` | Bảng AC-01..AC-14 + trạng thái pass/fail | P11.3 |
| `ops/runbook.md` | Env, seed, CI, troubleshooting | P12 |
| `business/project-overview.md` | Bản Overview, đánh dấu rõ phần nào là nguyên tắc (bậc 3) và phần nào là ví dụ (bậc 6) | Overview + P1.2 |
| `architecture/ai-service.md` | Adapter, contract FastAPI, fallback, guardrail chatbot | P9, P4.9b |
| `api/naming-decisions.md` | Bảng ánh xạ endpoint `D-19`, chống tạo duplicate | P4.1 |
| `traceability.md` | Ma trận truy vết | 13.2 |

## 13.2 Ma trận truy vết (cập nhật mỗi khi đổi 1 rule)

| Business Rule | RBAC | API | DB | UI | Test |
|---|---|---|---|---|---|
| `D-01` không deposit | — | `POST /bookings` | xoá field deposit | 8.2 | `AC-01` |
| `D-02` tách labor/parts | `additional_cost:create` | `/additional-costs` | `*_items.type` | `FhCostBreakdown` | `AC-06`, `AC-14` |
| `D-03` shortlist ≤5 | `invitation:shortlist` | `/shortlist` | `booking_invitations` | 8.4 | `AC-02` |
| `D-04` 1 assignment | `invitation:respond` | `/invitations/:id/respond` | partial unique index | 8.4 | `AC-03` |
| `D-07` evidence gating | `evidence:upload` | `/start-repair`, `/complete` | `repair_evidences` | 8.8 | `AC-05` |
| `D-08` warranty snapshot | `warranty:define` | `PUT /warranty` | `warrantyDaysSnapshot` | 8.5, 8.8 | `AC-13` |
| `D-10` arrival verification | `arrival_checkin:create` | `/check-in` | `arrival_check_ins` | 8.8 | `AC-11`, `AC-12` |
| `D-11` immutable sau approve | `additional_cost:revise` | `/revise` | `supersedesId` | 8.6 | `AC-08` |
| `D-18` RBAC DB-backed | toàn bộ P5.2 | seed Phase 0 | `roles`,`permissions`,`role_permissions` | menu theo `/me` | `AC-15` |
| `D-21` chatbot guardrail | `chatbot:use` | `/ai/conversations/:id/messages` | `ai_conversations` | `FhChatbotWidget` | `AC-17` |
| `D-22` status history | `order:read_status_history` | `/status-history` | `order_status_history` | `FhTimeline` (8.5) | `AC-16` |
| `D-20` history dẫn xuất | `history:read_related` | `/repair-history` | *(không bảng)* | `/app/history` | `AC-18` |

**Luật:** đổi 1 ô trong ma trận này thì phải kiểm tra và cập nhật cả hàng. Đây là cách chống lệch giữa tài liệu và code.

## 13.3 Ticket dọn dẹp ngay (làm trước Phase 1)

| ID | Việc |
|---|---|
| `CHORE-001` | Sửa link chéo chết trong 4 README: `web`, `backend`, `mobile`, `ai-service`, `docs` (GAP-06) |
| `CHORE-002` | Viết lại `web/README.md`: không phải "Admin Dashboard" mà là web 4 role + landing (GAP-07) |
| `CHORE-003` | Bổ sung `AGENTS.md` của cả 2 repo một dòng: "Mọi thay đổi nghiệp vụ phải tuân theo `docs/BUILD-BRIEF.md`" |
| `CHORE-004` | Grep xoá sạch mọi tàn dư `deposit`, `bookingGuarantee`, `noDeposit` |
| `CHORE-005` | Đánh dấu `docs` RBAC v1 là `DEPRECATED`, trỏ sang `rbac-v2.md` |
| `CHORE-006` | Nếu backend đã có endpoint theo tên Overview §25 → đổi sang tên canonical `D-19`, cập nhật consumer ở `web`, **không** để tồn tại song song 2 tên |
| `CHORE-007` | Nếu đã có permission theo quy ước cũ (`booking:read:own`) → migrate sang `D-17` (`booking:read_own`) ở cả seed, decorator và DB |
| `CHORE-008` | Chọn dứt điểm Cloudinary **hoặc** Firebase (`D-23`), xoá code của bên còn lại nếu đã lỡ cắm cả hai |

---

# PHỤ LỤC A — PROMPT MẪU CHO AGENT

**Bootstrap**
```
Đọc docs/BUILD-BRIEF.md phần P0, P1, P2, P3, P12.
Thực thi Phase 0 trong repo backend: module config (bảng system_config + seed 24 key
ở P2.3), error envelope + error code catalog ở P4.2, audit log interceptor, seed:demo,
CI xanh đủ 5 gate.
Không tạo module nghiệp vụ nào khác. Báo cáo lại danh sách file đã tạo trước khi commit.
```

**Build 1 module backend**
```
Đọc BUILD-BRIEF P3 (entity <X>), P4 (endpoint <X>), P5 (permission + state guard), P11.2.
Build module <X> trong repo backend.
Bắt buộc: DTO validate whitelist, guard đủ 5 lớp ở P5.1, transaction cho thao tác ghi
nhiều bảng, unit test cho service, e2e test cho mọi dòng RBAC negative liên quan.
Không hard-code ngưỡng — đọc từ ConfigService.
```

**Build 1 màn hình web**
```
Đọc BUILD-BRIEF P6 (route), P7 (design system), P8 (spec màn <Y>), P11.5.
Build màn <Y> trong repo web bằng component có sẵn ở src/components/ui trước khi tự tạo mới.
Bắt buộc đủ 5 state ở P7.8. Dùng đúng token ở P7.2, không viết hex trực tiếp.
Chạy checklist P11.5, trả lời từng câu, rồi mới báo xong.
```

**Audit**
```
Đọc BUILD-BRIEF P5 và P11.
Audit module <X>: liệt kê mọi sai lệch so với brief (thiếu guard, hard-code config,
field tiền gộp, thiếu test, state transition sai).
CHỈ báo cáo dạng bảng, CHƯA sửa gì. Chờ tôi duyệt.
```

# PHỤ LỤC B — DEFINITION OF DONE

Gộp 8 mục của v1.0 với 16 mục của Overview §36. Một ticket chỉ xong khi đủ **14** mục:

**Rõ ràng nghiệp vụ**
1. Requirement, actor, permission, ownership/scope, business rule — đều rõ, không suy diễn.
2. Không tạo chức năng trùng với thứ đã có trong repo.

**Đúng kỹ thuật**
3. Code đúng spec brief; không hard-code config/ngưỡng/số tiền.
4. Database relation đúng; migration đã kiểm tra.
5. API đúng REST convention và đúng tên canonical `D-19`.
6. DTO validation đầy đủ (`whitelist`, `forbidNonWhitelisted`).
7. Authorization đủ 5 lớp P5.1; state machine được validate nếu liên quan.
8. Transaction có nếu đụng nhiều bảng; transition có ghi `order_status_history`.
9. Error handling theo catalog P4.2, không trả lỗi thô.

**Kiểm chứng**
10. Unit + e2e test đã thêm; CI xanh đủ 5 gate; RBAC negative case liên quan đã có test.
11. (Web) Gọi đúng API, đủ 5 state P7.8, đã chạy checklist P11.5 và trả lời từng câu.

**Không phá thứ đang chạy**
12. Không phá module hiện có; backward compatible nếu có thể.

**Tài liệu**
13. Docs ở P13 đã cập nhật + ma trận truy vết đã cập nhật cả hàng.
14. PR nêu rõ mục nào của brief, kèm ảnh chụp màn hình nếu là web, và báo cáo theo Phụ lục C.

# PHỤ LỤC C — MẪU BÁO CÁO THAY ĐỔI (Overview §37)

Mọi PR/lượt trả lời của agent phải báo cáo đúng **9 mục** này, không báo kiểu "đã xong":

```
1. Files changed          — danh sách file
2. Why                    — lý do từng file thay đổi
3. Business rule          — rule nào được implement, trích ID (D-xx / AC-xx)
4. API changes            — endpoint thêm/đổi/xoá, có breaking không
5. Database changes       — bảng/cột/index/migration
6. Authorization changes  — permission, guard, seed RBAC
7. State machine impact   — transition nào bị ảnh hưởng, history có ghi không
8. Tests                  — test thêm/sửa, kết quả CI
9. Remaining risks / OPEN ITEMS — cái gì còn treo, cần ai quyết
```

---

*Hết. Mọi mâu thuẫn giữa tài liệu này và Business Baseline v2.0 → Baseline thắng, và phải mở `OPEN-QUESTION` để sửa brief. Mâu thuẫn giữa tài liệu này và PROJECT_OVERVIEW → áp thang ưu tiên P1.2, không tự quyết.*
