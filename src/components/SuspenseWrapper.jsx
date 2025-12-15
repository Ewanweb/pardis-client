import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const SuspenseWrapper = ({ children, fallback = null }) => {
    return (
        <React.Suspense fallback={fallback || <LoadingSpinner />}>
            {children}
        </React.Suspense>
    );
};

export default SuspenseWrapper;