import React from 'react';
import RouteSkeleton from './RouteSkeleton';

const SuspenseWrapper = ({ children, fallback = null }) => {
    return (
        <React.Suspense fallback={fallback || <RouteSkeleton />}>
            {children}
        </React.Suspense>
    );
};

export default SuspenseWrapper;
