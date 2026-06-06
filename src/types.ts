export type Category = string;
export type ArticleStatus = 'draft' | 'published' | 'scheduled';
export type ContentFontSize = 'small' | 'medium' | 'large' | 'xl';
export type ContentAlignment = 'left' | 'center' | 'right' | 'justify';

export interface ContentBlockStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough?: boolean;
  fontSize: ContentFontSize;
  alignment: ContentAlignment;
}

export interface ContentBlock {
  id: string;
  type: 'paragraph';
  text: string;
  style: ContentBlockStyle;
}

export interface Author {
  id?: string;
  name: string;
  designation: string;
  role: string;
  imageUrl?: string;
  active: boolean;
  createdAt?: any;
}

export interface Article {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: ContentBlock[];
  category: Category;
  status: ArticleStatus;
  featured: boolean;
  author: string;
  authorId?: string;
  image: {
    url: string;
    credit: string;
    source?: string;
  };
  mobileImage?: {
    url: string;
    credit?: string;
    source?: string;
  };
  mobileCropX?: number;
  createdAt?: any;
  updatedAt?: any;
  readTime?: string;
  date?: string;
  publishDate?: any;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    socialImage?: string;
  };
}

export type MediaAsset = {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: any;
  credit?: string;
  usageType?: 'cover' | 'inline' | 'social';
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  title: string;
  browserTitle?: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  ctaButton: {
    text: string;
    url: string;
  };
  socialUrls: {
    facebook: string;
    instagram: string;
  };
  footerUrls: {
    [key: string]: string;
  };
  updatedAt?: any;
}

export interface Subscriber {
  id?: string;
  email: string;
  createdAt: any;
  source: string;
}

export interface HomepageConfig {
  heroArticleId: string;
  featuredArticleIds: string[]; // Exactly 6
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'writer';
}

export type FeaturedRequestStatus = 'New' | 'Contacted' | 'Closed';

export interface FeaturedRequest {
  id?: string;
  name: string;
  brand: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  industry: string;
  budget: string;
  message: string;
  status: FeaturedRequestStatus;
  createdAt: any;
}

export type VideoCategory = 
  | 'Business Leaders'
  | 'Entrepreneurs'
  | 'Sports Icons'
  | 'Fashion & Lifestyle'
  | 'Tech & Innovation'
  | 'Culture & Arts'
  | 'Exclusive Interviews';

export interface VideoInterview {
  id?: string;
  title: string;
  youtubeUrl: string;
  category: VideoCategory;
  featured: boolean;
  createdAt: any;
}
