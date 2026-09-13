# FixHome — API Response & Error Convention

> **Owner**: Member 1 (Core Platform / Security / Integration)  
> **Status**: APPROVED & IMPLEMENTED  
> **Last Updated**: 2026-09-09

Tài liệu này định nghĩa hợp đồng giao tiếp chuẩn (API Contract) giữa NestJS Backend với Frontend Web (Vue.js) và Mobile App (React Native), cùng các module nghiệp vụ của Member 2, 3, 4.

---

## 1. Global Endpoints & Routing

- **Mọi feature API đều có tiền tố**: `/api/v1`
  - Ví dụ: `GET /api/v1/services`, `POST /api/v1/auth/login`
- **Platform Health Endpoint**:
  - `GET /health` (Root level liveness check cho DevOps/Docker/Load Balancers)
  - `GET /api/v1/health` (Alias hỗ trợ tương thích ngược)
  - Kết quả kiểm tra: Backend alive & kết nối PostgreSQL database.
- **Swagger Documentation**: `/api/docs` (Kèm nút Bearer Token Authorization)

---

## 2. Standard Success Response Envelope

Mọi response thành công (HTTP 200, 201) đều được bọc tự động qua `TransformInterceptor`:

### Cấu trúc cơ bản:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "c1f7b0f6-9f4a-4d2c-8a1a-4d6d1b72e0b1",
    "name": "Sửa chữa điều hòa"
  }
}
```

### Cấu trúc phân trang (Paginated Response):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "c1f7b0f6-9f4a-4d2c-8a1a-4d6d1b72e0b1",
      "name": "Sửa chữa điều hòa"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## 3. Standard Error Response Envelope

Mọi ngoại lệ (HttpException, ValidationError, Internal Error) đều được xử lý thống nhất qua `HttpExceptionFilter`:

### Lỗi Validation DTO (HTTP 400):
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": [
      "email must be an email",
      "password must be longer than or equal to 8 characters"
    ]
  },
  "timestamp": "2026-09-09T10:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

### Lỗi Nghiệp Vụ / Quyền Hạn (HTTP 401, 403, 404, 409):
```json
{
  "success": false,
  "statusCode": 404,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  },
  "timestamp": "2026-09-09T10:00:00.000Z",
  "path": "/api/v1/users/999"
}
```

### Lỗi Hệ Thống (HTTP 500):
- **Development**: Hiển thị thông báo lỗi chi tiết để debug.
- **Production**: Che giấu toàn bộ raw SQL/stack trace, chỉ trả về:
```json
{
  "success": false,
  "statusCode": 500,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error"
  },
  "timestamp": "2026-09-09T10:00:00.000Z",
  "path": "/api/v1/..."
}
```

---

## 4. Bảng Mã Lỗi Chuẩn (Standard Error Codes)

| HTTP Status | Error Code | Ý nghĩa |
|:---|:---|:---|
| 400 | `VALIDATION_FAILED` | DTO validation thất bại (kèm mảng `details`) |
| 400 | `BAD_REQUEST` | Yêu cầu không hợp lệ về mặt cú pháp hoặc nghiệp vụ |
| 401 | `UNAUTHORIZED` | Chưa đăng nhập, token thiếu, hết hạn hoặc không hợp lệ |
| 403 | `FORBIDDEN` | Đã đăng nhập nhưng không đủ quyền (RBAC) hoặc không phải chủ sở hữu |
| 404 | `NOT_FOUND` | Tài nguyên không tồn tại |
| 409 | `CONFLICT` | Trùng lặp dữ liệu (email, số điện thoại, mã dịch vụ đã tồn tại) |
| 422 | `UNPROCESSABLE_ENTITY` | Dữ liệu đúng cú pháp nhưng vi phạm trạng thái nghiệp vụ |
| 429 | `TOO_MANY_REQUESTS` | Vượt ngưỡng giới hạn gọi API (Rate limit) |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi máy chủ không mong muốn |
