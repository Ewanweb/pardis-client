import blogApi from '../api/blogApi';
import type {
  BlogCategoryDto,
  BlogListParams,
  BlogSearchParams,
  PagedResult,
  PostDetailDto,
  PostListItemDto,
  PostNavDto,
  PostSlugResolveDto,
  TagDto
} from '../types';

const cache = new Map<string, { expiresAt: number; data: unknown }>();
const pending = new Map<string, Promise<unknown>>();

const TTL = {
  list: 120000,
  detail: 300000,
  taxonomy: 900000,
  related: 120000,
  nav: 120000,
  search: 60000
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const unwrapResponse = (response: any) => {
  if (!response) return null;
  const payload = response.data ?? response;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
};

const getValue = <T>(payload: any, key: string, fallback: T) => {
  if (!payload || typeof payload !== 'object') return fallback;
  if (key in payload) return payload[key] as T;
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  if (pascalKey in payload) return payload[pascalKey] as T;
  return fallback;
};

const normalizePagedResult = <T>(payload: any, fallbackPage = 1, fallbackPageSize = 12): PagedResult<T> => {
  const items = getValue<T[]>(payload, 'items', []);
  const page = getValue<number>(payload, 'page', fallbackPage);
  const pageSize = getValue<number>(payload, 'pageSize', fallbackPageSize);
  const totalCount = getValue<number>(payload, 'totalCount', items.length);
  const totalPages = getValue<number>(payload, 'totalPages', Math.max(1, Math.ceil(totalCount / pageSize)));
  const hasNext = getValue<boolean>(payload, 'hasNext', page < totalPages);
  const hasPrev = getValue<boolean>(payload, 'hasPrev', page > 1);
  const stats = getValue<Record<string, unknown> | null>(payload, 'stats', null);

  return {
    items: Array.isArray(items) ? items : [],
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    stats
  };
};

const withCache = async <T>(key: string, fetcher: () => Promise<T>, ttl: number) => {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  if (pending.has(key)) {
    return pending.get(key) as Promise<T>;
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { expiresAt: now + ttl, data });
      return data;
    })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, promise as Promise<unknown>);
  return promise;
};

const fetchWithRetry = async <T>(fetcher: () => Promise<T>, retries = 1) => {
  try {
    return await fetcher();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(500);
    return fetchWithRetry(fetcher, retries - 1);
  }
};

const normalizeList = (payload: any, page = 1, pageSize = 12) =>
  normalizePagedResult<PostListItemDto>(payload, page, pageSize);

export const blogService = {
  async getPosts(params: BlogListParams = {}) {
    const { page = 1, pageSize = 12 } = params;
    const key = `posts:${JSON.stringify(params)}`;

    return withCache(
      key,
      () =>
        fetchWithRetry(async () => {
          const response = await blogApi.getPosts(params);
          const payload = unwrapResponse(response);
          return normalizeList(payload, page, pageSize);
        }),
      TTL.list
    );
  },

  async getPostBySlug(slug: string) {
    const key = `post:${slug}`;
    return withCache(
      key,
      () =>
        fetchWithRetry(async () => {
          const response = await blogApi.getPostBySlug(slug);
          const payload = unwrapResponse(response);
          return payload as PostSlugResolveDto;
        }),
      TTL.detail
    );
  },

  async getCategories() {
    const key = 'categories';
    return withCache(
      key,
      async () => {
        const response = await blogApi.getCategories();
        const payload = unwrapResponse(response);
        return (Array.isArray(payload) ? payload : []) as BlogCategoryDto[];
      },
      TTL.taxonomy
    );
  },

  async getTags() {
    const key = 'tags';
    return withCache(
      key,
      async () => {
        const response = await blogApi.getTags();
        const payload = unwrapResponse(response);
        return (Array.isArray(payload) ? payload : []) as TagDto[];
      },
      TTL.taxonomy
    );
  },

  async getPostsByCategory(slug: string, params: BlogListParams = {}) {
    const { page = 1, pageSize = 12 } = params;
    const key = `category:${slug}:${JSON.stringify(params)}`;
    return withCache(
      key,
      () =>
        fetchWithRetry(async () => {
          const response = await blogApi.getPostsByCategory(slug, params);
          const payload = unwrapResponse(response);
          return normalizeList(payload, page, pageSize);
        }),
      TTL.list
    );
  },

  async getPostsByTag(slug: string, params: BlogListParams = {}) {
    const { page = 1, pageSize = 12 } = params;
    const key = `tag:${slug}:${JSON.stringify(params)}`;
    return withCache(
      key,
      () =>
        fetchWithRetry(async () => {
          const response = await blogApi.getPostsByTag(slug, params);
          const payload = unwrapResponse(response);
          return normalizeList(payload, page, pageSize);
        }),
      TTL.list
    );
  },

  async searchPosts(params: BlogSearchParams) {
    const { page = 1, pageSize = 12 } = params;
    const key = `search:${JSON.stringify(params)}`;
    return withCache(
      key,
      () =>
        fetchWithRetry(async () => {
          const response = await blogApi.searchPosts(params);
          const payload = unwrapResponse(response);
          return normalizeList(payload, page, pageSize);
        }),
      TTL.search
    );
  },

  async getRelatedPosts(slug: string, take = 6) {
    const key = `related:${slug}:${take}`;
    return withCache(
      key,
      async () => {
        const response = await blogApi.getRelatedPosts(slug, take);
        const payload = unwrapResponse(response);
        return (Array.isArray(payload) ? payload : []) as PostListItemDto[];
      },
      TTL.related
    );
  },

  async getPostNavigation(slug: string) {
    const key = `nav:${slug}`;
    return withCache(
      key,
      async () => {
        const response = await blogApi.getPostNavigation(slug);
        const payload = unwrapResponse(response);
        return (payload || {}) as PostNavDto;
      },
      TTL.nav
    );
  },

  async incrementView(slug: string) {
    try {
      await blogApi.incrementView(slug);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default blogService;
