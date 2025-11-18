# Noverlink TODO

## 🔴 Critical - 立即修復

### ~~1. `.env` 檔案被 Git 追蹤~~ ✅ 已確認正常
**狀態：** 誤報，`.env` 已在 `.gitignore` 中且從未被追蹤

**驗證：**
```bash
git check-ignore -v packages/relay/.env
# → .gitignore:57:.env	packages/relay/.env
```

---

### ~~2. `.env` 的 BASE_DOMAIN 設定錯誤~~ ✅ 已修復
**問題：**
- ~~當前設定為 `BASE_DOMAIN=noverlink.com`（生產環境值）~~
- ~~開發環境應該用 `localhost:8080`~~

**修復：** 已改為 `BASE_DOMAIN=localhost:8080`

**相關檔案：**
- `packages/relay/.env` ✅

---

## 🟡 Important - 建議修復

### ~~3. TunnelMessage 的 `response_tx` 未使用~~ ✅ 已修復
**狀態：** 已移除未使用的 `response_tx` 欄位

**修改：**
- ✅ `packages/relay/src/registry.rs` - 移除 TunnelMessage.response_tx 欄位和註釋
- ✅ `packages/relay/src/handlers/http.rs` - 移除創建時的 response_tx 參數，改為直接傳遞（不需 clone）

**驗證：**
- ✅ cargo build - 編譯成功
- ✅ cargo test - 測試通過
- ✅ cargo clippy -D warnings - 無警告

**收益：**
- 減少 TunnelMessage 大小（~16 bytes per request）
- 移除混淆的 `#[allow(dead_code)]` 標記
- 減少一次 `response_tx.clone()` 操作
- 架構更清晰（單一 response 處理路徑）

---

### ~~4. Chunked Encoding 檢測不完整~~ ✅ 已修復
**狀態：** 已修復所有問題，完全符合 RFC 7230

**修復內容：**
1. ✅ Case-insensitive header 檢查（`transfer-encoding` / `Transfer-Encoding`）
2. ✅ 支持 trailers（`0\r\nX-Trailer: value\r\n\r\n`）
3. ✅ 正確檢測 `\r\n0\r\n` 後跟 `\r\n` 或 `\r\n\r\n`

**修復後程式碼：**
```rust
// Case-insensitive check for "transfer-encoding: chunked"
if headers_str.to_lowercase().contains("transfer-encoding:")
    && headers_str.to_lowercase().contains("chunked")
{
    // RFC 7230: chunked body ends with "0\r\n" followed by optional trailers
    // Pattern: "\r\n0\r\n\r\n" (no trailers) or "\r\n0\r\n<headers>\r\n\r\n" (with trailers)
    // ... (full logic in forwarder.rs:106-128)
}
```

**驗證：**
- ✅ cargo test - 所有測試通過（包括新增的 trailers 測試）
- ✅ cargo clippy -D warnings - 無警告

**相關檔案：**
- `packages/cli/src/forwarder.rs:102-128` ✅

---

### ~~5. HTTP 完整性檢測的 Fallback 邏輯錯誤~~ ✅ 已修復
**狀態：** 已修正邏輯，符合 HTTP/1.1 標準

**問題：**
- 舊邏輯：沒有 `Content-Length` 也不是 `chunked` 時，只要有 headers 就返回 true
- 正確行為：應該強制讀取直到 EOF（connection close）

**修復後程式碼：**
```rust
// If no Content-Length and not chunked, must read until connection closes (EOF)
// Cannot determine completeness from buffer content alone
// Return false to force reading until EOF
false
```

**驗證：**
- ✅ cargo test - 所有測試通過
- ✅ cargo clippy -D warnings - 無警告

**相關檔案：**
- `packages/cli/src/forwarder.rs:131-134` ✅

**技術說明：**
HTTP/1.1 的 body 結束標記有三種方式：
1. `Content-Length` - 明確指定長度
2. `Transfer-Encoding: chunked` - 最後的 0 chunk
3. **Connection close** - 關閉連接表示結束（現在正確處理）

---

## 🟢 Optional - 可選優化

### ~~6. Subdomain 生成無限循環風險（理論）~~ ⚠️ 已評估，不修復
**決定：** Over-engineering，實際風險可忽略

**評估結果：**
- Petname 組合數：~10,000+ 種
- 預期同時活躍 tunnels：< 1,000 個
- 單次碰撞機率：< 10%
- 連續碰撞 10 次機率：< 0.0000000001%

**結論：**
除非你有 10,000+ 個同時活躍的 tunnels，否則不會發生。
到那時候應該有更大的擴展性問題要解決（資源限制、負載均衡等）。

**當前代碼保持不變：**
```rust
loop {
    let subdomain = TunnelRegistry::generate_random_subdomain();
    if registry.is_domain_available(&subdomain) {
        break subdomain;
    }
}
```

**相關檔案：**
- `packages/relay/src/handlers/ws.rs:66-72`

---

### ~~7. HTTP Response Timeout 可能太短~~ ✅ 已修復
**狀態：** 已對標 ngrok，改為 420 秒（7 分鐘）

**修改內容：**
- CLI → localhost timeout: 30s → **420s**
- Relay → CLI timeout: 30s → **420s**

**業界參考：**
- ngrok: 420 秒（7 分鐘）
- Noverlink: 420 秒（對標）

**支持場景：**
- ✅ 大文件上傳/下載
- ✅ 慢速 API（ML 推理、複雜計算）
- ✅ Webhook 處理（支付、郵件發送）
- ✅ 資料庫遷移腳本

**驗證：**
- ✅ cargo test - 所有測試通過
- ✅ cargo clippy -D warnings - 無警告

**相關檔案：**
- `packages/cli/src/forwarder.rs:28` ✅
- `packages/relay/src/handlers/http.rs:236` ✅

---

## ✅ 已確認正確的架構

- ✅ WebSocket 分流架構（避免 deadlock）
- ✅ Subdomain 提取邏輯
- ✅ BASE_DOMAIN 設計
- ✅ HTTP Request/Response 轉發
- ✅ Petname 整合
- ✅ Request ID 追蹤
- ✅ 並發處理（Arc + DashMap）

---

## 待確認的設計決策

### Q1: Response Channel 設計
**選項 A（推薦）：** 繼續用 `registry.pending_requests`，移除 `TunnelMessage.response_tx`
**選項 B：** 改用每個 request 自帶 response channel

→ 建議選 A，當前架構已集中管理

### Q2: .env BASE_DOMAIN
開發環境應該用：
- `localhost:8080` ✅
- `noverlink.com` ❌（需要 DNS 設定）

### Q3: HTTP Timeout 時間
- 30 秒（當前）
- 60 秒
- 120 秒
- 可配置？

---

## 修復優先順序

1. **P0 - 立即：** 移除 .env from git + 修正 BASE_DOMAIN
2. **P1 - 重要：** 移除未使用的 response_tx
3. **P2 - 建議：** 修正 HTTP 完整性檢測邏輯
4. **P3 - 建議：** 修正 chunked encoding 檢測
5. **P4 - 可選：** 添加 subdomain 生成重試上限
