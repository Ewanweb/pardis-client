import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import SeoHead from '../../components/Seo/SeoHead';
import { Button } from '../../components/UI';
import { blogService } from '../../features/blog/services/blogService';
import BlogPostCard from '../../features/blog/components/BlogPostCard';
import BlogPagination from '../../features/blog/components/BlogPagination';
import { BlogListSkeleton } from '../../features/blog/components/BlogSkeletons';
import { buildBreadcrumbSchema } from '../../features/blog/utils/blogUtils';
import { generateSEOConfig } from '../../utils/seoHelpers';

const PAGE_SIZE = 12;

const BlogCategory = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = useMemo(() => {
    const value = parseInt(searchParams.get('page') || '1', 10);
    return Number.isNaN(value) || value < 1 ? 1 : value;
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const loadCategoryInfo = async () => {
      try {
        const categories = await blogService.getCategories();
        if (!isMounted) return;
        const current = categories.find((item) => item.slug === slug);
        setCategoryInfo(current || null);
      } catch (err) {
        if (!isMounted) return;
        setCategoryInfo(null);
      }
    };

    loadCategoryInfo();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await blogService.getPostsByCategory(slug, {
          page,
          pageSize: PAGE_SIZE
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
  }, [slug, page]);

  const seoConfig = generateSEOConfig({
    seoData: categoryInfo?.seo,
    fallbackTitle: categoryInfo?.title ? `مقالات دسته ${categoryInfo.title}` : 'دسته‌بندی وبلاگ',
    fallbackDescription: categoryInfo?.description || 'مقالات آموزشی آکادمی پردیس توس بر اساس دسته‌بندی تخصصی',
    currentUrl: `/blog/category/${slug}`
  });

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    ...buildBreadcrumbSchema([
      { name: 'آکادمی پردیس توس', url: '/' },
      { name: 'وبلاگ', url: '/blog' },
      { name: categoryInfo?.title || 'دسته‌بندی', url: `/blog/category/${slug}` }
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
        {meta.page > 1 && <link rel="prev" href={`/blog/category/${slug}?page=${meta.page - 1}`} />}
        {meta.page < meta.totalPages && (
          <link rel="next" href={`/blog/category/${slug}?page=${meta.page + 1}`} />
        )}
      </Helmet>

      <div className="container mx-auto px-4">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl shadow-slate-200/40">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-lg">
              <Layers size={30} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                {categoryInfo?.title ? `مقالات ${categoryInfo.title}` : 'دسته‌بندی وبلاگ'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl">
                {categoryInfo?.description || 'تمام مقالات تخصصی این دسته‌بندی را مرور کنید و مسیر یادگیری خود را تکمیل کنید.'}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          {loading ? (
            <BlogListSkeleton count={6} />
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-bold">دریافت مقالات این دسته با خطا مواجه شد.</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                تلاش دوباره
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">هنوز مقاله‌ای در این دسته منتشر نشده است.</p>
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
            <span>مسیرهای مرتبط:</span>
            <Link to="/blog" className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-600">
              همه مقالات
            </Link>
            <Link to="/blog/search" className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-600">
              جستجوی مقاله
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCategory;
