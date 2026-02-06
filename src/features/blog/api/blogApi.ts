import { api } from '../../../services/api';

const buildQueryString = (params: Record<string, unknown> = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return;
    }
    query.set(key, String(value));
  });

  return query.toString();
};

export const blogApi = {
  getPosts(params: Record<string, unknown> = {}) {
    const query = buildQueryString(params);
    return api.get(`/blog/posts${query ? `?${query}` : ''}`);
  },
  getPostBySlug(slug: string) {
    return api.get(`/blog/posts/${encodeURIComponent(slug)}`);
  },
  getCategories() {
    return api.get('/blog/categories');
  },
  getTags() {
    return api.get('/blog/tags');
  },
  getPostsByCategory(slug: string, params: Record<string, unknown> = {}) {
    const query = buildQueryString(params);
    return api.get(`/blog/category/${encodeURIComponent(slug)}/posts${query ? `?${query}` : ''}`);
  },
  getPostsByTag(slug: string, params: Record<string, unknown> = {}) {
    const query = buildQueryString(params);
    return api.get(`/blog/tag/${encodeURIComponent(slug)}/posts${query ? `?${query}` : ''}`);
  },
  getRelatedPosts(slug: string, take = 6) {
    const query = buildQueryString({ take });
    return api.get(`/blog/posts/${encodeURIComponent(slug)}/related${query ? `?${query}` : ''}`);
  },
  getPostNavigation(slug: string) {
    return api.get(`/blog/posts/${encodeURIComponent(slug)}/nav`);
  },
  searchPosts(params: Record<string, unknown>) {
    const query = buildQueryString(params);
    return api.get(`/blog/search${query ? `?${query}` : ''}`);
  },
  incrementView(slug: string) {
    return api.post(`/blog/posts/${encodeURIComponent(slug)}/view`);
  }
};

export default blogApi;
