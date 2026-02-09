# API Airforce Gateway

一個基於 Cloudflare Workers 的 API Gateway，提供 OpenAI 相容的 API 介面，支援聊天完成、圖片生成、多 API Key 管理、限流監控等功能。

## 功能特色

- 🚀 **OpenAI 相容 API** - 完全相容 OpenAI API 格式
- 💬 **聊天完成** - 支援串流和非串流模式
- 🎨 **圖片生成** - 整合 DALL-E 圖片生成
- 🔑 **多 API Key 管理** - 支援 Admin、User、Service 三種類型
- 📊 **限流監控** - Token Bucket 和 Sliding Window 演算法
- 📈 **即時監控** - 請求統計、錯誤追蹤、使用分析
- 🌐 **Web UI** - 純 HTML/CSS/JavaScript 實現的管理介面
- 🔒 **安全特性** - IP 限制、過期時間、權限控制

## 架構

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Router  │→│   Auth   │→│RateLimit │→│ Handlers │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│       ↓              ↓              ↓              ↓        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Cloudflare KV (Data Store)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  api.airforce │
                    └───────────────┘
```

## 快速開始

### 前置需求

- Node.js 18+
- Wrangler CLI
- Cloudflare 帳號

### 安裝

1. 克隆專案
```bash
git clone <repository-url>
cd api-airforce-gateway
```

2. 安裝依賴
```bash
npm install
```

3. 登入 Cloudflare
```bash
wrangler login
```

4. 配置 wrangler.toml
```toml
# 更新 KV namespace ID
[[kv_namespaces]]
binding = "KV"
id = "your_kv_namespace_id"
preview_id = "your_preview_kv_namespace_id"
```

5. 部署
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

## API 端點

### 公開 API

| 端點 | 方法 | 描述 |
|------|------|------|
| `/v1/models` | GET | 列出可用模型 |
| `/v1/chat/completions` | POST | 建立聊天完成 |
| `/v1/images/generations` | POST | 生成圖片 |
| `/health` | GET | 健康檢查 |

### 管理 API

| 端點 | 方法 | 描述 |
|------|------|------|
| `/admin/apikeys` | GET | 列出所有 API Keys |
| `/admin/apikeys` | POST | 建立新的 API Key |
| `/admin/apikeys/:id` | GET | 取得特定 API Key |
| `/admin/apikeys/:id` | PUT | 更新 API Key |
| `/admin/apikeys/:id` | DELETE | 刪除 API Key |
| `/admin/stats` | GET | 取得統計資料 |
| `/admin/logs` | GET | 取得日誌 |
| `/admin/settings` | GET | 取得設定 |
| `/admin/settings` | PUT | 更新設定 |

## 使用範例

### 聊天完成

```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### 圖片生成

```bash
curl https://your-worker.workers.dev/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A beautiful sunset over mountains",
    "n": 1,
    "size": "1024x1024"
  }'
```

### 串流聊天

```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Tell me a story"}
    ],
    "stream": true
  }'
```

## API Key 類型

### Admin Key
- 完整管理權限
- 可建立、編輯、刪除其他 API Keys
- 可存取所有管理端點

### User Key
- 基本使用權限
- 可使用聊天和圖片生成功能
- 可設定限流

### Service Key
- 服務整合權限
- 僅限聊天功能
- 適合後端服務整合

## 限流機制

系統實施多級限流：

1. **全域限流** - 所有請求的總限制
2. **API Key 限流** - 每個 API Key 的獨立限制
3. **IP 限流** - 每個 IP 地址的限制
4. **端點限流** - 每個 API 端點的限制

## Web UI

部署後，訪問 Worker URL 即可使用 Web UI：

1. 輸入 Admin API Key 登入
2. 查看儀表板統計
3. 管理 API Keys
4. 監控請求和日誌
5. 調整系統設定

## 專案結構

```
api-airforce-gateway/
├── src/
│   ├── index.js              # 主入口
│   ├── handlers/             # 請求處理器
│   │   ├── chatHandler.js
│   │   ├── imageHandler.js
│   │   ├── adminHandler.js
│   │   ├── webHandler.js
│   │   └── healthHandler.js
│   ├── middleware/           # 中間件
│   │   ├── auth.js
│   │   └── rateLimit.js
│   ├── services/             # 服務層
│   │   ├── apiKeyService.js
│   │   ├── rateLimitService.js
│   │   └── monitoringService.js
│   └── utils/                # 工具類
│       ├── router.js
│       └── logger.js
├── web-ui/                   # Web UI
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       └── pages/
│           ├── dashboard.js
│           ├── apikeys.js
│           ├── monitoring.js
│           ├── logs.js
│           └── settings.js
├── wrangler.toml             # Cloudflare 配置
├── package.json
├── deploy.sh                 # 部署腳本 (Linux/Mac)
├── deploy.bat                # 部署腳本 (Windows)
└── README.md
```

## 環境變數

| 變數 | 描述 | 必要 |
|------|------|------|
| `API_AIRFORCE_KEY` | api.airforce API Key | 是 |
| `ADMIN_API_KEY` | 管理 API Key | 是 |
| `ENVIRONMENT` | 環境 (production/preview) | 否 |
| `API_AIRFORCE_BASE_URL` | api.airforce 基礎 URL | 否 |
| `DEFAULT_RATE_LIMIT` | 預設請求限制 | 否 |
| `DEFAULT_RATE_WINDOW` | 預設時間窗口 | 否 |

## 開發

### 本地開發

```bash
# 啟動本地開發伺服器
npm run dev
```

### 測試

```bash
# 執行測試
npm test
```

## 故障排除

### KV Namespace 未設定

確保在 `wrangler.toml` 中設定了正確的 KV namespace ID：

```bash
# 建立 KV namespace
wrangler kv:namespace create "API_AIRFORCE_GATEWAY"

# 更新 wrangler.toml 中的 ID
```

### R2 Bucket 未建立

確保 R2 bucket 已建立：

```bash
# 建立 R2 bucket
wrangler r2 bucket create api-airforce-gateway
```

### API Key 驗證失敗

檢查：
1. API Key 是否正確
2. API Key 是否已啟用
3. API Key 是否已過期
4. IP 是否在允許列表中

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 支援

如有問題，請提交 Issue 或聯繫維護者。
