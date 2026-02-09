/**
 * Health Check Handler
 * Returns health status of the API Gateway
 */

export async function healthHandler(request, env, ctx) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      kv: 'unknown',
      r2: 'unknown',
      api_airforce: 'unknown'
    }
  };

  // Check KV
  try {
    await env.KV.put('health_check', 'ok', { expirationTtl: 60 });
    const value = await env.KV.get('health_check');
    health.services.kv = value === 'ok' ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.services.kv = 'unhealthy';
    health.status = 'degraded';
  }

  // Check R2
  try {
    await env.R2.put('health_check.txt', 'ok');
    await env.R2.delete('health_check.txt');
    health.services.r2 = 'healthy';
  } catch (error) {
    health.services.r2 = 'unhealthy';
    health.status = 'degraded';
  }

  // Check api.airforce
  try {
    const response = await fetch(`${env.API_AIRFORCE_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.API_AIRFORCE_KEY}`
      }
    });
    health.services.api_airforce = response.ok ? 'healthy' : 'unhealthy';
    if (!response.ok) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.api_airforce = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return new Response(JSON.stringify(health), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
