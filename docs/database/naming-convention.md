# FixHome – Database Conventions

## 1. Naming Standards
- **Table Names**: `snake_case`, số nhiều (plural). Ví dụ: `users`, `technicians`, `service_orders`, `quotations`.
- **Column Names**: `snake_case`. Ví dụ: `created_at`, `updated_at`, `full_name`, `phone_number`.
- **Primary Keys**: Luôn là `id` với kiểu `UUID v4` sinh tự động (`@PrimaryGeneratedColumn('uuid')`).
- **Foreign Keys**: Định dạng `<tên_bảng_số_ít>_id`. Ví dụ: `user_id`, `technician_id`, `service_order_id`.
- **Timestamps**: Mọi entity kế thừa `BaseEntity` gồm `id`, `created_at`, `updated_at`.

## 2. Migration Guidelines
- Không bao giờ bật `synchronize: true` trên môi trường Production / Staging.
- Tạo migration mới bằng lệnh:
  ```bash
  npm run migration:generate -- src/database/migrations/<MigrationName>
  ```
- Chạy migration:
  ```bash
  npm run migration:run
  ```
- Hoàn tác migration gần nhất:
  ```bash
  npm run migration:revert
  ```
