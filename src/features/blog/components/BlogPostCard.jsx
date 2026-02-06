import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Eye } from 'lucide-react';
import { Badge, Card } from '../../../components/UI';
import LazyImage from '../../../components/LazyImage';
import { formatDate, getImageUrl } from '../../../services/Libs';
import { sanitizeHtml } from '../utils/blogUtils';

const BlogPostCard = ({ post }) => {
  if (!post) return null;
  const cover = getImageUrl(post.coverImageUrl);
  const titleHtml = post.highlightedTitle ? sanitizeHtml(post.highlightedTitle) : null;
  const excerptHtml = post.highlightedExcerpt ? sanitizeHtml(post.highlightedExcerpt) : null;

  return (
    <Card className="group overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90" hover>
      <Link to={`/blog/${post.slug}`} className="block focus:outline-none">
        <div className="relative">
          <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
            <LazyImage
              src={cover || 'https://placehold.co/800x450/0f172a/e2e8f0?text=Pardis+Blog'}
              alt={post.title}
              className="w-full h-full"
              width={800}
              height={450}
            />
          </div>
          <div className="absolute top-4 right-4">
            <Badge color="secondary" size="sm">
              <BookOpen size={14} />
              {post.categoryTitle}
            </Badge>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-relaxed line-clamp-2">
              {titleHtml ? (
                <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
              ) : (
                post.title
              )}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 line-clamp-3">
              {excerptHtml ? (
                <span dangerouslySetInnerHTML={{ __html: excerptHtml }} />
              ) : (
                post.excerpt
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.readingTimeMinutes || 1} دقیقه مطالعه
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {post.viewCount?.toLocaleString('fa-IR') || '۰'} بازدید
            </span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default memo(BlogPostCard);
