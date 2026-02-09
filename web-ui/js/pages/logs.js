/**
 * Logs Page
 */

const LogsPage = {
  async load() {
    await this.loadLogs();
    this.initEventListeners();
  },

  async loadLogs() {
    try {
      const level = document.getElementById('logs-level').value;
      const logs = await api.get(`/admin/logs?limit=100&level=${level}`);
      const container = document.getElementById('logsContainer');

      if (logs.logs.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">暫無日誌記錄</p>';
        return;
      }

      container.innerHTML = logs.logs.map(log => {
        const logLevel = log.type === 'error' ? 'error' : log.type === 'warn' ? 'warn' : 'info';
        return `
          <div class="log-item ${logLevel}">
            <span class="log-timestamp">${log.timestamp}</span>
            <span class="log-message">[${log.type.toUpperCase()}] ${log.error || log.message || 'Request'}</span>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Failed to load logs:', error);
      notification.show('載入日誌失敗', 'error');
    }
  },

  initEventListeners() {
    document.getElementById('refreshLogsBtn').addEventListener('click', () => {
      this.loadLogs();
    });

    document.getElementById('logs-level').addEventListener('change', () => {
      this.loadLogs();
    });
  }
};
