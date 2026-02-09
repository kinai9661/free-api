/**
 * Simple Router for Cloudflare Worker
 * Handles route matching and middleware execution
 */

export class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * Register a GET route
   */
  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
  }

  /**
   * Register a POST route
   */
  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
  }

  /**
   * Register a PUT route
   */
  put(path, handler) {
    this.routes.push({ method: 'PUT', path, handler });
  }

  /**
   * Register a DELETE route
   */
  delete(path, handler) {
    this.routes.push({ method: 'DELETE', path, handler });
  }

  /**
   * Register a route for any method
   */
  all(path, handler) {
    this.routes.push({ method: '*', path, handler });
  }

  /**
   * Match a route against the request
   */
  match(method, path) {
    for (const route of this.routes) {
      if (route.method !== '*' && route.method !== method) {
        continue;
      }

      // Convert route pattern to regex
      const pattern = route.path
        .replace(/\*/g, '.*')
        .replace(/:([^/]+)/g, '([^/]+)');

      const regex = new RegExp(`^${pattern}$`);
      const match = path.match(regex);

      if (match) {
        // Extract path parameters
        const params = {};
        const paramNames = (route.path.match(/:([^/]+)/g) || []).map(p => p.slice(1));
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return { handler: route.handler, params };
      }
    }

    return null;
  }

  /**
   * Handle incoming request
   */
  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    const match = this.match(method, path);

    if (match) {
      // Add params to request
      request.params = match.params;
      return await match.handler(request, env, ctx);
    }

    // No match found
    return null;
  }
}
