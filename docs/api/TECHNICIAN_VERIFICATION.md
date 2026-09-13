# FixHome API — Technician Verification

> Specification and reference for Technician Credential Submission and Administrator Verification Review.

---

## 1. Overview & Verification Lifecycle

FixHome requires all technician accounts to be verified before they can accept bookings or orders.
The verification process has three states:
- `pending`: Application submitted by technician, awaiting operational review.
- `approved`: Reviewed and verified by an Admin or Service Manager.
- `rejected`: Application rejected with a specific explanation (`rejectionReason`). Technicians can re-submit after correcting their profile.

Supported Document Types (`DocumentType` enum):
- `citizen_id_front`: Mặt trước CCCD/CMND
- `citizen_id_back`: Mặt sau CCCD/CMND
- `certificate`: Bằng cấp / Chứng chỉ nghề nghiệp
- `portfolio`: Hình ảnh công trình / sản phẩm đã hoàn thành
- `other`: Tài liệu bổ trợ khác

Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
File size limit: Maximum 10MB per document.

---

## 2. Technician Verification Endpoints

Guarded with `@Roles(Role.TECHNICIAN)`.

### 2.1 Submit Verification Documents
`POST /api/v1/technician/verification`
- **Request Body**:
  ```json
  {
    "documents": [
      {
        "documentType": "citizen_id_front",
        "fileUrl": "https://storage.fixhome.vn/docs/cccd_front.jpg",
        "fileName": "cccd_front.jpg",
        "fileSize": 1048576,
        "mimeType": "image/jpeg"
      },
      {
        "documentType": "citizen_id_back",
        "fileUrl": "https://storage.fixhome.vn/docs/cccd_back.jpg",
        "fileName": "cccd_back.jpg",
        "fileSize": 1048576,
        "mimeType": "image/jpeg"
      }
    ]
  }
  ```
- **Response** (`201 Created`): Returns created verification record with status `pending`.
- **Validation**:
  - Rejects if technician already has a `pending` submission.
  - Rejects if technician is already `approved`.

### 2.2 Check Verification Status
`GET /api/v1/technician/verification/status`
- **Response** (`200 OK`): Returns latest verification status, reviewed timestamp, and documents list.

---

## 3. Administrative Review Endpoints

Guarded with `@Roles(Role.ADMIN, Role.SERVICE_MANAGER)`.

### 3.1 List Verifications
`GET /api/v1/admin/technician-verifications`
- **Query Params**:
  - `status`: Optional filter by `pending`, `approved`, `rejected`
  - `page`: default 1
  - `limit`: default 20 (max 100)

### 3.2 Get Verification Detail
`GET /api/v1/admin/technician-verifications/:id`
- Returns full details of submission, attached documents, and technician profile.

### 3.3 Approve Verification
`PATCH /api/v1/admin/technician-verifications/:id/approve`
- Changes status to `approved`, stamps `reviewedAt` and `reviewedBy`.

### 3.4 Reject Verification
`PATCH /api/v1/admin/technician-verifications/:id/reject`
- **Request Body**:
  ```json
  {
    "rejectionReason": "Ảnh mặt sau CCCD bị lóa sáng, không đọc được số seri. Vui lòng chụp lại."
  }
  ```
- Changes status to `rejected`, records `rejectionReason`, `reviewedAt`, and `reviewedBy`.
