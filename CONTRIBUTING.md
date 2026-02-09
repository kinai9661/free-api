# 貢獻指南

感謝您對 API Airforce Gateway 專案的興趣！我們歡迎任何形式的貢獻。

## 如何貢獻

### 報告問題

如果您發現了 bug 或有功能建議，請：

1. 檢查 [Issues](https://github.com/your-repo/issues) 確認問題尚未被報告
2. 創建一個新的 Issue，包含：
   - 清晰的標題
   - 詳細的問題描述
   - 重現步驟
   - 預期行為
   - 實際行為
   - 環境資訊（作業系統、Node.js 版本等）

### 提交程式碼

1. **Fork 專案**
   ```bash
   # 點擊 GitHub 頁面上的 Fork 按鈕
   ```

2. **克隆您的 fork**
   ```bash
   git clone https://github.com/your-username/api-airforce-gateway.git
   cd api-airforce-gateway
   ```

3. **創建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **進行修改**
   - 遵循現有的程式碼風格
   - 添加必要的測試
   - 更新相關文檔

5. **提交變更**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   提交訊息格式：
   - `feat:` 新功能
   - `fix:` 錯誤修復
   - `docs:` 文檔更新
   - `style:` 程式碼格式（不影響功能）
   - `refactor:` 重構
   - `test:` 測試相關
   - `chore:` 構建或工具相關

6. **推送到您的 fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **創建 Pull Request**
   - 前往 GitHub 上的原始專案
   - 點擊 "New Pull Request"
   - 選擇您的分支
   - 填寫 PR 描述
   - 等待審查

## 程式碼風格

### JavaScript

- 使用 2 空格縮排
- 使用單引號
- 使用分號
- 函數使用 camelCase
- 類別使用 PascalCase
- 常數使用 UPPER_SNAKE_CASE

```javascript
// 好的範例
const API_KEY = 'sk-123456';

function createApiKey(data) {
  return {
    id: crypto.randomUUID(),
    key: generateKey(),
    ...data
  };
}

class ApiKeyService {
  async validateKey(kv, apiKey) {
    // ...
  }
}
```

### 文檔

- 使用繁體中文
- 清晰簡潔的描述
- 包含使用範例

## 測試

在提交 PR 之前，請確保：

1. 所有測試通過
2. 新功能有對應的測試
3. 程式碼通過 lint 檢查

```bash
# 執行測試
npm test

# 執行 lint
npm run lint
```

## 文檔

更新文檔時：

1. 保持文檔與程式碼同步
2. 添加清晰的範例
3. 更新 CHANGELOG.md

## 發布流程

1. 更新版本號（package.json）
2. 更新 CHANGELOG.md
3. 創建 git tag
4. 推送到 GitHub
5. 創建 GitHub Release

## 行為準則

- 尊重所有貢獻者
- 建設性的反饋
- 歡迎新手
- 專業和友善

## 獲取幫助

如果您有任何問題：

1. 查看 [README.md](README.md)
2. 查看 [API_EXAMPLES.md](API_EXAMPLES.md)
3. 搜索現有的 Issues
4. 創建新的 Issue

## 授權

通過貢獻，您同意您的程式碼將根據專案的 MIT 授權進行授權。
