import { NextResponse } from 'next/server';
import { ApiKey, RateLimitInfo } from '@/types';
import { getTimestamp } from '@/lib/utils/cn';

/**
 * 限流存儲介面
 */
interface RateLimitStore {
  requests: number;
  tokens: number;
  resetTime: number;
}

/**
 * 記憶體存儲（開發環境）
 */
const memoryStore = new Map<string, RateLimitStore>();

/**
 * 獲取限流存儲
 */
function getStore(apiKeyId: string): RateLimitStore {
  const now = getTimestamp();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
  
  let store = memoryStore.get(apiKeyId);
  
  if (!store || now >= store.resetTime) {
    store = {
      requests: 0,
      tokens: 0,
      resetTime: now + windowMs,
    };
    memoryStore.set(apiKeyId, store);
  }
  
  return store;
}

/**
 * 檢查請求限流
 */
export async function checkRequestRateLimit(apiKey: ApiKey): Promise<RateLimitInfo | NextResponse> {
  const store = getStore(apiKey.id);
  const maxRequests = apiKey.rateLimit.requestsPerMinute;
  
  if (store.requests >= maxRequests) {
    return NextResponse.json(
      {
        error: {
          message: 'Rate limit exceeded for requests',
          type: 'rate_limit_error',
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': store.resetTime.toString(),
          'Retry-After': Math.ceil((store.resetTime - getTimestamp()) / 1000).toString(),
        },
      }
    );
  }
  
  return {
    limit: maxRequests,
    remaining: maxRequests - store.requests,
    reset: store.resetTime,
  };
}

/**
 * 檢查 Token 限流
 */
export async function checkTokenRateLimit(apiKey: ApiKey, tokens: number): Promise<RateLimitInfo | NextResponse> {
  const store = getStore(apiKey.id);
  const maxTokens = apiKey.rateLimit.tokensPerMinute;
  
  if (store.tokens + tokens > maxTokens) {
    return NextResponse.json(
      {
        error: {
          message: 'Rate limit exceeded for tokens',
          type: 'rate_limit_error',
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit-Tokens': maxTokens.toString(),
          'X-RateLimit-Remaining-Tokens': (maxTokens - store.tokens).toString(),
          'X-RateLimit-Reset': store.resetTime.toString(),
        },
      }
    );
  }
  
  return {
    limit: maxTokens,
    remaining: maxTokens - store.tokens,
    reset: store.resetTime,
  };
}

/**
 * 更新限流計數
 */
export async function updateRateLimit(apiKeyId: string, requests: number, tokens: number): Promise<void> {
  const store = getStore(apiKeyId);
  store.requests += requests;
  store.tokens += tokens;
  memoryStore.set(apiKeyId, store);
}

/**
 * 限流中介軟體
 */
export async function rateLimitMiddleware(
  apiKey: ApiKey,
  tokens?: number
): Promise<NextResponse | null> {
  // 檢查請求限流
  const requestLimit = await checkRequestRateLimit(apiKey);
  if (requestLimit instanceof NextResponse) {
    return requestLimit;
  }
  
  // 檢查 Token 限流（如果提供了 token 數量）
  if (tokens !== undefined) {
    const tokenLimit = await checkTokenRateLimit(apiKey, tokens);
    if (tokenLimit instanceof NextResponse) {
      return tokenLimit;
    }
  }
  
  return null;
}

/**
 * 獲取限流資訊
 */
export function getRateLimitInfo(apiKeyId: string): RateLimitInfo {
  const store = getStore(apiKeyId);
  return {
    limit: store.requests,
    remaining: 0,
    reset: store.resetTime,
  };
}
