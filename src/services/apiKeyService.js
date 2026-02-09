/**
 * API Key Service
 * Manages API key creation, validation, and lifecycle
 */

import { logger } from '../utils/logger.js';

// KV Key prefixes
const KEY_PREFIX = 'apikey:';
const KEY_INDEX_PREFIX = 'apikey:index:';
const KEY_USAGE_PREFIX = 'apikey:usage:';

/**
 * API Key Service
 */
export const apiKeyService = {
  /**
   * Generate a random API key
   */
  generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk-';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  },

  /**
   * Create a new API key
   */
  async createKey(kv, data) {
    const keyId = crypto.randomUUID();
    const apiKey = this.generateKey();

    // Default permissions based on type
    const defaultPermissions = {
      admin: ['admin:read', 'admin:write', 'chat:read', 'chat:write', 'image:generate'],
      user: ['chat:read', 'chat:write', 'image:generate'],
      service: ['chat:read', 'chat:write']
    };

    const keyData = {
      id: keyId,
      key: apiKey,
      name: data.name,
      type: data.type,
      permissions: data.permissions || defaultPermissions[data.type] || [],
      rateLimit: data.rateLimit || {
        limit: 100,
        window: 60
      },
      allowedIPs: data.allowedIPs || [],
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt || null,
      lastUsedAt: null,
      metadata: data.metadata || {}
    };

    // Store the key
    await kv.put(`${KEY_PREFIX}${keyId}`, JSON.stringify(keyData));

    // Store the key hash for validation
    const keyHash = await this.hashKey(apiKey);
    await kv.put(`${KEY_INDEX_PREFIX}${keyHash}`, keyId);

    // Initialize usage tracking
    await kv.put(`${KEY_USAGE_PREFIX}${keyId}`, JSON.stringify({
      requests: 0,
      tokens: 0,
      images: 0,
      lastReset: new Date().toISOString()
    }));

    logger.info('API key created', { keyId, name: data.name, type: data.type });

    return keyData;
  },

  /**
   * Validate an API key
   */
  async validateKey(kv, apiKey) {
    try {
      const keyHash = await this.hashKey(apiKey);
      const keyId = await kv.get(`${KEY_INDEX_PREFIX}${keyHash}`);

      if (!keyId) {
        return null;
      }

      const keyData = await kv.get(`${KEY_PREFIX}${keyId}`, { type: 'json' });

      if (!keyData) {
        return null;
      }

      return keyData;
    } catch (error) {
      logger.error('Failed to validate API key', { error: error.message });
      return null;
    }
  },

  /**
   * Get an API key by ID
   */
  async getKey(kv, keyId) {
    try {
      const keyData = await kv.get(`${KEY_PREFIX}${keyId}`, { type: 'json' });
      return keyData;
    } catch (error) {
      logger.error('Failed to get API key', { error: error.message, keyId });
      return null;
    }
  },

  /**
   * List all API keys
   */
  async listKeys(kv) {
    try {
      const keys = [];
      const list = await kv.list({ prefix: KEY_PREFIX });

      for (const item of list.keys) {
        const keyData = await kv.get(item.name, { type: 'json' });
        if (keyData) {
          // Remove the actual key from the response for security
          const { key, ...safeKeyData } = keyData;
          keys.push(safeKeyData);
        }
      }

      return keys;
    } catch (error) {
      logger.error('Failed to list API keys', { error: error.message });
      return [];
    }
  },

  /**
   * Update an API key
   */
  async updateKey(kv, keyId, updates) {
    try {
      const keyData = await kv.get(`${KEY_PREFIX}${keyId}`, { type: 'json' });

      if (!keyData) {
        return null;
      }

      // Apply updates
      const updatedKey = {
        ...keyData,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await kv.put(`${KEY_PREFIX}${keyId}`, JSON.stringify(updatedKey));

      logger.info('API key updated', { keyId });

      return updatedKey;
    } catch (error) {
      logger.error('Failed to update API key', { error: error.message, keyId });
      return null;
    }
  },

  /**
   * Delete an API key
   */
  async deleteKey(kv, keyId) {
    try {
      const keyData = await kv.get(`${KEY_PREFIX}${keyId}`, { type: 'json' });

      if (!keyData) {
        return false;
      }

      // Delete the key
      await kv.delete(`${KEY_PREFIX}${keyId}`);

      // Delete the key hash index
      const keyHash = await this.hashKey(keyData.key);
      await kv.delete(`${KEY_INDEX_PREFIX}${keyHash}`);

      // Delete usage tracking
      await kv.delete(`${KEY_USAGE_PREFIX}${keyId}`);

      logger.info('API key deleted', { keyId });

      return true;
    } catch (error) {
      logger.error('Failed to delete API key', { error: error.message, keyId });
      return false;
    }
  },

  /**
   * Update last used timestamp
   */
  async updateLastUsed(kv, keyId) {
    try {
      const keyData = await kv.get(`${KEY_PREFIX}${keyId}`, { type: 'json' });

      if (keyData) {
        keyData.lastUsedAt = new Date().toISOString();
        await kv.put(`${KEY_PREFIX}${keyId}`, JSON.stringify(keyData));
      }
    } catch (error) {
      logger.error('Failed to update last used', { error: error.message, keyId });
    }
  },

  /**
   * Get key usage statistics
   */
  async getKeyUsage(kv, keyId) {
    try {
      const usage = await kv.get(`${KEY_USAGE_PREFIX}${keyId}`, { type: 'json' });
      return usage || { requests: 0, tokens: 0, images: 0, lastReset: new Date().toISOString() };
    } catch (error) {
      logger.error('Failed to get key usage', { error: error.message, keyId });
      return { requests: 0, tokens: 0, images: 0, lastReset: new Date().toISOString() };
    }
  },

  /**
   * Update key usage statistics
   */
  async updateKeyUsage(kv, keyId, updates) {
    try {
      const usage = await this.getKeyUsage(kv, keyId);

      const updatedUsage = {
        ...usage,
        requests: (usage.requests || 0) + (updates.requests || 0),
        tokens: (usage.tokens || 0) + (updates.tokens || 0),
        images: (usage.images || 0) + (updates.images || 0),
        lastReset: usage.lastReset
      };

      await kv.put(`${KEY_USAGE_PREFIX}${keyId}`, JSON.stringify(updatedUsage));

      return updatedUsage;
    } catch (error) {
      logger.error('Failed to update key usage', { error: error.message, keyId });
      return null;
    }
  },

  /**
   * Hash an API key for storage
   */
  async hashKey(key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};
