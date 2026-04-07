# Truley Interview API Design

## Overview

此文件描述前端頁面所需的 API 端點設計。

### Authentication Methods

| 方法 | Header                                | 用途     |
| ---- | ------------------------------------- | -------- |
| JWT  | `Authorization: Bearer <accessToken>` | Web 前端 |

---

## 現有 API (已實作)

### Auth Module

| Method | Endpoint                   | Auth | Description      |
| ------ | -------------------------- | ---- | ---------------- |
| POST   | `/api/auth/register`       | -    | 用戶註冊         |
| POST   | `/api/auth/login`          | -    | 用戶登入         |
| POST   | `/api/auth/refresh`        | -    | 刷新 Token       |
| GET    | `/api/auth/google`         | -    | Google OAuth     |
| GET    | `/api/auth/github`         | -    | GitHub OAuth     |
| POST   | `/api/auth/device`         | -    | 開始設備授權流程 |
| POST   | `/api/auth/device/poll`    | -    | 輪詢設備授權狀態 |
| POST   | `/api/auth/device/approve` | JWT  | 批准設備授權     |
| POST   | `/api/auth/device/deny`    | JWT  | 拒絕設備授權     |
| GET    | `/api/auth/me`             | JWT  | 獲取當前用戶資訊 |

### Billing Module

| Method | Endpoint                    | Auth    | Description  |
| ------ | --------------------------- | ------- | ------------ |
| GET    | `/api/billing/subscription` | JWT     | 獲取訂閱資訊 |
| POST   | `/api/billing/webhook/*`    | Webhook | Polar 回調   |

---

## 新增 API (待實作)

### 1. Videos API

用於影片庫頁面顯示上傳的影片。

#### `GET /api/videos`

列出當前用戶的所有影片。

**Auth:** JWT

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `processing` \| `ready` \| `error` \| `all` | `ready` | 過濾狀態 |
| `limit` | number | 20 | 每頁數量 (max: 100) |
| `cursor` | string | - | 分頁游標 |
| `sortBy` | `uploadDate` \| `views` \| `duration` | `uploadDate` | 排序欄位 |
| `order` | `asc` \| `desc` | `desc` | 排序方向 |

**Response:**

```json
{
  "videos": [
    {
      "id": "uuid",
      "title": "My Video",
      "description": "Video description",
      "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
      "duration": 180,
      "durationFormatted": "3:00",
      "status": "ready",
      "views": 1500,
      "uploadDate": "2024-01-15T10:30:00Z",
      "fileSize": 52428800,
      "fileSizeFormatted": "50 MB"
    }
  ],
  "nextCursor": "eyJpZCI6Inh4eCJ9",
  "hasMore": true
}
```

---

#### `GET /api/videos/:id`

獲取單一影片的詳細資訊。

**Auth:** JWT

**Response:**

```json
{
  "id": "uuid",
  "title": "My Video",
  "description": "Video description",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "videoUrl": "https://cdn.example.com/video.mp4",
  "duration": 180,
  "durationFormatted": "3:00",
  "status": "ready",
  "views": 1500,
  "uploadDate": "2024-01-15T10:30:00Z",
  "fileSize": 52428800,
  "fileSizeFormatted": "50 MB",
  "mimeType": "video/mp4",
  "encoding": {
    "codec": "h264",
    "resolution": "1920x1080",
    "bitrate": 5000000
  }
}
```

---

#### `POST /api/videos/upload`

上傳新影片。

**Auth:** JWT

**Request:** `multipart/form-data`

| Field         | Type   | Required | Description               |
| ------------- | ------ | -------- | ------------------------- |
| `file`        | File   | Yes      | 影片檔案 (mp4, webm, mov) |
| `title`       | string | Yes      | 影片標題                  |
| `description` | string | No       | 影片描述                  |

**Response:**

```json
{
  "id": "uuid",
  "title": "My Video",
  "status": "processing",
  "uploadProgress": 100,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

#### `PATCH /api/videos/:id`

更新影片資訊。

**Auth:** JWT

**Request Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

#### `DELETE /api/videos/:id`

刪除影片。

**Auth:** JWT

**Response:**

```json
{
  "success": true
}
```

---

### 2. Video Stats API

用於影片分析頁面。

#### `GET /api/videos/:id/stats`

獲取影片的統計數據。

**Auth:** JWT

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `today` \| `week` \| `month` \| `all` | `week` | 統計時間範圍 |

**Response:**

```json
{
  "videoId": "uuid",
  "totalViews": 15420,
  "uniqueViewers": 8500,
  "watchTime": {
    "total": 36000,
    "formatted": "10h 0m"
  },
  "engagement": {
    "avgWatchTime": 180,
    "avgWatchTimeFormatted": "3:00",
    "completionRate": 0.75
  },
  "period": {
    "start": "2024-01-08T00:00:00Z",
    "end": "2024-01-15T23:59:59Z"
  },
  "viewsByDay": [
    {
      "date": "2024-01-15",
      "views": 2500
    }
  ]
}
```

---

### 3. Upload Progress API

用於追蹤上傳進度。

#### `GET /api/uploads/:id/progress`

獲取上傳進度。

**Auth:** JWT

**Response:**

```json
{
  "uploadId": "uuid",
  "status": "processing" | "ready" | "error",
  "progress": 75,
  "stage": "uploading" | "encoding" | "thumbnail",
  "message": "Encoding video...",
  "estimatedTimeRemaining": 120
}
```

---

### 4. API Keys Management

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

### 5. Billing & Usage API

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
  "storage": {
    "used": 5368709120,
    "limit": 53687091200,
    "usedFormatted": "5 GB",
    "limitFormatted": "50 GB"
  },
  "bandwidth": {
    "used": 10737418240,
    "limit": 107374182400,
    "usedFormatted": "10 GB",
    "limitFormatted": "100 GB"
  },
  "videos": {
    "uploaded": 25,
    "limit": 100
  }
}
```

---

## 頁面與 API 對應表

| 頁面              | 需要的 API                                                               |
| ----------------- | ------------------------------------------------------------------------ |
| **Dashboard**     | `GET /videos?status=ready`, `GET /videos/:id/stats`                      |
| **Video Library** | `GET /videos`, `GET /videos/:id`                                         |
| **Upload**        | `POST /videos/upload`, `GET /uploads/:id/progress`                       |
| **Video Detail**  | `GET /videos/:id`, `PATCH /videos/:id`, `DELETE /videos/:id`             |
| **Analytics**     | `GET /videos/:id/stats`                                                  |
| **Settings**      | `GET /auth/api-keys`, `POST /auth/api-keys`, `DELETE /auth/api-keys/:id` |
| **Billings**      | `GET /billing/usage`, `GET /billing/subscription`                        |

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
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Common Error Codes

| Status | Error                  | Description         |
| ------ | ---------------------- | ------------------- |
| 400    | Bad Request            | 請求參數無效        |
| 401    | Unauthorized           | 未認證或 token 過期 |
| 403    | Forbidden              | 無權限訪問資源      |
| 404    | Not Found              | 資源不存在          |
| 413    | Payload Too Large      | 檔案超過大小限制    |
| 415    | Unsupported Media Type | 不支持的影片格式    |
| 429    | Too Many Requests      | 請求頻率過高        |
| 500    | Internal Server Error  | 伺服器錯誤          |

---

## File Upload Specifications

### Supported Formats

| Format        | Extensions              | Max Size |
| ------------- | ----------------------- | -------- |
| **Video**     | `.mp4`, `.webm`, `.mov` | 100 MB   |
| **Thumbnail** | `.jpg`, `.png`, `.webp` | 5 MB     |

### Upload Limits

| Plan       | Max File Size | Monthly Uploads | Storage |
| ---------- | ------------- | --------------- | ------- |
| Free       | 50 MB         | 10              | 1 GB    |
| Hobbyist   | 100 MB        | 50              | 10 GB   |
| Pro        | 500 MB        | 500             | 100 GB  |
| Enterprise | 2 GB          | Unlimited       | 1 TB    |

### Encoding Presets

| Quality   | Resolution | Bitrate   | Codec |
| --------- | ---------- | --------- | ----- |
| **1080p** | 1920x1080  | 5000 kbps | H.264 |
| **720p**  | 1280x720   | 2500 kbps | H.264 |
| **480p**  | 854x480    | 1000 kbps | H.264 |
