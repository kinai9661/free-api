import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, hasPermission, verifyAdminPassword } from '@/lib/middleware/auth';
import { getMonitoringData, getSystemStats } from '@/lib/middleware/monitoring';
import { apiKeyService } from '@/lib/services/apiKeyService';

/**
 * GET /api/monitoring - 獲取監控數據（需要管理員權限）
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    const url = new URL(request.url);
    const apiKeyId = url.searchParams.get('apiKeyId');
    const period = (url.searchParams.get('period') as 'hour' | 'day' | 'week' | 'month') || 'day';

    // 獲取系統統計
    const systemStats = await getSystemStats();

    // 如果指定了 API Key ID，獲取該 API Key 的監控數據
    let apiKeyStats = null;
    if (apiKeyId) {
      const monitoringData = await getMonitoringData(apiKeyId, period);
      apiKeyStats = {
        apiKeyId,
        period,
        data: monitoringData,
      };
    }

    return NextResponse.json(
      {
        system: systemStats,
        apiKey: apiKeyStats,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: { message: errorMessage, type: 'server_error' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
