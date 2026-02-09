/**
 * Initialization Script
 * Creates the initial Admin API Key
 *
 * Usage: node init.js
 */

import { apiKeyService } from './src/services/apiKeyService.js';

// Mock KV for local testing
class MockKV {
  constructor() {
    this.store = new Map();
  }

  async put(key, value, options = {}) {
    this.store.set(key, value);
  }

  async get(key, options = {}) {
    const value = this.store.get(key);
    if (!value) return null;

    if (options.type === 'json') {
      return JSON.parse(value);
    }
    return value;
  }

  async delete(key) {
    this.store.delete(key);
  }

  async list(options = {}) {
    const keys = [];
    for (const [name] of this.store) {
      if (!options.prefix || name.startsWith(options.prefix)) {
        keys.push({ name });
      }
    }
    return { keys };
  }
}

async function init() {
  console.log('==========================================');
  console.log('API Airforce Gateway - Initialization');
  console.log('==========================================');
  console.log('');

  const kv = new MockKV();

  // Create Admin API Key
  console.log('Creating Admin API Key...');
  const adminKey = await apiKeyService.createKey(kv, {
    name: 'Admin Key',
    type: 'admin',
    rateLimit: {
      limit: 1000,
      window: 60
    }
  });

  console.log('');
  console.log('✓ Admin API Key created successfully!');
  console.log('');
  console.log('==========================================');
  console.log('IMPORTANT: Save this API Key!');
  console.log('==========================================');
  console.log('');
  console.log('Key ID:', adminKey.id);
  console.log('API Key:', adminKey.key);
  console.log('');
  console.log('Use this key to access the Web UI and Admin API.');
  console.log('');
  console.log('To set this as a secret in Cloudflare:');
  console.log('  wrangler secret put ADMIN_API_KEY');
  console.log('  (then paste the key above)');
  console.log('');
}

init().catch(console.error);
