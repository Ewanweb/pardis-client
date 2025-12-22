import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AppLoader from '../components/AppLoader';
import { useAuth } from './AuthContext';
import { preloadEssentialData, waitForFonts } from '../utils/appBootstrap';

const AppBootstrapContext = createContext({ appReady: false });

const MINIMUM_LOADER_MS = 500;
const FADE_OUT_MS = 350;

export const AppBootstrapProvider = ({ children }) => {
    const { loading: authLoading } = useAuth();
    const [appReady, setAppReady] = useState(false);
    const [showLoader, setShowLoader] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const bootStartRef = useRef(performance.now());
    const hasBootstrappedRef = useRef(false);

    useEffect(() => {
        if (appReady || authLoading) return;

        let isMounted = true;

        if (!hasBootstrappedRef.current) {
            hasBootstrappedRef.current = true;
            bootStartRef.current = performance.now();
        }

        const bootstrap = async () => {
            await Promise.all([
                waitForFonts(),
                preloadEssentialData()
            ]);

            const elapsed = performance.now() - bootStartRef.current;
            const remaining = Math.max(0, MINIMUM_LOADER_MS - elapsed);

            window.setTimeout(() => {
                if (isMounted) {
                    setAppReady(true);
                }
            }, remaining);
        };

        bootstrap();

        return () => {
            isMounted = false;
        };
    }, [appReady, authLoading]);

    useEffect(() => {
        if (!appReady) return;

        setIsFadingOut(true);
        const timer = window.setTimeout(() => {
            setShowLoader(false);
        }, FADE_OUT_MS);

        return () => window.clearTimeout(timer);
    }, [appReady]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        if (showLoader) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = previousOverflow;
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showLoader]);

    const value = useMemo(() => ({ appReady }), [appReady]);

    return (
        <AppBootstrapContext.Provider value={value}>
            {children}
            {showLoader && <AppLoader isFadingOut={isFadingOut} />}
        </AppBootstrapContext.Provider>
    );
};

export const useAppBootstrap = () => useContext(AppBootstrapContext);
