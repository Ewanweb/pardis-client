import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * کامپوننت برای اسکرول به بالای صفحه هنگام تغییر مسیر
 */
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default ScrollToTop;
