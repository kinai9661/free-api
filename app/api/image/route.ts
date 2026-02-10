import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, hasPermission } from '@/lib/middleware/auth';
import { rateLimitMiddleware, updateRateLimit } from '@/lib/middleware/rateLimit';
import { withMonitoring } from '@/lib/middleware/monitoring';
import { airforceService } from '@/lib/services/airforceService';
import { apiKeyService } from '@/lib/services/apiKeyService';
import { ImageRequest } from '@/types';

/**
 * POST /api/image/generations - 圖片生成端點
 */
export async function POST(request: NextRequest) {
  // CORS 處理
  const origin = request.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    // 認證
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { apiKey } = authResult;

    // 權限檢查
    if (!hasPermission(apiKey, 'image')) {
      return NextResponse.json(
        { error: { message: 'Image generation permission required', type: 'permission_error' } },
        { status: 403, headers: corsHeaders }
      );
    }

    // 解析請求
    const body: ImageRequest = await request.json();

    // 限流檢查
    const rateLimitResult = await rateLimitMiddleware(apiKey);
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // 處理圖片生成請求
    const response = await withMonitoring(
      () => airforceService.image(body, apiKey.key),
      apiKey.id
    )();

    // 更新使用量
    await updateRateLimit(apiKey.id, 1, 0);
    await apiKeyService.updateApiKeyUsage(apiKey.key, 1, 0);

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: { message: errorMessage, type: 'server_error' } },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/image - 獲取圖片模型列表
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { apiKey } = authResult;

    if (!hasPermission(apiKey, 'image')) {
      return NextResponse.json(
        { error: { message: 'Image generation permission required', type: 'permission_error' } },
        { status: 403, headers: corsHeaders }
      );
    }

    const models = await airforceService.getModels(apiKey.key);
    return NextResponse.json(models, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: { message: errorMessage, type: 'server_error' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
