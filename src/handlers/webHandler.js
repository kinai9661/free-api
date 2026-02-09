/**
 * Web UI Handler
 * Serves the Web UI static files
 */

// Import HTML content
const INDEX_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Airforce Gateway - Admin</title>
  <link rel="stylesheet" href="/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <div id="app">
    <!-- Layout -->
    <div class="layout">
      <!-- Sidebar -->
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
          <a href="#monitoring" class="nav-item" data-page="monitoring">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span>監控</span>
          </a>
          <a href="#logs" class="nav-item" data-page="logs">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>日誌</span>
          </a>
          <a href="#settings" class="nav-item" data-page="settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>設定</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">系統正常</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <button class="menu-toggle" id="menuToggle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h2 class="page-title" id="pageTitle">儀表板</h2>
          </div>
          <div class="header-right">
            <div class="api-key-input">
              <input type="password" id="apiKeyInput" placeholder="輸入 API Key">
              <button id="apiKeySubmit">登入</button>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content" id="pageContent">
          <!-- Chat Page -->
          <div class="page hidden" id="page-chat">
            <div class="chat-container">
              <div class="chat-sidebar">
                <div class="chat-sidebar-header">
                  <h3>對話歷史</h3>
                  <button class="btn btn-sm btn-primary" id="newChatBtn">新對話</button>
                </div>
                <div class="chat-history" id="chatHistory"></div>
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
                <div class="image-history" id="imageHistory"></div>
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
          <div class="page" id="page-dashboard">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon stat-icon-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">總請求數</div>
                  <div class="stat-value" id="stat-requests">0</div>
                  <div class="stat-change" id="stat-requests-change">+0%</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">成功請求</div>
                  <div class="stat-value" id="stat-success">0</div>
                  <div class="stat-change" id="stat-success-change">+0%</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">錯誤請求</div>
                  <div class="stat-value" id="stat-errors">0</div>
                  <div class="stat-change" id="stat-errors-change">+0%</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Token 使用量</div>
                  <div class="stat-value" id="stat-tokens">0</div>
                  <div class="stat-change" id="stat-tokens-change">+0%</div>
                </div>
              </div>
            </div>

            <div class="charts-grid">
              <div class="chart-card">
                <div class="chart-header">
                  <h3>請求趨勢</h3>
                  <select id="chart-period" class="period-select">
                    <option value="1h">1 小時</option>
                    <option value="6h">6 小時</option>
                    <option value="24h" selected>24 小時</option>
                    <option value="7d">7 天</option>
                  </select>
                </div>
                <div class="chart-body">
                  <canvas id="requestsChart"></canvas>
                </div>
              </div>
              <div class="chart-card">
                <div class="chart-header">
                  <h3>API 使用分佈</h3>
                </div>
                <div class="chart-body">
                  <canvas id="distributionChart"></canvas>
                </div>
              </div>
            </div>

            <div class="recent-activity">
              <h3>最近活動</h3>
              <div class="activity-list" id="activityList"></div>
            </div>
          </div>

          <!-- API Keys Page -->
          <div class="page hidden" id="page-apikeys">
            <div class="page-header">
              <h3>API Keys 管理</h3>
              <button class="btn btn-primary" id="createKeyBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                新增 API Key
              </button>
            </div>
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>名稱</th>
                    <th>類型</th>
                    <th>權限</th>
                    <th>限流</th>
                    <th>狀態</th>
                    <th>最後使用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody id="apiKeysTableBody"></tbody>
              </table>
            </div>
          </div>

          <!-- Monitoring Page -->
          <div class="page hidden" id="page-monitoring">
            <div class="page-header">
              <h3>監控儀表板</h3>
              <select id="monitoring-period" class="period-select">
                <option value="1h">1 小時</option>
                <option value="6h">6 小時</option>
                <option value="24h" selected>24 小時</option>
                <option value="7d">7 天</option>
                <option value="30d">30 天</option>
              </select>
            </div>
            <div class="monitoring-grid">
              <div class="monitoring-card">
                <h4>請求統計</h4>
                <div class="monitoring-stats">
                  <div class="monitoring-stat">
                    <span class="monitoring-stat-label">總請求</span>
                    <span class="monitoring-stat-value" id="monitoring-requests">0</span>
                  </div>
                  <div class="monitoring-stat">
                    <span class="monitoring-stat-label">成功率</span>
                    <span class="monitoring-stat-value" id="monitoring-success-rate">0%</span>
                  </div>
                  <div class="monitoring-stat">
                    <span class="monitoring-stat-label">平均延遲</span>
                    <span class="monitoring-stat-value" id="monitoring-avg-duration">0ms</span>
                  </div>
                </div>
              </div>
              <div class="monitoring-card">
                <h4>Token 使用</h4>
                <div class="monitoring-stats">
                  <div class="monitoring-stat">
                    <span class="monitoring-stat-label">Chat Tokens</span>
                    <span class="monitoring-stat-value" id="monitoring-chat-tokens">0</span>
                  </div>
                  <div class="monitoring-stat">
                    <span class="monitoring-stat-label">圖片生成</span>
                    <span class="monitoring-stat-value" id="monitoring-images">0</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-header">
                <h3>請求趨勢</h3>
              </div>
              <div class="chart-body">
                <canvas id="monitoringChart"></canvas>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-header">
                <h3>模型使用分佈</h3>
              </div>
              <div class="chart-body">
                <canvas id="modelChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Logs Page -->
          <div class="page hidden" id="page-logs">
            <div class="page-header">
              <h3>系統日誌</h3>
              <div class="logs-filters">
                <select id="logs-level" class="filter-select">
                  <option value="all">所有級別</option>
                  <option value="error">錯誤</option>
                  <option value="warn">警告</option>
                  <option value="info">資訊</option>
                </select>
                <button class="btn btn-secondary" id="refreshLogsBtn">重新整理</button>
              </div>
            </div>
            <div class="logs-container" id="logsContainer"></div>
          </div>

          <!-- Settings Page -->
          <div class="page hidden" id="page-settings">
            <div class="page-header">
              <h3>系統設定</h3>
              <button class="btn btn-primary" id="saveSettingsBtn">儲存設定</button>
            </div>
            <div class="settings-container">
              <div class="settings-section">
                <h4>限流設定</h4>
                <div class="form-group">
                  <label>全域請求限制</label>
                  <input type="number" id="setting-global-limit" value="100">
                  <span class="form-hint">每分鐘最大請求數</span>
                </div>
                <div class="form-group">
                  <label>全域時間窗口</label>
                  <input type="number" id="setting-global-window" value="60">
                  <span class="form-hint">時間窗口（秒）</span>
                </div>
              </div>
              <div class="settings-section">
                <h4>監控設定</h4>
                <div class="form-group">
                  <label>日誌保留天數</label>
                  <input type="number" id="setting-log-retention" value="30">
                  <span class="form-hint">日誌保留天數</span>
                </div>
                <div class="form-group">
                  <label>統計保留天數</label>
                  <input type="number" id="setting-stats-retention" value="30">
                  <span class="form-hint">統計資料保留天數</span>
                </div>
              </div>
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

      async put(endpoint, data) {
        return this.request(endpoint, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      }

      async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
      }
    }

    const api = new APIClient();

    // Utility Functions
    const Utils = {
      formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '剛剛';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' 分鐘前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小時前';
        return date.toLocaleDateString('zh-TW');
      },

      formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
      }
    };

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

    // Event Listeners
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
          loadCurrentPage();
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
      const hash = window.location.hash.slice(1) || 'dashboard';

      // Update navigation
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === hash);
      });

      // Update page title
      const titles = {
        chat: '聊天',
        image: '圖片生成',
        dashboard: '儀表板',
        apikeys: 'API Keys',
        monitoring: '監控',
        logs: '日誌',
        settings: '設定'
      };
      document.getElementById('pageTitle').textContent = titles[hash] || '儀表板';

      // Show/hide pages
      document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
      });
      const activePage = document.getElementById('page-' + hash);
      if (activePage) {
        activePage.classList.remove('hidden');
      }

      // Load page data
      if (hash === 'chat' && typeof ChatPage !== 'undefined') {
        ChatPage.load();
      } else if (hash === 'image' && typeof ImagePage !== 'undefined') {
        ImagePage.load();
      } else if (hash === 'dashboard' && typeof DashboardPage !== 'undefined') {
        DashboardPage.load();
      } else if (hash === 'apikeys' && typeof APIKeysPage !== 'undefined') {
        APIKeysPage.load();
      } else if (hash === 'monitoring' && typeof MonitoringPage !== 'undefined') {
        MonitoringPage.load();
      } else if (hash === 'logs' && typeof LogsPage !== 'undefined') {
        LogsPage.load();
      } else if (hash === 'settings' && typeof SettingsPage !== 'undefined') {
        SettingsPage.load();
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

  // Serve index.html for root and all routes (SPA)
  if (path === '/' || path === '/admin' || path.startsWith('/admin/') || path.startsWith('/chat') || path.startsWith('/image')) {
    return new Response(INDEX_HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // Serve CSS files
  if (path.startsWith('/css/')) {
    try {
      const css = await env.R2.get('web-ui' + path);
      if (css) {
        return new Response(css, {
          headers: {
            'Content-Type': 'text/css; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    } catch (error) {
      // Ignore
    }
  }

  // Serve JS files
  if (path.startsWith('/js/')) {
    try {
      const js = await env.R2.get('web-ui' + path);
      if (js) {
        return new Response(js, {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    } catch (error) {
      // Ignore
    }
  }

  // 404 for other paths
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}
