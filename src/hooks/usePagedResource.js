import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE = 1;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 200;

const normalizePage = (value) => {
  const parsed = Number.isNaN(value) ? MIN_PAGE : value;
  return parsed < MIN_PAGE ? MIN_PAGE : parsed;
};

const normalizePageSize = (value) => {
  const parsed = Number.isNaN(value) ? DEFAULT_PAGE_SIZE : value;
  if (parsed < MIN_PAGE_SIZE) return MIN_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
};

const useDebouncedValue = (value, delayMs) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debouncedValue;
};

export const usePagedResource = ({
  endpoint,
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialParams = {},
  searchKey = "search",
  pageParam = "page",
  pageSizeParam = "pageSize",
  debounceMs = 400,
  extract
} = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = useMemo(() => {
    const value = parseInt(searchParams.get(pageParam) || "", 10);
    return normalizePage(Number.isNaN(value) ? MIN_PAGE : value);
  }, [pageParam, searchParams]);

  const initialSize = useMemo(() => {
    const value = parseInt(searchParams.get(pageSizeParam) || "", 10);
    return normalizePageSize(
      Number.isNaN(value) ? initialPageSize : value
    );
  }, [initialPageSize, pageSizeParam, searchParams]);

  const initialSearch = useMemo(
    () => searchParams.get(searchKey) || "",
    [searchKey, searchParams]
  );

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    page: initialPage,
    pageSize: initialSize,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [params, setParams] = useState(initialParams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  useEffect(() => {
    const value = parseInt(searchParams.get(pageParam) || "", 10);
    const nextPage = normalizePage(Number.isNaN(value) ? MIN_PAGE : value);
    const sizeValue = parseInt(searchParams.get(pageSizeParam) || "", 10);
    const nextPageSize = normalizePageSize(
      Number.isNaN(sizeValue) ? initialPageSize : sizeValue
    );
    const nextSearch = searchParams.get(searchKey) || "";

    if (nextPage !== page) setPage(nextPage);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);
    if (nextSearch !== search) setSearch(nextSearch);
  }, [
    initialPageSize,
    page,
    pageParam,
    pageSize,
    pageSizeParam,
    search,
    searchKey,
    searchParams
  ]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set(pageParam, page.toString());
    next.set(pageSizeParam, pageSize.toString());

    if (search) {
      next.set(searchKey, search);
    } else {
      next.delete(searchKey);
    }

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") {
        next.delete(key);
        return;
      }
      next.set(key, value.toString());
    });

    setSearchParams(next, { replace: true });
  }, [
    page,
    pageParam,
    pageSize,
    pageSizeParam,
    params,
    search,
    searchKey,
    searchParams,
    setSearchParams
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams({
      [pageParam]: page.toString(),
      [pageSizeParam]: pageSize.toString()
    });

    if (debouncedSearch) {
      queryParams.set(searchKey, debouncedSearch);
    }

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") {
        return;
      }
      queryParams.set(key, value.toString());
    });

    try {
      const response = await api.get(`${endpoint}?${queryParams}`);
      const payload = extract
        ? extract(response)
        : response.data?.data?.data ?? response.data?.data ?? response.data;

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
          typeof payload?.hasPrev === "boolean" ? payload.hasPrev : page > 1
      });
      setStats(payload?.stats || null);

      if (typeof payload?.page === "number" && payload.page !== page) {
        setPage(normalizePage(payload.page));
      }
    } catch (err) {
      setError(err);
      setItems([]);
      setMeta((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
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
    searchKey
  ]);

  useEffect(() => {
    fetchData();
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
    setParams: updateParams
  };
};
