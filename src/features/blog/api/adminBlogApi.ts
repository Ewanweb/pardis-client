import { api } from "../../../services/api";
import type {
  CreatePostRequestDto,
  UpdatePostRequestDto,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
  CreateTagRequestDto,
  UpdateTagRequestDto,
  BlogListParams,
} from "../types";

const buildQueryString = (params: Record<string, unknown> = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "all"
    ) {
      return;
    }
    query.set(key, String(value));
  });

  return query.toString();
};

export const adminBlogApi = {
  // Posts Management
  getPosts(params: BlogListParams & { status?: string } = {}) {
    const query = buildQueryString(params);
    return api.get(`/admin/blog/posts${query ? `?${query}` : ""}`);
  },

  getPostById(id: string) {
    return api.get(`/admin/blog/posts/${id}`);
  },

  createPost(data: CreatePostRequestDto) {
    return api.post("/admin/blog/posts", data);
  },

  updatePost(id: string, data: UpdatePostRequestDto) {
    return api.put(`/admin/blog/posts/${id}`, data);
  },

  publishPost(id: string, publishedAt?: string) {
    return api.post(`/admin/blog/posts/${id}/publish`, { publishedAt });
  },

  deletePost(id: string) {
    return api.delete(`/admin/blog/posts/${id}`);
  },

  // Categories Management
  createCategory(data: CreateCategoryRequestDto) {
    return api.post("/admin/blog/categories", data);
  },

  updateCategory(id: string, data: UpdateCategoryRequestDto) {
    return api.put(`/admin/blog/categories/${id}`, data);
  },

  deleteCategory(id: string) {
    return api.delete(`/admin/blog/categories/${id}`);
  },

  // Tags Management
  createTag(data: CreateTagRequestDto) {
    return api.post("/admin/blog/tags", data);
  },

  updateTag(id: string, data: UpdateTagRequestDto) {
    return api.put(`/admin/blog/tags/${id}`, data);
  },

  deleteTag(id: string) {
    return api.delete(`/admin/blog/tags/${id}`);
  },

  // Image Upload
  uploadImage(imageFile: File) {
    const formData = new FormData();
    formData.append("imageFile", imageFile);

    return api.post("/admin/blog/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default adminBlogApi;
