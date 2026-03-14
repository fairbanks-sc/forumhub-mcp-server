/**
 * Page-related tools for the Forum Hub MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListPagesSchema,
  GetPageSchema,
  type ListPagesInput,
  type GetPageInput,
} from "../schemas/index.js";
import { wpGet, wpGetPaginated, handleApiError } from "../services/wordpress-client.js";
import {
  pageToMarkdown,
  truncateIfNeeded,
  stripHtml,
  formatDate,
} from "../services/formatters.js";
import type { WPPage } from "../types.js";

export function registerPageTools(server: McpServer): void {
  // ─── List Pages ──────────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_list_pages",
    {
      title: "List Forum Hub Pages",
      description: `List WordPress pages from the Forum Hub. Pages are static content like the Accessibility Resources page, client documentation landing pages, and similar non-blog content.

Args:
  - per_page: Number of results per page (1–100, default 10)
  - page: Page number (default 1)
  - parent: Filter by parent page ID to find child/sub-pages (optional)
  - order: 'asc' or 'desc' (default asc)
  - orderby: Sort field (date, id, title, slug, modified, menu_order)

Returns: Markdown-formatted list of pages.`,
      inputSchema: ListPagesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListPagesInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          per_page: params.per_page,
          page: params.page,
          order: params.order,
          orderby: params.orderby,
          _fields: "id,date,title,excerpt,link,parent",
        };
        if (params.parent !== undefined) queryParams.parent = params.parent;

        const { data: pages, pagination } = await wpGetPaginated<WPPage>(
          "/pages",
          queryParams
        );

        if (!pages.length) {
          return {
            content: [{ type: "text" as const, text: "No pages found matching your filters." }],
          };
        }

        const lines: string[] = [
          `# Forum Hub Pages (page ${pagination.current_page} of ${pagination.total_pages}, ${pagination.total} total)`,
          "",
        ];

        for (const pg of pages) {
          lines.push(pageToMarkdown(pg, false));
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

  // ─── Get Page ────────────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_get_page",
    {
      title: "Get Forum Hub Page",
      description: `Retrieve the full content of a single Forum Hub page by its ID.

Pages are static content (not blog posts). Use forumhub_list_pages to discover available pages and their IDs.

Args:
  - id: The WordPress page ID

Returns: Full page content in markdown format.`,
      inputSchema: GetPageSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetPageInput) => {
      try {
        const pg = await wpGet<WPPage>(`/pages/${params.id}`);

        const title = stripHtml(pg.title.rendered);
        const date = formatDate(pg.date);
        const content = stripHtml(pg.content.rendered);

        const markdown = [
          `# ${title}`,
          `**Last updated:** ${formatDate(pg.modified)} | **ID:** ${pg.id}`,
          `**Link:** ${pg.link}`,
          pg.parent ? `**Parent page ID:** ${pg.parent}` : "",
          "",
          content,
        ]
          .filter(Boolean)
          .join("\n");

        const { text } = truncateIfNeeded(markdown);
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
