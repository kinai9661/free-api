/**
 * Web UI Handler
 * Serves the Web UI as a single HTML file with embedded CSS and JS
 */

const WEB_UI_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Airforce Gateway</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --color-primary: #6366f1;
      --color-primary-hover: #4f46e5;
      --color-secondary: #64748b;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-error: #ef4444;
      --color-bg-primary: #ffffff;
      --color-bg-secondary: #f8fafc;
      --color-bg-tertiary: #f1f5f9;
      --color-text-primary: #1e293b;
      --color-text-secondary: #64748b;
      --color-text-tertiary: #94a3b8;
      --color-border: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      --radius-md: 8px;
      --radius-lg: 12px;
      --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --sidebar-width: 260px;
      --header-height: 64px;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg-primary: #0f172a;
        --color-bg-secondary: #1e293b;
        --color-bg-tertiary: #334155;
        --color-text-primary: #f1f5f9;
        --color-text-secondary: #cbd5e1;
        --color-text-tertiary: #94a3b8;
        --color-border: #334155;
      }
    }
    body {
      font-family: var(--font-family);
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
      line-height: 1.5;
    }
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: var(--sidebar-width);
      background-color: var(--color-bg-primary);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .sidebar-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-primary);
    }
    .version {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      margin-top: 0.25rem;
    }
    .sidebar-nav {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
      margin-bottom: 0.25rem;
    }
    .nav-item:hover {
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }
    .nav-item.active {
      background-color: var(--color-primary);
      color: white;
    }
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--color-border);
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .header {
      height: var(--header-height);
      background-color: var(--color-bg-primary);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0.5rem;
    }
    .page-title {
      font-size: 1.125rem;
      font-weight: 600;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .api-key-input {
      display: flex;
      gap: 0.5rem;
    }
    .api-key-input input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
      width: 200px;
    }
    .api-key-input input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .api-key-input button {
      padding: 0.5rem 0.75rem;
      background-color: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      cursor: pointer;
    }
    .api-key-input button:hover {
      background-color: var(--color-primary-hover);
    }
    .page-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
    .page { display: none; }
    .page.active { display: block; }
    .page.hidden { display: none; }
    
    /* Chat Styles */
    .chat-container {
      display: flex;
      height: calc(100vh - var(--header-height));
      overflow: hidden;
    }
    .chat-sidebar {
      width: 280px;
      background-color: var(--color-bg-primary);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
    }
    .chat-sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chat-sidebar-header h3 {
      font-size: 1rem;
      font-weight: 600;
    }
    .chat-history {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .chat-history-item {
      padding: 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      margin-bottom: 0.25rem;
      transition: background-color 0.2s ease;
    }
    .chat-history-item:hover {
      background-color: var(--color-bg-secondary);
    }
    .chat-history-item.active {
      background-color: var(--color-primary);
      color: white;
    }
    .chat-history-title {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chat-history-time {
      font-size: 0.75rem;
      opacity: 0.7;
    }
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg-secondary);
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    .chat-message {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .chat-message-user {
      flex-direction: row-reverse;
    }
    .chat-message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--color-bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .chat-message-assistant .chat-message-avatar {
      background-color: var(--color-primary);
      color: white;
    }
    .chat-message-user .chat-message-avatar {
      background-color: var(--color-secondary);
      color: white;
    }
    .chat-message-content {
      max-width: 70%;
      padding: 1rem;
      border-radius: var(--radius-lg);
      background-color: var(--color-bg-primary);
      box-shadow: var(--shadow-sm);
    }
    .chat-message-user .chat-message-content {
      background-color: var(--color-primary);
      color: white;
    }
    .chat-message-content p {
      margin: 0;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .chat-input-container {
      padding: 1.5rem;
      background-color: var(--color-bg-primary);
      border-top: 1px solid var(--color-border);
    }
    .chat-input-wrapper {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .chat-input-wrapper textarea {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-family: inherit;
      resize: none;
      min-height: 44px;
      max-height: 200px;
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }
    .chat-input-wrapper textarea:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .chat-send-btn {
      width: 44px;
      height: 44px;
      border: none;
      border-radius: var(--radius-md);
      background-color: var(--color-primary);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chat-send-btn:hover {
      background-color: var(--color-primary-hover);
    }
    .chat-options {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .chat-model-select {
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 0.875rem;
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }
    .chat-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    
    /* Image Styles */
    .image-container {
      display: flex;
      height: calc(100vh - var(--header-height));
      overflow: hidden;
    }
    .image-sidebar {
      width: 280px;
      background-color: var(--color-bg-primary);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
    }
    .image-sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
    }
    .image-sidebar-header h3 {
      font-size: 1rem;
      font-weight: 600;
    }
    .image-history {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .image-history-item {
      padding: 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      margin-bottom: 0.25rem;
      transition: background-color 0.2s ease;
    }
    .image-history-item:hover {
      background-color: var(--color-bg-secondary);
    }
    .image-history-preview {
      width: 100%;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      background-color: var(--color-bg-tertiary);
      margin-bottom: 0.5rem;
    }
    .image-history-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-history-info {
      font-size: 0.875rem;
    }
    .image-history-prompt {
      font-weight: 500;
      margin-bottom: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .image-history-time {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
    }
    .image-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg-secondary);
    }
    .image-preview {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-preview-placeholder {
      text-align: center;
      color: var(--color-text-tertiary);
    }
    .image-preview-placeholder svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    .image-preview-placeholder p {
      font-size: 0.875rem;
    }
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      width: 100%;
      max-width: 1200px;
    }
    .image-item {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background-color: var(--color-bg-primary);
      box-shadow: var(--shadow-md);
    }
    .image-item img {
      width: 100%;
      height: auto;
      display: block;
    }
    .image-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .image-item:hover .image-actions {
      opacity: 1;
    }
    .image-actions .btn {
      background-color: rgba(255, 255, 255, 0.9);
      color: var(--color-text-primary);
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    .image-input-container {
      padding: 1.5rem;
      background-color: var(--color-bg-primary);
      border-top: 1px solid var(--color-border);
    }
    .image-input-wrapper {
      margin-bottom: 1rem;
    }
    .image-input-wrapper textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-family: inherit;
      resize: none;
      min-height: 80px;
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }
    .image-input-wrapper textarea:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .image-options {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .image-option-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .image-option-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    .image-select {
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 0.875rem;
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }
    .image-generate-btn {
      width: 100%;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary {
      background-color: var(--color-primary);
      color: white;
    }
    .btn-primary:hover {
      background-color: var(--color-primary-hover);
    }
    .btn-secondary {
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    
    /* Modal */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal.active {
      display: flex;
    }
    .modal-content {
      background-color: var(--color-bg-primary);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .modal-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
    }
    .modal-close {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0.25rem;
    }
    .modal-body {
      padding: 1.5rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1.5rem;
      border-top: 1px solid var(--color-border);
    }
    
    /* Notification */
    .notification {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      background-color: var(--color-bg-primary);
      border-radius: var(--radius-md);
      padding: 1rem;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 1001;
      transform: translateX(calc(100% + 1.5rem));
      transition: transform 0.3s ease;
      max-width: 400px;
    }
    .notification.active {
      transform: translateX(0);
    }
    .notification.success {
      border-left: 4px solid var(--color-success);
    }
    .notification.error {
      border-left: 4px solid var(--color-error);
    }
    .notification.warning {
      border-left: 4px solid var(--color-warning);
    }
    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }
    .notification-close {
      background: none;
      border: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      padding: 0.25rem;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.active {
        transform: translateX(0);
      }
      .main-content {
        margin-left: 0;
      }
      .menu-toggle {
        display: block;
      }
      .chat-sidebar,
      .image-sidebar {
        display: none;
      }
      .chat-message-content {
        max-width: 85%;
      }
      .image-options {
        flex-direction: column;
        gap: 1rem;
      }
      .image-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>API Gateway</h1>
          <span class="version">v1.0.0</span>
        </div>
        <nav class="sidebar-nav">
          <a href="#chat" class="nav-item" data-page="chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>聊天</span>
          </a>
          <a href="#image" class="nav-item" data-page="image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>圖片生成</span>
          </a>
          <a href="#dashboard" class="nav-item" data-page="dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>儀表板</span>
          </a>
          <a href="#apikeys" class="nav-item" data-page="apikeys">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
            <span>API Keys</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">系統正常</span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header class="header">
          <div class="header-left">
            <button class="menu-toggle" id="menuToggle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h2 class="page-title" id="pageTitle">聊天</h2>
          </div>
          <div class="header-right">
            <div class="api-key-input">
              <input type="password" id="apiKeyInput" placeholder="輸入 API Key">
              <button id="apiKeySubmit">登入</button>
            </div>
          </div>
        </header>

        <div class="page-content" id="pageContent">
          <!-- Chat Page -->
          <div class="page active" id="page-chat">
            <div class="chat-container">
              <div class="chat-sidebar">
                <div class="chat-sidebar-header">
                  <h3>對話歷史</h3>
                  <button class="btn btn-sm btn-primary" id="newChatBtn">新對話</button>
                </div>
                <div class="chat-history" id="chatHistory">
                  <p style="text-align:center;color:var(--color-text-tertiary);padding:1rem;">暫無對話歷史</p>
                </div>
              </div>
              <div class="chat-main">
                <div class="chat-messages" id="chatMessages">
                  <div class="chat-message chat-message-assistant">
                    <div class="chat-message-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div class="chat-message-content">
                      <p>你好！我是 AI 助手，有什麼我可以幫助你的嗎？</p>
                    </div>
                  </div>
                </div>
                <div class="chat-input-container">
                  <div class="chat-input-wrapper">
                    <textarea id="chatInput" placeholder="輸入訊息..." rows="1"></textarea>
                    <button class="chat-send-btn" id="chatSendBtn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                  <div class="chat-options">
                    <select id="chatModel" class="chat-model-select">
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                    <label class="chat-option">
                      <input type="checkbox" id="chatStream" checked>
                      <span>串流輸出</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Image Generation Page -->
          <div class="page hidden" id="page-image">
            <div class="image-container">
              <div class="image-sidebar">
                <div class="image-sidebar-header">
                  <h3>生成歷史</h3>
                </div>
                <div class="image-history" id="imageHistory">
                  <p style="text-align:center;color:var(--color-text-tertiary);padding:1rem;">暫無生成歷史</p>
                </div>
              </div>
              <div class="image-main">
                <div class="image-preview" id="imagePreview">
                  <div class="image-preview-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p>生成的圖片將顯示在這裡</p>
                  </div>
                </div>
                <div class="image-input-container">
                  <div class="image-input-wrapper">
                    <textarea id="imagePrompt" placeholder="描述你想要生成的圖片..." rows="3"></textarea>
                  </div>
                  <div class="image-options">
                    <div class="image-option-group">
                      <label>模型</label>
                      <select id="imageModel" class="image-select">
                        <option value="dall-e-3">DALL-E 3</option>
                        <option value="dall-e-2">DALL-E 2</option>
                      </select>
                    </div>
                    <div class="image-option-group">
                      <label>尺寸</label>
                      <select id="imageSize" class="image-select">
                        <option value="1024x1024">1024 x 1024</option>
                        <option value="1792x1024">1792 x 1024</option>
                        <option value="1024x1792">1024 x 1792</option>
                      </select>
                    </div>
                    <div class="image-option-group">
                      <label>數量</label>
                      <select id="imageCount" class="image-select">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  </div>
                  <button class="btn btn-primary image-generate-btn" id="imageGenerateBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    生成圖片
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dashboard Page -->
          <div class="page hidden" id="page-dashboard">
            <div style="text-align:center;padding:3rem;">
              <h2>儀表板</h2>
              <p style="color:var(--color-text-secondary);">請先登入 API Key 以查看統計資料</p>
            </div>
          </div>

          <!-- API Keys Page -->
          <div class="page hidden" id="page-apikeys">
            <div style="text-align:center;padding:3rem;">
              <h2>API Keys 管理</h2>
              <p style="color:var(--color-text-secondary);">請先登入 Admin API Key 以管理 API Keys</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal -->
    <div class="modal" id="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modalTitle">標題</h3>
          <button class="modal-close" id="modalClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" id="modalBody"></div>
        <div class="modal-footer" id="modalFooter">
          <button class="btn btn-secondary" id="modalCancel">取消</button>
          <button class="btn btn-primary" id="modalConfirm">確認</button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div class="notification" id="notification">
      <div class="notification-content">
        <span class="notification-icon" id="notificationIcon"></span>
        <span class="notification-message" id="notificationMessage"></span>
      </div>
      <button class="notification-close" id="notificationClose">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>

  <script>
    // API Client
    class APIClient {
      constructor() {
        this.baseURL = '';
        this.apiKey = localStorage.getItem('api_key') || '';
      }

      setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('api_key', key);
      }

      getApiKey() {
        return this.apiKey;
      }

      async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey,
          ...options.headers
        };

        const response = await fetch(url, {
          ...options,
          headers
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Request failed');
        }

        return response.json();
      }

      async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
      }

      async post(endpoint, data) {
        return this.request(endpoint, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    }

    const api = new APIClient();

    // Modal
    class Modal {
      constructor() {
        this.modal = document.getElementById('modal');
        this.title = document.getElementById('modalTitle');
        this.body = document.getElementById('modalBody');
        this.confirmBtn = document.getElementById('modalConfirm');
        this.cancelBtn = document.getElementById('modalCancel');
        this.closeBtn = document.getElementById('modalClose');

        this.closeBtn.addEventListener('click', () => this.close());
        this.cancelBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.close();
        });
      }

      open(title, content, onConfirm = null) {
        this.title.textContent = title;
        this.body.innerHTML = content;
        this.modal.classList.add('active');

        if (onConfirm) {
          this.confirmBtn.style.display = 'inline-flex';
          this.confirmBtn.onclick = () => {
            onConfirm();
            this.close();
          };
        } else {
          this.confirmBtn.style.display = 'none';
        }
      }

      close() {
        this.modal.classList.remove('active');
      }
    }

    // Notification
    class Notification {
      constructor() {
        this.notification = document.getElementById('notification');
        this.icon = document.getElementById('notificationIcon');
        this.message = document.getElementById('notificationMessage');
        this.closeBtn = document.getElementById('notificationClose');

        this.closeBtn.addEventListener('click', () => this.hide());
      }

      show(message, type = 'success') {
        this.message.textContent = message;
        this.notification.className = 'notification ' + type + ' active';

        const icons = {
          success: '✓',
          error: '✕',
          warning: '⚠'
        };
        this.icon.textContent = icons[type] || '✓';

        setTimeout(() => this.hide(), 5000);
      }

      hide() {
        this.notification.classList.remove('active');
      }
    }

    const modal = new Modal();
    const notification = new Notification();

    // Chat Page
    const ChatPage = {
      messages: [],
      currentChatId: null,
      isStreaming: false,

      init() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const newChatBtn = document.getElementById('newChatBtn');

        chatInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });

        chatInput.addEventListener('input', () => {
          chatInput.style.height = 'auto';
          chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
        });

        chatSendBtn.addEventListener('click', () => this.sendMessage());
        newChatBtn.addEventListener('click', () => this.newChat());
      },

      async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (!message || this.isStreaming) return;

        const model = document.getElementById('chatModel').value;
        const stream = document.getElementById('chatStream').checked;

        this.addMessage('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        if (!this.currentChatId) {
          this.currentChatId = Date.now().toString();
          this.saveChatToHistory(message);
        }

        const loadingId = this.addLoadingIndicator();

        try {
          if (stream) {
            await this.sendStreamingMessage(model, message, loadingId);
          } else {
            await this.sendNonStreamingMessage(model, message, loadingId);
          }
        } catch (error) {
          this.removeMessage(loadingId);
          this.addMessage('assistant', '錯誤: ' + error.message, true);
        }
      },

      async sendNonStreamingMessage(model, message, loadingId) {
        try {
          const response = await api.post('/v1/chat/completions', {
            model,
            messages: this.getMessagesForAPI(),
            stream: false
          });

          this.removeMessage(loadingId);
          const content = response.choices[0]?.message?.content || '沒有回應';
          this.addMessage('assistant', content);
          this.updateChatHistory(content);
        } catch (error) {
          throw error;
        }
      },

      async sendStreamingMessage(model, message, loadingId) {
        this.isStreaming = true;

        try {
          const response = await fetch(api.baseURL + '/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + api.getApiKey(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: this.getMessagesForAPI(),
              stream: true
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || '請求失敗');
          }

          this.removeMessage(loadingId);
          const messageId = this.addMessage('assistant', '', false, true);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                    this.updateMessage(messageId, fullContent);
                  }
                } catch (e) {}
              }
            }
          }

          this.isStreaming = false;
          this.updateChatHistory(fullContent);
        } catch (error) {
          this.isStreaming = false;
          throw error;
        }
      },

      getMessagesForAPI() {
        return this.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      },

      addMessage(role, content, isError = false, isStreaming = false) {
        const messageId = 'msg-' + Date.now();
        const messagesContainer = document.getElementById('chatMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message chat-message-' + role + (isError ? ' chat-message-error' : '');
        messageDiv.id = messageId;

        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.innerHTML = role === 'user' 
          ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
          : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-message-content';
        contentDiv.innerHTML = isStreaming ? '<span class="typing-indicator">...</span>' : '<p>' + this.escapeHtml(content) + '</p>';

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.messages.push({ role, content, id: messageId });

        return messageId;
      },

      updateMessage(messageId, content) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
          const contentDiv = messageDiv.querySelector('.chat-message-content');
          contentDiv.innerHTML = '<p>' + this.escapeHtml(content) + '</p>';
          document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
        }
      },

      removeMessage(messageId) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) messageDiv.remove();
      },

      addLoadingIndicator() {
        const messageId = 'loading-' + Date.now();
        const messagesContainer = document.getElementById('chatMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message chat-message-assistant';
        messageDiv.id = messageId;

        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-message-content';
        contentDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageId;
      },

      newChat() {
        this.messages = [];
        this.currentChatId = null;
        document.getElementById('chatMessages').innerHTML = \`
          <div class="chat-message chat-message-assistant">
            <div class="chat-message-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="chat-message-content">
              <p>你好！我是 AI 助手，有什麼我可以幫助你的嗎？</p>
            </div>
          </div>
        \`;
      },

      saveChatToHistory(firstMessage) {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chat = {
          id: this.currentChatId,
          title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
          createdAt: new Date().toISOString(),
          messages: []
        };
        history.unshift(chat);
        localStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 50)));
        this.renderChatHistory();
      },

      updateChatHistory(lastMessage) {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chatIndex = history.findIndex(c => c.id === this.currentChatId);
        if (chatIndex !== -1) {
          history[chatIndex].messages = this.messages;
          localStorage.setItem('chatHistory', JSON.stringify(history));
        }
      },

      renderChatHistory() {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const historyContainer = document.getElementById('chatHistory');

        if (history.length === 0) {
          historyContainer.innerHTML = '<p style="text-align:center;color:var(--color-text-tertiary);padding:1rem;">暫無對話歷史</p>';
          return;
        }

        historyContainer.innerHTML = history.map(chat => \`
          <div class="chat-history-item \${chat.id === this.currentChatId ? 'active' : ''}" data-id="\${chat.id}">
            <div class="chat-history-title">\${this.escapeHtml(chat.title)}</div>
            <div class="chat-history-time">\${this.formatDate(chat.createdAt)}</div>
          </div>
        \`).join('');

        historyContainer.querySelectorAll('.chat-history-item').forEach(item => {
          item.addEventListener('click', () => this.loadChat(item.dataset.id));
        });
      },

      loadChat(chatId) {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chat = history.find(c => c.id === chatId);

        if (chat) {
          this.currentChatId = chatId;
          this.messages = chat.messages || [];

          const messagesContainer = document.getElementById('chatMessages');
          messagesContainer.innerHTML = this.messages.map(msg => \`
            <div class="chat-message chat-message-\${msg.role}">
              <div class="chat-message-avatar">
                \${msg.role === 'user' 
                  ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
                  : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
                }
              </div>
              <div class="chat-message-content">
                <p>\${this.escapeHtml(msg.content)}</p>
              </div>
            </div>
          \`).join('');

          this.renderChatHistory();
        }
      },

      formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '剛剛';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' 分鐘前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小時前';
        return date.toLocaleDateString('zh-TW');
      },

      escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    };

    // Image Page
    const ImagePage = {
      init() {
        const generateBtn = document.getElementById('imageGenerateBtn');
        const imagePrompt = document.getElementById('imagePrompt');

        generateBtn.addEventListener('click', () => this.generateImage());

        imagePrompt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.generateImage();
          }
        });
      },

      async generateImage() {
        const prompt = document.getElementById('imagePrompt').value.trim();
        const model = document.getElementById('imageModel').value;
        const size = document.getElementById('imageSize').value;
        const count = parseInt(document.getElementById('imageCount').value);

        if (!prompt) {
          notification.show('請輸入圖片描述', 'warning');
          return;
        }

        const generateBtn = document.getElementById('imageGenerateBtn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '生成中...';

        try {
          const response = await api.post('/v1/images/generations', {
            model,
            prompt,
            n: count,
            size
          });

          this.displayImages(response.data);
          this.saveToHistory(prompt, response.data);

          document.getElementById('imagePrompt').value = '';
        } catch (error) {
          notification.show(error.message, 'error');
        } finally {
          generateBtn.disabled = false;
          generateBtn.innerHTML = \`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            生成圖片
          \`;
        }
      },

      displayImages(images) {
        const previewContainer = document.getElementById('imagePreview');

        if (images.length === 0) {
          previewContainer.innerHTML = \`
            <div class="image-preview-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>沒有生成圖片</p>
            </div>
          \`;
          return;
        }

        previewContainer.innerHTML = \`
          <div class="image-grid">
            \${images.map((img, index) => \`
              <div class="image-item">
                <img src="\${img.url}" alt="Generated image \${index + 1}" loading="lazy">
                <div class="image-actions">
                  <button class="btn btn-sm btn-secondary" onclick="ImagePage.downloadImage('\${img.url}', \${index})">
                    下載
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="ImagePage.copyImageUrl('\${img.url}')">
                    複製連結
                  </button>
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      },

      async downloadImage(url, index) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'generated-image-' + Date.now() + '-' + index + '.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);

          notification.show('圖片下載中...', 'success');
        } catch (error) {
          notification.show('下載失敗', 'error');
        }
      },

      async copyImageUrl(url) {
        try {
          await navigator.clipboard.writeText(url);
          notification.show('連結已複製', 'success');
        } catch (error) {
          notification.show('複製失敗', 'error');
        }
      },

      saveToHistory(prompt, images) {
        const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
        const item = {
          id: Date.now().toString(),
          prompt,
          images: images.map(img => img.url),
          createdAt: new Date().toISOString()
        };
        history.unshift(item);
        localStorage.setItem('imageHistory', JSON.stringify(history.slice(0, 50)));
        this.renderImageHistory();
      },

      renderImageHistory() {
        const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
        const historyContainer = document.getElementById('imageHistory');

        if (history.length === 0) {
          historyContainer.innerHTML = '<p style="text-align:center;color:var(--color-text-tertiary);padding:1rem;">暫無生成歷史</p>';
          return;
        }

        historyContainer.innerHTML = history.map(item => \`
          <div class="image-history-item" data-id="\${item.id}">
            <div class="image-history-preview">
              \${item.images[0] ? \`<img src="\${item.images[0]}" alt="Preview">\` : ''}
            </div>
            <div class="image-history-info">
              <div class="image-history-prompt">\${this.escapeHtml(item.prompt.substring(0, 30))}\${item.prompt.length > 30 ? '...' : ''}</div>
              <div class="image-history-time">\${this.formatDate(item.createdAt)}</div>
            </div>
          </div>
        \`).join('');

        historyContainer.querySelectorAll('.image-history-item').forEach(item => {
          item.addEventListener('click', () => this.loadHistoryItem(item.dataset.id));
        });
      },

      loadHistoryItem(itemId) {
        const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
        const item = history.find(h => h.id === itemId);

        if (item) {
          document.getElementById('imagePrompt').value = item.prompt;
          this.displayImages(item.images.map(url => ({ url })));
        }
      },

      formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '剛剛';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' 分鐘前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小時前';
        return date.toLocaleDateString('zh-TW');
      },

      escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      // Menu toggle
      const menuToggle = document.getElementById('menuToggle');
      const sidebar = document.querySelector('.sidebar');
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });

      // API Key input
      const apiKeyInput = document.getElementById('apiKeyInput');
      const apiKeySubmit = document.getElementById('apiKeySubmit');

      if (api.getApiKey()) {
        apiKeyInput.value = api.getApiKey();
      }

      apiKeySubmit.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
          api.setApiKey(key);
          notification.show('API Key 已設定', 'success');
        }
      });

      // Navigation
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const page = item.dataset.page;
          window.location.hash = page;
        });
      });

      // Hash change handler
      window.addEventListener('hashchange', loadCurrentPage);

      // Load initial page
      loadCurrentPage();
    });

    function loadCurrentPage() {
      const hash = window.location.hash.slice(1) || 'chat';

      // Update navigation
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === hash);
      });

      // Update page title
      const titles = {
        chat: '聊天',
        image: '圖片生成',
        dashboard: '儀表板',
        apikeys: 'API Keys'
      };
      document.getElementById('pageTitle').textContent = titles[hash] || '聊天';

      // Show/hide pages
      document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
      });
      const activePage = document.getElementById('page-' + hash);
      if (activePage) {
        activePage.classList.remove('hidden');
      }

      // Initialize page
      if (hash === 'chat') {
        ChatPage.init();
      } else if (hash === 'image') {
        ImagePage.init();
      }
    }
  </script>
</body>
</html>`;

/**
 * Handle Web UI requests
 */
export async function webHandler(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Serve HTML for all routes (SPA)
  return new Response(WEB_UI_HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
