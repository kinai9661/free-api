import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, hasPermission } from '@/lib/middleware/auth';
import { rateLimitMiddleware, updateRateLimit } from '@/lib/middleware/rateLimit';
import { withMonitoring } from '@/lib/middleware/monitoring';
import { airforceService } from '@/lib/services/airforceService';
import { apiKeyService } from '@/lib/services/apiKeyService';
import { ChatRequest } from '@/types';

// 強制動態渲染，因為此路由使用 request.headers
export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/completions - 聊天完成端點
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
    if (!hasPermission(apiKey, 'chat')) {
      return NextResponse.json(
        { error: { message: 'Chat permission required', type: 'permission_error' } },
        { status: 403, headers: corsHeaders }
      );
    }

    // 解析請求
    const body: ChatRequest = await request.json();
    const { stream = false } = body;

    // 限流檢查
    const rateLimitResult = await rateLimitMiddleware(apiKey);
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // 處理串流請求
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullContent = '';
            for await (const chunk of airforceService.chatStream(body, apiKey.key)) {
              fullContent += chunk;
              const data = `data: ${JSON.stringify({
                choices: [{ delta: { content: chunk } }],
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));

            // 更新使用量
            await updateRateLimit(apiKey.id, 1, fullContent.length / 4);
            await apiKeyService.updateApiKeyUsage(apiKey.key, 1, Math.ceil(fullContent.length / 4));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Stream error';
            controller.error(new Error(errorMessage));
          } finally {
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 處理非串流請求
    const response = await withMonitoring(
      () => airforceService.chat(body, apiKey.key),
      apiKey.id
    )();

    // 更新使用量
    await updateRateLimit(apiKey.id, 1, response.usage?.total_tokens || 0);
    await apiKeyService.updateApiKeyUsage(apiKey.key, 1, response.usage?.total_tokens || 0);

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
 * GET /api/chat - 獲取聊天模型列表
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

    if (!hasPermission(apiKey, 'chat')) {
      return NextResponse.json(
        { error: { message: 'Chat permission required', type: 'permission_error' } },
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
