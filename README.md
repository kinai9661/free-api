# API Gateway - api.airforce

基於 Next.js + Tailwind CSS 的 API Gateway，整合聊天、圖片生成等功能，部署到 Cloudflare Pages。

## 功能特色

- 💬 **聊天完成** - 支援多種 AI 模型進行對話
- 🎨 **圖片生成** - 使用 DALL-E、Stable Diffusion 等模型生成圖片
- 🔑 **API Key 管理** - 安全地管理多個 API Key，設定權限和限流
- 📊 **實時監控** - 監控 API 使用情況、請求統計和系統狀態
- 🚀 **Cloudflare Pages 部署** - 全球 CDN 加速，邊緣計算

## 技術棧

- **前端**: Next.js 14+ (App Router) + React 18+
- **樣式**: Tailwind CSS
- **語言**: TypeScript
- **部署**: Cloudflare Pages
- **存儲**: Cloudflare KV (配置/快取) + R2 (圖片)

## 快速開始

### 本地開發

1. 安裝依賴：
```bash
npm install
```

2. 複製環境變數文件：
```bash
cp .env.example .env.local
```

3. 啟動開發服務器：
```bash
npm run dev
```

4. 打開瀏覽器訪問 `http://localhost:3000`

### 部署到 Cloudflare Pages

#### 方法 1：使用 Wrangler CLI

1. 安裝 Wrangler：
```bash
npm install -g wrangler
```

2. 登入 Cloudflare：
```bash
wrangler login
```

3. 構建並部署：
```bash
npm run pages:deploy
```

#### 方法 2：使用 Cloudflare Dashboard

1. 構建專案：
```bash
npm run build
npm run pages:build
```

2. 在 Cloudflare Dashboard 創建新的 Pages 專案
3. 上傳 `.vercel/output/static` 目錄
4. 設定環境變數和綁定

#### 方法 3：使用 GitHub Actions

1. Fork 此專案到 GitHub
2. 在 Cloudflare Dashboard 連接 GitHub 倉庫
3. 設定構建命令和輸出目錄
4. 配置環境變數和綁定

## 環境變數配置

在 `.env.local` 或 Cloudflare Pages 環境變數中設定：

```env
# API 配置
API_BASE_URL=https://api.airforce
NEXT_PUBLIC_API_URL=/api

# 管理員密碼（用於 API Key 管理）
ADMIN_PASSWORD=your-admin-password-here

# Cloudflare KV 配置
KV_NAMESPACE_ID=your-kv-namespace-id
KV_PREVIEW_NAMESPACE_ID=your-preview-kv-namespace-id

# Cloudflare R2 配置
R2_BUCKET_NAME=api-airforce-gateway-images

# 限流配置
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_TOKENS=10000

# 監控配置
MONITORING_ENABLED=true
MONITORING_RETENTION_DAYS=30
```

## Cloudflare 綁定配置

### KV 命名空間

1. 在 Cloudflare Dashboard 創建 KV 命名空間
2. 在 `wrangler.toml` 中配置綁定：
```toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

### R2 存儲桶

1. 在 Cloudflare Dashboard 創建 R2 存儲桶
2. 在 `wrangler.toml` 中配置綁定：
```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "api-airforce-gateway-images"
```

## API 文檔

### 聊天完成 API

```bash
POST /api/chat
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "model": "gpt-4",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "stream": false
}
```

### 圖片生成 API

```bash
POST /api/image
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "model": "dall-e-3",
  "prompt": "A beautiful sunset",
  "n": 1,
  "size": "1024x1024"
}
```

### API Key 管理 API

```bash
# 列出所有 API Keys（需要管理員密碼）
GET /api/apikeys
X-Admin-Password: your-admin-password

# 創建新 API Key
POST /api/apikeys
X-Admin-Password: your-admin-password
Content-Type: application/json

{
  "name": "My API Key",
  "permissions": [
    { "type": "chat", "enabled": true },
    { "type": "image", "enabled": true }
  ],
  "rateLimit": {
    "requestsPerMinute": 100,
    "tokensPerMinute": 10000
  }
}

# 刪除 API Key
DELETE /api/apikeys
X-Admin-Password: your-admin-password
Content-Type: application/json

{
  "key": "af_xxxxxxxxxxxx"
}
```

### 監控 API

```bash
# 獲取系統監控數據（需要管理員密碼）
GET /api/monitoring?period=day
X-Admin-Password: your-admin-password
```

## 專案結構

```
api-airforce-gateway-nextjs/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── chat/            # 聊天 API
│   │   ├── image/           # 圖片生成 API
│   │   ├── apikeys/         # API Key 管理 API
│   │   └── monitoring/      # 監控 API
│   ├── chat/                # 聊天頁面
│   ├── image/               # 圖片生成頁面
│   ├── apikeys/             # API Key 管理頁面
│   ├── monitoring/          # 監控儀表板頁面
│   ├── layout.tsx           # 根佈局
│   ├── page.tsx             # 首頁
│   └── globals.css          # 全局樣式
├── components/              # React 組件
│   ├── base/               # 基礎組件
│   ├── layout/             # 佈局組件
│   └── features/           # 功能組件
├── lib/                     # 工具庫
│   ├── middleware/         # 中介軟體
│   ├── services/           # 服務
│   └── utils/              # 工具函數
├── types/                   # TypeScript 類型定義
├── public/                  # 靜態資源
├── .env.example            # 環境變數境變數範例
├── .env.local              # 本地環境變數
├── next.config.js          # Next.js 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
├── wrangler.toml           # Cloudflare Wrangler 配置
└── package.json            # 專案依賴
```

## 開發指南

### 添加新的 API 端點

1. 在 `app/api/` 下創建新的路由目錄
2. 創建 `route.ts` 文件並實現處理函數
3. 使用中介軟體進行認證、限流等

### 添加新的頁面

1. 在 `app/` 下創建新的頁面目錄
2. 創建 `page.tsx` 文件
3. 使用現有組件或創建新組件

### 添加新的組件

1. 在 `components/` 下創建組件文件
2. 遵循現有的組件結構和命名約定
3. 使用 TypeScript 進行類型定義

## 故障排除

### 構建錯誤

- 確保所有依賴已安裝：`npm install`
- 檢查 TypeScript 類型錯誤：`npm run lint`
- 清除快取：`rm -rf .next node_modules && npm install`

### 部署錯誤

- 檢查 Cloudflare 綁定是否正確配置
- 確認環境變數已設定
- 查看 Cloudflare Pages 構建日誌

### API 錯誤

- 檢查 API Key 是否有效
- 確認限流設定是否合理
- 查看 Cloudflare KV/R2 綁定狀態

## 許可證

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 聯繫方式

如有問題，請通過 GitHub Issues 聯繫。
