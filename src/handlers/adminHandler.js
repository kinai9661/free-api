/**
 * Admin Handler
 * Handles admin API endpoints for API key management, stats, and logs
 */

import { apiKeyService } from '../services/apiKeyService.js';
import { monitoringService } from '../services/monitoringService.js';
import { logger } from '../utils/logger.js';

/**
 * Handle admin API requests
 */
export async function adminHandler(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const apiKey = request.apiKey;

  // Check if user has admin permission
  if (!apiKey.permissions.includes('admin:read') && !apiKey.permissions.includes('admin:write')) {
    return new Response(JSON.stringify({
      error: {
        message: 'Admin permission required',
        type: 'permission_error',
        code: 'permission_denied'
      }
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // API Keys endpoints
  if (path === '/admin/apikeys') {
    if (method === 'GET') {
      return await listAPIKeys(request, env);
    } else if (method === 'POST') {
      return await createAPIKey(request, env);
    }
  }

  if (path.startsWith('/admin/apikeys/')) {
    const keyId = request.params.id;
    if (method === 'GET') {
      return await getAPIKey(request, env, keyId);
    } else if (method === 'PUT') {
      return await updateAPIKey(request, env, keyId);
    } else if (method === 'DELETE') {
      return await deleteAPIKey(request, env, keyId);
    }
  }

  // Stats endpoint
  if (path === '/admin/stats' && method === 'GET') {
    return await getStats(request, env);
  }

  // Logs endpoint
  if (path === '/admin/logs' && method === 'GET') {
    return await getLogs(request, env);
  }

  // Settings endpoint
  if (path === '/admin/settings') {
    if (method === 'GET') {
      return await getSettings(request, env);
    } else if (method === 'PUT') {
      return await updateSettings(request, env);
    }
  }

  return new Response(JSON.stringify({
    error: {
      message: 'Invalid admin endpoint',
      type: 'invalid_request_error',
      code: 'invalid_endpoint'
    }
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * List all API keys
 */
async function listAPIKeys(request, env) {
  try {
    const keys = await apiKeyService.listKeys(env.KV);
    return new Response(JSON.stringify({ keys }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to list API keys', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to list API keys',
        type: 'api_error',
        code: 'list_keys_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Create a new API key
 */
async function createAPIKey(request, env) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type) {
      return new Response(JSON.stringify({
        error: {
          message: 'Missing required fields: name, type',
          type: 'invalid_request_error',
          code: 'missing_fields'
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate type
    if (!['admin', 'user', 'service'].includes(body.type)) {
      return new Response(JSON.stringify({
        error: {
          message: 'Invalid type. Must be admin, user, or service',
          type: 'invalid_request_error',
          code: 'invalid_type'
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const keyData = await apiKeyService.createKey(env.KV, body);

    return new Response(JSON.stringify(keyData), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to create API key', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to create API key',
        type: 'api_error',
        code: 'create_key_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a specific API key
 */
async function getAPIKey(request, env, keyId) {
  try {
    const key = await apiKeyService.getKey(env.KV, keyId);

    if (!key) {
      return new Response(JSON.stringify({
        error: {
          message: 'API key not found',
          type: 'not_found_error',
          code: 'key_not_found'
        }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(key), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to get API key', { error: error.message, keyId });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to get API key',
        type: 'api_error',
        code: 'get_key_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update an API key
 */
async function updateAPIKey(request, env, keyId) {
  try {
    const body = await request.json();
    const key = await apiKeyService.updateKey(env.KV, keyId, body);

    if (!key) {
      return new Response(JSON.stringify({
        error: {
          message: 'API key not found',
          type: 'not_found_error',
          code: 'key_not_found'
        }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(key), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to update API key', { error: error.message, keyId });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to update API key',
        type: 'api_error',
        code: 'update_key_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete an API key
 */
async function deleteAPIKey(request, env, keyId) {
  try {
    const success = await apiKeyService.deleteKey(env.KV, keyId);

    if (!success) {
      return new Response(JSON.stringify({
        error: {
          message: 'API key not found',
          type: 'not_found_error',
          code: 'key_not_found'
        }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to delete API key', { error: error.message, keyId });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to delete API key',
        type: 'api_error',
        code: 'delete_key_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get statistics
 */
async function getStats(request, env) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '24h';

    const stats = await monitoringService.getStats(env.KV, period);

    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to get stats', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to get stats',
        type: 'api_error',
        code: 'get_stats_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get logs
 */
async function getLogs(request, env) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const level = url.searchParams.get('level') || 'all';

    const logs = await monitoringService.getLogs(env.KV, { limit, offset, level });

    return new Response(JSON.stringify(logs), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to get logs', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to get logs',
        type: 'api_error',
        code: 'get_logs_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get settings
 */
async function getSettings(request, env) {
  try {
    const settings = await env.KV.get('settings', { type: 'json' });

    return new Response(JSON.stringify(settings || {}), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to get settings', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to get settings',
        type: 'api_error',
        code: 'get_settings_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update settings
 */
async function updateSettings(request, env) {
  try {
    const body = await request.json();

    await env.KV.put('settings', JSON.stringify(body));

    return new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed to update settings', { error: error.message });
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to update settings',
        type: 'api_error',
        code: 'update_settings_failed'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
