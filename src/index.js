/**
 * API Airforce Gateway - Main Entry Point
 * Cloudflare Worker for API Gateway with chat, image generation, and monitoring
 */

import { Router } from './utils/router.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { chatHandler } from './handlers/chatHandler.js';
import { imageHandler } from './handlers/imageHandler.js';
import { adminHandler } from './handlers/adminHandler.js';
import { webHandler } from './handlers/webHandler.js';
import { healthHandler } from './handlers/healthHandler.js';
import { logger } from './utils/logger.js';

// Initialize Router
const router = new Router();

// Health Check
router.get('/health', healthHandler);

// Web UI Routes
router.get('/', webHandler);
router.get('/admin', webHandler);
router.get('/admin/*', webHandler);

// Public API Routes - v1
router.all('/v1/models', authMiddleware, rateLimitMiddleware, chatHandler);
router.all('/v1/chat/completions', authMiddleware, rateLimitMiddleware, chatHandler);
router.all('/v1/images/generations', authMiddleware, rateLimitMiddleware, imageHandler);

// Admin API Routes
router.all('/admin/apikeys', authMiddleware, adminHandler);
router.all('/admin/apikeys/:id', authMiddleware, adminHandler);
router.all('/admin/stats', authMiddleware, adminHandler);
router.all('/admin/logs', authMiddleware, adminHandler);
router.all('/admin/settings', authMiddleware, adminHandler);

// 404 Handler
router.all('*', async (request, env, ctx) => {
  return new Response(JSON.stringify({
    error: {
      message: 'Not Found',
      type: 'not_found_error',
      code: 'not_found'
    }
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

/**
 * Main fetch handler for Cloudflare Worker
 */
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    try {
      // Log incoming request
      logger.info(`${method} ${path}`, {
        ip: request.headers.get('CF-Connecting-IP'),
        userAgent: request.headers.get('User-Agent')
      });

      // Route the request
      const response = await router.handle(request, env, ctx);

      // Log response
      const duration = Date.now() - startTime;
      logger.info(`${method} ${path} - ${response.status}`, {
        duration: `${duration}ms`
      });

      // Add CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      };

      // Merge CORS headers with existing headers
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (!newHeaders.has(key)) {
          newHeaders.set(key, value);
        }
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      logger.error(`${method} ${path} - Error`, {
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      });

      // Return error response
      return new Response(JSON.stringify({
        error: {
          message: 'Internal Server Error',
          type: 'internal_error',
          code: 'internal_error'
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
