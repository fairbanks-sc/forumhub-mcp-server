/**
 * Post-related tools for the Forum Hub MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListPostsSchema,
  GetPostSchema,
  SearchPostsSchema,
  type ListPostsInput,
  type GetPostInput,
  type SearchPostsInput,
} from "../schemas/index.js";
import { wpGet, wpGetPaginated, handleApiError } from "../services/wordpress-client.js";
import {
  postToMarkdown,
  truncateIfNeeded,
  stripHtml,
  formatDate,
} from "../services/formatters.js";
import type { WPPost } from "../types.js";

export function registerPostTools(server: McpServer): void {
  // ─── List Posts ──────────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_list_posts",
    {
      title: "List Forum Hub Posts",
      description: `List recent posts from the Silverchair Forum Hub with optional filtering by category, tag, and date range.

Returns a paginated list of posts with titles, dates, excerpts, and links. Use category/tag IDs from forumhub_list_categories and forumhub_list_tags to filter.

Args:
  - per_page: Number of results per page (1–100, default 10)
  - page: Page number (default 1)
  - category: Filter by category ID (optional)
  - tag: Filter by tag ID (optional)
  - after: ISO 8601 date — only posts after this date (optional)
  - before: ISO 8601 date — only posts before this date (optional)
  - order: 'desc' (newest first) or 'asc' (oldest first)
  - orderby: Sort field (date, relevance, id, title, slug, modified)

Returns: Markdown-formatted list of posts with pagination info.`,
      inputSchema: ListPostsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListPostsInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          per_page: params.per_page,
          page: params.page,
          order: params.order,
          orderby: params.orderby,
          _fields: "id,date,title,excerpt,link,categories,tags",
        };
        if (params.category !== undefined) queryParams.categories = params.category;
        if (params.tag !== undefined) queryParams.tags = params.tag;
        if (params.after) queryParams.after = params.after;
        if (params.before) queryParams.before = params.before;

        const { data: posts, pagination } = await wpGetPaginated<WPPost>(
          "/posts",
          queryParams
        );

        if (!posts.length) {
          return {
            content: [{ type: "text" as const, text: "No posts found matching your filters." }],
          };
        }

        const lines: string[] = [
          `# Forum Hub Posts (page ${pagination.current_page} of ${pagination.total_pages}, ${pagination.total} total)`,
          "",
        ];

        for (const post of posts) {
          lines.push(postToMarkdown(post, false));
        }

        if (pagination.has_more) {
          lines.push(
            `---`,
            `*More results available. Request page ${pagination.current_page + 1} to see the next set.*`
          );
        }

        const { text } = truncateIfNeeded(lines.join("\n"));
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Get Post ────────────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_get_post",
    {
      title: "Get Forum Hub Post",
      description: `Retrieve the full content of a single Forum Hub post by its ID.

Returns the complete post including title, full text content (HTML stripped to plain text), publish date, categories, tags, and link.

Args:
  - id: The WordPress post ID (e.g. 8828)

Returns: Full post content in markdown format.`,
      inputSchema: GetPostSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetPostInput) => {
      try {
        const post = await wpGet<WPPost>(`/posts/${params.id}`);

        const title = stripHtml(post.title.rendered);
        const date = formatDate(post.date);
        const content = stripHtml(post.content.rendered);

        const markdown = [
          `# ${title}`,
          `**Published:** ${date} | **ID:** ${post.id}`,
          `**Link:** ${post.link}`,
          `**Categories:** ${post.categories.join(", ")} | **Tags:** ${post.tags.join(", ")}`,
          "",
          content,
        ].join("\n");

        const { text } = truncateIfNeeded(markdown);
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Search Posts ────────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_search_posts",
    {
      title: "Search Forum Hub Posts",
      description: `Full-text search across Forum Hub posts by keyword.

Searches post titles and content for the given query string. Results are ranked by relevance. Optionally narrow results to a specific category or tag.

Args:
  - query: Search string (min 2 chars)
  - per_page: Results per page (1–100, default 10)
  - page: Page number (default 1)
  - category: Filter by category ID (optional)
  - tag: Filter by tag ID (optional)

Returns: Markdown-formatted search results with relevance ranking.`,
      inputSchema: SearchPostsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: SearchPostsInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          search: params.query,
          per_page: params.per_page,
          page: params.page,
          orderby: "relevance",
          _fields: "id,date,title,excerpt,link,categories,tags",
        };
        if (params.category !== undefined) queryParams.categories = params.category;
        if (params.tag !== undefined) queryParams.tags = params.tag;

        const { data: posts, pagination } = await wpGetPaginated<WPPost>(
          "/posts",
          queryParams
        );

        if (!posts.length) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No posts found matching "${params.query}". Try a broader search term.`,
              },
            ],
          };
        }

        const lines: string[] = [
          `# Search Results for "${params.query}" (${pagination.total} found)`,
          "",
        ];

        for (const post of posts) {
          lines.push(postToMarkdown(post, false));
        }

        if (pagination.has_more) {
          lines.push(
            `---`,
            `*More results available. Request page ${pagination.current_page + 1} to see the next set.*`
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
