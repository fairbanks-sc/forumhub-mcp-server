/**
 * WordPress REST API client with swappable authentication.
 *
 * Supports three auth modes:
 *  1. Application Password (Basic Auth) — preferred, set WP_USERNAME + WP_APP_PASSWORD
 *  2. Cookie auth — set WP_COOKIE with your logged-in cookie string
 *  3. No auth — for publicly accessible endpoints
 *
 * The auth mode is auto-detected from environment variables at startup.
 */

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_BASE_URL, AuthMode, REQUEST_TIMEOUT } from "../constants.js";
import type { PaginationInfo } from "../types.js";

/** Result of a paginated API request */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Detects the authentication mode from environment variables.
 */
function detectAuthMode(): AuthMode {
  if (process.env.WP_USERNAME && process.env.WP_APP_PASSWORD) {
    return AuthMode.APPLICATION_PASSWORD;
  }
  if (process.env.WP_COOKIE) {
    return AuthMode.COOKIE;
  }
  return AuthMode.NONE;
}

/**
 * Builds authorization headers based on the detected auth mode.
 */
function buildAuthHeaders(mode: AuthMode): Record<string, string> {
  switch (mode) {
    case AuthMode.APPLICATION_PASSWORD: {
      const username = process.env.WP_USERNAME ?? "";
      const password = process.env.WP_APP_PASSWORD ?? "";
      const encoded = Buffer.from(`${username}:${password}`).toString("base64");
      return { Authorization: `Basic ${encoded}` };
    }
    case AuthMode.COOKIE: {
      const cookie = process.env.WP_COOKIE ?? "";
      return { Cookie: cookie };
    }
    case AuthMode.NONE:
    default:
      return {};
  }
}

/** Singleton Axios instance configured for the WP REST API */
let clientInstance: AxiosInstance | null = null;
let currentAuthMode: AuthMode | null = null;

/**
 * Returns (or creates) the configured Axios client.
 */
export function getClient(): AxiosInstance {
  const mode = detectAuthMode();

  // Recreate if auth mode changed (e.g. env vars updated at runtime)
  if (clientInstance && currentAuthMode === mode) {
    return clientInstance;
  }

  currentAuthMode = mode;
  const authHeaders = buildAuthHeaders(mode);

  clientInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      Accept: "application/json",
      ...authHeaders,
    },
  });

  return clientInstance;
}

/**
 * Returns the current auth mode for logging/diagnostics.
 */
export function getAuthMode(): AuthMode {
  return detectAuthMode();
}

/**
 * Makes a GET request to the WordPress REST API.
 */
export async function wpGet<T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T> {
  const client = getClient();
  const response = await client.get<T>(endpoint, { params });
  return response.data;
}

/**
 * Makes a paginated GET request, extracting WP pagination headers.
 */
export async function wpGetPaginated<T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<PaginatedResponse<T>> {
  const client = getClient();
  const response = await client.get<T[]>(endpoint, { params });

  const total = parseInt(response.headers["x-wp-total"] ?? "0", 10);
  const totalPages = parseInt(response.headers["x-wp-totalpages"] ?? "0", 10);
  const perPage = (params?.per_page as number) ?? 10;
  const page = (params?.page as number) ?? 1;

  return {
    data: response.data,
    pagination: {
      total,
      total_pages: totalPages,
      current_page: page,
      per_page: perPage,
      has_more: page < totalPages,
    },
  };
}

/**
 * Formats an API error into a clear, actionable message.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError;
    if (axiosErr.response) {
      switch (axiosErr.response.status) {
        case 401:
          return (
            "Error: Authentication failed. " +
            "Check your WP_USERNAME/WP_APP_PASSWORD or WP_COOKIE environment variables. " +
            `Current auth mode: ${detectAuthMode()}`
          );
        case 403:
          return "Error: Access forbidden. Your account may not have permission to view this content.";
        case 404:
          return "Error: Resource not found. Check the ID or slug and try again.";
        case 429:
          return "Error: Rate limit exceeded. Wait a moment before retrying.";
        default:
          return `Error: WordPress API returned status ${axiosErr.response.status}.`;
      }
    } else if (axiosErr.code === "ECONNABORTED") {
      return "Error: Request timed out. The WordPress server may be slow or unreachable.";
    } else if (axiosErr.code === "ENOTFOUND") {
      return "Error: Could not resolve silverchair.com. Check your network connection.";
    }
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}
