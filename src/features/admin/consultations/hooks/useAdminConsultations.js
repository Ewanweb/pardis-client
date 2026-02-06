import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ConsultationAdminApi } from "../services/consultationAdminApi";
import toast from "react-hot-toast";

export const useAdminConsultations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    completed: 0,
    cancelled: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // تبدیل status به عدد اگر string باشه
      let statusValue = undefined;
      if (status && status !== "all") {
        const statusNum = parseInt(status, 10);
        if (!isNaN(statusNum)) {
          statusValue = statusNum;
        }
      }

      const params = {
        page,
        pageSize,
        search: search || undefined,
        status: statusValue,
      };

      console.log("📤 Fetching filtered consultations with params:", params);

      // Fetch filtered consultations
      const response = await ConsultationAdminApi.getConsultations(params);

      let data = null;
      if (response.data?.items && Array.isArray(response.data.items)) {
        data = response.data;
      } else if (
        response.data?.data?.items &&
        Array.isArray(response.data.data.items)
      ) {
        data = response.data.data;
      } else if (response.items && Array.isArray(response.items)) {
        data = response;
      }

      const items = Array.isArray(data?.items) ? data.items : [];

      console.log("📋 Filtered Items:", items.length, "items");

      setConsultations(items);
      setPagination({
        page: data?.page || page,
        pageSize: data?.pageSize || pageSize,
        totalCount: data?.totalCount || 0,
        totalPages: data?.totalPages || 0,
        hasNext: data?.hasNext || false,
        hasPrev: data?.hasPrevious || false,
      });

      console.log("📄 Pagination set:", {
        page: data?.page || page,
        totalCount: data?.totalCount || 0,
        totalPages: data?.totalPages || 0,
      });

      // Fetch ALL consultations for accurate stats (without filters)
      console.log("📊 Fetching all consultations for stats calculation...");
      const statsResponse = await ConsultationAdminApi.getConsultations({
        page: 1,
        pageSize: 1000, // Get all items
        // No status or search filter - get everything
      });

      console.log("📊 Stats Response:", statsResponse);

      let statsData = null;
      if (
        statsResponse.data?.items &&
        Array.isArray(statsResponse.data.items)
      ) {
        statsData = statsResponse.data;
      } else if (
        statsResponse.data?.data?.items &&
        Array.isArray(statsResponse.data.data.items)
      ) {
        statsData = statsResponse.data.data;
      } else if (statsResponse.items && Array.isArray(statsResponse.items)) {
        statsData = statsResponse;
      }

      const allItems = Array.isArray(statsData?.items) ? statsData.items : [];
      console.log("📊 All Items for Stats:", allItems.length, "items");

      const calculatedStats = {
        total: statsData?.totalCount || allItems.length || 0,
        pending: allItems.filter((c) => c.status === "Pending").length,
        contacted: allItems.filter((c) => c.status === "Contacted").length,
        completed: allItems.filter((c) => c.status === "Completed").length,
        cancelled: allItems.filter((c) => c.status === "Cancelled").length,
      };

      console.log("📊 Calculated Stats:", calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error("❌ Error fetching consultations:", err);
      setError(err);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const updateFilters = useCallback(
    (newFilters) => {
      const params = new URLSearchParams(searchParams);

      if (newFilters.hasOwnProperty("search")) {
        if (newFilters.search) {
          params.set("search", newFilters.search);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
      }

      if (newFilters.hasOwnProperty("status")) {
        if (newFilters.status && newFilters.status !== "all") {
          params.set("status", newFilters.status);
        } else {
          params.delete("status");
        }
        params.set("page", "1");
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const updatePage = useCallback(
    (newPage) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage.toString());
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const updatePageSize = useCallback(
    (newPageSize) => {
      const params = new URLSearchParams(searchParams);
      params.set("pageSize", newPageSize.toString());
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const updateStatus = useCallback(
    async (id, newStatus, adminNotes = null) => {
      try {
        const result = await ConsultationAdminApi.updateStatus(
          id,
          newStatus,
          adminNotes,
        );

        if (result.success || result.data?.success) {
          await fetchConsultations();
          toast.success("وضعیت با موفقیت به‌روزرسانی شد");
        }
        return result;
      } catch (error) {
        console.error("❌ Error updating consultation status:", error);
        toast.error("خطا در به‌روزرسانی وضعیت");
        throw error;
      }
    },
    [fetchConsultations],
  );

  const deleteConsultation = useCallback(
    async (id) => {
      try {
        const result = await ConsultationAdminApi.deleteConsultation(id);
        if (result.success) {
          await fetchConsultations();
        }
        return result;
      } catch (error) {
        console.error("Error deleting consultation:", error);
        toast.error("خطا در حذف درخواست");
        throw error;
      }
    },
    [fetchConsultations],
  );

  return {
    loading,
    error,
    consultations,
    filters: {
      search,
      status,
    },
    stats,
    updateFilters,
    updateStatus,
    deleteConsultation,
    refetch: fetchConsultations,
    pagination,
    updatePage,
    updatePageSize,
  };
};
