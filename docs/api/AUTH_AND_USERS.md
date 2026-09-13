# FixHome API — Authentication & User Management

> Specification and reference for Member 1 Core Platform Authentication, Authorization, and User Lifecycle.

---

## 1. Overview & Security Architecture

The FixHome authentication layer utilizes JSON Web Tokens (JWT) with dual-token lifecycle:
- **Access Token**: Short-lived (15 minutes by default), contains user identity and roles (`sub`, `email`, `role`).
- **Refresh Token**: Long-lived (7 days by default), stored hashed (SHA-256) in the PostgreSQL `refresh_tokens` table for session tracking, multi-device management, and instant revocation.
- **Password Security**: Salted with `bcrypt` (10 rounds). Passwords must contain at least 8 characters, with at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
- **Account State Machine**: Accounts have states: `active`, `locked`, `suspended`. Inactive or locked accounts are immediately rejected by `JwtStrategy` and login endpoints.

---

## 2. Roles & Permissions

- `customer`: Standard home service client (Can register publicly).
- `technician`: Service provider/craftsman (Can register publicly, subject to verification).
- `service_manager`: Operational coordinator (Assigned by Admin).
- `admin`: Super administrator (Pre-seeded or provisioned via admin console).

---

## 3. Endpoints Specification

### 3.1 Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Public endpoint to register Customer or Technician accounts.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "Nguyen Van A",
    "phoneNumber": "0912345678",
    "role": "customer"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "id": "c1f7a4e2-...",
        "email": "user@example.com",
        "fullName": "Nguyen Van A",
        "phoneNumber": "0912345678",
        "role": "customer",
        "status": "active",
        "isActive": true,
        "createdAt": "2026-09-09T06:00:00.000Z",
        "updatedAt": "2026-09-09T06:00:00.000Z"
      }
    }
  }
  ```

#### `POST /api/v1/auth/login`
Public endpoint supporting login with either Email or Phone number.
- **Request Body**:
  ```json
  {
    "identifier": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": { ... }
    }
  }
  ```

#### `POST /api/v1/auth/refresh`
Public endpoint to rotate refresh tokens and obtain a fresh access token.
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

#### `POST /api/v1/auth/logout`
Authenticated endpoint (`Bearer <token>`) to invalidate the session refresh token.
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Logged out successfully",
    "data": { "loggedOut": true }
  }
  ```

#### `GET /api/v1/auth/me`
Authenticated endpoint returning the current user identity and profile.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response** (`200 OK`): Returns sanitized user profile.

---

### 3.2 User Profile (`/api/v1/users`)

#### `GET /api/v1/users/me`
Retrieve profile of currently authenticated user.

#### `PATCH /api/v1/users/me`
Update profile details of currently authenticated user (e.g. `fullName`, `phoneNumber`).

---

### 3.3 Admin User Management (`/api/v1/admin/users`)

Guarded with `@Roles(Role.ADMIN)`.

#### `GET /api/v1/admin/users`
List users with pagination, role filtering, status filtering, and text search.
- **Query Params**:
  - `page`: default 1
  - `limit`: default 20 (max 100)
  - `role`: optional (`customer`, `technician`, `service_manager`, `admin`)
  - `status`: optional (`active`, `locked`, `suspended`)
  - `search`: optional substring search on name, email, or phone.

#### `GET /api/v1/admin/users/:id`
Get detailed user profile by UUID.

#### `PATCH /api/v1/admin/users/:id/status`
Lock, suspend, or activate an account. If locked or suspended, all active refresh tokens for this user are automatically revoked.
- **Request Body**:
  ```json
  {
    "status": "locked",
    "reason": "Suspicious login attempts detected"
  }
  ```
