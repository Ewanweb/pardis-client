import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Search, TrendingUp } from 'lucide-react';
import SeoHead from '../../components/Seo/SeoHead';
import { Button, Input } from '../../components/UI';
import { blogService } from '../../features/blog/services/blogService';
import BlogPostCard from '../../features/blog/components/BlogPostCard';
import BlogFilters from '../../features/blog/components/BlogFilters';
import BlogPagination from '../../features/blog/components/BlogPagination';
import { BlogListSkeleton } from '../../features/blog/components/BlogSkeletons';
import { buildBreadcrumbSchema } from '../../features/blog/utils/blogUtils';
import { generateSEOConfig } from '../../utils/seoHelpers';

const PAGE_SIZE = 12;

const BlogIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  const page = useMemo(() => {
    const value = parseInt(searchParams.get('page') || '1', 10);
    return Number.isNaN(value) || value < 1 ? 1 : value;
  }, [searchParams]);

  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const q = searchParams.get('q') || '';

  useEffect(() => {
    let isMounted = true;
    const loadFilters = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          blogService.getCategories(),
          blogService.getTags()
        ]);
        if (!isMounted) return;
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        if (!isMounted) return;
        setCategories([]);
        setTags([]);
      }
    };

    loadFilters();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await blogService.getPosts({
          page,
          pageSize: PAGE_SIZE,
          sort,
          category: category || undefined,
          tag: tag || undefined,
          q: q || undefined
        });
        if (!isMounted) return;
        setPosts(result.items || []);
        setMeta({
          page: result.page,
          totalPages: result.totalPages,
          totalCount: result.totalCount
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err);
        setPosts([]);
        setMeta({ page: 1, totalPages: 1, totalCount: 0 });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, [page, sort, category, tag, q]);

  const updateParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateParams({ q: searchInput.trim() || '' });
  };

  const seoConfig = generateSEOConfig({
    fallbackTitle: 'وبلاگ آکادمی پردیس توس',
    fallbackDescription: 'جدیدترین مقالات آموزشی، مسیرهای یادگیری و تحلیل‌های تخصصی آکادمی پردیس توس.',
    currentUrl: '/blog'
  });

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    ...buildBreadcrumbSchema([
      { name: 'آکادمی پردیس توس', url: '/' },
      { name: 'وبلاگ', url: '/blog' }
    ])
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <SeoHead
        title={seoConfig.title}
        description={seoConfig.description}
        canonicalUrl={seoConfig.canonicalUrl}
        noIndex={seoConfig.noIndex}
        noFollow={seoConfig.noFollow}
        ogType="website"
        structuredData={breadcrumbsSchema}
      />
      <Helmet>
        {meta.page > 1 && <link rel="prev" href={`/blog?page=${meta.page - 1}`} />}
        {meta.page < meta.totalPages && (
          <link rel="next" href={`/blog?page=${meta.page + 1}`} />
        )}
      </Helmet>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute right-0 top-0 -z-10 h-[320px] w-[320px] rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute left-0 bottom-0 -z-10 h-[320px] w-[320px] rounded-full bg-secondary-500/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold border border-primary-100 dark:border-primary-800">
                <BookOpen size={14} />
                مسیر رشد با پردیس
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 mb-4">
                مجله آموزشی پردیس توس
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                جدیدترین مقالات تخصصی، تجربه‌های آموزشی و راهنمایی‌های مسیر یادگیری را اینجا پیدا کنید.
              </p>
            </div>

            <div className="w-full lg:w-[360px]">
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="جستجو در مقالات..."
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    جستجو
                    <Search size={18} className="ml-2" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/blog/search?q=${encodeURIComponent(searchInput.trim())}`)}
                  >
                    نتایج دقیق
                  </Button>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <TrendingUp size={14} />
                  {meta.totalCount.toLocaleString('fa-IR')} مقاله برای مسیر شما
                </div>
              </form>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-8">
          <BlogFilters
            categories={categories}
            tags={tags}
            activeCategory={category}
            activeTag={tag}
            sort={sort}
            onCategoryChange={(value) => updateParams({ category: value })}
            onTagChange={(value) => updateParams({ tag: value })}
            onSortChange={(value) => updateParams({ sort: value })}
            onClear={() => updateParams({ category: '', tag: '', sort: 'newest', q: '' })}
          />

          {loading ? (
            <BlogListSkeleton count={6} />
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-bold">دریافت مقالات با خطا مواجه شد.</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                تلاش دوباره
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">مقاله‌ای با این فیلترها پیدا نشد.</p>
              <Button className="mt-4" variant="secondary" onClick={() => updateParams({ category: '', tag: '', q: '' })}>
                نمایش همه مقالات
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <BlogPagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={(nextPage) => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('page', String(nextPage));
                  setSearchParams(nextParams, { replace: true });
                }}
              />
              <div className="text-xs text-slate-400">
                نمایش صفحه {meta.page.toLocaleString('fa-IR')} از {meta.totalPages.toLocaleString('fa-IR')}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>مسیرهای سریع:</span>
            {categories.slice(0, 6).map((categoryItem) => (
              <Link
                key={categoryItem.slug}
                to={`/blog/category/${categoryItem.slug}`}
                className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-600 transition"
              >
                {categoryItem.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogIndex;
