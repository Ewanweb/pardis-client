/**
 * ✅ Request Deduplication & Caching System
 *
 * Prevents duplicate API requests for the same endpoint
 * Caches responses in memory for the duration of the app session
 *
 * Usage:
 *   const data = await cachedApi.get('/Home/Categories');
 */

class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Get cached data or fetch from API
   * If request is already in flight, return the same promise
   */
  async get(url, options = {}) {
    const cacheKey = `GET:${url}`;
    const { skipCache = false, ttl = Infinity } = options;

    // Return cached data if available and not expired
    if (!skipCache && this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
      this.cache.delete(cacheKey);
    }

    // Return pending request if already in flight (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make new request and cache it
    const promise = this._makeRequest(url, "GET", options);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const response = await promise;
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
      return response;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * POST request (not cached by default)
   */
  async post(url, data, options = {}) {
    return this._makeRequest(url, "POST", { ...options, data });
  }

  /**
   * PUT request (not cached by default)
   */
  async put(url, data, options = {}) {
    return this._makeRequest(url, "PUT", { ...options, data });
  }

  /**
   * DELETE request (not cached by default)
   */
  async delete(url, options = {}) {
    return this._makeRequest(url, "DELETE", options);
  }

  /**
   * Clear cache for specific URL or all cache
   */
  clearCache(url = null) {
    if (url) {
      this.cache.delete(`GET:${url}`);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Internal method to make actual API request
   */
  async _makeRequest(url, method, options) {
    // This will be injected with actual API instance
    if (!this.apiInstance) {
      throw new Error("RequestCache: API instance not initialized");
    }
    return this.apiInstance[method.toLowerCase()](url, options.data);
  }

  /**
   * Initialize with API instance
   */
  setApiInstance(api) {
    this.apiInstance = api;
  }
}

export const requestCache = new RequestCache();
