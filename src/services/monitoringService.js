/**
 * Monitoring Service
 * Tracks request metrics, errors, and provides statistics
 */

import { logger } from '../utils/logger.js';

// KV Key prefixes
const METRICS_PREFIX = 'metrics:';
const LOGS_PREFIX = 'logs:';
const STATS_PREFIX = 'stats:';

/**
 * Monitoring Service
 */
export const monitoringService = {
  /**
   * Record a request metric
   */
  async recordRequest(kv, type, data) {
    try {
      const now = new Date();
      const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hourKey = `${dateKey}:${now.getHours()}`; // YYYY-MM-DD:HH

      // Record hourly metrics
      const hourlyKey = `${METRICS_PREFIX}hourly:${type}:${hourKey}`;
      const hourlyData = await kv.get(hourlyKey, { type: 'json' }) || {
        requests: 0,
        success: 0,
        errors: 0,
        tokens: 0,
        images: 0,
        duration: 0,
        byModel: {},
        byKey: {}
      };

      hourlyData.requests += 1;
      hourlyData.success += data.success ? 1 : 0;
      hourlyData.errors += data.success ? 0 : 1;
      hourlyData.tokens += data.tokens || 0;
      hourlyData.images += data.images || 0;
      hourlyData.duration += data.duration || 0;

      // Track by model
      if (data.model) {
        hourlyData.byModel[data.model] = (hourlyData.byModel[data.model] || 0) + 1;
      }

      // Track by API key
      if (data.apiKeyId) {
        hourlyData.byKey[data.apiKeyId] = (hourlyData.byKey[data.apiKeyId] || 0) + 1;
      }

      await kv.put(hourlyKey, JSON.stringify(hourlyData), {
        expirationTtl: 86400 * 7 // Keep for 7 days
      });

      // Record daily stats
      const dailyKey = `${STATS_PREFIX}daily:${dateKey}`;
      const dailyData = await kv.get(dailyKey, { type: 'json' }) || {
        requests: 0,
        success: 0,
        errors: 0,
        tokens: 0,
        images: 0,
        avgDuration: 0
      };

      dailyData.requests += 1;
      dailyData.success += data.success ? 1 : 0;
      dailyData.errors += data.success ? 0 : 1;
      dailyData.tokens += data.tokens || 0;
      dailyData.images += data.images || 0;

      // Update average duration
      const totalDuration = dailyData.avgDuration * (dailyData.requests - 1) + (data.duration || 0);
      dailyData.avgDuration = totalDuration / dailyData.requests;

      await kv.put(dailyKey, JSON.stringify(dailyData), {
        expirationTtl: 86400 * 30 // Keep for 30 days
      });

      logger.debug('Request recorded', { type, data });
    } catch (error) {
      logger.error('Failed to record request', { error: error.message, type, data });
    }
  },

  /**
   * Record an error
   */
  async recordError(kv, type, error) {
    try {
      const now = new Date();
      const dateKey = now.toISOString().split('T')[0];
      const hourKey = `${dateKey}:${now.getHours()}`;

      // Record hourly errors
      const hourlyKey = `${METRICS_PREFIX}errors:${type}:${hourKey}`;
      const hourlyData = await kv.get(hourlyKey, { type: 'json' }) || {
        count: 0,
        errors: {}
      };

      hourlyData.count += 1;
      hourlyData.errors[error] = (hourlyData.errors[error] || 0) + 1;

      await kv.put(hourlyKey, JSON.stringify(hourlyData), {
        expirationTtl: 86400 * 7
      });

      // Log to R2 for long-term storage
      const logKey = `${LOGS_PREFIX}${now.toISOString()}:${type}:${Math.random().toString(36).substr(2, 9)}`;
      await kv.put(logKey, JSON.stringify({
        timestamp: now.toISOString(),
        type,
        error
      }), {
        expirationTtl: 86400 * 30
      });
    } catch (error) {
      logger.error('Failed to record error', { error: error.message, type });
    }
  },

  /**
   * Get statistics for a period
   */
  async getStats(kv, period = '24h') {
    try {
      const now = new Date();
      const stats = {
        period,
        requests: 0,
        success: 0,
        errors: 0,
        tokens: 0,
        images: 0,
        avgDuration: 0,
        byType: {
          chat: { requests: 0, success: 0, errors: 0, tokens: 0 },
          image: { requests: 0, success: 0, errors: 0, images: 0 }
        },
        byModel: {},
        byHour: []
      };

      let hoursToFetch = 24;
      if (period === '1h') hoursToFetch = 1;
      if (period === '6h') hoursToFetch = 6;
      if (period === '24h') hoursToFetch = 24;
      if (period === '7d') hoursToFetch = 24 * 7;
      if (period === '30d') hoursToFetch = 24 * 30;

      // Fetch hourly metrics
      for (let i = 0; i < hoursToFetch; i++) {
        const hour = new Date(now.getTime() - i * 3600000);
        const dateKey = hour.toISOString().split('T')[0];
        const hourKey = `${dateKey}:${hour.getHours()}`;

        for (const type of ['chat', 'image']) {
          const hourlyKey = `${METRICS_PREFIX}hourly:${type}:${hourKey}`;
          const hourlyData = await kv.get(hourlyKey, { type: 'json' });

          if (hourlyData) {
            stats.requests += hourlyData.requests;
            stats.success += hourlyData.success;
            stats.errors += hourlyData.errors;
            stats.tokens += hourlyData.tokens || 0;
            stats.images += hourlyData.images || 0;

            stats.byType[type].requests += hourlyData.requests;
            stats.byType[type].success += hourlyData.success;
            stats.byType[type].errors += hourlyData.errors;
            stats.byType[type].tokens += hourlyData.tokens || 0;
            stats.byType[type].images += hourlyData.images || 0;

            // Aggregate by model
            for (const [model, count] of Object.entries(hourlyData.byModel || {})) {
              stats.byModel[model] = (stats.byModel[model] || 0) + count;
            }
          }
        }

        // Add hourly data point
        if (i < 24) { // Only include last 24 hours in byHour
          stats.byHour.unshift({
            hour: hour.toISOString(),
            requests: stats.byType.chat.requests + stats.byType.image.requests,
            chat: stats.byType.chat.requests,
            image: stats.byType.image.requests
          });
        }
      }

      // Calculate average duration
      const totalRequests = stats.requests;
      if (totalRequests > 0) {
        stats.avgDuration = stats.byType.chat.avgDuration || 0;
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get stats', { error: error.message, period });
      return {
        period,
        requests: 0,
        success: 0,
        errors: 0,
        tokens: 0,
        images: 0,
        avgDuration: 0,
        byType: {
          chat: { requests: 0, success: 0, errors: 0, tokens: 0 },
          image: { requests: 0, success: 0, errors: 0, images: 0 }
        },
        byModel: {},
        byHour: []
      };
    }
  },

  /**
   * Get logs
   */
  async getLogs(kv, options = {}) {
    try {
      const { limit = 100, offset = 0, level = 'all' } = options;

      const logs = [];
      const list = await kv.list({
        prefix: LOGS_PREFIX,
        limit: limit + offset
      });

      for (let i = offset; i < Math.min(list.keys.length, limit + offset); i++) {
        const logData = await kv.get(list.keys[i].name, { type: 'json' });
        if (logData) {
          if (level === 'all' || logData.level === level) {
            logs.push(logData);
          }
        }
      }

      return {
        logs,
        total: list.keys.length,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Failed to get logs', { error: error.message, options });
      return {
        logs: [],
        total: 0,
        limit,
        offset
      };
    }
  },

  /**
   * Update key usage statistics
   */
  async updateKeyUsage(kv, keyId, updates) {
    try {
      const usageKey = `${STATS_PREFIX}key:${keyId}`;
      const usage = await kv.get(usageKey, { type: 'json' }) || {
        requests: 0,
        tokens: 0,
        images: 0,
        lastUsed: null
      };

      usage.requests += updates.requests || 0;
      usage.tokens += updates.tokens || 0;
      usage.images += updates.images || 0;
      usage.lastUsed = new Date().toISOString();

      await kv.put(usageKey, JSON.stringify(usage), {
        expirationTtl: 86400 * 30
      });

      return usage;
    } catch (error) {
      logger.error('Failed to update key usage', { error: error.message, keyId });
      return null;
    }
  },

  /**
   * Get key usage statistics
   */
  async getKeyUsage(kv, keyId) {
    try {
      const usageKey = `${STATS_PREFIX}key:${keyId}`;
      const usage = await kv.get(usageKey, { type: 'json' });

      return usage || {
        requests: 0,
        tokens: 0,
        images: 0,
        lastUsed: null
      };
    } catch (error) {
      logger.error('Failed to get key usage', { error: error.message, keyId });
      return {
        requests: 0,
        tokens: 0,
        images: 0,
        lastUsed: null
      };
    }
  },

  /**
   * Get all key usage statistics
   */
  async getAllKeyUsage(kv) {
    try {
      const usageList = [];
      const list = await kv.list({ prefix: `${STATS_PREFIX}key:` });

      for (const item of list.keys) {
        const keyId = item.name.replace(`${STATS_PREFIX}key:`, '');
        const usage = await kv.get(item.name, { type: 'json' });
        if (usage) {
          usageList.push({
            keyId,
            ...usage
          });
        }
      }

      return usageList;
    } catch (error) {
      logger.error('Failed to get all key usage', { error: error.message });
      return [];
    }
  }
};
