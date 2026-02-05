ofile',
    '/cart',
    '/orders',
    '/login',
    '/register',
    '/checkout'
  ];
  
  return !noIndexPaths.some(noIndexPath => path.startsWith(noIndexPath));
};

// SEO preloading strategy
const shouldPreloadSEO = (pageType) => {
  return ['home', 'course', 'category'].includes(pageType);
};iltering parameters
  const allowedParams = ['page', 'category', 'level', 'price'];
  const filteredParams = new URLSearchParams();
  
  allowedParams.forEach(param => {
    if (searchParams.has(param)) {
      filteredParams.set(param, searchParams.get(param));
    }
  });
  
  const queryString = filteredParams.toString();
  return `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
};

// Indexability rules
const isPageIndexable = (path) => {
  const noIndexPaths = [
    '/admin',
    '/preturn 'admin';
  if (path.startsWith('/profile')) return 'profile';
  if (path.startsWith('/cart')) return 'cart';
  if (path.startsWith('/orders')) return 'orders';
  return 'page';
};

// Canonical URL builder with normalization
const buildCanonicalUrl = (path, searchParams) => {
  const baseUrl = process.env.VITE_SITE_URL || 'https://pardistous.ir';
  
  // Normalize path (remove trailing slash except for root)
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  
  // Handle pagination and fl,
      defaultConfig,
      isIndexable: isPageIndexable(currentPath),
      shouldPreload: shouldPreloadSEO(pageType)
    };
  }, [location.pathname, location.search]);

  return (
    <SEOContext.Provider value={seoState}>
      {children}
    </SEOContext.Provider>
  );
};

// Page type detection
const getPageType = (path) => {
  if (path === '/') return 'home';
  if (path.startsWith('/course/')) return 'course';
  if (path.startsWith('/category/')) return 'category';
  if (path.startsWith('/admin/')) rurrentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    // Determine page type from route
    const pageType = getPageType(currentPath);
    
    // Build canonical URL with proper normalization
    const canonicalUrl = buildCanonicalUrl(currentPath, searchParams);
    
    // Get default SEO config for page type
    const defaultConfig = SEOConfig.getDefaultConfig(pageType);
    
    return {
      pageType,
      currentPath,
      searchParams,
      canonicalUrSEOProvider = ({ children }) => {
  const location = useLocation();

  const seoState = useMemo(() => {
    const c SEO Provider - Central SEO Management
 * Handles context-aware SEO data with performance optimization
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SEOConfig } from '../../config/seo';

const SEOContext = createContext();

export const useSEOContext = () => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEOContext must be used within SEOProvider');
  }
  return context;
};

export const /**
 * Enterprise