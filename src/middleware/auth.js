/**
 * Authentication Middleware
 * Validates API keys and attaches user info to request
 */

import { apiKeyService } from '../services/apiKeyService.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware
 */
export async function authMiddleware(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip auth for health check and web UI
  if (path === '/health' || path === '/' || path.startsWith('/admin') && !path.startsWith('/admin/api')) {
    return await request.next?.(request, env, ctx) || null;
  }

  // Get API key from header or query parameter
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                 request.headers.get('x-api-key') ||
                 url.searchParams.get('api_key');

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: {
        message: 'Missing API key',
        type: 'authentication_error',
        code: 'missing_api_key'
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate API key
  const keyData = await apiKeyService.validateKey(env.KV, apiKey);

  if (!keyData) {
    logger.warn('Invalid API key', { apiKey });
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid API key',
        type: 'authentication_error',
        code: 'invalid_api_key'
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if key is active
  if (!keyData.active) {
    logger.warn('Inactive API key', { apiKey, keyId: keyData.id });
    return new Response(JSON.stringify({
      error: {
        message: 'API key is inactive',
        type: 'authentication_error',
        code: 'inactive_api_key'
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check expiration
  if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
    logger.warn('Expired API key', { apiKey, keyId: keyData.id });
    return new Response(JSON.stringify({
      error: {
        message: 'API key has expired',
        type: 'authentication_error',
        code: 'expired_api_key'
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check IP restrictions
  if (keyData.allowedIPs && keyData.allowedIPs.length > 0) {
    const clientIP = request.headers.get('CF-Connecting-IP');
    if (!keyData.allowedIPs.includes(clientIP)) {
      logger.warn('IP not allowed', { apiKey, keyId: keyData.id, clientIP });
      return new Response(JSON.stringify({
        error: {
          message: 'IP address not allowed',
          type: 'authentication_error',
          code: 'ip_not_allowed'
        }
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Attach key data to request
  request.apiKey = keyData;
  request.clientIP = request.headers.get('CF-Connecting-IP');

  // Continue to next middleware/handler
  return await request.next?.(request, env, ctx) || null;
}
