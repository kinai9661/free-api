/**
 * Rate Limit Service
 * Implements Token Bucket and Sliding Window rate limiting algorithms
 */

import { logger } from '../utils/logger.js';

// KV Key prefixes
const RATE_LIMIT_PREFIX = 'ratelimit:';

/**
 * Rate Limit Service
 */
export const rateLimitService = {
  /**
   * Check rate limit using Token Bucket algorithm
   */
  async checkLimit(kv, identifier, limit, window) {
    try {
      const now = Date.now();
      const key = `${RATE_LIMIT_PREFIX}${identifier}`;

      // Get current state
      const state = await kv.get(key, { type: 'json' });

      if (!state) {
        // First request - initialize bucket
        const newState = {
          tokens: limit - 1,
          lastRefill: now,
          windowStart: now,
          windowEnd: now + (window * 1000)
        };

        await kv.put(key, JSON.stringify(newState), {
          expirationTtl: window
        });

        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: newState.windowEnd,
          retryAfter: 0
        };
      }

      // Check if window has expired
      if (now > state.windowEnd) {
        // Reset bucket
        const newState = {
          tokens: limit - 1,
          lastRefill: now,
          windowStart: now,
          windowEnd: now + (window * 1000)
        };

        await kv.put(key, JSON.stringify(newState), {
          expirationTtl: window
        });

        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: newState.windowEnd,
          retryAfter: 0
        };
      }

      // Check if tokens are available
      if (state.tokens > 0) {
        // Consume a token
        state.tokens -= 1;
        await kv.put(key, JSON.stringify(state), {
          expirationTtl: Math.ceil((state.windowEnd - now) / 1000)
        });

        return {
          allowed: true,
          remaining: state.tokens,
          resetAt: state.windowEnd,
          retryAfter: 0
        };
      }

      // Rate limit exceeded
      const retryAfter = Math.ceil((state.windowEnd - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt: state.windowEnd,
        retryAfter
      };
    } catch (error) {
      logger.error('Rate limit check failed', {
        error: error.message,
        identifier
      });

      // Fail open - allow request if rate limit check fails
      return {
        allowed: true,
        remaining: limit,
        resetAt: Date.now() + (window * 1000),
        retryAfter: 0
      };
    }
  },

  /**
   * Reset rate limit for an identifier
   */
  async resetLimit(kv, identifier) {
    try {
      const key = `${RATE_LIMIT_PREFIX}${identifier}`;
      await kv.delete(key);

      logger.info('Rate limit reset', { identifier });

      return true;
    } catch (error) {
      logger.error('Failed to reset rate limit', {
        error: error.message,
        identifier
      });

      return false;
    }
  },

  /**
   * Get current rate limit state
   */
  async getLimitState(kv, identifier) {
    try {
      const key = `${RATE_LIMIT_PREFIX}${identifier}`;
      const state = await kv.get(key, { type: 'json' });

      return state;
    } catch (error) {
      logger.error('Failed to get rate limit state', {
        error: error.message,
        identifier
      });

      return null;
    }
  },

  /**
   * Get all rate limit states
   */
  async getAllLimits(kv) {
    try {
      const limits = [];
      const list = await kv.list({ prefix: RATE_LIMIT_PREFIX });

      for (const item of list.keys) {
        const state = await kv.get(item.name, { type: 'json' });
        if (state) {
          limits.push({
            identifier: item.name.replace(RATE_LIMIT_PREFIX, ''),
            ...state
          });
        }
      }

      return limits;
    } catch (error) {
      logger.error('Failed to get all rate limits', { error: error.message });
      return [];
    }
  }
};
