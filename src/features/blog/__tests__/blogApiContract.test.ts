import { describe, it, expect, vi, beforeEach } from "vitest";
import { blogService } from "../services/blogService";
import { adminBlogService } from "../services/adminBlogService";
import type {
  PostListItemDto,
  PostDetailDto,
  BlogCategoryDto,
  TagDto,
  PagedResult,
  CreatePostRequestDto,
} from "../types";

// Mock API responses matching backend contracts
const mockPostListResponse = {
  success: true,
  data: {
    items: [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test Post",
        slug: "test-post",
        excerpt: "Test excerpt",
        coverImageUrl: "https://example.com/image.jpg",
        author: "Test Author",
        categoryTitle: "Test Category",
        categorySlug: "test-category",
        publishedAt: "2024-01-01T00:00:00Z",
        readingTimeMinutes: 5,
        viewCount: 100,
        status: "Published",
      },
    ] as PostListItemDto[],
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  } as PagedResult<PostListItemDto>,
};

const mockPostDetailResponse = {
  success: true,
  data: {
    post: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test Post",
      slug: "test-post",
      content: "<p>Test content</p>",
      excerpt: "Test excerpt",
      coverImageUrl: "https://example.com/image.jpg",
      author: "Test Author",
      publishedAt: "2024-01-01T00:00:00Z",
      readingTimeMinutes: 5,
      viewCount: 100,
      status: "Published",
      category: {
        id: "123e4567-e89b-12d3-a456-426614174001",
        title: "Test Category",
        slug: "test-category",
        description: "Test description",
        priority: 1,
        seo: {
          metaTitle: "Test Meta Title",
          metaDescription: "Test Meta Description",
        },
      } as BlogCategoryDto,
      tags: [
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          title: "Test Tag",
          slug: "test-tag",
        },
      ] as TagDto[],
      seo: {
        metaTitle: "Test SEO Title",
        metaDescription: "Test SEO Description",
        canonicalUrl: "https://example.com/blog/test-post",
        noIndex: false,
        noFollow: false,
        ogTitle: "Test OG Title",
        ogDescription: "Test OG Description",
        ogImage: "https://example.com/og-image.jpg",
        ogType: "article",
        twitterTitle: "Test Twitter Title",
        twitterDescription: "Test Twitter Description",
        twitterImage: "https://example.com/twitter-image.jpg",
        twitterCard: "summary_large_image",
      },
    } as PostDetailDto,
    isRedirect: false,
  },
};

const mockCategoriesResponse = {
  success: true,
  data: [
    {
      id: "123e4567-e89b-12d3-a456-426614174001",
      title: "Test Category",
      slug: "test-category",
      description: "Test description",
      priority: 1,
      seo: {
        metaTitle: "Test Meta Title",
        metaDescription: "Test Meta Description",
      },
    },
  ] as BlogCategoryDto[],
};

const mockTagsResponse = {
  success: true,
  data: [
    {
      id: "123e4567-e89b-12d3-a456-426614174002",
      title: "Test Tag",
      slug: "test-tag",
    },
  ] as TagDto[],
};

// Mock the API modules
vi.mock("../api/blogApi", () => ({
  default: {
    getPosts: vi.fn(),
    getPostBySlug: vi.fn(),
    getCategories: vi.fn(),
    getTags: vi.fn(),
    getPostsByCategory: vi.fn(),
    getPostsByTag: vi.fn(),
    searchPosts: vi.fn(),
    getRelatedPosts: vi.fn(),
    getPostNavigation: vi.fn(),
    incrementView: vi.fn(),
  },
}));

vi.mock("../api/adminBlogApi", () => ({
  default: {
    getPosts: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    publishPost: vi.fn(),
    deletePost: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
  },
}));

describe("Blog API Contract Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Public Blog API", () => {
    it("should handle getPosts with correct pagination format", async () => {
      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getPosts).mockResolvedValue(mockPostListResponse);

      const result = await blogService.getPosts({ page: 1, pageSize: 12 });

      expect(blogApi.getPosts).toHaveBeenCalledWith({ page: 1, pageSize: 12 });
      expect(result).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            slug: expect.any(String),
            excerpt: expect.any(String),
            author: expect.any(String),
            categoryTitle: expect.any(String),
            categorySlug: expect.any(String),
            status: expect.any(String),
            viewCount: expect.any(Number),
            readingTimeMinutes: expect.any(Number),
          }),
        ]),
        page: 1,
        pageSize: 12,
        totalCount: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean),
      });
    });

    it("should handle getPostBySlug with redirect support", async () => {
      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getPostBySlug).mockResolvedValue(
        mockPostDetailResponse,
      );

      const result = await blogService.getPostBySlug("test-post");

      expect(blogApi.getPostBySlug).toHaveBeenCalledWith("test-post");
      expect(result).toEqual({
        post: expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          slug: expect.any(String),
          content: expect.any(String),
          excerpt: expect.any(String),
          author: expect.any(String),
          status: expect.any(String),
          category: expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            slug: expect.any(String),
          }),
          tags: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
              slug: expect.any(String),
            }),
          ]),
          seo: expect.objectContaining({
            metaTitle: expect.any(String),
            metaDescription: expect.any(String),
            ogTitle: expect.any(String),
            ogDescription: expect.any(String),
            twitterTitle: expect.any(String),
            twitterDescription: expect.any(String),
          }),
        }),
        isRedirect: false,
      });
    });

    it("should handle getCategories with SEO data", async () => {
      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getCategories).mockResolvedValue(
        mockCategoriesResponse,
      );

      const result = await blogService.getCategories();

      expect(blogApi.getCategories).toHaveBeenCalled();
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            slug: expect.any(String),
            priority: expect.any(Number),
            seo: expect.objectContaining({
              metaTitle: expect.any(String),
              metaDescription: expect.any(String),
            }),
          }),
        ]),
      );
    });

    it("should handle getTags correctly", async () => {
      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getTags).mockResolvedValue(mockTagsResponse);

      const result = await blogService.getTags();

      expect(blogApi.getTags).toHaveBeenCalled();
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            slug: expect.any(String),
          }),
        ]),
      );
    });

    it("should handle search with highlighting", async () => {
      const searchResponse = {
        ...mockPostListResponse,
        data: {
          ...mockPostListResponse.data,
          items: [
            {
              ...mockPostListResponse.data.items[0],
              highlightedTitle: "Test <mark>search</mark> Post",
              highlightedExcerpt: "Test <mark>search</mark> excerpt",
            },
          ],
        },
      };

      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.searchPosts).mockResolvedValue(searchResponse);

      const result = await blogService.searchPosts({
        q: "search",
        page: 1,
        pageSize: 12,
      });

      expect(blogApi.searchPosts).toHaveBeenCalledWith({
        q: "search",
        page: 1,
        pageSize: 12,
      });
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          highlightedTitle: "Test <mark>search</mark> Post",
          highlightedExcerpt: "Test <mark>search</mark> excerpt",
        }),
      );
    });
  });

  describe("Admin Blog API", () => {
    it("should handle admin getPosts with draft support", async () => {
      const adminResponse = {
        ...mockPostListResponse,
        data: {
          ...mockPostListResponse.data,
          pageSize: 20, // Admin default
        },
      };

      const { default: adminBlogApi } = await import("../api/adminBlogApi");
      vi.mocked(adminBlogApi.getPosts).mockResolvedValue(adminResponse);

      const result = await adminBlogService.getPosts({
        page: 1,
        pageSize: 20,
        status: "Draft",
      });

      expect(adminBlogApi.getPosts).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        status: "Draft",
      });
      expect(result.pageSize).toBe(20);
    });

    it("should handle createPost with proper DTO structure", async () => {
      const createPostDto: CreatePostRequestDto = {
        blogCategoryId: "123e4567-e89b-12d3-a456-426614174001",
        title: "New Test Post",
        slug: "new-test-post",
        content: "<p>New test content</p>",
        excerpt: "New test excerpt",
        coverImageUrl: "https://example.com/new-image.jpg",
        status: "Draft",
        publishedAt: null,
        tags: ["test-tag", "new-tag"],
        seo: {
          metaTitle: "New Test SEO Title",
          metaDescription: "New Test SEO Description",
          canonicalUrl: "https://example.com/blog/new-test-post",
          noIndex: false,
          noFollow: false,
          ogTitle: "New Test OG Title",
          ogDescription: "New Test OG Description",
          ogImage: "https://example.com/new-og-image.jpg",
          ogType: "article",
          twitterTitle: "New Test Twitter Title",
          twitterDescription: "New Test Twitter Description",
          twitterImage: "https://example.com/new-twitter-image.jpg",
          twitterCard: "summary_large_image",
        },
      };

      const createResponse = {
        success: true,
        data: mockPostDetailResponse.data.post,
      };

      const { default: adminBlogApi } = await import("../api/adminBlogApi");
      vi.mocked(adminBlogApi.createPost).mockResolvedValue(createResponse);

      const result = await adminBlogService.createPost(createPostDto);

      expect(adminBlogApi.createPost).toHaveBeenCalledWith(createPostDto);
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          slug: expect.any(String),
          content: expect.any(String),
          status: expect.any(String),
        }),
      );
    });

    it("should handle publishPost correctly", async () => {
      const publishResponse = {
        success: true,
        message: "مطلب منتشر شد",
      };

      const { default: adminBlogApi } = await import("../api/adminBlogApi");
      vi.mocked(adminBlogApi.publishPost).mockResolvedValue(publishResponse);

      const result = await adminBlogService.publishPost(
        "123e4567-e89b-12d3-a456-426614174000",
      );

      expect(adminBlogApi.publishPost).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000",
        undefined,
      );
      expect(result).toEqual(publishResponse);
    });
  });

  describe("Response Format Normalization", () => {
    it("should handle wrapped responses correctly", async () => {
      const wrappedResponse = {
        success: true,
        data: mockPostListResponse.data,
        message: "Success",
      };

      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getPosts).mockResolvedValue(wrappedResponse);

      const result = await blogService.getPosts();

      expect(result).toEqual(mockPostListResponse.data);
    });

    it("should handle direct responses correctly", async () => {
      const directResponse = mockPostListResponse.data;

      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getPosts).mockResolvedValue(directResponse);

      const result = await blogService.getPosts();

      expect(result).toEqual(directResponse);
    });

    it("should normalize pagination with fallback values", async () => {
      const incompleteResponse = {
        success: true,
        data: {
          items: mockPostListResponse.data.items,
          // Missing pagination fields
        },
      };

      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getPosts).mockResolvedValue(incompleteResponse);

      const result = await blogService.getPosts({ page: 2, pageSize: 10 });

      expect(result).toEqual({
        items: mockPostListResponse.data.items,
        page: 2,
        pageSize: 10,
        totalCount: 1, // Fallback to items.length
        totalPages: 1, // Calculated
        hasNext: false,
        hasPrev: true,
        stats: null,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const { default: blogApi } = await import("../api/blogApi");
      vi.mocked(blogApi.getPosts).mockRejectedValue(new Error("Network error"));

      await expect(blogService.getPosts()).rejects.toThrow("Network error");
    });

    it("should handle admin API errors gracefully", async () => {
      const { default: adminBlogApi } = await import("../api/adminBlogApi");
      vi.mocked(adminBlogApi.createPost).mockRejectedValue(
        new Error("Validation error"),
      );

      const createPostDto: CreatePostRequestDto = {
        blogCategoryId: "123e4567-e89b-12d3-a456-426614174001",
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        status: "Draft",
        tags: [],
        seo: {},
      } as CreatePostRequestDto;

      await expect(adminBlogService.createPost(createPostDto)).rejects.toThrow(
        "Validation error",
      );
    });
  });
});
