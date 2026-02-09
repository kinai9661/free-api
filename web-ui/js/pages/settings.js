/**
 * Settings Page
 */

const SettingsPage = {
  async load() {
    await this.loadSettings();
    this.initEventListeners();
  },

  async loadSettings() {
    try {
      const settings = await api.get('/admin/settings');

      if (settings.globalLimit) {
        document.getElementById('setting-global-limit').value = settings.globalLimit;
      }
      if (settings.globalWindow) {
        document.getElementById('setting-global-window').value = settings.globalWindow;
      }
      if (settings.logRetention) {
        document.getElementById('setting-log-retention').value = settings.logRetention;
      }
      if (settings.statsRetention) {
        document.getElementById('setting-stats-retention').value = settings.statsRetention;
      }

    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  initEventListeners() {
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettings();
    });
  },

  async saveSettings() {
    try {
      const settings = {
        globalLimit: parseInt(document.getElementById('setting-global-limit').value),
        globalWindow: parseInt(document.getElementById('setting-global-window').value),
        logRetention: parseInt(document.getElementById('setting-log-retention').value),
        statsRetention: parseInt(document.getElementById('setting-stats-retention').value)
      };

      await api.put('/admin/settings', settings);

      notification.show('設定已儲存', 'success');
    } catch (error) {
      notification.show(error.message, 'error');
    }
  }
};
