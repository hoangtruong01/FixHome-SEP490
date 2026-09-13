# FixHome API — Service Catalog

> Specification and reference for Service Categories and Services Catalog management.

---

## 1. Domain Model

- **ServiceCategory (`service_categories`)**:
  - `id`: UUID (PK)
  - `name`: Human-readable title (e.g., "Điện nước", "Điện lạnh")
  - `code`: Unique machine-readable code (e.g., `ELECTRICAL`, `PLUMBING`, `AIR_CONDITIONING`)
  - `description`: Detailed category scope
  - `isActive`: Boolean flag for toggling catalog visibility
  - `createdAt`, `updatedAt`: Audit timestamps

- **Service (`services`)**:
  - `id`: UUID (PK)
  - `categoryId`: Foreign key referencing `service_categories(id)` (ON DELETE RESTRICT)
  - `name`: Service title (e.g., "Sửa máy lạnh chảy nước")
  - `code`: Unique machine-readable code (e.g., `AC_WATER_LEAK`)
  - `description`: Detailed explanation of service items
  - `basePrice`, `minPrice`, `maxPrice`: Numeric(12,2) Vietnamese Dong benchmark pricing
  - `isActive`: Visibility flag
  - `createdAt`, `updatedAt`: Audit timestamps

---

## 2. Public Catalog Endpoints

### 2.1 Service Categories
- `GET /api/v1/categories`: List all active service categories.
- `GET /api/v1/categories/:id`: Get active category details by ID.

### 2.2 Services
- `GET /api/v1/services`: List services.
  - **Query Params**:
    - `categoryId`: Filter by specific category UUID.
    - `search`: Substring search on service name or description.
- `GET /api/v1/services/:id`: Get service details by UUID including its associated category.

---

## 3. Administrative Catalog Endpoints

Guarded with `@Roles(Role.ADMIN, Role.SERVICE_MANAGER)`.

### 3.1 Category Management (`/api/v1/admin/categories`)
- `POST /api/v1/admin/categories`: Create a new category (`name`, `code`, `description`, `isActive`).
- `PATCH /api/v1/admin/categories/:id`: Update category fields.
- `DELETE /api/v1/admin/categories/:id`: Soft-delete/deactivate category (`isActive = false`).

### 3.2 Service Management (`/api/v1/admin/services`)
- `POST /api/v1/admin/services`: Create a service (`categoryId`, `name`, `code`, `description`, `basePrice`, `minPrice`, `maxPrice`, `isActive`).
- `PATCH /api/v1/admin/services/:id`: Update service fields.
- `DELETE /api/v1/admin/services/:id`: Soft-delete/deactivate service (`isActive = false`).
