import { useState, useEffect, useCallback } from "react";
import { AdminPaymentApi } from "../services/adminPaymentApi";
import {
  PaymentStatus,
  isPaymentPending,
  getStatusNumber,
} from "../utils/paymentStatus";
import toast from "react-hot-toast";

export const useAdminPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminPaymentApi.listPayments();
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching admin payments:", error);
      toast.error("خطا در دریافت پرداخت‌ها");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPayments = useCallback(() => {
    let filtered = [...payments];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.studentName?.toLowerCase().includes(searchTerm) ||
          payment.orderNumber?.toLowerCase().includes(searchTerm) ||
          payment.trackingCode?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      const statusValue = parseInt(filters.status);
      filtered = filtered.filter(
        (payment) => getStatusNumber(payment.status) === statusValue
      );
    }

    // Sort by creation date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredPayments(filtered);
  }, [payments, filters]);

  const approvePayment = useCallback(
    async (paymentId) => {
      try {
        const result = await AdminPaymentApi.approvePayment(paymentId);
        if (result.success) {
          toast.success("پرداخت با موفقیت تایید شد");
          await fetchPayments(); // Refresh the list
        }
      } catch (error) {
        console.error("Error approving payment:", error);
        toast.error("خطا در تایید پرداخت");
      }
    },
    [fetchPayments]
  );

  const rejectPayment = useCallback(
    async (paymentId, reason) => {
      try {
        const result = await AdminPaymentApi.rejectPayment(paymentId, reason);
        if (result.success) {
          toast.success("پرداخت رد شد");
          await fetchPayments(); // Refresh the list
        }
      } catch (error) {
        console.error("Error rejecting payment:", error);
        toast.error("خطا در رد پرداخت");
      }
    },
    [fetchPayments]
  );

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const refetch = useCallback(() => {
    return fetchPayments();
  }, [fetchPayments]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Apply filters when payments or filters change
  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  // Stats
  const stats = {
    total: payments.length,
    pending: payments.filter((p) => isPaymentPending(p.status)).length,
    approved: payments.filter(
      (p) => getStatusNumber(p.status) === PaymentStatus.PAID
    ).length,
    rejected: payments.filter(
      (p) => getStatusNumber(p.status) === PaymentStatus.FAILED
    ).length,
  };

  return {
    loading,
    payments: filteredPayments,
    filters,
    stats,
    updateFilters,
    approvePayment,
    rejectPayment,
    refetch,
  };
};
