/**
 * Chat Completion Handler
 * Handles chat completion requests to api.airforce
 */

import { logger } from '../utils/logger.js';
import { monitoringService } from '../services/monitoringService.js';

/**
 * Handle chat completion requests
 */
export async function chatHandler(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Handle OPTIONS for CORS
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // GET /v1/models - List available models
  if (path === '/v1/models' && method === 'GET') {
    return await handleModels(request, env);
  }

  // POST /v1/chat/completions - Create chat completion
  if (path === '/v1/chat/completions' && method === 'POST') {
    return await handleChatCompletion(request, env, ctx);
  }

  return new Response(JSON.stringify({
    error: {
      message: 'Invalid request',
      type: 'invalid_request_error',
      code: 'invalid_request'
    }
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle GET /v1/models
 */
async function handleModels(request, env) {
  try {
    const response = await fetch(`${env.API_AIRFORCE_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.API_AIRFORCE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.error('Failed to fetch models', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to fetch models',
        type: 'api_error',
        code: 'models_fetch_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle POST /v1/chat/completions
 */
async function handleChatCompletion(request, env, ctx) {
  const startTime = Date.now();
  const apiKey = request.apiKey;

  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({
        error: {
          message: 'Missing or invalid messages',
          type: 'invalid_request_error',
          code: 'invalid_messages'
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if streaming is requested
    const stream = body.stream === true;

    if (stream) {
      return await handleStreamingChat(body, env, ctx, apiKey);
    } else {
      return await handleNonStreamingChat(body, env, apiKey);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Chat completion error', {
      error: error.message,
      duration: `${duration}ms`
    });

    // Record error in monitoring
    await monitoringService.recordError(env.KV, 'chat', error.message);

    return new Response(JSON.stringify({
      error: {
        message: 'Internal server error',
        type: 'api_error',
        code: 'internal_error'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle non-streaming chat completion
 */
async function handleNonStreamingChat(body, env, apiKey) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${env.API_AIRFORCE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.API_AIRFORCE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Record metrics
    await monitoringService.recordRequest(env.KV, 'chat', {
      apiKeyId: apiKey.id,
      model: body.model,
      success: response.ok,
      duration,
      tokens: data.usage?.total_tokens || 0
    });

    // Update API key usage
    await monitoringService.updateKeyUsage(env.KV, apiKey.id, {
      requests: 1,
      tokens: data.usage?.total_tokens || 0
    });

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': request.rateLimitInfo?.limit?.toString() || '100',
        'X-RateLimit-Remaining': request.rateLimitInfo?.remaining?.toString() || '0',
        'X-RateLimit-Reset': request.rateLimitInfo?.resetAt?.toString() || '0'
      }
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Handle streaming chat completion
 */
async function handleStreamingChat(body, env, ctx, apiKey) {
  const startTime = Date.now();
  let totalTokens = 0;

  try {
    const response = await fetch(`${env.API_AIRFORCE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.API_AIRFORCE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify(error), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a TransformStream to process the SSE stream
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        // Forward the chunk
        controller.enqueue(chunk);

        // Try to parse tokens from the chunk
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              totalTokens += parsed.usage?.total_tokens || 0;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    });

    // Pipe the response through the transform stream
    ctx.waitUntil(response.body.pipeTo(writable));

    // Record metrics after stream completes
    ctx.waitUntil(
      (async () => {
        const duration = Date.now() - startTime;
        await monitoringService.recordRequest(env.KV, 'chat', {
          apiKeyId: apiKey.id,
          model: body.model,
          success: true,
          duration,
          tokens: totalTokens
        });
        await monitoringService.updateKeyUsage(env.KV, apiKey.id, {
          requests: 1,
          tokens: totalTokens
        });
      })()
    );

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': request.rateLimitInfo?.limit?.toString() || '100',
        'X-RateLimit-Remaining': request.rateLimitInfo?.remaining?.toString() || '0',
        'X-RateLimit-Reset': request.rateLimitInfo?.resetAt?.toString() || '0'
      }
    });
  } catch (error) {
    throw error;
  }
}
