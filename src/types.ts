/**
 * TypeScript type definitions for WordPress REST API responses.
 */

/** WordPress post object (simplified) */
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
}

/** WordPress page object (simplified) */
export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  parent: number;
}

/** WordPress category object */
export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  parent: number;
}

/** WordPress tag object */
export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
}

/** Pagination metadata returned with list responses */
export interface PaginationInfo {
  total: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  has_more: boolean;
}
