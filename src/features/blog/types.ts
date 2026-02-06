export type BlogPostStatus = "Draft" | "Published" | "Archived" | string;

export interface SeoBreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

export interface SeoDto {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogSiteName?: string;
  ogLocale?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  author?: string;
  robotsContent?: string;
  direction?: string;
  language?: string;
  currentUrl?: string;
  prevUrl?: string;
  nextUrl?: string;
  lastModified?: string;
  jsonLdSchemas?: object[];
  breadcrumbs?: SeoBreadcrumbItem[];
}

export interface BlogCategoryDto {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  priority?: number;
  seo?: SeoDto;
}

export interface TagDto {
  id: string;
  title: string;
  slug: string;
}

export interface PostListItemDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string | null;
  author: string;
  categoryTitle: string;
  categorySlug: string;
  publishedAt?: string | null;
  readingTimeMinutes: number;
  viewCount: number;
  status: BlogPostStatus;
  highlightedTitle?: string | null;
  highlightedExcerpt?: string | null;
}

export interface PostDetailDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageUrl?: string | null;
  author: string;
  publishedAt?: string | null;
  readingTimeMinutes: number;
  viewCount: number;
  status: BlogPostStatus;
  category: BlogCategoryDto;
  tags: TagDto[];
  seo: SeoDto;
}

export interface PostNavDto {
  next?: PostListItemDto | null;
  previous?: PostListItemDto | null;
}

export interface PostSlugResolveDto {
  post?: PostDetailDto | null;
  isRedirect?: boolean;
  redirectSlug?: string | null;
}

export interface PagedResult<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  stats?: Record<string, unknown> | null;
}

export interface BlogListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  category?: string;
  tag?: string;
  q?: string;
}

export interface BlogSearchParams {
  q: string;
  page?: number;
  pageSize?: number;
}

export interface BlogFilterState {
  category?: string;
  tag?: string;
  sort?: string;
  q?: string;
}

// Admin DTOs - matching backend exactly
export interface CreatePostRequestDto {
  blogCategoryId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageUrl?: string | null;
  status: string;
  publishedAt?: string | null;
  tags: string[];
  seo: SeoDto;
}

export interface UpdatePostRequestDto extends CreatePostRequestDto {}

export interface CreateCategoryRequestDto {
  title: string;
  slug: string;
  description?: string | null;
  priority: number;
  coverImageUrl?: string | null;
  seo: SeoDto;
}

export interface UpdateCategoryRequestDto extends CreateCategoryRequestDto {}

export interface CreateTagRequestDto {
  title: string;
  slug: string;
}

export interface UpdateTagRequestDto extends CreateTagRequestDto {}

export interface AdminPostListItem extends PostListItemDto {
  status: BlogPostStatus;
  createdAt?: string;
  updatedAt?: string;
}
