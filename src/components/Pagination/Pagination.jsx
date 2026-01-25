import { Button } from "../UI";

const buildPageWindow = (page, totalPages, windowSize = 5) => {
    if (totalPages <= windowSize) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) {
        return Array.from({ length: windowSize }, (_, i) => i + 1);
    }

    if (page >= totalPages - 2) {
        return Array.from({ length: windowSize }, (_, i) => totalPages - (windowSize - 1) + i);
    }

    return Array.from({ length: windowSize }, (_, i) => page - 2 + i);
};

export const Pagination = ({
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100]
}) => {
    if (totalPages <= 1) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);
    const pages = buildPageWindow(page, totalPages);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    نمایش {start} تا {end} از {totalCount.toLocaleString()}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={!hasPrev}
                        className="!py-1.5 !px-3"
                    >
                        قبلی
                    </Button>

                    <div className="flex items-center gap-1">
                        {pages.map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 text-sm rounded-lg transition-colors ${page === pageNum
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={!hasNext}
                        className="!py-1.5 !px-3"
                    >
                        بعدی
                    </Button>
                </div>
            </div>
        </div>
    );
};
