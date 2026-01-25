import { useCallback } from "react";
import { AdminPaymentApi } from "../services/adminPaymentApi";
import { usePagedResource } from "../../../../hooks/usePagedResource";
import toast from "react-hot-toast";

const extractPayments = (response) =>
  response.data?.data?.data ?? response.data?.data ?? response.data;

export const useAdminPayments = () => {
  const {
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
    setPage,
    setPageSize,
    setSearch,
    setParams
  } = usePagedResource({
    endpoint: "/admin/payments",
    initialPageSize: 20,
    initialParams: { status: "all" },
    extract: extractPayments
  });

  const approvePayment = useCallback(
    async (paymentId) => {
      try {
        const result = await AdminPaymentApi.approvePayment(paymentId);
        if (result.success) {
          toast.success("Payment approved.");
          await refresh();
        }
      } catch (error) {
        console.error("Error approving payment:", error);
        toast.error("Failed to approve payment.");
      }
    },
    [refresh]
  );

  const rejectPayment = useCallback(
    async (paymentId, reason) => {
      try {
        const result = await AdminPaymentApi.rejectPayment(paymentId, reason);
        if (result.success) {
          toast.success("Payment rejected.");
          await refresh();
        }
      } catch (error) {
        console.error("Error rejecting payment:", error);
        toast.error("Failed to reject payment.");
      }
    },
    [refresh]
  );

  const updateFilters = useCallback(
    (newFilters) => {
      if (Object.prototype.hasOwnProperty.call(newFilters, "search")) {
        setSearch(newFilters.search);
      }
      if (Object.prototype.hasOwnProperty.call(newFilters, "status")) {
        setParams((prev) => ({ ...prev, status: newFilters.status }));
      }
    },
    [setParams, setSearch]
  );

  const resolvedStats = {
    total: stats?.total ?? meta.totalCount,
    pending: stats?.pending ?? 0,
    approved: stats?.approved ?? 0,
    rejected: stats?.rejected ?? 0
  };

  return {
    loading,
    error,
    payments: items,
    filters: {
      search,
      status: params.status ?? "all"
    },
    stats: resolvedStats,
    updateFilters,
    approvePayment,
    rejectPayment,
    refetch: refresh,
    pagination: {
      page,
      pageSize,
      totalCount: meta.totalCount,
      totalPages: meta.totalPages,
      hasNext: meta.hasNext,
      hasPrev: meta.hasPrev
    },
    updatePage: setPage,
    updatePageSize: setPageSize
  };
};
