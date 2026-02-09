/**
 * Monitoring Page
 */

const MonitoringPage = {
  monitoringChart: null,
  modelChart: null,

  async load() {
    await this.loadMonitoringData();
    this.initCharts();
  },

  async loadMonitoringData() {
    try {
      const period = document.getElementById('monitoring-period').value;
      const stats = await api.get(`/admin/stats?period=${period}`);

      // Update monitoring stats
      document.getElementById('monitoring-requests').textContent = Utils.formatNumber(stats.requests);

      const successRate = stats.requests > 0 ? ((stats.success / stats.requests) * 100).toFixed(1) : 0;
      document.getElementById('monitoring-success-rate').textContent = `${successRate}%`;

      document.getElementById('monitoring-avg-duration').textContent = `${Math.round(stats.avgDuration)}ms`;
      document.getElementById('monitoring-chat-tokens').textContent = Utils.formatNumber(stats.tokens);
      document.getElementById('monitoring-images').textContent = stats.images;

    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  },

  initCharts() {
    // Monitoring Chart
    const monitoringCtx = document.getElementById('monitoringChart').getContext('2d');

    if (this.monitoringChart) {
      this.monitoringChart.destroy();
    }

    this.monitoringChart = new Chart(monitoringCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Chat',
            data: [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Image',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
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

    // Model Chart
    const modelCtx = document.getElementById('modelChart').getContext('2d');

    if (this.modelChart) {
      this.modelChart.destroy();
    }

    this.modelChart = new Chart(modelCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: '請求數',
          data: [],
          backgroundColor: '#6366f1',
          borderRadius: 4
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

    // Load chart data
    this.loadChartData();

    // Period selector
    document.getElementById('monitoring-period').addEventListener('change', () => {
      this.loadMonitoringData();
      this.loadChartData();
    });
  },

  async loadChartData() {
    try {
      const period = document.getElementById('monitoring-period').value;
      const stats = await api.get(`/admin/stats?period=${period}`);

      // Update monitoring chart
      const labels = stats.byHour.map(h => {
        const date = new Date(h.hour);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      });

      this.monitoringChart.data.labels = labels;
      this.monitoringChart.data.datasets[0].data = stats.byHour.map(h => h.chat);
      this.monitoringChart.data.datasets[1].data = stats.byHour.map(h => h.image);
      this.monitoringChart.update();

      // Update model chart
      const modelLabels = Object.keys(stats.byModel);
      const modelData = Object.values(stats.byModel);

      this.modelChart.data.labels = modelLabels;
      this.modelChart.data.datasets[0].data = modelData;
      this.modelChart.update();

    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  }
};
