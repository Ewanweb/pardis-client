import React from 'react';
import LoadingScreen from './LoadingScreen';

const SuspenseWrapper = ({ children, fallback = null, loadingMessage = "در حال بارگذاری صفحه..." }) => {
    return (
        <React.Suspense fallback={fallback || <LoadingScreen message={loadingMessage} />}>
            {children}
        </React.Suspense>
    );
};

export default SuspenseWrapper;
