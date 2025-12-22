export const getSiteBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://pardistous.ir';
};

export const buildCanonicalUrl = (path = '/') => {
  const baseUrl = getSiteBaseUrl();
  try {
    return new URL(path, baseUrl).toString();
  } catch (error) {
    return `${baseUrl}${path}`;
  }
};

export const stripHtml = (value = '') =>
  value
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

export const createBreadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.item
  }))
});

export const createOrganizationSchema = (baseUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'آکادمی پردیس توس',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  sameAs: [
    'https://www.instagram.com/pardis_academy',
    'https://www.linkedin.com/company/pardis-academy'
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+98-21-12345678',
      contactType: 'customer service',
      areaServed: 'IR',
      availableLanguage: 'fa'
    }
  ]
});

export const createWebSiteSchema = (baseUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'آکادمی پردیس توس',
  url: baseUrl,
  inLanguage: 'fa-IR',
  publisher: {
    '@type': 'Organization',
    name: 'آکادمی پردیس توس',
    url: baseUrl
  }
});

export const createFaqSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const createItemListSchema = ({ name, description, items = [] }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  description,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: item.url,
    name: item.name
  }))
});

export const createCourseSchema = ({
  baseUrl,
  courseUrl,
  title,
  description,
  instructorName,
  price,
  categoryTitle,
  imageUrl
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: title,
  description,
  inLanguage: 'fa-IR',
  url: courseUrl,
  provider: {
    '@type': 'Organization',
    name: 'آکادمی پردیس توس',
    url: baseUrl
  },
  instructor: {
    '@type': 'Person',
    name: instructorName
  },
  image: imageUrl,
  offers: {
    '@type': 'Offer',
    category: categoryTitle,
    price: price ?? 0,
    priceCurrency: 'IRR',
    availability: 'https://schema.org/InStock',
    url: courseUrl || baseUrl
  }
});
