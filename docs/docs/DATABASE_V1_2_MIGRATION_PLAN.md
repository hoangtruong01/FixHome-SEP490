# FIXHOME v1.2 — DATABASE MIGRATION PLAN

**Tài liệu:** Kế hoạch nâng cấp và đồng bộ cơ sở dữ liệu  
**Phiên bản đích:** Specification v1.2 Baseline  
**Hệ quản trị CSDL:** PostgreSQL (Supabase Connection Pooler)  
**ORM:** TypeORM  

---

## 1. Mục tiêu & Nguyên tắc

1. **Tuân thủ Specification v1.2:** Cung cấp đầy đủ cấu trúc bảng, enum, cột và ràng buộc để hỗ trợ luồng nghiệp vụ v1.2 (loại bỏ `PENDING_CONFIRMATION` khỏi ServiceOrder, hỗ trợ `FIXED_PRICE`, snapshot đơn giá/số lượng/phạm vi, quy trình thanh toán tiền mặt `CashSettlement`, công nợ hoa hồng `CommissionDue`, và bảo hành `WarrantyClaim`).
2. **Bảo toàn dữ liệu lịch sử:** Không thực hiện `DROP TABLE` hoặc xóa dữ liệu tài chính/lịch sử đơn hàng hiện có.
3. **Tính tương thích ngược (Backward Compatibility):** Các trường mới thêm đều có giá trị mặc định (`DEFAULT`) hoặc cho phép `NULL` có kiểm soát để dữ liệu seed/demo hiện tại tiếp tục hoạt động trơn tru.

---

## 2. Danh mục thay đổi Enum (`ENUM CHANGES`)

### 2.1 Enum `service_order_status_enum`
- **Hiện tại:** `('pending_confirmation', 'accepted', 'en_route', 'under_repair', 'completed', 'cancelled')`
- **Thay đổi v1.2:** Loại bỏ giá trị `pending_confirmation` khỏi enum sử dụng trong ServiceOrder (chuẩn hóa thành `('accepted', 'en_route', 'under_repair', 'completed', 'cancelled')`).
- **Xử lý dữ liệu:**
  ```sql
  -- Chuyển đổi các đơn đang ở pending_confirmation (nếu có) thành accepted hoặc cancelled
  UPDATE service_orders SET status = 'accepted' WHERE status = 'pending_confirmation';
  ```

### 2.2 Enum mới: `service_pricing_mode_enum`
- **Tạo mới:**
  ```sql
  CREATE TYPE service_pricing_mode_enum AS ENUM ('fixed_price', 'inspection_required');
  ```

### 2.3 Enum mới: `cash_settlement_status_enum`
- **Tạo mới:**
  ```sql
  CREATE TYPE cash_settlement_status_enum AS ENUM ('pending_confirmation', 'confirmed', 'disputed');
  ```

### 2.4 Enum mới: `commission_due_status_enum`
- **Tạo mới:**
  ```sql
  CREATE TYPE commission_due_status_enum AS ENUM ('pending', 'paid', 'cancelled');
  ```

### 2.5 Enum mới: `warranty_claim_status_enum`
- **Tạo mới:**
  ```sql
  CREATE TYPE warranty_claim_status_enum AS ENUM ('open', 'reviewing', 'rework', 'resolved', 'rejected');
  ```

---

## 3. Danh mục sửa đổi bảng hiện có (`TABLES MODIFY`)

### 3.1 Bảng `services`
Bổ sung các cột phục vụ mô hình định giá v1.2:
- `pricing_mode`: `service_pricing_mode_enum NOT NULL DEFAULT 'inspection_required'`
- `unit`: `VARCHAR(50) NULL` (ví dụ: "Máy", "Bình", "Cái", "Bộ", "Lần")
- `fixed_price`: `NUMERIC(12, 2) NULL`
- `scope_description`: `TEXT NULL`

### 3.2 Bảng `technician_skills` (hoặc mở rộng làm `TechnicianService`)
Bổ sung các cột phục vụ khai báo giá công tham khảo:
- `listed_labor_price`: `NUMERIC(12, 2) NULL` (giá công thợ niêm yết cho dịch vụ INSPECTION_REQUIRED)
- `typical_warranty_days`: `INT NULL DEFAULT 30`
- `is_active`: `BOOLEAN NOT NULL DEFAULT true`

### 3.3 Bảng `bookings`
Bổ sung các cột snapshot giá và khung giờ:
- `preferred_time_window`: `VARCHAR(100) NULL` (ví dụ: "08:00 - 10:00", "14:00 - 16:00")
- `pricing_mode_snapshot`: `service_pricing_mode_enum NULL`
- `fixed_unit_price_snapshot`: `NUMERIC(12, 2) NULL`
- `quantity`: `INT NOT NULL DEFAULT 1`
- `scope_snapshot`: `TEXT NULL`

### 3.4 Bảng `service_orders`
- Thay đổi giá trị mặc định của cột `status`:
  ```sql
  ALTER TABLE service_orders ALTER COLUMN status SET DEFAULT 'accepted';
  ```
- Bổ sung trường snapshot hình thức tính giá:
  - `pricing_mode_snapshot`: `service_pricing_mode_enum NULL`
  - `fixed_service_subtotal`: `NUMERIC(12, 2) NULL DEFAULT 0`

---

## 4. Danh mục bảng tạo mới (`TABLES ADD`)

### 4.1 Bảng `cash_settlements`
Quản lý luồng xác nhận kép thanh toán tiền mặt theo Rule BRX-028:
```sql
CREATE TABLE cash_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
    declared_by_technician_id UUID NOT NULL REFERENCES users(id),
    declared_amount NUMERIC(12, 2) NOT NULL,
    declared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    technician_notes TEXT,
    receipt_evidence_url TEXT,
    confirmed_by_customer_id UUID REFERENCES users(id),
    confirmed_amount NUMERIC(12, 2),
    confirmed_at TIMESTAMPTZ,
    status cash_settlement_status_enum NOT NULL DEFAULT 'pending_confirmation',
    manager_resolution_reason TEXT,
    resolved_by_manager_id UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cash_settlement_order UNIQUE (service_order_id)
);
```

### 4.2 Bảng `commission_dues`
Quản lý nghĩa vụ nợ hoa hồng 10% sau khi thu tiền mặt theo Rule BRX-030 & BRX-031:
```sql
CREATE TABLE commission_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
    cash_settlement_id UUID REFERENCES cash_settlements(id) ON DELETE RESTRICT,
    labor_total_snapshot NUMERIC(12, 2) NOT NULL,
    commission_rate_snapshot NUMERIC(5, 4) NOT NULL DEFAULT 0.1000, -- 10%
    due_amount NUMERIC(12, 2) NOT NULL,
    status commission_due_status_enum NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_commission_due_order UNIQUE (service_order_id)
);
```

### 4.3 Bảng `warranty_claims`
Quản lý khiếu nại bảo hành của khách hàng theo Rule BRX-038 - BRX-040:
```sql
CREATE TABLE warranty_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_coverage_id UUID NOT NULL REFERENCES warranty_coverages(id) ON DELETE RESTRICT,
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES users(id),
    claim_reason TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    status warranty_claim_status_enum NOT NULL DEFAULT 'open',
    is_covered BOOLEAN NULL, -- true: lỗi cũ thuộc bảo hành -> rework; false: lỗi mới -> additional quote
    technician_response TEXT,
    manager_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. Danh mục chỉ mục (`INDEXES`) & Ràng buộc toàn vẹn (`CONSTRAINTS`)

1. **Unique TechnicianService:**
   - Đảm bảo mỗi thợ chỉ có 1 bản ghi khai báo cho mỗi dịch vụ:
   - `CREATE UNIQUE INDEX idx_technician_skills_tech_service ON technician_skills (technician_id, service_id);` (đã có trên `technician_skills`).
2. **Kiểm tra nợ hoa hồng (Eligibility Gate):**
   - Tạo index phục vụ query kiểm tra nhanh thợ có nợ hoa hồng chưa thanh toán:
   - `CREATE INDEX idx_commission_dues_tech_status ON commission_dues (technician_id, status) WHERE status = 'pending';`
3. **Index lọc đơn và lịch hẹn:**
   - `CREATE INDEX idx_bookings_time_status ON bookings (preferred_at, status);`
   - `CREATE INDEX idx_service_orders_status ON service_orders (status);`
   - `CREATE INDEX idx_cash_settlements_status ON cash_settlements (status);`

---

## 6. Kế hoạch Seed dữ liệu Catalog FIXED_PRICE chuẩn v1.2

Trong migration/seed tiếp theo, nạp 17 dịch vụ FIXED_PRICE theo Section 8.3.1:
1. Vệ sinh điều hòa treo tường 1–1.5 HP (180.000đ / Máy)
2. Vệ sinh điều hòa treo tường 2–2.5 HP (220.000đ / Máy)
3. Vệ sinh điều hòa âm trần (500.000đ / Máy)
4. Vệ sinh máy giặt cửa trên ≤ 9kg (350.000đ / Máy)
5. Vệ sinh máy giặt cửa trên > 9kg (450.000đ / Máy)
6. Vệ sinh máy giặt cửa ngang ≤ 9kg (550.000đ / Máy)
7. Vệ sinh máy giặt cửa ngang > 9kg (650.000đ / Máy)
8. Vệ sinh máy sấy gia đình (350.000đ / Máy)
9. Vệ sinh/bảo dưỡng bình nóng lạnh (250.000đ / Bình)
10. Thay công tắc điện - tiền công (100.000đ / Cái)
11. Thay ổ cắm điện - tiền công (100.000đ / Cái)
12. Lắp đèn trần cơ bản - tiền công (120.000đ / Cái)
13. Lắp quạt treo tường - tiền công (150.000đ / Cái)
14. Lắp quạt trần cơ bản - tiền công (250.000đ / Cái)
15. Lắp TV lên giá treo có sẵn (100.000đ / TV)
16. Thay vòi nước - tiền công (120.000đ / Cái)
17. Thay vòi sen - tiền công (150.000đ / Bộ)
18. Thay siphon/chống rò lavabo - tiền công (150.000đ / Bộ)
19. Lắp máy lọc nước cơ bản (250.000đ / Máy)
20. Kiểm tra/chẩn đoán thiết bị tại nhà (100.000đ / Lần)

---

## 7. Quy trình Rollback (Khi cần)

- Các bảng mới (`cash_settlements`, `commission_dues`, `warranty_claims`) có thể drop an toàn mà không ảnh hưởng bảng lõi cũ.
- Các cột mới trên `services`, `bookings`, `service_orders` cho phép null nên việc revert code sẽ không làm đứt kết nối dữ liệu.
