/**
 * Zod validation schemas for all Forum Hub MCP tools.
 */

import { z } from "zod";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "../constants.js";

// ─── Shared pagination schema ────────────────────────────────────────────────

const PaginationFields = {
  per_page: z
    .number()
    .int()
    .min(1)
    .max(MAX_PER_PAGE)
    .default(DEFAULT_PER_PAGE)
    .describe("Number of results per page (1–100, default 10)"),
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination (default 1)"),
};

// ─── Posts ───────────────────────────────────────────────────────────────────

export const ListPostsSchema = z
  .object({
    ...PaginationFields,
    category: z
      .number()
      .int()
      .optional()
      .describe("Filter by category ID. Use forumhub_list_categories to find IDs."),
    tag: z
      .number()
      .int()
      .optional()
      .describe("Filter by tag ID. Use forumhub_list_tags to find IDs."),
    after: z
      .string()
      .optional()
      .describe("Return posts published after this ISO 8601 date (e.g. 2026-01-01T00:00:00)"),
    before: z
      .string()
      .optional()
      .describe("Return posts published before this ISO 8601 date"),
    order: z
      .enum(["asc", "desc"])
      .default("desc")
      .describe("Sort order: 'desc' (newest first) or 'asc' (oldest first)"),
    orderby: z
      .enum(["date", "relevance", "id", "title", "slug", "modified"])
      .default("date")
      .describe("Field to sort by (default: date)"),
  })
  .strict();

export type ListPostsInput = z.infer<typeof ListPostsSchema>;

export const GetPostSchema = z
  .object({
    id: z.number().int().positive().describe("The WordPress post ID"),
  })
  .strict();

export type GetPostInput = z.infer<typeof GetPostSchema>;

export const SearchPostsSchema = z
  .object({
    query: z
      .string()
      .min(2, "Search query must be at least 2 characters")
      .max(200)
      .describe("Search string to match against post titles and content"),
    ...PaginationFields,
    category: z
      .number()
      .int()
      .optional()
      .describe("Narrow search to a specific category ID"),
    tag: z
      .number()
      .int()
      .optional()
      .describe("Narrow search to a specific tag ID"),
  })
  .strict();

export type SearchPostsInput = z.infer<typeof SearchPostsSchema>;

// ─── Pages ───────────────────────────────────────────────────────────────────

export const ListPagesSchema = z
  .object({
    ...PaginationFields,
    parent: z
      .number()
      .int()
      .optional()
      .describe("Filter by parent page ID (for child pages)"),
    order: z
      .enum(["asc", "desc"])
      .default("asc")
      .describe("Sort order"),
    orderby: z
      .enum(["date", "id", "title", "slug", "modified", "menu_order"])
      .default("menu_order")
      .describe("Field to sort by (default: menu_order)"),
  })
  .strict();

export type ListPagesInput = z.infer<typeof ListPagesSchema>;

export const GetPageSchema = z
  .object({
    id: z.number().int().positive().describe("The WordPress page ID"),
  })
  .strict();

export type GetPageInput = z.infer<typeof GetPageSchema>;

// ─── Categories ──────────────────────────────────────────────────────────────

export const ListCategoriesSchema = z
  .object({
    ...PaginationFields,
    per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(100).describe("Number of results per page (default 100)"),
    hide_empty: z.boolean().default(true).describe("If true, hide categories with no posts"),
  })
  .strict();

export type ListCategoriesInput = z.infer<typeof ListCategoriesSchema>;

// ─── Tags ────────────────────────────────────────────────────────────────────

export const ListTagsSchema = z
  .object({
    ...PaginationFields,
    per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(100).describe("Number of results per page (default 100)"),
    hide_empty: z.boolean().default(true).describe("If true, hide tags with no posts"),
  })
  .strict();

export type ListTagsInput = z.infer<typeof ListTagsSchema>;

// ─── Search ──────────────────────────────────────────────────────────────────

export const SearchContentSchema = z
  .object({
    query: z
      .string()
      .min(2)
      .max(200)
      .describe("Search string to find across all Forum Hub content (posts, pages, etc.)"),
    ...PaginationFields,
    subtype: z
      .enum(["post", "page", "any"])
      .optional()
      .describe("Limit search to a specific content subtype: 'post', 'page', or 'any' (default: searches all)"),
  })
  .strict();

export type SearchContentInput = z.infer<typeof SearchContentSchema>;
