import { MonitoringData } from '@/types';
import { getTimestamp } from '@/lib/utils/cn';

/**
 * 監控數據存儲
 */
interface MonitoringStore {
  apiKeyId: string;
  data: MonitoringData[];
}

/**
 * 記憶體存儲（開發環境）
 */
const monitoringStore = new Map<string, MonitoringStore>();

/**
 * 獲取監控存儲
 */
function getMonitoringStore(apiKeyId: string): MonitoringStore {
  let store = monitoringStore.get(apiKeyId);
  
  if (!store) {
    store = {
      apiKeyId,
      data: [],
    };
    monitoringStore.set(apiKeyId, store);
  }
  
  return store;
}

/**
 * 記錄請求
 */
export async function recordRequest(
  apiKeyId: string,
  success: boolean,
  responseTime: number,
  tokens?: number
): Promise<void> {
  const store = getMonitoringStore(apiKeyId);
  const now = getTimestamp();
  
  // 查找或創建當前時間段的數據
  let currentData = store.data.find(d => {
    return d.timestamp <= now && now < d.timestamp + 3600000; // 1小時窗口
  });
  
  if (!currentData) {
    currentData = {
      timestamp: now - (now % 3600000),
      requests: 0,
      tokens: 0,
      errors: 0,
      avgResponseTime: 0,
    };
    store.data.push(currentData);
  }
  
  // 更新數據
  currentData.requests++;
  if (tokens) {
    currentData.tokens += tokens;
  }
  if (!success) {
    currentData.errors++;
  }
  
  // 更新平均響應時間
  const totalResponseTime = currentData.avgResponseTime * (currentData.requests - 1) + responseTime;
  currentData.avgResponseTime = totalResponseTime / currentData.requests;
  
  // 清理舊數據（保留30天）
  const retentionMs = 30 * 24 * 60 * 60 * 1000;
  store.data = store.data.filter(d => d.timestamp > now - retentionMs);
  
  monitoringStore.set(apiKeyId, store);
}

/**
 * 獲取監控數據
 */
export async function getMonitoringData(
  apiKeyId: string,
  period: 'hour' | 'day' | 'week' | 'month'
): Promise<MonitoringData[]> {
  const store = getMonitoringStore(apiKeyId);
  const now = getTimestamp();
  
  let periodMs: number;
  switch (period) {
    case 'hour':
      periodMs = 3600000; // 1小時
      break;
    case 'day':
      periodMs = 86400000; // 1天
      break;
    case 'week':
      periodMs = 604800000; // 1週
      break;
    case 'month':
      periodMs = 2592000000; // 30天
      break;
  }
  
  return store.data.filter(d => d.timestamp > now - periodMs);
}

/**
 * 獲取系統統計
 */
export async function getSystemStats() {
  const now = getTimestamp();
  const dayMs = 86400000;
  
  let totalRequests = 0;
  let totalTokens = 0;
  let totalErrors = 0;
  let totalResponseTime = 0;
  let responseCount = 0;
  
  for (const store of monitoringStore.values()) {
    for (const data of store.data) {
      if (data.timestamp > now - dayMs) {
        totalRequests += data.requests;
        totalTokens += data.tokens;
        totalErrors += data.errors;
        totalResponseTime += data.avgResponseTime * data.requests;
        responseCount += data.requests;
      }
    }
  }
  
  return {
    totalRequests,
    totalTokens,
    totalErrors,
    activeApiKeys: monitoringStore.size,
    avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
    uptime: now, // 簡化實現
  };
}

/**
 * 監控中介軟體包裝器
 */
export function withMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  apiKeyId: string
): T {
  return (async (...args: any[]) => {
    const startTime = getTimestamp();
    let success = false;
    let tokens = 0;
    
    try {
      const result = await fn(...args);
      success = true;
      
      // 嘗試從結果中提取 token 數量
      if (result?.usage) {
        tokens = result.usage.total_tokens || 0;
      }
      
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const responseTime = getTimestamp() - startTime;
      await recordRequest(apiKeyId, success, responseTime, tokens);
    }
  }) as T;
}
