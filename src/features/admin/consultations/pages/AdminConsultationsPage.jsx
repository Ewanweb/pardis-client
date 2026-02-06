import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/UI';
import { APIErrorAlert } from '../../../../components/Alert';
import { Pagination } from '../../../../components/Pagination/Pagination';
import { useAdminConsultations } from '../hooks/useAdminConsultations';
import { ConsultationFilters } from '../components/ConsultationFilters';
import { ConsultationTable } from '../components/ConsultationTable';
import { ConsultationStatusBadge } from '../components/ConsultationStatusBadge';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { formatDate } from '../../../../services/Libs';

const AdminConsultationsPage = () => {
    const {
        loading,
        consultations,
        filters,
        stats,
        updateFilters,
        updateStatus,
        deleteConsultation,
        refetch,
        error,
        pagination,
        updatePage,
        updatePageSize
    } = useAdminConsultations();

    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleViewDetails = (consultation) => {
        setSelectedConsultation(consultation);
        setShowDetailModal(true);
    };

    const handleChangeStatus = (consultation) => {
        setSelectedConsultation(consultation);
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async (id, status, adminNotes) => {
        try {
            await updateStatus(id, status, adminNotes);
            setShowStatusModal(false);
            setSelectedConsultation(null);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = (id) => {
        const consultation = consultations.find(c => c.id === id);
        if (consultation) {
            setSelectedConsultation(consultation);
            setShowDeleteModal(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedConsultation) return;

        try {
            await deleteConsultation(selectedConsultation.id);
            setShowDeleteModal(false);
            setSelectedConsultation(null);
        } catch (error) {
            console.error('Error deleting consultation:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری درخواست‌ها...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && <APIErrorAlert error={error} onRetry={refetch} onClose={() => { }} />}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">
                        درخواست‌های مشاوره
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        مدیریت و پیگیری درخواست‌های مشاوره کاربران
                    </p>
                </div>
                <Button variant="outline" onClick={refetch} className="!py-2.5">
                    <RefreshCw size={18} className="ml-2" />
                    به‌روزرسانی
                </Button>
            </div>

            <ConsultationFilters filters={filters} onFiltersChange={updateFilters} stats={stats} />

            <ConsultationTable
                consultations={consultations}
                onViewDetails={handleViewDetails}
                onChangeStatus={handleChangeStatus}
                onDelete={handleDelete}
            />

            {!loading && (
                <Pagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    totalCount={pagination.totalCount}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    onPageChange={updatePage}
                    onPageSizeChange={updatePageSize}
                />
            )}

            {showStatusModal && selectedConsultation && (
                <StatusUpdateModal
                    consultation={selectedConsultation}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedConsultation(null);
                    }}
                    onUpdate={handleUpdateStatus}
                />
            )}

            {showDetailModal && selectedConsultation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">جزئیات درخواست مشاوره</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">نام و نام خانوادگی</label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">{selectedConsultation.fullName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">شماره تماس</label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1 dir-ltr text-right">{selectedConsultation.phoneNumber}</p>
                                </div>
                            </div>
                            {selectedConsultation.email && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ایمیل</label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1 dir-ltr text-right">{selectedConsultation.email}</p>
                                </div>
                            )}
                            {selectedConsultation.courseName && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">دوره مورد نظر</label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">{selectedConsultation.courseName}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">پیام</label>
                                <p className="text-slate-700 dark:text-slate-300 mt-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">{selectedConsultation.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">وضعیت</label>
                                    <div className="mt-2"><ConsultationStatusBadge status={selectedConsultation.status} /></div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">تاریخ ثبت</label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">{formatDate(selectedConsultation.createdAt)}</p>
                                </div>
                            </div>
                            {selectedConsultation.contactedAt && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">تاریخ تماس</label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">{formatDate(selectedConsultation.contactedAt)}</p>
                                </div>
                            )}
                            {selectedConsultation.adminNotes && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">یادداشت ادمین</label>
                                    <p className="text-slate-700 dark:text-slate-300 mt-1 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">{selectedConsultation.adminNotes}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" onClick={() => setShowDetailModal(false)} className="w-full">بستن</Button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedConsultation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">حذف درخواست مشاوره</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-600 dark:text-slate-400">
                                آیا از حذف درخواست مشاوره <span className="font-bold">{selectedConsultation.fullName}</span> اطمینان دارید؟
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">انصراف</Button>
                            <Button onClick={handleDeleteConfirm} className="flex-1 !bg-red-600 hover:!bg-red-700">حذف</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminConsultationsPage;
