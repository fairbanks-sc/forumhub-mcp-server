/**
 * Shared constants for the Forum Hub MCP server.
 */

/** WordPress REST API base URL for silverchair.com */
export const API_BASE_URL = "https://www.silverchair.com/wp-json/wp/v2";

/** Maximum response size in characters to prevent overwhelming LLM context */
export const CHARACTER_LIMIT = 25_000;

/** Default number of items per page for list operations */
export const DEFAULT_PER_PAGE = 10;

/** Maximum items per page allowed by WordPress REST API */
export const MAX_PER_PAGE = 100;

/** Request timeout in milliseconds */
export const REQUEST_TIMEOUT = 30_000;

/** Authentication modes supported by the server */
export enum AuthMode {
  /** WordPress Application Password (Basic Auth) — preferred */
  APPLICATION_PASSWORD = "application_password",
  /** Cookie-based auth via browser session cookie */
  COOKIE = "cookie",
  /** No authentication (public API access) */
  NONE = "none",
}
