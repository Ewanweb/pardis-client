import adminBlogApi from "../api/adminBlogApi";
import type {
  CreatePostRequestDto,
  UpdatePostRequestDto,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
  CreateTagRequestDto,
  UpdateTagRequestDto,
  BlogListParams,
  PagedResult,
  PostDetailDto,
  AdminPostListItem,
  BlogCategoryDto,
  TagDto,
} from "../types";

const unwrapResponse = (response: any) => {
  if (!response) return null;
  const payload = response.data ?? response;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
};

const normalizePagedResult = <T>(
  payload: any,
  fallbackPage = 1,
  fallbackPageSize = 20,
): PagedResult<T> => {
  const items = payload?.items || [];
  const page = payload?.page || fallbackPage;
  const pageSize = payload?.pageSize || fallbackPageSize;
  const totalCount = payload?.totalCount || items.length;
  const totalPages =
    payload?.totalPages || Math.max(1, Math.ceil(totalCount / pageSize));
  const hasNext = payload?.hasNext ?? page < totalPages;
  const hasPrev = payload?.hasPrev ?? page > 1;

  return {
    items: Array.isArray(items) ? items : [],
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    stats: payload?.stats || null,
  };
};

export const adminBlogService = {
  async getPosts(params: BlogListParams & { status?: string } = {}) {
    try {
      const response = await adminBlogApi.getPosts(params);
      const payload = unwrapResponse(response);
      return normalizePagedResult<AdminPostListItem>(
        payload,
        params.page || 1,
        params.pageSize || 20,
      );
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      throw error;
    }
  },

  async createPost(data: CreatePostRequestDto) {
    try {
      const response = await adminBlogApi.createPost(data);
      const payload = unwrapResponse(response);
      return payload as PostDetailDto;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async updatePost(id: string, data: UpdatePostRequestDto) {
    try {
      const response = await adminBlogApi.updatePost(id, data);
      const payload = unwrapResponse(response);
      return payload as PostDetailDto;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  async publishPost(id: string, publishedAt?: string) {
    try {
      const response = await adminBlogApi.publishPost(id, publishedAt);
      const payload = unwrapResponse(response);
      return payload;
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  },

  async deletePost(id: string) {
    try {
      const response = await adminBlogApi.deletePost(id);
      const payload = unwrapResponse(response);
      return payload;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  async createCategory(data: CreateCategoryRequestDto) {
    try {
      const response = await adminBlogApi.createCategory(data);
      const payload = unwrapResponse(response);
      return payload as BlogCategoryDto;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(id: string, data: UpdateCategoryRequestDto) {
    try {
      const response = await adminBlogApi.updateCategory(id, data);
      const payload = unwrapResponse(response);
      return payload as BlogCategoryDto;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const response = await adminBlogApi.deleteCategory(id);
      const payload = unwrapResponse(response);
      return payload;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  async createTag(data: CreateTagRequestDto) {
    try {
      const response = await adminBlogApi.createTag(data);
      const payload = unwrapResponse(response);
      return payload as TagDto;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  },

  async updateTag(id: string, data: UpdateTagRequestDto) {
    try {
      const response = await adminBlogApi.updateTag(id, data);
      const payload = unwrapResponse(response);
      return payload as TagDto;
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  },

  async deleteTag(id: string) {
    try {
      const response = await adminBlogApi.deleteTag(id);
      const payload = unwrapResponse(response);
      return payload;
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  },

  async uploadImage(imageFile: File) {
    try {
      const response = await adminBlogApi.uploadImage(imageFile);
      const payload = unwrapResponse(response);
      return payload as {
        imageUrl: string;
        accessToken: string;
        fileName: string;
        fileSize: number;
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },
};

export default adminBlogService;
