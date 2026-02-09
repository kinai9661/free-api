/**
 * Rate Limiting Middleware
 * Implements Token Bucket and Sliding Window algorithms
 */

import { rateLimitService } from '../services/rateLimitService.js';
import { logger } from '../utils/logger.js';

/**
 * Rate limit middleware
 */
export async function rateLimitMiddleware(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Skip rate limiting for health check and web UI
  if (path === '/health' || path === '/' || path.startsWith('/admin') && !path.startsWith('/admin/api')) {
    return await request.next?.(request, env, ctx) || null;
  }

  const apiKey = request.apiKey;
  const clientIP = request.clientIP;

  // Get rate limit configuration
  const config = {
    global: {
      limit: parseInt(env.DEFAULT_RATE_LIMIT) || 100,
      window: parseInt(env.DEFAULT_RATE_WINDOW) || 60
    },
    key: apiKey?.rateLimit || {
      limit: parseInt(env.DEFAULT_RATE_LIMIT) || 100,
      window: parseInt(env.DEFAULT_RATE_WINDOW) || 60
    },
    ip: {
      limit: 50,
      window: 60
    },
    endpoint: {
      limit: 20,
      window: 60
    }
  };

  // Check global rate limit
  const globalResult = await rateLimitService.checkLimit(
    env.KV,
    'global',
    config.global.limit,
    config.global.window
  );

  if (!globalResult.allowed) {
    logger.warn('Global rate limit exceeded', {
      limit: config.global.limit,
      window: config.global.window
    });
    return new Response(JSON.stringify({
      error: {
        message: 'Rate limit exceeded. Please try again later.',
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded',
        retry_after: globalResult.retryAfter
      }
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': globalResult.retryAfter.toString(),
        'X-RateLimit-Limit': config.global.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': globalResult.resetAt.toString()
      }
    });
  }

  // Check API key rate limit
  if (apiKey) {
    const keyResult = await rateLimitService.checkLimit(
      env.KV,
      `key:${apiKey.id}`,
      config.key.limit,
      config.key.window
    );

    if (!keyResult.allowed) {
      logger.warn('API key rate limit exceeded', {
        keyId: apiKey.id,
        limit: config.key.limit,
        window: config.key.window
      });
      return new Response(JSON.stringify({
        error: {
          message: 'API key rate limit exceeded. Please try again later.',
          type: 'rate_limit_error',
          code: 'key_rate_limit_exceeded',
          retry_after: keyResult.retryAfter
        }
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': keyResult.retryAfter.toString(),
          'X-RateLimit-Limit': config.key.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': keyResult.resetAt.toString()
        }
      });
    }
  }

  // Check IP rate limit
  if (clientIP) {
    const ipResult = await rateLimitService.checkLimit(
      env.KV,
      `ip:${clientIP}`,
      config.ip.limit,
      config.ip.window
    );

    if (!ipResult.allowed) {
      logger.warn('IP rate limit exceeded', {
        ip: clientIP,
        limit: config.ip.limit,
        window: config.ip.window
      });
      return new Response(JSON.stringify({
        error: {
          message: 'IP rate limit exceeded. Please try again later.',
          type: 'rate_limit_error',
          code: 'ip_rate_limit_exceeded',
          retry_after: ipResult.retryAfter
        }
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': ipResult.retryAfter.toString(),
          'X-RateLimit-Limit': config.ip.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': ipResult.resetAt.toString()
        }
      });
    }
  }

  // Check endpoint rate limit
  const endpointResult = await rateLimitService.checkLimit(
    env.KV,
    `endpoint:${method}:${path}`,
    config.endpoint.limit,
    config.endpoint.window
  );

  if (!endpointResult.allowed) {
    logger.warn('Endpoint rate limit exceeded', {
      endpoint: `${method} ${path}`,
      limit: config.endpoint.limit,
      window: config.endpoint.window
    });
    return new Response(JSON.stringify({
      error: {
        message: 'Endpoint rate limit exceeded. Please try again later.',
        type: 'rate_limit_error',
        code: 'endpoint_rate_limit_exceeded',
        retry_after: endpointResult.retryAfter
      }
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': endpointResult.retryAfter.toString(),
        'X-RateLimit-Limit': config.endpoint.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': endpointResult.resetAt.toString()
      }
    });
  }

  // Add rate limit headers to response
  request.rateLimitInfo = {
    limit: config.key.limit,
    remaining: endpointResult.remaining,
    resetAt: endpointResult.resetAt
  };

  // Continue to next handler
  return await request.next?.(request, env, ctx) || null;
}
