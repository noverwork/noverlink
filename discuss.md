# Noverlink Tunnel - 設計討論

## Entity 架構

```
User
 ├── domains[]         → Domain
 ├── usageQuotas[]     → UsageQuota
 ├── oauthConnections[] → OAuthConnection
 └── subscriptions[]   → Subscription

Domain (subdomain 保留)
 ├── hostname, isReserved
 └── sessions[]        → TunnelSession

TunnelSession
 ├── domain            → Domain
 ├── protocol          // HTTP 或 TCP
 └── httpRequests[]    → HttpRequest

HttpRequest
 └── session           → TunnelSession
```

設計模式：**Stateless**（類似 ngrok）
- Domain 只保留 hostname
- tunnel 配置由 CLI 每次連線帶入

---

## 使用情境

### 1. 用戶註冊 & 登入

```
[Web] 用戶註冊
 → User { name, email, password, plan: FREE, maxTunnels: 1 }

[Web] OAuth 登入 (GitHub/Google)
 → User { ... }
 → OAuthConnection { provider: GITHUB, providerUserId: "12345" }

[CLI] 取得 authToken
 → User.authToken = "nk_xxxxxxxx"
```

---

### 2. 建立 Tunnel (Dashboard)

```
[Web] 用戶建立 subdomain tunnel
 → Domain {
     hostname: "myapp",           // myapp.noverlink.io
     isReserved: true,
     isCustom: false,
     protocol: HTTP,
     targetPort: 3000,
     targetHost: "localhost",
     isEnabled: true,
     recordRequests: true
   }

[Web] 用戶建立 custom domain tunnel
 → Domain {
     hostname: "api.mycompany.com",
     isReserved: false,
     isCustom: true,
     dnsVerified: false,          // 等待 DNS 驗證
     protocol: HTTP,
     targetPort: 8080,
     ...
   }

[Web] DNS 驗證成功
 → Domain.dnsVerified = true
```

---

### 3. CLI 連線

```bash
$ noverlink --token nk_xxx --subdomain myapp --port 3000
```

```
[Relay] 驗證 authToken → 找到 User
[Relay] 查詢 Domain { hostname: "myapp", user }
[Relay] 建立 WebSocket 連線
 → TunnelSession {
     domain,
     protocol: HTTP,
     status: ACTIVE,
     connectedAt: now(),
     clientIp: "203.0.113.50",
     clientVersion: "0.1.0"
   }

[Dashboard] 顯示 "myapp.noverlink.io 🟢 Online"
```

---

### 4. HTTP 請求流程 (Replay 功能)

```
[Client] curl https://myapp.noverlink.io/api/users

[Relay] 收到請求
 → HttpRequest {
     session,
     method: "GET",
     path: "/api/users",
     requestHeaders: { "Host": "myapp.noverlink.io", ... },
     timestamp: now()
   }

[Relay] 透過 WebSocket 轉發到 CLI → localhost:3000

[CLI] 回應 200 OK

[Relay] 記錄回應
 → HttpRequest {
     responseStatus: 200,
     responseHeaders: { "Content-Type": "application/json" },
     responseBody: Buffer<...>,
     durationMs: 45
   }

[Relay] 更新 session 流量
 → TunnelSession.bytesIn += requestSize
 → TunnelSession.bytesOut += responseSize
```

---

### 5. Dashboard 查看請求 & Replay

```
[Web] 用戶查看請求列表
 → SELECT * FROM http_request
   WHERE session.domain.user = currentUser
   ORDER BY timestamp DESC

┌────────────┬────────┬─────────────┬────────┬──────────┐
│ Time       │ Method │ Path        │ Status │ Duration │
├────────────┼────────┼─────────────┼────────┼──────────┤
│ 10:30:05   │ POST   │ /api/login  │ 200    │ 120ms    │
│ 10:30:02   │ GET    │ /api/users  │ 200    │ 45ms     │
│ 10:29:58   │ GET    │ /health     │ 200    │ 12ms     │
└────────────┴────────┴─────────────┴────────┴──────────┘

[Web] 用戶點擊 "Replay" 按鈕
 → POST /api/replay { requestId: "xxx" }
 → 重新發送原始 request 到目前 active 的 session
 → 建立新的 HttpRequest 記錄
```

---

### 6. CLI 斷線

```
[CLI] Ctrl+C 或網路斷開

[Relay] 偵測到 WebSocket 關閉
 → TunnelSession {
     status: CLOSED,
     disconnectedAt: now()
   }

[Dashboard] 顯示 "myapp.noverlink.io 🔴 Offline"
```

---

### 7. 月度用量統計 (Cron Job)

```
[Cron] 每小時執行

→ SELECT
    domain.user_id,
    SUM(bytes_in + bytes_out) as bandwidth,
    COUNT(http_request.id) as requests,
    SUM(disconnected_at - connected_at) as minutes
  FROM tunnel_session
  WHERE month = current_month
  GROUP BY user_id

→ UPSERT UsageQuota {
    user,
    year: 2025,
    month: 11,
    bandwidthUsedMb: 1500,
    requestCount: 25000,
    tunnelMinutes: 4320
  }

[Web] 檢查配額
 → IF bandwidthUsedMb > User.maxBandwidthMb
   → 警告 / 限流 / 升級提示
```

---

### 8. 訂閱升級

```
[Web] 用戶點擊升級 Pro
 → 跳轉 Polar checkout

[Webhook] Polar 回調
 → Subscription {
     polarSubscriptionId: "sub_xxx",
     polarCustomerId: "cus_xxx",
     status: ACTIVE,
     currentPeriodEnd: 2025-12-29
   }
 → User.plan = PRO
 → User.maxTunnels = 10
 → User.maxBandwidthMb = 100000
```

---

### 9. TCP Tunnel (進階)

```bash
$ noverlink --token nk_xxx --subdomain db --protocol tcp --port 5432
```

```
[Relay]
 → Domain { protocol: TCP, targetPort: 5432 }
 → TunnelSession { ... }
 → 不記錄 HttpRequest (TCP 不是 HTTP)

[Client] psql -h db.noverlink.io -p 5432
 → TCP 直通到 localhost:5432
```

---

## 待討論問題

- [x] Request body 儲存限制？→ 先全存 PostgreSQL，之後再優化
- [x] HttpRequest 保留政策？→ 先不刪，之後再處理
- [x] Rate limiting 策略？→ 不需要
- [x] WebSocket 斷線重連處理？→ 重連建新 Session，斷線回 502
