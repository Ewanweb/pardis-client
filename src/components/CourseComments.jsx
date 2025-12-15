import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, ThumbsUp, Clock, User, Edit2, Trash2, Send, AlertCircle } from 'lucide-react';
import { Button, Badge } from './UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate } from '../services/Libs';
import toast from 'react-hot-toast';

const CourseComments = ({ courseId, courseName }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [userComment, setUserComment] = useState(null);

    const [formData, setFormData] = useState({
        content: '',
        rating: 5
    });

    useEffect(() => {
        fetchComments();
        if (user) {
            checkUserComment();
        }
    }, [courseId, user]);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/comments/course/${courseId}`);
            setComments(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUserComment = async () => {
        try {
            const response = await api.get(`/comments/my-comment/course/${courseId}`);
            setUserComment(response.data?.data);
        } catch (error) {
            // کاربر کامنت ندارد
            setUserComment(null);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!formData.content.trim()) {
            toast.error('لطفاً نظر خود را بنویسید');
            return;
        }

        try {
            const commentData = {
                courseId,
                content: formData.content.trim(),
                rating: formData.rating
            };

            if (editingComment) {
                await api.put(`/comments/${editingComment.id}`, commentData);
                toast.success('نظر شما با موفقیت ویرایش شد');
                setEditingComment(null);
            } else {
                await api.post('/comments', commentData);
                toast.success('نظر شما ثبت شد و پس از تأیید نمایش داده خواهد شد');
            }

            setFormData({ content: '', rating: 5 });
            setShowCommentForm(false);
            await checkUserComment();
            await fetchComments();
        } catch (error) {
            const message = error.response?.data?.message || 'خطا در ثبت نظر';
            toast.error(message);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setFormData({
            content: comment.content,
            rating: comment.rating
        });
        setShowCommentForm(true);
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('آیا مطمئن هستید که می‌خواهید نظر خود را حذف کنید؟')) {
            return;
        }

        try {
            await api.delete(`/comments/${commentId}`);
            toast.success('نظر شما حذف شد');
            await checkUserComment();
            await fetchComments();
        } catch (error) {
            toast.error('خطا در حذف نظر');
        }
    };

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        onClick={interactive ? () => onRatingChange(star) : undefined}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
                        disabled={!interactive}
                    >
                        <Star
                            size={interactive ? 24 : 16}
                            className={`${star <= rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                } transition-colors duration-200`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: { color: 'amber', text: 'در انتظار تأیید' },
            Approved: { color: 'emerald', text: 'تأیید شده' },
            Rejected: { color: 'red', text: 'رد شده' }
        };

        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge color={config.color} size="sm">{config.text}</Badge>;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                نظرات و امتیازات
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {comments.length} نظر ثبت شده
                            </p>
                        </div>
                    </div>

                    {user && !userComment && (
                        <Button
                            onClick={() => setShowCommentForm(true)}
                            size="sm"
                            className="!px-4 !py-2"
                        >
                            <Edit2 size={16} className="ml-1" />
                            ثبت نظر
                        </Button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* نظر کاربر فعلی */}
                {userComment && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-800/50">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {user.fullName?.charAt(0) || 'شما'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">نظر شما</p>
                                    <div className="flex items-center gap-2">
                                        {renderStars(userComment.rating)}
                                        {getStatusBadge(userComment.status)}
                                    </div>
                                </div>
                            </div>

                            {userComment.status === 'Pending' && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditComment(userComment)}
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteComment(userComment.id)}
                                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {userComment.content}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(userComment.createdAt)}
                            </span>
                        </div>
                    </div>
                )}

                {/* فرم ثبت/ویرایش نظر */}
                {showCommentForm && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            {editingComment ? 'ویرایش نظر' : 'ثبت نظر جدید'}
                        </h4>

                        <form onSubmit={handleSubmitComment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    امتیاز شما
                                </label>
                                {renderStars(formData.rating, true, (rating) =>
                                    setFormData(prev => ({ ...prev, rating }))
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    نظر شما
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="نظر خود را در مورد این دوره بنویسید..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" size="sm">
                                    <Send size={16} className="ml-1" />
                                    {editingComment ? 'ویرایش نظر' : 'ثبت نظر'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowCommentForm(false);
                                        setEditingComment(null);
                                        setFormData({ content: '', rating: 5 });
                                    }}
                                >
                                    انصراف
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* لیست نظرات */}
                {comments.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="mx-auto text-slate-400 mb-4" size={48} />
                        <h4 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                            هنوز نظری ثبت نشده
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400">
                            اولین نفری باشید که نظر خود را در مورد این دوره ثبت می‌کند
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {comment.user?.fullName?.charAt(0) || 'ک'}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h5 className="font-bold text-slate-800 dark:text-white">
                                                {comment.user?.fullName || 'کاربر'}
                                            </h5>
                                            {renderStars(comment.rating)}
                                        </div>

                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                                            {comment.content}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatDate(comment.createdAt)}
                                            </span>

                                            {comment.adminNote && (
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                    <AlertCircle size={12} />
                                                    یادداشت ادمین
                                                </span>
                                            )}
                                        </div>

                                        {comment.adminNote && (
                                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                                    <strong>یادداشت ادمین:</strong> {comment.adminNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseComments;