import { useState } from 'react';
import { AlertTriangle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { copyErrorDetails } from '../utils/clipboard';

const ErrorDisplay = ({
    error,
    title = 'خطا در بارگذاری',
    showDetails = import.meta.env?.DEV || false,
    collapsible = true,
    className = ''
}) => {
    const [copyStatus, setCopyStatus] = useState('idle');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopyError = async () => {
        if (copyStatus !== 'idle' || !error) return;

        setCopyStatus('copying');

        try {
            const success = await copyErrorDetails(error);

            if (success) {
                setCopyStatus('copied');
                setTimeout(() => setCopyStatus('idle'), 2000);
            } else {
                setCopyStatus('idle');
            }
        } catch (err) {
            console.error('Failed to copy error details:', err);
            setCopyStatus('idle');
        }
    };

    if (!error) return null;

    const errorMessage = error.response?.data?.message || error.message || 'خطای نامشخص';

    return (
        <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5">
                    <AlertTriangle size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
                            {title}
                        </h3>

                        <div className="flex items-center gap-1">
                            {/* Copy button */}
                            <button
                                onClick={handleCopyError}
                                disabled={copyStatus !== 'idle'}
                                className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors disabled:opacity-50 text-red-600 dark:text-red-400"
                                title="کپی جزئیات کامل خطا"
                            >
                                {copyStatus === 'copied' ? (
                                    <Check size={16} className="text-green-500" />
                                ) : copyStatus === 'copying' ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>

                            {/* Expand/Collapse button */}
                            {showDetails && collapsible && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors text-red-600 dark:text-red-400"
                                    title={isExpanded ? 'بستن جزئیات' : 'نمایش جزئیات'}
                                >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        {errorMessage}
                    </p>

                    {/* Error details */}
                    {showDetails && (!collapsible || isExpanded) && (
                        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32 whitespace-pre-wrap">
                                {error.stack || JSON.stringify(error, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;