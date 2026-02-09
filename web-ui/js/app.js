/**
 * API Airforce Gateway - Web UI
 * Main Application JavaScript
 */

// API Client
class APIClient {
  constructor() {
    this.baseURL = '';
    this.apiKey = localStorage.getItem('admin_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('admin_api_key', key);
  }

  getApiKey() {
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = '';
    localStorage.removeItem('admin_api_key');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
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

// Global State
const AppState = {
  apiKey: localStorage.getItem('admin_api_key') || '',
  currentPage: 'dashboard',
  charts: {}
};

// API Client Instance
const api = new APIClient();

// Router
class Router {
  constructor() {
    this.routes = {};
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const handler = this.routes[hash];

    if (handler) {
      handler();
    } else {
      this.routes['dashboard']();
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}

// Modal
class Modal {
  constructor() {
    this.modal = document.getElementById('modal');
    this.title = document.getElementById('modalTitle');
    this.body = document.getElementById('modalBody');
    this.footer = document.getElementById('modalFooter');
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
    this.notification.className = `notification ${type} active`;

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

// Utility Functions
const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
    return date.toLocaleDateString('zh-TW');
  },

  formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }
};

// Initialize
const router = new Router();
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

  if (AppState.apiKey) {
    apiKeyInput.value = AppState.apiKey;
  }

  apiKeySubmit.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      api.setApiKey(key);
      AppState.apiKey = key;
      notification.show('API Key 已設定', 'success');
      loadCurrentPage();
    }
  });

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      router.navigate(page);
    });
  });

  // Load initial page
  loadCurrentPage();
});

function loadCurrentPage() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  AppState.currentPage = hash;

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
  const activePage = document.getElementById(`page-${hash}`);
  if (activePage) {
    activePage.classList.remove('hidden');
  }

  // Load page data
  switch (hash) {
    case 'chat':
      ChatPage.load();
      break;
    case 'image':
      ImagePage.load();
      break;
    case 'dashboard':
      DashboardPage.load();
      break;
    case 'apikeys':
      APIKeysPage.load();
      break;
    case 'monitoring':
      MonitoringPage.load();
      break;
    case 'logs':
      LogsPage.load();
      break;
    case 'settings':
      SettingsPage.load();
      break;
  }
}
