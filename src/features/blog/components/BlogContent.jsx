import { useMemo, useState } from 'react';
import { List, ChevronDown } from 'lucide-react';
import { prepareBlogContent } from '../utils/blogUtils';

const BlogContent = ({ content }) => {
  const [tocOpen, setTocOpen] = useState(false);
  const { html, toc } = useMemo(() => prepareBlogContent(content || ''), [content]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
      <article
        className="blog-content text-slate-700 dark:text-slate-200 leading-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <aside className="space-y-4">
        <div className="lg:hidden">
          <button
            onClick={() => setTocOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 font-bold"
          >
            <span className="flex items-center gap-2">
              <List size={18} />
              فهرست مطالب
            </span>
            <ChevronDown size={18} className={`transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
          </button>
          {tocOpen && toc.length > 0 && (
            <div className="mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-sm text-slate-500 dark:text-slate-300 hover:text-primary-600 transition-colors ${
                    item.level === 3 ? 'mr-4' : item.level >= 4 ? 'mr-8' : ''
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block sticky top-32">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200 mb-4">
              <List size={18} />
              <h3 className="text-sm font-black">فهرست مطالب</h3>
            </div>
            {toc.length > 0 ? (
              <div className="space-y-2">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm text-slate-500 dark:text-slate-300 hover:text-primary-600 transition-colors ${
                      item.level === 3 ? 'mr-3' : item.level >= 4 ? 'mr-6' : ''
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">سرفصلی برای نمایش وجود ندارد.</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BlogContent;
