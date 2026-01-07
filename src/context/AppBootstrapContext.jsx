import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { waitForFonts } from '../utils/appBootstrap';

const AppBootstrapContext = createContext({ appReady: false });

export const AppBootstrapProvider = ({ children }) => {
    const { loading: authLoading } = useAuth();
    const [appReady, setAppReady] = useState(false);
    const hasBootstrappedRef = useRef(false);

    useEffect(() => {
        if (appReady || authLoading) return;

        let isMounted = true;

        if (!hasBootstrappedRef.current) {
            hasBootstrappedRef.current = true;
        }

        const bootstrap = async () => {
            // ✅ OPTIMIZATION: Only wait for fonts, no data preloading
            // Each route will fetch its own data independently
            await waitForFonts();

            if (isMounted) {
                setAppReady(true);
            }
        };

        bootstrap();

        return () => {
            isMounted = false;
        };
    }, [appReady, authLoading]);

    const value = useMemo(() => ({ appReady }), [appReady]);

    return (
        <AppBootstrapContext.Provider value={value}>
            {children}
        </AppBootstrapContext.Provider>
    );
};

export const useAppBootstrap = () => useContext(AppBootstrapContext);
