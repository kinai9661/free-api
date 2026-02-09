/**
 * Dashboard Page
 */

const DashboardPage = {
  requestsChart: null,
  distributionChart: null,

  async load() {
    await this.loadStats();
    this.initCharts();
    this.loadActivity();
  },

  async loadStats() {
    try {
      const stats = await api.get('/admin/stats?period=24h');

      // Update stat cards
      document.getElementById('stat-requests').textContent = Utils.formatNumber(stats.requests);
      document.getElementById('stat-success').textContent = Utils.formatNumber(stats.success);
      document.getElementById('stat-errors').textContent = Utils.formatNumber(stats.errors);
      document.getElementById('stat-tokens').textContent = Utils.formatNumber(stats.tokens);

      // Calculate success rate
      const successRate = stats.requests > 0 ? ((stats.success / stats.requests) * 100).toFixed(1) : 0;
      document.getElementById('stat-success-change').textContent = `${successRate}% 成功率`;

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  initCharts() {
    // Requests Chart
    const requestsCtx = document.getElementById('requestsChart').getContext('2d');

    if (this.requestsChart) {
      this.requestsChart.destroy();
    }

    this.requestsChart = new Chart(requestsCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '請求數',
          data: [],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    // Distribution Chart
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');

    if (this.distributionChart) {
      this.distributionChart.destroy();
    }

    this.distributionChart = new Chart(distributionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Chat', 'Image'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#6366f1', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Load chart data
    this.loadChartData();

    // Period selector
    document.getElementById('chart-period').addEventListener('change', () => {
      this.loadChartData();
    });
  },

  async loadChartData() {
    try {
      const period = document.getElementById('chart-period').value;
      const stats = await api.get(`/admin/stats?period=${period}`);

      // Update requests chart
      const labels = stats.byHour.map(h => {
        const date = new Date(h.hour);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      });

      this.requestsChart.data.labels = labels;
      this.requestsChart.data.datasets[0].data = stats.byHour.map(h => h.requests);
      this.requestsChart.update();

      // Update distribution chart
      this.distributionChart.data.datasets[0].data = [
        stats.byType.chat.requests,
        stats.byType.image.requests
      ];
      this.distributionChart.update();

    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  },

  async loadActivity() {
    try {
      const logs = await api.get('/admin/logs?limit=10');
      const activityList = document.getElementById('activityList');

      if (logs.logs.length === 0) {
        activityList.innerHTML = '<p class="text-center text-gray-500">暫無活動記錄</p>';
        return;
      }

      activityList.innerHTML = logs.logs.map(log => {
        const isError = log.type === 'error';
        return `
          <div class="activity-item">
            <div class="activity-icon ${isError ? 'error' : 'success'}">
              ${isError ? '✕' : '✓'}
            </div>
            <div class="activity-content">
              <div class="activity-title">${log.type} - ${log.error || '成功'}</div>
              <div class="activity-time">${Utils.formatDate(log.timestamp)}</div>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  }
};
