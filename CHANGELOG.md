# 變更日誌

本專案的所有重要變更都將記錄在此文件中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
並且本專案遵守 [語義化版本](https://semver.org/lang/zh-TW/)。

## [未發布]

### 新增
- 初始版本發布
- OpenAI 相容 API 介面
- 聊天完成功能（支援串流）
- 圖片生成功能
- 多 API Key 管理（Admin、User、Service）
- 多級限流機制（全域、Key、IP、端點）
- 即時監控和統計
- Web UI 管理介面
- 健康檢查端點

### 技術
- Cloudflare Workers 部署
- Cloudflare KV 資料存儲
- Cloudflare R2 物件存儲
- 純 HTML/CSS/JavaScript Web UI
- Token Bucket 限流演算法
- Sliding Window 限流演算法

## [1.0.0] - 2024-01-01

### 新增
- 完整的 API Gateway 功能
- 聊天完成 API
- 圖片生成 API
- API Key 管理系統
- 限流和監控系統
- Web UI 管理介面
- 部署腳本
- 完整文檔

---

## 版本說明

### [未發布]
- 正在開發中的版本，尚未發布。

### [1.0.0]
- 首次穩定版本發布。
