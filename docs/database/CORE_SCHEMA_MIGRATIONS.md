# FixHome — Core Database Schema & Migrations

> **Owner**: Member 1 (Core Platform / Security / Integration)  
> **Status**: INITIAL BASELINE EXECUTED  
> **Last Updated**: 2026-09-09

Tài liệu này quy chuẩn cấu trúc cơ sở dữ liệu nền tảng cho danh tính (Identity) và phiên xác thực (Authentication Session) của hệ thống FixHome.

---

## 1. Nguyên Tắc Thiết Kế Database (Database Principles)

1. **Khóa chính**: Luôn là `id` UUID v4 sinh tự động (`uuid_generate_v4()`).
2. **Kế thừa BaseEntity**: Mọi bảng đều có `created_at` và `updated_at` kiểu `TIMESTAMP WITH TIME ZONE DEFAULT now()`.
3. **Naming Standards**:
   - Tên bảng: `snake_case`, số nhiều (ví dụ: `users`, `refresh_tokens`).
   - Tên cột: `snake_case` (ví dụ: `password_hash`, `token_hash`, `device_info`).
   - Khóa ngoại: `<tên_bảng_số_ít>_id` (ví dụ: `user_id`).
4. **Không bật `synchronize: true` trên Production / Staging**: Mọi thay đổi schema đều phải qua TypeORM migration.

---

## 2. Các Bảng Thuộc Phạm Vi Member 1

### A. Bảng `users`
Bảng quản lý tài khoản người dùng của toàn bộ hệ thống (Customer, Technician, Service Manager, Admin).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính sinh tự động |
| `email` | `VARCHAR` | `NOT NULL`, `UNIQUE INDEX` | Email đăng nhập duy nhất |
| `password_hash` | `VARCHAR` | `NOT NULL` | Mật khẩu băm (bcrypt) |
| `full_name` | `VARCHAR` | `NOT NULL` | Họ và tên người dùng |
| `phone_number` | `VARCHAR` | `NULLABLE`, `UNIQUE INDEX` | Số điện thoại duy nhất (khi có) |
| `role` | `users_role_enum` | `DEFAULT 'customer'`, `INDEX` | `customer`, `technician`, `service_manager`, `admin` |
| `status` | `users_status_enum` | `DEFAULT 'active'`, `INDEX` | `active`, `locked`, `suspended` |
| `is_active` | `BOOLEAN` | `DEFAULT true` | Cờ kích hoạt nhanh |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Thời gian cập nhật |

### B. Bảng `refresh_tokens`
Bảng lưu trữ phiên làm việc và mã Refresh Token phục vụ xác thực đa thiết bị (Web + Mobile) và hỗ trợ thu hồi tức thì khi Logout hoặc khóa tài khoản.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính sinh tự động |
| `user_id` | `UUID` | `NOT NULL`, `FK users(id) ON DELETE CASCADE`, `INDEX` | Tham chiếu người dùng sở hữu token |
| `token_hash` | `VARCHAR` | `NOT NULL`, `INDEX` | SHA-256 hash của chuỗi Refresh Token (không lưu plaintext) |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Thời điểm token hết hạn |
| `is_revoked` | `BOOLEAN` | `DEFAULT false` | Cờ thu hồi token |
| `device_info` | `VARCHAR` | `NULLABLE` | Thông tin thiết bị (ví dụ: Mobile App, Chrome on Windows) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Thời gian cấp token |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Thời gian cập nhật |

---

## 3. Lệnh Quản Lý Migration

TypeORM migration được cấu hình chạy qua CLI độc lập tại `src/database/data-source.ts`:

- **Chạy toàn bộ migration chưa chạy**:
  ```bash
  npm run migration:run
  ```
- **Kiểm tra danh sách trạng thái migrations**:
  ```bash
  npx typeorm-ts-node-commonjs migration:show -d src/database/data-source.ts
  ```
- **Hoàn tác migration gần nhất**:
  ```bash
  npm run migration:revert
  ```
- **Sinh migration tự động từ entities**:
  ```bash
  npx typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts src/database/migrations/<MigrationName>
  ```

---

## 4. Migration: ServiceCatalogAndVerification (`1725889000000-ServiceCatalogAndVerification.ts`)

Migration này bổ sung 4 bảng thuộc phạm vi Member 1: Danh mục dịch vụ và Hồ sơ xác minh thợ.

### 4.1 Bảng `service_categories`
- `id`: UUID (PK, DEFAULT `uuid_generate_v4()`)
- `name`: VARCHAR NOT NULL (Tên danh mục)
- `code`: VARCHAR NOT NULL UNIQUE (Mã danh mục, Index)
- `description`: TEXT NULLABLE (Mô tả)
- `is_active`: BOOLEAN NOT NULL DEFAULT true (Index)
- `created_at`, `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

### 4.2 Bảng `services`
- `id`: UUID (PK, DEFAULT `uuid_generate_v4()`)
- `category_id`: UUID NOT NULL, FK `service_categories(id)` ON DELETE RESTRICT (Index)
- `name`: VARCHAR NOT NULL (Tên dịch vụ)
- `code`: VARCHAR NOT NULL UNIQUE (Mã dịch vụ, Index)
- `description`: TEXT NULLABLE (Mô tả chi tiết)
- `base_price`: NUMERIC(12,2) NULLABLE (Giá cơ bản chuẩn)
- `min_price`: NUMERIC(12,2) NULLABLE (Giá sàn)
- `max_price`: NUMERIC(12,2) NULLABLE (Giá trần)
- `is_active`: BOOLEAN NOT NULL DEFAULT true (Index)
- `created_at`, `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

### 4.3 Bảng `technician_verifications`
- `id`: UUID (PK, DEFAULT `uuid_generate_v4()`)
- `technician_id`: UUID NOT NULL, FK `users(id)` ON DELETE CASCADE (Index)
- `status`: ENUM (`pending`, `approved`, `rejected`), DEFAULT `pending` (Index)
- `submitted_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `reviewed_at`: TIMESTAMPTZ NULLABLE
- `reviewed_by`: UUID NULLABLE, FK `users(id)` ON DELETE SET NULL
- `rejection_reason`: TEXT NULLABLE
- `created_at`, `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

### 4.4 Bảng `verification_documents`
- `id`: UUID (PK, DEFAULT `uuid_generate_v4()`)
- `verification_id`: UUID NOT NULL, FK `technician_verifications(id)` ON DELETE CASCADE (Index)
- `document_type`: ENUM (`citizen_id_front`, `citizen_id_back`, `certificate`, `portfolio`, `other`)
- `file_url`: VARCHAR NOT NULL (Đường dẫn tài liệu)
- `file_name`: VARCHAR NOT NULL (Tên file gốc)
- `file_size`: INT NOT NULL (Kích thước bytes)
- `mime_type`: VARCHAR NOT NULL (Loại MIME)
- `created_at`, `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
