export const SITE_NAME = 'آکادمی پردیس توس';
export const SITE_URL = 'https://pardistous.ir';
export const SITE_LOGO_PATH = '/logo.png';
export const SITE_OG_IMAGE = '/og-image.png';
export const SITE_TWITTER_IMAGE = '/twitter-image.png';

export const getSiteOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return SITE_URL;
};

export const buildCanonicalUrl = ({ canonical, pathname = '/', search = '' } = {}) => {
  const origin = getSiteOrigin();

  if (canonical) {
    try {
      return new URL(canonical, origin).toString();
    } catch (error) {
      return canonical;
    }
  }

  return `${origin}${pathname}${search}`;
};

export const buildRobotsValue = ({ noIndex = false, noFollow = false } = {}) => {
  const indexValue = noIndex ? 'noindex' : 'index';
  const followValue = noFollow ? 'nofollow' : 'follow';
  return `${indexValue}, ${followValue}`;
};
