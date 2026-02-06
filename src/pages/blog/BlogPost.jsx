import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, Copy, Eye, Linkedin, Send, Twitter } from 'lucide-react';
import SeoHead from '../../components/Seo/SeoHead';
import { Button, Badge } from '../../components/UI';
import LazyImage from '../../components/LazyImage';
import { formatDate, getImageUrl } from '../../services/Libs';
import { blogService } from '../../features/blog/services/blogService';
import BlogPostCard from '../../features/blog/components/BlogPostCard';
import { BlogDetailSkeleton } from '../../features/blog/components/BlogSkeletons';
import BlogContent from '../../features/blog/components/BlogContent';
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  ensureAbsoluteUrl
} from '../../features/blog/utils/blogUtils';
import { generateSEOConfig } from '../../utils/seoHelpers';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [navigation, setNavigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await blogService.getPostBySlug(slug);
        if (!isMounted) return;

        if (result?.isRedirect && result?.redirectSlug) {
          navigate(`/blog/${result.redirectSlug}`, { replace: true });
          return;
        }

        if (!result?.post) {
          setError(new Error('Post not found'));
          setPost(null);
          return;
        }

        setPost(result.post);
      } catch (err) {
        if (!isMounted) return;
        setError(err);
        setPost(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug, navigate]);

  useEffect(() => {
    if (!post?.slug) return;
    let isMounted = true;

    const loadExtras = async () => {
      try {
        const [related, nav] = await Promise.all([
          blogService.getRelatedPosts(post.slug, 6),
          blogService.getPostNavigation(post.slug)
        ]);
        if (!isMounted) return;
        setRelatedPosts(related || []);
        setNavigation(nav || null);
      } catch (err) {
        if (!isMounted) return;
        setRelatedPosts([]);
        setNavigation(null);
      }
    };

    loadExtras();
    return () => {
      isMounted = false;
    };
  }, [post?.slug]);

  useEffect(() => {
    if (!post?.slug) return;
    const key = `blog_view_${post.slug}`;
    if (sessionStorage.getItem(key)) return;
    blogService.incrementView(post.slug);
    sessionStorage.setItem(key, '1');
  }, [post?.slug]);

  const canonicalPath = `/blog/${slug}`;

  const seoConfig = generateSEOConfig({
    seoData: post?.seo,
    fallbackTitle: post?.title || 'مقاله آموزشی',
    fallbackDescription: post?.excerpt || 'مقاله آموزشی آکادمی پردیس توس',
    currentUrl: canonicalPath
  });

  const breadcrumbs = post?.seo?.breadcrumbs?.length
    ? post.seo.breadcrumbs.map((item) => ({ name: item.name, url: item.url }))
    : [
      { name: 'آکادمی پردیس توس', url: '/' },
      { name: 'وبلاگ', url: '/blog' },
      post?.category?.title
        ? { name: post.category.title, url: `/blog/category/${post.category.slug}` }
        : null,
      post?.title ? { name: post.title, url: canonicalPath } : null
    ].filter(Boolean);

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs || []);

  const absoluteCover = post?.coverImageUrl ? getImageUrl(post.coverImageUrl) : null;
  const siteOrigin = window.location.origin;
  const ogImage = post?.seo?.ogImage ? ensureAbsoluteUrl(post.seo.ogImage, siteOrigin) : absoluteCover;
  const twitterImage = post?.seo?.twitterImage
    ? ensureAbsoluteUrl(post.seo.twitterImage, siteOrigin)
    : ogImage;
  const toInternalPath = (url) => {
    if (!url) return '/';
    if (url.startsWith('http')) {
      try {
        const parsed = new URL(url);
        return `${parsed.pathname}${parsed.search}`;
      } catch (err) {
        return '/';
      }
    }
    return url;
  };
  const blogSchema = post
    ? buildBlogPostingSchema({
      title: post.title,
      description: post.excerpt,
      canonicalUrl: ensureAbsoluteUrl(post.seo?.canonicalUrl || canonicalPath, siteOrigin),
      imageUrl: absoluteCover ? ensureAbsoluteUrl(absoluteCover, siteOrigin) : undefined,
      publishedAt: post.publishedAt,
      modifiedAt: post.seo?.lastModified,
      author: post.author,
      categoryTitle: post.category?.title,
      tags: post.tags?.map((tag) => tag.title)
    })
    : null;

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [blogSchema, breadcrumbSchema].filter(Boolean)
  };

  const shareUrl = ensureAbsoluteUrl(canonicalPath, siteOrigin);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess('لینک کپی شد');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('امکان کپی وجود ندارد');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <BlogDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-12 text-center">
            <p className="text-red-600 dark:text-red-400 font-bold">مقاله موردنظر پیدا نشد.</p>
            <Button className="mt-4" onClick={() => navigate('/blog')}>
              بازگشت به وبلاگ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <SeoHead
        title={seoConfig.title}
        description={seoConfig.description}
        canonicalUrl={seoConfig.canonicalUrl}
        noIndex={seoConfig.noIndex}
        noFollow={seoConfig.noFollow}
        ogType={post?.seo?.ogType || 'article'}
        ogImage={ogImage}
        structuredData={combinedSchema}
      />
      <Helmet>
        {post?.seo?.ogTitle && <meta property="og:title" content={post.seo.ogTitle} />}
        {post?.seo?.ogDescription && (
          <meta property="og:description" content={post.seo.ogDescription} />
        )}
        {post?.seo?.twitterTitle && (
          <meta name="twitter:title" content={post.seo.twitterTitle} />
        )}
        {post?.seo?.twitterDescription && (
          <meta name="twitter:description" content={post.seo.twitterDescription} />
        )}
        {twitterImage && <meta name="twitter:image" content={twitterImage} />}
        {post?.seo?.twitterCard && (
          <meta name="twitter:card" content={post.seo.twitterCard} />
        )}
      </Helmet>

      <div className="container mx-auto px-4">
        <nav className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 mb-6">
          {breadcrumbs?.map((item, index) => (
            <span key={item.url} className="flex items-center gap-2">
              <Link
                to={toInternalPath(item.url)}
                className="hover:text-primary-600 transition"
              >
                {item.name}
              </Link>
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>

        <header className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge color="secondary">{post.category?.title}</Badge>
              {post.tags?.map((tag) => (
                <Link key={tag.slug} to={`/blog/tag/${tag.slug}`}>
                  <Badge color="slate">#{tag.title}</Badge>
                </Link>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-relaxed">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                {post.readingTimeMinutes || 1} دقیقه مطالعه
              </span>
              <span className="flex items-center gap-2">
                <Eye size={16} />
                {post.viewCount?.toLocaleString('fa-IR') || '۰'} بازدید
              </span>
              <span className="font-bold">نویسنده: {post.author}</span>
            </div>

            {absoluteCover && (
              <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60">
                <LazyImage
                  src={absoluteCover}
                  alt={post.title}
                  className="w-full h-full"
                  width={1200}
                  height={675}
                />
              </div>
            )}
          </div>
        </header>

        <div className="mt-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/30">
          <BlogContent content={post.content} />
        </div>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">به اشتراک‌گذاری</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleCopyLink} className="!px-4">
                کپی لینک
                <Copy size={16} />
              </Button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:border-primary-500"
              >
                <Send size={16} className="inline ml-1" />
                تلگرام
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:border-primary-500"
              >
                <Linkedin size={16} className="inline ml-1" />
                لینکدین
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:border-primary-500"
              >
                <Twitter size={16} className="inline ml-1" />
                X
              </a>
            </div>
            {copySuccess && <p className="text-xs text-slate-500 mt-3">{copySuccess}</p>}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">مقاله بعدی / قبلی</h3>
            <div className="space-y-4">
              {navigation?.previous && (
                <Link
                  to={`/blog/${navigation.previous.slug}`}
                  className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 transition"
                >
                  <p className="text-xs text-slate-400 mb-1">قبلی</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2">
                    {navigation.previous.title}
                  </p>
                </Link>
              )}
              {navigation?.next && (
                <Link
                  to={`/blog/${navigation.next.slug}`}
                  className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 transition"
                >
                  <p className="text-xs text-slate-400 mb-1">بعدی</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2">
                    {navigation.next.title}
                  </p>
                </Link>
              )}
              {!navigation?.next && !navigation?.previous && (
                <p className="text-sm text-slate-400">مقاله دیگری یافت نشد.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">مطالب مرتبط</h2>
            <Link to="/blog" className="text-sm text-primary-600 hover:text-primary-700">
              مشاهده همه مقالات
            </Link>
          </div>

          {relatedPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">مقاله مرتبطی یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {relatedPosts.map((item) => (
                <BlogPostCard key={item.id} post={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BlogPost;
