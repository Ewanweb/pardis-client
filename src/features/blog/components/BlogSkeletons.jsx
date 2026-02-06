const BlogListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-4/5 animate-pulse" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/5 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BlogDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="h-10 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export { BlogListSkeleton, BlogDetailSkeleton };
