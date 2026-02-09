/**
 * API Keys Page
 */

const APIKeysPage = {
  async load() {
    await this.loadKeys();
    this.initEventListeners();
  },

  async loadKeys() {
    try {
      const data = await api.get('/admin/apikeys');
      const tbody = document.getElementById('apiKeysTableBody');

      if (data.keys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">暫無 API Keys</td></tr>';
        return;
      }

      tbody.innerHTML = data.keys.map(key => `
        <tr>
          <td>
            <div class="font-medium">${key.name}</div>
            <div class="text-sm text-gray-500">${key.id}</div>
          </td>
          <td>
            <span class="badge badge-${key.type}">${key.type}</span>
          </td>
          <td>
            <div class="text-sm">
              ${key.permissions.map(p => `<span class="badge badge-secondary">${p}</span>`).join(' ')}
            </div>
          </td>
          <td>
            <div class="text-sm">
              ${key.rateLimit.limit} 請求 / ${key.rateLimit.window} 秒
            </div>
          </td>
          <td>
            <span class="badge ${key.active ? 'badge-active' : 'badge-inactive'}">
              ${key.active ? '啟用' : '停用'}
            </span>
          </td>
          <td>
            <div class="text-sm">
              ${key.lastUsedAt ? Utils.formatDate(key.lastUsedAt) : '從未使用'}
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary" onclick="APIKeysPage.editKey('${key.id}')">
                編輯
              </button>
              <button class="btn btn-sm btn-danger" onclick="APIKeysPage.deleteKey('${key.id}')">
                刪除
              </button>
            </div>
          </td>
        </tr>
      `).join('');

    } catch (error) {
      console.error('Failed to load API keys:', error);
      notification.show('載入 API Keys 失敗', 'error');
    }
  },

  initEventListeners() {
    document.getElementById('createKeyBtn').addEventListener('click', () => {
      this.showCreateModal();
    });
  },

  showCreateModal() {
    const content = `
      <form id="createKeyForm">
        <div class="form-group">
          <label for="keyName">名稱</label>
          <input type="text" id="keyName" required placeholder="輸入 API Key 名稱">
        </div>
        <div class="form-group">
          <label for="keyType">類型</label>
          <select id="keyType" required>
            <option value="user">User</option>
            <option value="service">Service</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label for="keyLimit">請求限制</label>
          <input type="number" id="keyLimit" value="100" min="1">
        </div>
        <div class="form-group">
          <label for="keyWindow">時間窗口（秒）</label>
          <input type="number" id="keyWindow" value="60" min="1">
        </div>
      </form>
    `;

    modal.open('新增 API Key', content, async () => {
      const name = document.getElementById('keyName').value;
      const type = document.getElementById('keyType').value;
      const limit = parseInt(document.getElementById('keyLimit').value);
      const window = parseInt(document.getElementById('keyWindow').value);

      try {
        await api.post('/admin/apikeys', {
          name,
          type,
          rateLimit: { limit, window }
        });

        notification.show('API Key 已建立', 'success');
        await this.loadKeys();
      } catch (error) {
        notification.show(error.message, 'error');
      }
    });
  },

  async editKey(keyId) {
    try {
      const key = await api.get(`/admin/apikeys/${keyId}`);

      const content = `
        <form id="editKeyForm">
          <div class="form-group">
            <label for="editKeyName">名稱</label>
            <input type="text" id="editKeyName" value="${key.name}" required>
          </div>
          <div class="form-group">
            <label for="editKeyActive">狀態</label>
            <select id="editKeyActive">
              <option value="true" ${key.active ? 'selected' : ''}>啟用</option>
              <option value="false" ${!key.active ? 'selected' : ''}>停用</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editKeyLimit">請求限制</label>
            <input type="number" id="editKeyLimit" value="${key.rateLimit.limit}" min="1">
          </div>
          <div class="form-group">
            <label for="editKeyWindow">時間窗口（秒）</label>
            <input type="number" id="editKeyWindow" value="${key.rateLimit.window}" min="1">
          </div>
        </form>
      `;

      modal.open('編輯 API Key', content, async () => {
        const name = document.getElementById('editKeyName').value;
        const active = document.getElementById('editKeyActive').value === 'true';
        const limit = parseInt(document.getElementById('editKeyLimit').value);
        const window = parseInt(document.getElementById('editKeyWindow').value);

        try {
          await api.put(`/admin/apikeys/${keyId}`, {
            name,
            active,
            rateLimit: { limit, window }
          });

          notification.show('API Key 已更新', 'success');
          await this.loadKeys();
        } catch (error) {
          notification.show(error.message, 'error');
        }
      });
    } catch (error) {
      notification.show('載入 API Key 失敗', 'error');
    }
  },

  async deleteKey(keyId) {
    const content = `
      <p>確定要刪除此 API Key 嗎？此操作無法復原。</p>
    `;

    modal.open('刪除 API Key', content, async () => {
      try {
        await api.delete(`/admin/apikeys/${keyId}`);
        notification.show('API Key 已刪除', 'success');
        await this.loadKeys();
      } catch (error) {
        notification.show(error.message, 'error');
      }
    });
  }
};
