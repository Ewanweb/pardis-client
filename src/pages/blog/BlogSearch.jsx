import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import SeoHead from '../../components/Seo/SeoHead';
import { Button, Input } from '../../components/UI';
import { blogService } from '../../features/blog/services/blogService';
import BlogPostCard from '../../features/blog/components/BlogPostCard';
import BlogPagination from '../../features/blog/components/BlogPagination';
import { BlogListSkeleton } from '../../features/blog/components/BlogSkeletons';
import { buildBreadcrumbSchema } from '../../features/blog/utils/blogUtils';
import { generateSEOConfig } from '../../utils/seoHelpers';

const PAGE_SIZE = 12;

const BlogSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const page = useMemo(() => {
    const value = parseInt(searchParams.get('page') || '1', 10);
    return Number.isNaN(value) || value < 1 ? 1 : value;
  }, [searchParams]);

  const q = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let isMounted = true;
    const loadResults = async () => {
      if (!q.trim()) {
        setPosts([]);
        setMeta({ page: 1, totalPages: 1, totalCount: 0 });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await blogService.searchPosts({ q, page, pageSize: PAGE_SIZE });
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

    loadResults();
    return () => {
      isMounted = false;
    };
  }, [q, page]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('q', searchInput.trim());
    } else {
      next.delete('q');
    }
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    ...buildBreadcrumbSchema([
      { name: 'آکادمی پردیس توس', url: '/' },
      { name: 'وبلاگ', url: '/blog' },
      { name: 'جستجو', url: `/blog/search?q=${encodeURIComponent(q)}` }
    ])
  };

  const seoConfig = generateSEOConfig({
    fallbackTitle: q ? `جستجو در وبلاگ برای «${q}»` : 'جستجوی وبلاگ',
    fallbackDescription: 'نتایج جستجو در مقالات آموزشی آکادمی پردیس توس',
    currentUrl: `/blog/search?q=${encodeURIComponent(q)}`
  });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <SeoHead
        title={seoConfig.title}
        description={seoConfig.description}
        canonicalUrl={seoConfig.canonicalUrl}
        noIndex
        noFollow
        ogType="website"
        structuredData={breadcrumbsSchema}
      />
      <Helmet>
        {meta.page > 1 && <link rel="prev" href={`/blog/search?q=${encodeURIComponent(q)}&page=${meta.page - 1}`} />}
        {meta.page < meta.totalPages && (
          <link rel="next" href={`/blog/search?q=${encodeURIComponent(q)}&page=${meta.page + 1}`} />
        )}
      </Helmet>

      <div className="container mx-auto px-4">
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Search size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">جستجوی مقالات</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                عبارت موردنظر را وارد کنید تا مقالات مرتبط نمایش داده شوند.
              </p>
            </div>
            <form onSubmit={handleSearchSubmit} className="w-full md:w-[360px] space-y-3">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="مثال: بازاریابی محتوا"
              />
              <Button type="submit" className="w-full">
                جستجو
                <Search size={18} className="ml-2" />
              </Button>
            </form>
          </div>
        </section>

        <div className="mt-10">
          {loading ? (
            <BlogListSkeleton count={6} />
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-bold">خطا در جستجوی مقالات.</p>
            </div>
          ) : q && posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">نتیجه‌ای برای «{q}» پیدا نشد.</p>
              <Button className="mt-4" variant="secondary" onClick={() => setSearchParams({})}>
                بازگشت به وبلاگ
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
            <div className="mt-12 flex flex-col items-center gap-3">
              <BlogPagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={(nextPage) => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(nextPage));
                  setSearchParams(next, { replace: true });
                }}
              />
              <div className="text-xs text-slate-400">
                صفحه {meta.page.toLocaleString('fa-IR')} از {meta.totalPages.toLocaleString('fa-IR')}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/blog" className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-600">
              همه مقالات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSearch;
