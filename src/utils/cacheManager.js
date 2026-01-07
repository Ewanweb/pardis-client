/**
 * Cache manager disabled.
 * Requirements: avoid client-side caching to prevent stale data.
 */

class CacheManager {
  checkAndClearCache() {
    return Promise.resolve(false);
  }

  clearAllCache() {
    return Promise.resolve();
  }

  forceClearCache() {
    return Promise.resolve();
  }

  getCacheSize() {
    return Promise.resolve({
      bytes: 0,
      kb: 0,
      mb: 0,
      essential: { bytes: 0, kb: 0 },
      nonEssential: { bytes: 0, kb: 0 },
    });
  }

  notifyUser() {
    // no-op
  }

  setVersion() {
    // no-op
  }

  getCurrentVersion() {
    return { app: null, stored: null };
  }
}

export const cacheManager = new CacheManager();
export default cacheManager;
