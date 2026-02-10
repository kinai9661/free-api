// API Key 類型
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  permissions: Permission[];
  rateLimit: RateLimit;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
  usage: ApiKeyUsage;
}

export interface Permission {
  type: 'chat' | 'image' | 'audio' | 'admin';
  enabled: boolean;
}

export interface RateLimit {
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export interface ApiKeyUsage {
  totalRequests: number;
  totalTokens: number;
  todayRequests: number;
  todayTokens: number;
}

// 聊天相關類型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: ChatUsage;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// 圖片生成相關類型
export interface ImageRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
}

export interface ImageResponse {
  created: number;
  data: ImageData[];
}

export interface ImageData {
  url: string;
  revised_prompt?: string;
}

// 監控相關類型
export interface MonitoringData {
  timestamp: number;
  requests: number;
  tokens: number;
  errors: number;
  avgResponseTime: number;
}

export interface ApiKeyStats {
  apiKeyId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  data: MonitoringData[];
}

export interface SystemStats {
  totalRequests: number;
  totalTokens: number;
  totalErrors: number;
  activeApiKeys: number;
  avgResponseTime: number;
  uptime: number;
}

// 錯誤類型
export interface ApiError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// 模型類型
export interface Model {
  id: string;
  name: string;
  type: 'chat' | 'image' | 'audio';
  provider: string;
  contextLength?: number;
  maxTokens?: number;
}

// 限流相關類型
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// 認證相關類型
export interface AuthContext {
  apiKey: ApiKey;
  isAuthenticated: boolean;
}

// 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
