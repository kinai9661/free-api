import { NextResponse } from 'next/server';
import { ApiKey, AuthContext } from '@/types';
import { isValidApiKey } from '@/lib/utils/cn';
import { apiKeyService } from '@/lib/services/apiKeyService';

/**
 * 從請求中提取 API Key
 */
function extractApiKey(request: Request): string | null {
  // 從 Authorization 標頭提取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 從 X-API-Key 標頭提取
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // 從查詢參數提取
  const url = new URL(request.url);
  const apiKeyParam = url.searchParams.get('api_key');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

/**
 * 驗證管理員密碼
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return false;
  }
  return password === adminPassword;
}

/**
 * 認證中介軟體
 */
export async function authMiddleware(request: Request): Promise<AuthContext | NextResponse> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return NextResponse.json(
      { error: { message: 'Missing API key', type: 'authentication_error' } },
      { status: 401 }
    );
  }

  if (!isValidApiKey(apiKey)) {
    return NextResponse.json(
      { error: { message: 'Invalid API key format', type: 'authentication_error' } },
      { status: 401 }
    );
  }

  // 從 KV 獲取 API Key 資訊
  const keyData = await apiKeyService.getApiKey(apiKey);

  if (!keyData) {
    return NextResponse.json(
      { error: { message: 'Invalid API key', type: 'authentication_error' } },
      { status: 401 }
    );
  }

  if (!keyData.isActive) {
    return NextResponse.json(
      { error: { message: 'API key is disabled', type: 'authentication_error' } },
      { status: 403 }
    );
  }

  return {
    apiKey: keyData,
    isAuthenticated: true,
  };
}

/**
 * 檢查權限
 */
export function hasPermission(apiKey: ApiKey, permissionType: string): boolean {
  return apiKey.permissions.some(p => p.type === permissionType && p.enabled);
}

/**
 * 權限檢查中介軟體
 */
export function permissionMiddleware(authContext: AuthContext, requiredPermission: string): NextResponse | null {
  if (!hasPermission(authContext.apiKey, requiredPermission)) {
    return NextResponse.json(
      { error: { message: 'Insufficient permissions', type: 'permission_error' } },
      { status: 403 }
    );
  }
  return null;
}
