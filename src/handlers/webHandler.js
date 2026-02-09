/**
 * Web UI Handler
 * Serves the Web UI static files
 */

/**
 * Handle Web UI requests
 */
export async function webHandler(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Serve index.html for root and admin routes
  if (path === '/' || path === '/admin' || path.startsWith('/admin/')) {
    try {
      // Try to get the HTML from R2
      const html = await env.R2.get('web-ui/index.html');

      if (html) {
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      // Fallback: return a simple HTML page
      return new Response(getFallbackHTML(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    } catch (error) {
      // Fallback: return a simple HTML page
      return new Response(getFallbackHTML(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
  }

  // Serve CSS files
  if (path.startsWith('/css/')) {
    try {
      const css = await env.R2.get(`web-ui${path}`);
      if (css) {
        return new Response(css, {
          headers: {
            'Content-Type': 'text/css; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    } catch (error) {
      // Ignore
    }
  }

  // Serve JS files
  if (path.startsWith('/js/')) {
    try {
      const js = await env.R2.get(`web-ui${path}`);
      if (js) {
        return new Response(js, {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    } catch (error) {
      // Ignore
    }
  }

  // 404 for other paths
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Fallback HTML when R2 is not available
 */
function getFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Airforce Gateway</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .status {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .status-item:last-child {
      border-bottom: none;
    }
    .status-label {
      opacity: 0.8;
    }
    .status-value {
      font-weight: 600;
    }
    .status-value.healthy {
      color: #4ade80;
    }
    .status-value.unhealthy {
      color: #f87171;
    }
    .api-endpoints {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: left;
    }
    .api-endpoints h3 {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    .endpoint {
      font-family: 'Courier New', monospace;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    .method {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-right: 8px;
    }
    .method.get { background: #3b82f6; }
    .method.post { background: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <h1>API Airforce Gateway</h1>
    <p>OpenAI-compatible API Gateway for api.airforce</p>

    <div class="status">
      <div class="status-item">
        <span class="status-label">Status</span>
        <span class="status-value healthy">Running</span>
      </div>
      <div class="status-item">
        <span class="status-label">Version</span>
        <span class="status-value">1.0.0</span>
      </div>
      <div class="status-item">
        <span class="status-label">Environment</span>
        <span class="status-value">Production</span>
      </div>
    </div>

    <div class="api-endpoints">
      <h3>Public API Endpoints</h3>
      <div class="endpoint">
        <span class="method get">GET</span>/v1/models
      </div>
      <div class="endpoint">
        <span class="method post">POST</span>/v1/chat/completions
      </div>
      <div class="endpoint">
        <span class="method post">POST</span>/v1/images/generations
      </div>
      <div class="endpoint">
        <span class="method get">GET</span>/health
      </div>
    </div>
  </div>
</body>
</html>`;
}
