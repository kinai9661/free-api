import { ApiKey, Permission, RateLimit, ApiKeyUsage } from '@/types';
import { generateId, generateApiKey, getTimestamp } from '@/lib/utils/cn';

/**
 * API Key 存儲（開發環境使用記憶體）
 */
const apiKeyStore = new Map<string, ApiKey>();

/**
 * 初始化預設 API Key
 */
export function initializeDefaultApiKey(): void {
  if (apiKeyStore.size === 0) {
    const defaultKey: ApiKey = {
      id: generateId(),
      key: 'af_' + '0'.repeat(32), // 預設測試 key
      name: 'Default Test Key',
      permissions: [
        { type: 'chat', enabled: true },
        { type: 'image', enabled: true },
        { type: 'audio', enabled: false },
        { type: 'admin', enabled: true },
      ],
      rateLimit: {
        requestsPerMinute: 100,
        tokensPerMinute: 10000,
      },
      createdAt: new Date().toISOString(),
      lastUsedAt: undefined,
      isActive: true,
      usage: {
        totalRequests: 0,
        totalTokens: 0,
        todayRequests: 0,
        todayTokens: 0,
      },
    };
    apiKeyStore.set(defaultKey.key, defaultKey);
  }
}

/**
 * 獲取 API Key
 */
export async function getApiKey(key: string): Promise<ApiKey | null> {
  return apiKeyStore.get(key) || null;
}

/**
 * 創建 API Key
 */
export async function createApiKey(
  name: string,
  permissions: Permission[],
  rateLimit: RateLimit
): Promise<ApiKey> {
  const apiKey: ApiKey = {
    id: generateId(),
    key: generateApiKey(),
    name,
    permissions,
    rateLimit,
    createdAt: new Date().toISOString(),
    lastUsedAt: undefined,
    isActive: true,
    usage: {
      totalRequests: 0,
      totalTokens: 0,
      todayRequests: 0,
      todayTokens: 0,
    },
  };
  
  apiKeyStore.set(apiKey.key, apiKey);
  return apiKey;
}

/**
 * 更新 API Key
 */
export async function updateApiKey(
  key: string,
  updates: Partial<Omit<ApiKey, 'id' | 'key' | 'createdAt'>>
): Promise<ApiKey | null> {
  const apiKey = apiKeyStore.get(key);
  if (!apiKey) {
    return null;
  }
  
  const updatedKey = { ...apiKey, ...updates };
  apiKeyStore.set(key, updatedKey);
  return updatedKey;
}

/**
 * 刪除 API Key
 */
export async function deleteApiKey(key: string): Promise<boolean> {
  return apiKeyStore.delete(key);
}

/**
 * 列出所有 API Keys
 */
export async function listApiKeys(): Promise<ApiKey[]> {
  return Array.from(apiKeyStore.values());
}

/**
 * 更新 API Key 使用情況
 */
export async function updateApiKeyUsage(
  key: string,
  requests: number,
  tokens: number
): Promise<void> {
  const apiKey = apiKeyStore.get(key);
  if (!apiKey) {
    return;
  }
  
  apiKey.usage.totalRequests += requests;
  apiKey.usage.totalTokens += tokens;
  apiKey.usage.todayRequests += requests;
  apiKey.usage.todayTokens += tokens;
  apiKey.lastUsedAt = new Date().toISOString();
  
  apiKeyStore.set(key, apiKey);
}

/**
 * 重置今日使用量
 */
export async function resetTodayUsage(): Promise<void> {
  const now = getTimestamp();
  const dayMs = 86400000;
  
  for (const [key, apiKey] of apiKeyStore.entries()) {
    const createdAt = new Date(apiKey.createdAt).getTime();
    if (now - createdAt > dayMs) {
      apiKey.usage.todayRequests = 0;
      apiKey.usage.todayTokens = 0;
      apiKeyStore.set(key, apiKey);
    }
  }
}

/**
 * 驗證 API Key 權限
 */
export function hasPermission(apiKey: ApiKey, permissionType: string): boolean {
  return apiKey.permissions.some(p => p.type === permissionType && p.enabled);
}

// 初始化預設 API Key
initializeDefaultApiKey();
