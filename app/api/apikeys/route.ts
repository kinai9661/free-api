import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, hasPermission, verifyAdminPassword } from '@/lib/middleware/auth';
import { apiKeyService } from '@/lib/services/apiKeyService';
import { Permission, RateLimit } from '@/types';

/**
 * GET /api/apikeys - 列出所有 API Keys（需要管理員權限）
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Admin-Password',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    // 檢查管理員密碼
    const adminPassword = request.headers.get('x-admin-password');
    if (!adminPassword || !(await verifyAdminPassword(adminPassword))) {
      return NextResponse.json(
        { error: { message: 'Invalid admin password', type: 'authentication_error' } },
        { status: 401, headers: corsHeaders }
      );
    }

    const apiKeys = await apiKeyService.listApiKeys();
    
    // 隱藏實際的 API Key
    const sanitizedKeys = apiKeys.map(key => ({
      ...key,
      key: key.key.substring(0, 8) + '...' + key.key.substring(key.key.length - 4),
    }));

    return NextResponse.json({ data: sanitizedKeys }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: { message: errorMessage, type: 'server_error' } },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/apikeys - 創建新的 API Key（需要管理員權限）
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Admin-Password',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    // 檢查管理員密碼
    const adminPassword = request.headers.get('x-admin-password');
    if (!adminPassword || !(await verifyAdminPassword(adminPassword))) {
      return NextResponse.json(
        { error: { message: 'Invalid admin password', type: 'authentication_error' } },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { name, permissions, rateLimit } = body;

    if (!name || !permissions || !rateLimit) {
      return NextResponse.json(
        { error: { message: 'Missing required fields: name, permissions, rateLimit', type: 'validation_error' } },
        { status: 400, headers: corsHeaders }
      );
    }

    const newKey = await apiKeyService.createApiKey(name, permissions, rateLimit);

    return NextResponse.json({ data: newKey }, { status: 201, headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: { message: errorMessage, type: 'server_error' } },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/apikeys - 刪除 API Key（需要管理員權限）
 */
export async function DELETE(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Admin-Password',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    // 檢查管理員密碼
    const adminPassword = request.headers.get('x-admin-password');
    if (!adminPassword || !(await verifyAdminPassword(adminPassword))) {
      return NextResponse.json(
        { error: { message: 'Invalid admin password', type: 'authentication_error' } },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: { message: 'Missing required field: key', type: 'validation_error' } },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await apiKeyService.deleteApiKey(key);

    if (!deleted) {
      return NextResponse.json(
        { error: { message: 'API Key not found', type: 'not_found_error' } },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: { message: errorMessage, type: 'server_error' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
