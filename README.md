# Noverlink

> 🚀 快速、輕量的本地到全球隧道解決方案 - 像 ngrok，但更好、更便宜

Noverlink 是一個自架的隧道服務，讓你能夠將本地服務暴露到公網。支援 HTTP 和 WebSocket 代理。

## ✨ 特點

- ✅ **HTTP 代理** - 完整支援 HTTP/HTTPS 請求
- ✅ **WebSocket 代理** - 支援 WebSocket 連接
- ✅ **高性能** - Rust 編寫的 Relay 核心
- ✅ **多並發** - 支援多個同時連接
- ✅ **簡單易用** - 一行命令啟動

## 📦 架構

```
┌─────────────┐      HTTP/WS      ┌─────────────┐      WebSocket      ┌─────────────┐
│   Browser   │ ───────────────► │    Relay    │ ◄─────────────────► │     CLI     │
│   /Client   │                   │   (Rust)    │      (control)      │   (Rust)    │
└─────────────┘                   └─────────────┘                     └─────────────┘
                                         │                                    │
                                         │                                    │ TCP
                                         ├─ HTTP Listener (9444)              │
                                         ├─ WS Control (8444)                 ▼
                                         └─ Base Domain Config        ┌─────────────┐
                                                                      │  localhost  │
                                                                      │   :3000     │
                                                                      └─────────────┘
```

## 🚀 快速開始

### 前置需求

- Rust 1.70+
- Node.js (僅用於開發/測試)

### 1. 啟動 Relay Server

Relay 是中繼伺服器，處理所有進入的連接並轉發到對應的 CLI 客戶端。

```bash
# 進入 relay 目錄
cd packages/relay

# 設定環境變數並啟動
WS_PORT=8444 HTTP_PORT=9444 BASE_DOMAIN=localhost cargo run

# 或使用發行版編譯
cargo build --release
WS_PORT=8444 HTTP_PORT=9444 BASE_DOMAIN=localhost ./target/release/relay
```

**環境變數說明**:
- `WS_PORT`: WebSocket 控制連接端口（CLI 連接用）- 預設 `8444`
- `HTTP_PORT`: HTTP/WebSocket 代理端口（瀏覽器訪問用）- 預設 `9444`
- `BASE_DOMAIN`: 基礎域名 - 預設 `localhost`

**啟動成功會看到**:
```
INFO Starting Noverlink Relay
INFO Base domain: localhost
INFO WebSocket listener started on 0.0.0.0:8444
INFO HTTP listener started on 0.0.0.0:9444
```

### 2. 啟動 CLI Client

CLI 客戶端連接到 Relay，並將本地服務暴露出去。

```bash
# 進入 CLI 目錄
cd packages/cli

# 啟動隧道，暴露本地端口 3000
NOVERLINK_RELAY_URL=ws://localhost:8444 cargo run -- http 3000

# 或使用發行版
cargo build --release
NOVERLINK_RELAY_URL=ws://localhost:8444 ./target/release/noverlink-cli http 3000
```

**環境變數說明**:
- `NOVERLINK_RELAY_URL`: Relay 的 WebSocket 控制端點 URL
  - 預設: `ws://localhost:8444`
  - 生產環境範例: `ws://relay.yourdomain.com:8444`

**命令格式**:
```bash
noverlink-cli http <PORT> [OPTIONS]

參數:
  <PORT>              要轉發的本地端口號

選項:
  --domain <DOMAIN>   指定子域名（可選）
  -h, --help          顯示幫助信息
```

**啟動成功會看到**:
```
🚀 Starting Noverlink tunnel...

INFO Connecting to relay: ws://localhost:8444
INFO WebSocket connection established
INFO Tunnel registered: http://satisfied-airedale.localhost

✅ Tunnel established!

   Public URL:  http://satisfied-airedale.localhost
   Forwarding:  http://satisfied-airedale.localhost → localhost:3000

Press Ctrl+C to stop the tunnel
```

### 3. 訪問你的服務

現在你的本地服務已經暴露到公網了！

**HTTP 請求**:
```bash
# 訪問你的服務（使用 CLI 給你的 subdomain）
curl http://satisfied-airedale.localhost:9444/

# 或在瀏覽器打開
open http://satisfied-airedale.localhost:9444/
```

**WebSocket 連接**:
```bash
# 使用 websocat 測試 WebSocket
websocat ws://satisfied-airedale.localhost:9444/

# 或在 JavaScript 中
const ws = new WebSocket('ws://satisfied-airedale.localhost:9444/');
```

## 📖 使用範例

### 範例 1: 暴露本地 Web 應用

```bash
# Terminal 1: 啟動你的本地應用
npm run dev  # 假設運行在 localhost:3000

# Terminal 2: 啟動 Relay
cd packages/relay
WS_PORT=8444 HTTP_PORT=9444 BASE_DOMAIN=localhost cargo run

# Terminal 3: 啟動 CLI
cd packages/cli
NOVERLINK_RELAY_URL=ws://localhost:8444 cargo run -- http 3000

# 現在可以通過公網 URL 訪問了！
# http://your-subdomain.localhost:9444
```

### 範例 2: 暴露 WebSocket 服務

```bash
# Terminal 1: 啟動 WebSocket server (例如 Socket.io)
node websocket-server.js  # 運行在 localhost:8080

# Terminal 2: 啟動 Relay
cd packages/relay
WS_PORT=8444 HTTP_PORT=9444 BASE_DOMAIN=localhost cargo run

# Terminal 3: 啟動 CLI
cd packages/cli
NOVERLINK_RELAY_URL=ws://localhost:8444 cargo run -- http 8080

# WebSocket 客戶端可以連接
# ws://your-subdomain.localhost:9444
```

### 範例 3: 生產環境部署

**在伺服器上部署 Relay**:

```bash
# 編譯發行版
cd packages/relay
cargo build --release

# 設定環境變數
export WS_PORT=8444
export HTTP_PORT=443  # 使用標準 HTTPS 端口
export BASE_DOMAIN=tunnel.yourdomain.com

# 啟動（建議使用 systemd 或 Docker）
./target/release/relay
```

**客戶端連接到生產 Relay**:

```bash
cd packages/cli
cargo build --release

# 連接到生產 Relay
NOVERLINK_RELAY_URL=wss://tunnel.yourdomain.com:8444 \
  ./target/release/noverlink-cli http 3000
```

## 🔧 進階配置

### 環境變數完整列表

**Relay Server**:
```bash
WS_PORT=8444           # WebSocket 控制端口
HTTP_PORT=9444         # HTTP/WS 代理端口
BASE_DOMAIN=localhost  # 基礎域名
RUST_LOG=info         # 日誌級別 (error, warn, info, debug, trace)
```

**CLI Client**:
```bash
NOVERLINK_RELAY_URL=ws://localhost:8444  # Relay WebSocket URL
RUST_LOG=info                             # 日誌級別
```

### 自定義子域名

```bash
# 指定你想要的子域名
cargo run -- http 3000 --domain myapp

# 你的服務會在這個 URL:
# http://myapp.localhost:9444
```

### 日誌調試

```bash
# 啟用詳細日誌
RUST_LOG=debug cargo run

# 只顯示錯誤
RUST_LOG=error cargo run
```

## 🧪 測試

專案包含完整的測試套件：

### 運行 WebSocket 測試

```bash
# 自動化測試腳本
./test-websocket.sh

# 或手動測試
node test-ws-server.js      # Terminal 1: 測試 server
cargo run --bin relay        # Terminal 2: Relay
cargo run -- http 3000       # Terminal 3: CLI
websocat ws://xxx.localhost:9444  # Terminal 4: 測試客戶端
```

### 運行 HTTP 測試

```bash
node test-http-server.js     # Terminal 1: 測試 server
cargo run --bin relay        # Terminal 2: Relay
cargo run -- http 3000       # Terminal 3: CLI

# 測試不同端點
curl http://xxx.localhost:9444/
curl http://xxx.localhost:9444/api/json
curl http://xxx.localhost:9444/large
```

測試結果詳見:
- [WebSocket 測試結果](TEST_RESULTS.md)
- [HTTP 測試結果](HTTP_TEST_RESULTS.md)

## 📊 性能

基於測試結果:

| 指標 | 數值 |
|------|------|
| 小請求延遲 | ~2-5ms |
| 大文件 (1MB) | ~50-100ms |
| 並發連接 | 支援 10+ 同時連接 |
| 吞吐量 | 無明顯瓶頸 |
| 穩定性 | 零崩潰，零洩漏 |

## 🛠️ 開發

### 專案結構

```
noverlink/
├── packages/
│   ├── relay/              # Rust - 中繼伺服器
│   │   ├── src/
│   │   │   ├── main.rs           # 入口
│   │   │   ├── registry.rs       # 連接管理
│   │   │   ├── handlers/
│   │   │   │   ├── http.rs       # HTTP/WebSocket 處理
│   │   │   │   └── ws.rs         # CLI 控制連接
│   │   │   └── metrics.rs        # 監控指標（stub）
│   │   └── Cargo.toml
│   │
│   ├── cli/                # Rust - 客戶端工具
│   │   ├── src/
│   │   │   ├── main.rs           # 入口
│   │   │   ├── cli.rs            # CLI 參數解析
│   │   │   ├── commands/         # 命令實現
│   │   │   ├── relay.rs          # Relay 連接
│   │   │   └── forwarder.rs      # 請求轉發
│   │   └── Cargo.toml
│   │
│   └── rs-shared/          # Rust - 共享代碼
│       ├── src/
│       │   └── protocol.rs       # 協議定義
│       └── Cargo.toml
│
├── test-ws-server.js       # WebSocket 測試 server
├── test-http-server.js     # HTTP 測試 server
├── TEST_RESULTS.md         # WebSocket 測試結果
└── HTTP_TEST_RESULTS.md    # HTTP 測試結果
```

### 編譯

```bash
# 開發模式編譯（快速，包含調試信息）
cargo build

# 發行版編譯（優化，體積小）
cargo build --release

# 編譯特定套件
cargo build -p relay
cargo build -p noverlink-cli
```

### 運行測試

```bash
# 運行所有測試
cargo test

# 運行特定套件的測試
cargo test -p rs-shared
cargo test -p relay

# 顯示測試輸出
cargo test -- --nocapture
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

## 🙏 致謝

- 靈感來自 [ngrok](https://ngrok.com)
- 使用 [Tokio](https://tokio.rs) 非同步運行時
- 使用 [Nx](https://nx.dev) 管理 monorepo
