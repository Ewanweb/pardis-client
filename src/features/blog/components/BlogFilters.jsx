import { Filter, Search, X } from 'lucide-react';
import { Button } from '../../../components/UI';

const BlogFilters = ({
  categories,
  tags,
  activeCategory,
  activeTag,
  sort,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClear
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Filter size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black">فیلترها</h2>
            <p className="text-xs text-slate-400">دسته و برچسب موردنظر را انتخاب کن.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              !activeCategory
                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-primary-300'
            }`}
          >
            همه دسته‌ها
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => onCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === category.slug
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-primary-300'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagChange('')}
            className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
              !activeTag
                ? 'bg-secondary-500 text-white border-secondary-500 shadow-lg shadow-secondary-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-secondary-300'
            }`}
          >
            همه برچسب‌ها
          </button>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => onTagChange(tag.slug)}
              className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                activeTag === tag.slug
                  ? 'bg-secondary-500 text-white border-secondary-500 shadow-lg shadow-secondary-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-secondary-300'
              }`}
            >
              #{tag.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm">
            <Search size={16} />
            مرتب‌سازی
          </div>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="mostViewed">محبوب‌ترین</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="!px-3"
          >
            پاکسازی
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogFilters;
