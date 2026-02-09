/**
 * Image Generation Handler
 * Handles image generation requests to api.airforce
 */

import { logger } from '../utils/logger.js';
import { monitoringService } from '../services/monitoringService.js';

/**
 * Handle image generation requests
 */
export async function imageHandler(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Handle OPTIONS for CORS
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // POST /v1/images/generations - Generate image
  if (path === '/v1/images/generations' && method === 'POST') {
    return await handleImageGeneration(request, env, ctx);
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
 * Handle POST /v1/images/generations
 */
async function handleImageGeneration(request, env, ctx) {
  const startTime = Date.now();
  const apiKey = request.apiKey;

  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    if (!body.prompt) {
      return new Response(JSON.stringify({
        error: {
          message: 'Missing prompt',
          type: 'invalid_request_error',
          code: 'missing_prompt'
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has permission to generate images
    if (!apiKey.permissions.includes('image:generate')) {
      return new Response(JSON.stringify({
        error: {
          message: 'API key does not have permission to generate images',
          type: 'permission_error',
          code: 'permission_denied'
        }
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forward request to api.airforce
    const response = await fetch(`${env.API_AIRFORCE_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.API_AIRFORCE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      logger.error('Image generation failed', {
        error: data.error?.message || 'Unknown error',
        duration: `${duration}ms`
      });

      // Record error in monitoring
      await monitoringService.recordError(env.KV, 'image', data.error?.message || 'Unknown error');

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store generated images in R2
    if (data.data && Array.isArray(data.data)) {
      for (const image of data.data) {
        if (image.url) {
          try {
            // Download the image
            const imageResponse = await fetch(image.url);
            const imageBlob = await imageResponse.blob();

            // Generate a unique filename
            const filename = `images/${apiKey.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;

            // Store in R2
            await env.R2.put(filename, imageBlob, {
              httpMetadata: {
                contentType: imageResponse.headers.get('Content-Type') || 'image/png'
              },
              customMetadata: {
                apiKeyId: apiKey.id,
                prompt: body.prompt,
                model: body.model || 'dall-e-3',
                createdAt: new Date().toISOString()
              }
            });

            // Update the URL to point to our R2 storage
            image.url = `/api/images/${filename}`;
            image.b64_json = undefined; // Remove base64 data to save space
          } catch (error) {
            logger.error('Failed to store image in R2', {
              error: error.message,
              imageUrl: image.url
            });
            // Keep original URL if storage fails
          }
        }
      }
    }

    // Record metrics
    await monitoringService.recordRequest(env.KV, 'image', {
      apiKeyId: apiKey.id,
      model: body.model || 'dall-e-3',
      success: true,
      duration,
      images: data.data?.length || 0
    });

    // Update API key usage
    await monitoringService.updateKeyUsage(env.KV, apiKey.id, {
      requests: 1,
      images: data.data?.length || 0
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
    const duration = Date.now() - startTime;
    logger.error('Image generation error', {
      error: error.message,
      duration: `${duration}ms`
    });

    // Record error in monitoring
    await monitoringService.recordError(env.KV, 'image', error.message);

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
