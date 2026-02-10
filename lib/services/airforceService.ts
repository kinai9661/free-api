import { ChatRequest, ChatResponse, ImageRequest, ImageResponse } from '@/types';

/**
 * Airforce API 服務
 */
export class AirforceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'https://api.airforce';
  }

  /**
   * 發送聊天請求
   */
  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: response.statusText, type: 'api_error' },
      }));
      throw new Error(error.error?.message || 'Chat request failed');
    }

    return response.json();
  }

  /**
   * 發送串流聊天請求
   */
  async *chatStream(request: ChatRequest, apiKey: string): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: response.statusText, type: 'api_error' },
      }));
      throw new Error(error.error?.message || 'Chat stream request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析錯誤
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 發送圖片生成請求
   */
  async image(request: ImageRequest, apiKey: string): Promise<ImageResponse> {
    const response = await fetch(`${this.baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: response.statusText, type: 'api_error' },
      }));
      throw new Error(error.error?.message || 'Image generation failed');
    }

    return response.json();
  }

  /**
   * 獲取可用模型列表
   */
  async getModels(apiKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v1/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: response.statusText, type: 'api_error' },
      }));
      throw new Error(error.error?.message || 'Failed to fetch models');
    }

    return response.json();
  }
}

// 導出單例實例
export const airforceService = new AirforceService();
