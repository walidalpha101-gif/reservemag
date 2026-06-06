import { Article, SiteSettings, ContentBlock, Subscriber } from '../types';

export const ARTICLE_DEFAULTS: Article = {
  slug: '',
  title: 'Untitled Narrative',
  subtitle: '',
  excerpt: '',
  content: [],
  category: 'Culture',
  status: 'draft',
  featured: false,
  author: 'The Reserve Editorial',
  image: {
    url: '',
    credit: '',
    source: ''
  },
  mobileImage: {
    url: '',
    credit: '',
    source: ''
  },
  mobileCropX: 50,
  readTime: '5 min',
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  publishDate: new Date().toISOString()
};

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  title: 'THE RESERVE',
  browserTitle: 'THE RESERVE | Asia\'s Quiet Renaissance',
  faviconUrl: '/favicon.ico',
  description: 'The definitive platform for the visionaries of tomorrow.',
  logoUrl: '',
  ctaButton: {
    text: 'Get Featured',
    url: '/get-featured'
  },
  socialUrls: {
    facebook: '',
    instagram: ''
  },
  footerUrls: {
    'Navigation': '/',
    'Digital Archive': '/archive',
    'Editorial Policy': '/editorial-policy',
    'Private Ledger': '/admin',
    'Editorial Board': '/editorial-board',
    'Advertising': '/advertising',
    'Legal': '/legal'
  }
};

export const normalizeArticle = (data: any): Article => {
  return {
    ...ARTICLE_DEFAULTS,
    ...data,
    id: data.id,
    content: Array.isArray(data.content) ? data.content : [],
    image: {
      ...ARTICLE_DEFAULTS.image,
      ...(data.image || {})
    },
    mobileImage: {
      ...ARTICLE_DEFAULTS.mobileImage,
      ...(data.mobileImage || {})
    },
    mobileCropX: typeof data.mobileCropX === 'number' ? data.mobileCropX : 50,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

export const normalizeSettings = (data: any): SiteSettings => {
  return {
    ...SITE_SETTINGS_DEFAULTS,
    ...data,
    browserTitle: data.browserTitle || data.title || SITE_SETTINGS_DEFAULTS.browserTitle,
    faviconUrl: data.faviconUrl || SITE_SETTINGS_DEFAULTS.faviconUrl,
    ctaButton: {
      ...SITE_SETTINGS_DEFAULTS.ctaButton,
      ...(data.ctaButton || {})
    },
    socialUrls: {
      ...SITE_SETTINGS_DEFAULTS.socialUrls,
      ...(data.socialUrls || {})
    },
    footerUrls: {
      ...SITE_SETTINGS_DEFAULTS.footerUrls,
      ...(data.footerUrls || {})
    }
  };
};

export const sanitizeForFirestore = (data: any): any => {
  const result: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value === undefined) return;
    if (value === null) {
      result[key] = null;
      return;
    }
    if (Array.isArray(value)) {
      result[key] = value.map(item => (typeof item === 'object' && item !== null) ? sanitizeForFirestore(item) : item);
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      if (value.toDate) {
        result[key] = value;
      } else {
        result[key] = sanitizeForFirestore(value);
      }
    } else {
      result[key] = value;
    }
  });
  return result;
};
