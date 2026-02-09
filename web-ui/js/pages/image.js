/**
 * Image Generation Page
 */

const ImagePage = {
  imageHistory: [],

  async load() {
    this.initEventListeners();
    this.loadImageHistory();
  },

  initEventListeners() {
    const generateBtn = document.getElementById('imageGenerateBtn');
    const imagePrompt = document.getElementById('imagePrompt');

    generateBtn.addEventListener('click', () => this.generateImage());

    // Generate on Ctrl+Enter
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
    generateBtn.innerHTML = `
      <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      生成中...
    `;

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
      generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        生成圖片
      `;
    }
  },

  displayImages(images) {
    const previewContainer = document.getElementById('imagePreview');

    if (images.length === 0) {
      previewContainer.innerHTML = `
        <div class="image-preview-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>沒有生成圖片</p>
        </div>
      `;
      return;
    }

    previewContainer.innerHTML = `
      <div class="image-grid">
        ${images.map((img, index) => `
          <div class="image-item">
            <img src="${img.url}" alt="Generated image ${index + 1}" loading="lazy">
            <div class="image-actions">
              <button class="btn btn-sm btn-secondary" onclick="ImagePage.downloadImage('${img.url}', ${index})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                下載
              </button>
              <button class="btn btn-sm btn-secondary" onclick="ImagePage.copyImageUrl('${img.url}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                複製連結
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async downloadImage(url, index) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `generated-image-${Date.now()}-${index}.png`;
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

  loadImageHistory() {
    this.renderImageHistory();
  },

  renderImageHistory() {
    const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
    const historyContainer = document.getElementById('imageHistory');

    if (history.length === 0) {
      historyContainer.innerHTML = '<p class="text-center text-gray-500">暫無生成歷史</p>';
      return;
    }

    historyContainer.innerHTML = history.map(item => `
      <div class="image-history-item" data-id="${item.id}">
        <div class="image-history-preview">
          ${item.images[0] ? `<img src="${item.images[0]}" alt="Preview">` : ''}
        </div>
        <div class="image-history-info">
          <div class="image-history-prompt">${this.escapeHtml(item.prompt.substring(0, 30))}${item.prompt.length > 30 ? '...' : ''}</div>
          <div class="image-history-time">${Utils.formatDate(item.createdAt)}</div>
        </div>
      </div>
    `).join('');

    // Add click handlers
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
