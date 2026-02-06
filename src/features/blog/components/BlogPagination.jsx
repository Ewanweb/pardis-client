const buildPages = (page, totalPages) => {
  const windowSize = 5;
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (page >= totalPages - 2) {
    return Array.from({ length: windowSize }, (_, index) => totalPages - (windowSize - 1) + index);
  }

  return Array.from({ length: windowSize }, (_, index) => page - 2 + index);
};

const BlogPagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        قبلی
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
            pageNumber === page
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        بعدی
      </button>
    </div>
  );
};

export default BlogPagination;
