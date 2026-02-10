import { NextResponse } from 'next/server';

/**
 * CORS 中介軟體
 */
export function corsMiddleware(request: Request) {
  const origin = request.headers.get('origin');
  
  const headers = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  };

  // 處理 OPTIONS 預檢請求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  return { headers };
}

/**
 * 添加 CORS 標頭到響應
 */
export function addCorsHeaders(response: Response, headers: Record<string, string>) {
  const newResponse = new NextResponse(response.body, response);
  Object.entries(headers).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}
