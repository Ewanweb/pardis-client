import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE = 1;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 200;
const DEFAULT_DEBOUNCE_MS = 300;

const normalizePage = (value) => {
  const parsed = Number.isNaN(value) ? MIN_PAGE : value;
  return parsed < MIN_PAGE ? MIN_PAGE : parsed;
};

const normalizePageSize = (value) => {
  const parsed = Number.isNaN(value) ? DEFAULT_PAGE_SIZE : value;
  if (parsed < MIN_PAGE_SIZE) return MIN_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
};

/**
 * Hook برای مدیریت منابع صفحه‌بندی شده با قابلیت جستجوی Real-Time
 *
 * ویژگی‌ها:
 * - جستجوی لحظه‌ای (Real-Time) با debounce
 * - لغو خودکار درخواست‌های قبلی (Request Cancellation)
 * - بدون رفرش صفحه (Pure AJAX)
 * - بهینه‌سازی شده برای performance
 */
export const usePagedResource = ({
  endpoint,
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialParams = {},
  searchKey = "search",
  pageParam = "page",
  pageSizeParam = "pageSize",
  debounceMs = DEFAULT_DEBOUNCE_MS,
  extract,
} = {}) => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    page: MIN_PAGE,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(MIN_PAGE);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [params, setParams] = useState(initialParams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref برای مدیریت AbortController
  const abortControllerRef = useRef(null);

  // State برای debouncedSearch
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Effect برای debounce کردن search
  useEffect(() => {
    // اگر search خالی شد، بلافاصله اعمال کن
    if (search === "") {
      setDebouncedSearch("");
      return;
    }

    // تنظیم timer برای debounce
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    // Cleanup
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const fetchData = useCallback(async () => {
    // لغو درخواست قبلی اگر هنوز در حال اجرا است
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // ایجاد AbortController جدید
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams({
      [pageParam]: page.toString(),
      [pageSizeParam]: pageSize.toString(),
    });

    // استفاده از debouncedSearch
    if (debouncedSearch) {
      queryParams.set(searchKey, debouncedSearch);
    }

    Object.entries(params || {}).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        return;
      }
      queryParams.set(key, value.toString());
    });

    try {
      const response = await api.get(`${endpoint}?${queryParams}`, {
        signal: abortControllerRef.current.signal,
      });

      const payload = extract
        ? extract(response)
        : (response.data?.data?.data ?? response.data?.data ?? response.data);

      const nextItems = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];

      const totalCount =
        typeof payload?.totalCount === "number"
          ? payload.totalCount
          : nextItems.length;
      const totalPages =
        typeof payload?.totalPages === "number"
          ? payload.totalPages
          : Math.max(1, Math.ceil(totalCount / pageSize));

      setItems(nextItems);
      setMeta({
        page: typeof payload?.page === "number" ? payload.page : page,
        pageSize:
          typeof payload?.pageSize === "number" ? payload.pageSize : pageSize,
        totalCount,
        totalPages,
        hasNext:
          typeof payload?.hasNext === "boolean"
            ? payload.hasNext
            : page < totalPages,
        hasPrev:
          typeof payload?.hasPrev === "boolean" ? payload.hasPrev : page > 1,
      });
      setStats(payload?.stats || null);

      if (typeof payload?.page === "number" && payload.page !== page) {
        setPage(normalizePage(payload.page));
      }
    } catch (err) {
      // نادیده گرفتن خطای abort
      if (err.name === "AbortError" || err.name === "CanceledError") {
        return;
      }

      setError(err);
      setItems([]);
      setMeta((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }));
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    endpoint,
    extract,
    page,
    pageParam,
    pageSize,
    pageSizeParam,
    params,
    searchKey,
  ]);

  // Effect برای fetch کردن data
  useEffect(() => {
    fetchData();

    // Cleanup: لغو درخواست در صورت unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const updatePage = useCallback((nextPage) => {
    setPage(normalizePage(nextPage));
  }, []);

  const updatePageSize = useCallback((nextPageSize) => {
    setPageSize(normalizePageSize(nextPageSize));
    setPage(MIN_PAGE);
  }, []);

  const updateSearch = useCallback((nextSearch) => {
    setSearch(nextSearch);
    setPage(MIN_PAGE);
  }, []);

  const updateParams = useCallback((updater) => {
    setParams((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next ?? {};
    });
    setPage(MIN_PAGE);
  }, []);

  return {
    items,
    meta,
    stats,
    loading,
    error,
    search,
    page,
    pageSize,
    params,
    refresh,
    setPage: updatePage,
    setPageSize: updatePageSize,
    setSearch: updateSearch,
    setParams: updateParams,
  };
};
