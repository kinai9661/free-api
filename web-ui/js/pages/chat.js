/**
 * Chat Page
 */

const ChatPage = {
  messages: [],
  currentChatId: null,
  isStreaming: false,

  async load() {
    this.initEventListeners();
    this.loadChatHistory();
  },

  initEventListeners() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const newChatBtn = document.getElementById('newChatBtn');

    // Send message on Enter (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
    });

    // Send button
    chatSendBtn.addEventListener('click', () => this.sendMessage());

    // New chat button
    newChatBtn.addEventListener('click', () => this.newChat());
  },

  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message || this.isStreaming) return;

    const model = document.getElementById('chatModel').value;
    const stream = document.getElementById('chatStream').checked;

    // Add user message
    this.addMessage('user', message);
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Create new chat if needed
    if (!this.currentChatId) {
      this.currentChatId = Date.now().toString();
      this.saveChatToHistory(message);
    }

    // Add loading indicator
    const loadingId = this.addLoadingIndicator();

    try {
      if (stream) {
        await this.sendStreamingMessage(model, message, loadingId);
      } else {
        await this.sendNonStreamingMessage(model, message, loadingId);
      }
    } catch (error) {
      this.removeMessage(loadingId);
      this.addMessage('assistant', `錯誤: ${error.message}`, true);
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

      // Update chat history
      this.updateChatHistory(content);
    } catch (error) {
      throw error;
    }
  },

  async sendStreamingMessage(model, message, loadingId) {
    this.isStreaming = true;

    try {
      const response = await fetch(`${api.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getApiKey()}`,
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

      // Remove loading indicator and add assistant message
      this.removeMessage(loadingId);
      const messageId = this.addMessage('assistant', '', false, true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

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
            } catch (e) {
              // Ignore parse errors
            }
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
    const messageId = `msg-${Date.now()}`;
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${role} ${isError ? 'chat-message-error' : ''}`;
    messageDiv.id = messageId;

    const avatar = document.createElement('div');
    avatar.className = 'chat-message-avatar';
    avatar.innerHTML = role === 'user' 
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-message-content';
    contentDiv.innerHTML = isStreaming ? '<span class="typing-indicator">...</span>' : `<p>${this.escapeHtml(content)}</p>`;

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
      contentDiv.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
      document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    }
  },

  removeMessage(messageId) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
      messageDiv.remove();
    }
  },

  addLoadingIndicator() {
    const messageId = `loading-${Date.now()}`;
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
    document.getElementById('chatMessages').innerHTML = `
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
    `;
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

  loadChatHistory() {
    this.renderChatHistory();
  },

  renderChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const historyContainer = document.getElementById('chatHistory');

    if (history.length === 0) {
      historyContainer.innerHTML = '<p class="text-center text-gray-500">暫無對話歷史</p>';
      return;
    }

    historyContainer.innerHTML = history.map(chat => `
      <div class="chat-history-item ${chat.id === this.currentChatId ? 'active' : ''}" data-id="${chat.id}">
        <div class="chat-history-title">${this.escapeHtml(chat.title)}</div>
        <div class="chat-history-time">${Utils.formatDate(chat.createdAt)}</div>
      </div>
    `).join('');

    // Add click handlers
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
      messagesContainer.innerHTML = this.messages.map(msg => `
        <div class="chat-message chat-message-${msg.role}">
          <div class="chat-message-avatar">
            ${msg.role === 'user' 
              ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
              : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
            }
          </div>
          <div class="chat-message-content">
            <p>${this.escapeHtml(msg.content)}</p>
          </div>
        </div>
      `).join('');

      this.renderChatHistory();
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
