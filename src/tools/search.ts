/**
 * Cross-content search tool for the Forum Hub MCP server.
 *
 * Uses the WordPress /search endpoint to find content across all types.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchContentSchema, type SearchContentInput } from "../schemas/index.js";
import { wpGetPaginated, handleApiError } from "../services/wordpress-client.js";
import { stripHtml, truncateIfNeeded } from "../services/formatters.js";

/** WordPress search result item */
interface WPSearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
  _embedded?: {
    self?: Array<{
      excerpt?: { rendered: string };
      date?: string;
    }>;
  };
}

export function registerSearchTools(server: McpServer): void {
  server.registerTool(
    "forumhub_search_content",
    {
      title: "Search All Forum Hub Content",
      description: `Search across all Forum Hub content types (posts and pages) using WordPress native search.

This is the broadest search tool — it searches posts, pages, and any other public content types. Use this when you don't know whether the information you need is in a post or a page.

For post-specific search with category/tag filtering, use forumhub_search_posts instead.

Args:
  - query: Search string (min 2 chars)
  - per_page: Results per page (1–100, default 10)
  - page: Page number (default 1)
  - subtype: Limit to 'post', 'page', or 'any' (optional, searches all if omitted)

Returns: Search results with titles, types, URLs, and excerpts.`,
      inputSchema: SearchContentSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: SearchContentInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          search: params.query,
          per_page: params.per_page,
          page: params.page,
          _embed: true,
        };
        if (params.subtype) queryParams.subtype = params.subtype;

        const { data: results, pagination } = await wpGetPaginated<WPSearchResult>(
          "/search",
          queryParams
        );

        if (!results.length) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No content found matching "${params.query}". Try different keywords or a broader search.`,
              },
            ],
          };
        }

        const lines: string[] = [
          `# Search Results for "${params.query}" (${pagination.total} found)`,
          "",
        ];

        for (const result of results) {
          const title = stripHtml(result.title);
          const typeLabel = result.subtype === "page" ? "Page" : "Post";
          const excerpt =
            result._embedded?.self?.[0]?.excerpt?.rendered
              ? stripHtml(result._embedded.self[0].excerpt.rendered)
              : "";

          lines.push(`## ${title}`);
          lines.push(
            `**Type:** ${typeLabel} | **ID:** ${result.id} | [View](${result.url})`
          );
          if (excerpt) lines.push(excerpt);
          lines.push("");
        }

        if (pagination.has_more) {
          lines.push(
            `---`,
            `*More results available. Request page ${pagination.current_page + 1}.*`
          );
        }

        const { text } = truncateIfNeeded(lines.join("\n"));
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
