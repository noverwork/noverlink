# Noverlink API Design

## Overview

此文件描述前端頁面所需的 API 端點設計。

### Authentication Methods

| 方法 | Header | 用途 |
|------|--------|------|
| JWT | `Authorization: Bearer <accessToken>` | Web 前端 |
| CLI Token | `Authorization: Bearer nv_<token>` | CLI 工具 |
| Relay Secret | `X-Relay-Secret: <secret>` | Relay 服務 |

---

## 現有 API (已實作)

### Auth Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | 用戶註冊 |
| POST | `/api/auth/login` | - | 用戶登入 |
| POST | `/api/auth/refresh` | - | 刷新 Token |
| GET | `/api/auth/google` | - | Google OAuth |
| GET | `/api/auth/github` | - | GitHub OAuth |
| POST | `/api/auth/device` | - | 開始設備授權流程 |
| POST | `/api/auth/device/poll` | - | 輪詢設備授權狀態 |
| POST | `/api/auth/device/approve` | JWT | 批准設備授權 |
| POST | `/api/auth/device/deny` | JWT | 拒絕設備授權 |
| GET | `/api/auth/me` | JWT | 獲取當前用戶資訊 |

### Tunnels Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tunnels/ticket` | CLI Token | 獲取 Relay 連接票據 |

### Relay Module (Internal)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/relay/sessions` | Relay Secret | 創建 Tunnel Session |
| PATCH | `/api/relay/sessions/:id/close` | Relay Secret | 關閉 Session |
| POST | `/api/relay/sessions/:id/requests` | Relay Secret | 儲存 HTTP 請求日誌 |

### Billing Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/billing/subscription` | JWT | 獲取訂閱資訊 |
| POST | `/api/billing/webhook/*` | Webhook | Polar 回調 |

---

## 新增 API (待實作)

### 1. Tunnel Sessions API

用於 Dashboard 和 Tunnels 頁面顯示活躍的 tunnel 連接。

#### `GET /api/tunnels/sessions`

列出當前用戶的所有 tunnel sessions。

**Auth:** JWT

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `active` \| `closed` \| `all` | `active` | 過濾狀態 |
| `limit` | number | 20 | 每頁數量 (max: 100) |
| `cursor` | string | - | 分頁游標 |

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "subdomain": "happy-cat",
      "publicUrl": "https://happy-cat.noverlink.dev",
      "localPort": 3000,
      "status": "active",
      "clientIp": "192.168.1.1",
      "clientVersion": "0.1.0",
      "connectedAt": "2024-01-15T10:30:00Z",
      "closedAt": null,
      "bytesIn": 1024000,
      "bytesOut": 2048000,
      "requestCount": 150
    }
  ],
  "nextCursor": "eyJpZCI6Inh4eCJ9",
  "hasMore": true
}
```

---

#### `GET /api/tunnels/sessions/:id`

獲取單一 session 的詳細資訊。

**Auth:** JWT

**Response:**
```json
{
  "id": "uuid",
  "subdomain": "happy-cat",
  "publicUrl": "https://happy-cat.noverlink.dev",
  "localPort": 3000,
  "status": "active",
  "clientIp": "192.168.1.1",
  "clientVersion": "0.1.0",
  "connectedAt": "2024-01-15T10:30:00Z",
  "closedAt": null,
  "bytesIn": 1024000,
  "bytesOut": 2048000,
  "requestCount": 150,
  "stats": {
    "avgLatency": 45,
    "p95Latency": 120,
    "successRate": 0.98
  }
}
```

---

#### `GET /api/tunnels/sessions/:id/logs`

獲取 session 的 HTTP 請求日誌（分頁）。

**Auth:** JWT

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | 每頁數量 (max: 100) |
| `cursor` | string | - | 分頁游標 |
| `method` | string | - | 過濾 HTTP method |
| `status` | string | - | 過濾狀態碼 (e.g., `2xx`, `4xx`, `500`) |

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "method": "GET",
      "path": "/api/users",
      "queryString": "page=1",
      "status": 200,
      "durationMs": 45,
      "requestSize": 256,
      "responseSize": 1024,
      "timestamp": "2024-01-15T10:35:00Z"
    }
  ],
  "nextCursor": "eyJpZCI6Inh4eCJ9",
  "hasMore": true
}
```

---

#### `DELETE /api/tunnels/sessions/:id`

強制關閉一個活躍的 session。

**Auth:** JWT

**Response:**
```json
{
  "success": true
}
```

---

### 2. Tunnel Stats API

用於 Dashboard 頁面的統計資料。

#### `GET /api/tunnels/stats`

獲取用戶的 tunnel 統計摘要。

**Auth:** JWT

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `today` \| `week` \| `month` | `today` | 統計時間範圍 |

**Response:**
```json
{
  "activeTunnels": 2,
  "totalRequests": 15420,
  "totalBandwidth": {
    "in": 52428800,
    "out": 104857600,
    "formatted": "150 MB"
  },
  "avgLatency": 42,
  "period": {
    "start": "2024-01-15T00:00:00Z",
    "end": "2024-01-15T23:59:59Z"
  }
}
```

---

### 3. API Keys Management

用於 Settings 頁面的 API Key 管理。

#### `GET /api/auth/api-keys`

列出用戶的所有 API Keys。

**Auth:** JWT

**Response:**
```json
{
  "keys": [
    {
      "id": "uuid",
      "name": "My Laptop",
      "prefix": "nv_abc1",
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### `POST /api/auth/api-keys`

創建新的 API Key。

**Auth:** JWT

**Request Body:**
```json
{
  "name": "My Laptop"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Laptop",
  "key": "nv_abc123xyz789...",
  "prefix": "nv_abc1",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

> ⚠️ `key` 只在創建時返回一次，之後無法再查看。

---

#### `DELETE /api/auth/api-keys/:id`

刪除一個 API Key。

**Auth:** JWT

**Response:**
```json
{
  "success": true
}
```

---

### 4. Billing & Usage API

用於 Billings 頁面。

#### `GET /api/billing/usage`

獲取當前計費週期的使用量。

**Auth:** JWT

**Response:**
```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "tunnels": {
    "used": 2,
    "limit": 5
  },
  "bandwidth": {
    "used": 5368709120,
    "limit": 53687091200,
    "usedFormatted": "5 GB",
    "limitFormatted": "50 GB"
  },
  "requests": {
    "total": 125000
  }
}
```

---

#### `POST /api/billing/checkout`

創建 Polar 結帳連結。

**Auth:** JWT

**Request Body:**
```json
{
  "productId": "hobbyist_monthly"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://polar.sh/checkout/..."
}
```

---

#### `GET /api/billing/invoices`

獲取發票/付款歷史。

**Auth:** JWT

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 10 | 每頁數量 |
| `cursor` | string | - | 分頁游標 |

**Response:**
```json
{
  "invoices": [
    {
      "id": "inv_xxx",
      "amount": 1200,
      "currency": "USD",
      "status": "paid",
      "paidAt": "2024-01-01T00:00:00Z",
      "description": "Hobbyist Plan - January 2024",
      "invoiceUrl": "https://polar.sh/invoice/..."
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

### 5. Domains API (Optional)

用於管理保留的子域名。

#### `GET /api/domains`

列出用戶保留的域名。

**Auth:** JWT

**Response:**
```json
{
  "domains": [
    {
      "id": "uuid",
      "hostname": "myapp",
      "fullUrl": "https://myapp.noverlink.dev",
      "isReserved": true,
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### `POST /api/domains`

保留一個子域名。

**Auth:** JWT

**Request Body:**
```json
{
  "hostname": "myapp"
}
```

**Response:**
```json
{
  "id": "uuid",
  "hostname": "myapp",
  "fullUrl": "https://myapp.noverlink.dev",
  "isReserved": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

#### `DELETE /api/domains/:id`

釋放一個保留的域名。

**Auth:** JWT

**Response:**
```json
{
  "success": true
}
```

---

## 頁面與 API 對應表

| 頁面 | 需要的 API |
|------|-----------|
| **Dashboard** | `GET /tunnels/sessions?status=active`, `GET /tunnels/stats` |
| **Tunnels** | `GET /tunnels/sessions`, `GET /tunnels/sessions/:id` |
| **Tunnel Detail** | `GET /tunnels/sessions/:id`, `GET /tunnels/sessions/:id/logs` |
| **Settings** | `GET /auth/me`, `GET /auth/api-keys`, `POST /auth/api-keys`, `DELETE /auth/api-keys/:id` |
| **Billings** | `GET /billing/usage`, `GET /billing/subscription`, `POST /billing/checkout`, `GET /billing/invoices` |
| **Device Auth** | `POST /auth/device/approve`, `POST /auth/device/deny` (已存在) |

---

## 實作優先順序

### Phase 1: Core (Dashboard & Tunnels)
1. `GET /api/tunnels/sessions` - 列出 sessions
2. `GET /api/tunnels/sessions/:id` - Session 詳情
3. `GET /api/tunnels/sessions/:id/logs` - 請求日誌
4. `GET /api/tunnels/stats` - 統計摘要

### Phase 2: Settings
5. `GET /api/auth/api-keys` - 列出 API Keys
6. `POST /api/auth/api-keys` - 創建 API Key
7. `DELETE /api/auth/api-keys/:id` - 刪除 API Key

### Phase 3: Billing
8. `GET /api/billing/usage` - 使用量
9. `POST /api/billing/checkout` - 創建結帳
10. `GET /api/billing/invoices` - 發票歷史

### Phase 4: Optional
11. `GET /api/domains` - 列出域名
12. `POST /api/domains` - 保留域名
13. `DELETE /api/domains/:id` - 釋放域名
14. `DELETE /api/tunnels/sessions/:id` - 強制關閉 session

---

## Error Response Format

所有錯誤回應遵循統一格式：

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | 請求參數無效 |
| 401 | Unauthorized | 未認證或 token 過期 |
| 403 | Forbidden | 無權限訪問資源 |
| 404 | Not Found | 資源不存在 |
| 409 | Conflict | 資源衝突 (如域名已被使用) |
| 429 | Too Many Requests | 請求頻率過高 |
| 500 | Internal Server Error | 伺服器錯誤 |
