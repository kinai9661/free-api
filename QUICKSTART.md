# 快速開始指南

本指南將幫助您在 5 分鐘內部署 API Airforce Gateway。

## 前置需求

- Node.js 18+
- Wrangler CLI
- Cloudflare 帳號
- api.airforce API Key

## 步驟 1: 安裝 Wrangler

```bash
npm install -g wrangler
```

## 步驟 2: 登入 Cloudflare

```bash
wrangler login
```

這將打開瀏覽器讓您登入 Cloudflare。

## 步驟 3: 創建 KV Namespace

```bash
wrangler kv:namespace create "API_AIRFORCE_GATEWAY"
```

記下輸出的 `id`，稍後會用到。

## 步驟 4: 創建 R2 Bucket

```bash
wrangler r2 bucket create api-airforce-gateway
```

## 步驟 5: 配置 wrangler.toml

打開 [`wrangler.toml`](wrangler.toml) 文件，更新以下內容：

```toml
# 更新 KV namespace ID
[[kv_namespaces]]
binding = "KV"
id = "your_kv_namespace_id_here"  # 替換為步驟 3 中的 ID
preview_id = "your_preview_kv_namespace_id_here"
```

## 步驟 6: 安裝依賴

```bash
cd api-airforce-gateway
npm install
```

## 步驟 7: 部署

### Linux/Mac

```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows

```bash
deploy.bat
```

部署腳本會：
1. 部署 Worker
2. 上傳 Web UI 到 R2
3. 設置必要的 secrets

## 步驟 8: 設置 Secrets

部署腳本會提示您輸入以下 secrets：

1. **API_AIRFORCE_KEY** - 您的 api.airforce API Key
2. **ADMIN_API_KEY** - 管理 API Key（可以留空自動生成）

⚠️ **重要**: 請妥善保存您的 ADMIN_API_KEY！

## 步驟 9: 訪問 Web UI

部署完成後，訪問您的 Worker URL：

```
https://your-worker-name.your-subdomain.workers.dev
```

使用您的 ADMIN_API_KEY 登入。

## 步驟 10: 創建 API Keys

在 Web UI 中：

1. 點擊「API Keys」頁籤
2. 點擊「新增 API Key」
3. 填寫名稱和類型
4. 設置限流參數
5. 點擊「確認」

## 測試 API

### 測試聊天完成

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

### 測試圖片生成

```bash
curl https://your-worker.workers.dev/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A beautiful sunset",
    "n": 1,
    "size": "1024x1024"
  }'
```

## 常見問題

### KV Namespace ID 在哪裡？

執行 `wrangler kv:namespace create "API_AIRFORCE_GATEWAY"` 後，輸出會顯示：

```
🌀 Creating namespace with title "API-AIRFORCE-GATEWAY"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

複製 `id` 的值到 `wrangler.toml`。

### 如何獲取 api.airforce API Key？

訪問 [api.airforce](https://api.airforce/) 註冊並獲取 API Key。

### 部署失敗怎麼辦？

1. 檢查 Cloudflare 登入狀態：`wrangler whoami`
2. 檢查 KV namespace ID 是否正確
3. 檢查 R2 bucket 是否已創建
4. 查看錯誤訊息並根據提示修復

### 如何查看日誌？

```bash
wrangler tail
```

## 下一步

- 閱讀 [README.md](README.md) 了解更多功能
- 查看 [API_EXAMPLES.md](API_EXAMPLES.md) 了解 API 使用範例
- 閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何貢獻

## 需要幫助？

如有問題，請：
1. 查看 [README.md](README.md) 的故障排除部分
2. 提交 [Issue](https://github.com/your-repo/issues)
