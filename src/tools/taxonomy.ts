/**
 * Category and tag tools for the Forum Hub MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListCategoriesSchema,
  ListTagsSchema,
  type ListCategoriesInput,
  type ListTagsInput,
} from "../schemas/index.js";
import { wpGetPaginated, handleApiError } from "../services/wordpress-client.js";
import { categoryToMarkdown, tagToMarkdown } from "../services/formatters.js";
import type { WPCategory, WPTag } from "../types.js";

export function registerTaxonomyTools(server: McpServer): void {
  // ─── List Categories ─────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_list_categories",
    {
      title: "List Forum Hub Categories",
      description: `List all post categories available on the Forum Hub.

Use category IDs from this tool to filter posts in forumhub_list_posts and forumhub_search_posts. Categories organize content into topics like "Accessibility", "Clients", "Events", etc.

Args:
  - per_page: Number of results per page (default 100)
  - page: Page number (default 1)
  - hide_empty: If true, hide categories with no posts (default true)

Returns: List of categories with names, IDs, and post counts.`,
      inputSchema: ListCategoriesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListCategoriesInput) => {
      try {
        const { data: categories, pagination } = await wpGetPaginated<WPCategory>("/categories", {
          per_page: params.per_page,
          page: params.page,
          hide_empty: params.hide_empty,
          _fields: "id,name,slug,count,description,parent",
        });

        if (!categories.length) {
          return {
            content: [{ type: "text" as const, text: "No categories found." }],
          };
        }

        const lines: string[] = [
          `# Forum Hub Categories (page ${pagination.current_page} of ${pagination.total_pages}, ${pagination.total} total)`,
          "",
          ...categories.map(categoryToMarkdown),
        ];

        if (pagination.has_more) {
          lines.push("", `---`, `*More categories available. Request page ${pagination.current_page + 1}.*`);
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── List Tags ───────────────────────────────────────────────────────────

  server.registerTool(
    "forumhub_list_tags",
    {
      title: "List Forum Hub Tags",
      description: `List all post tags available on the Forum Hub.

Use tag IDs from this tool to filter posts in forumhub_list_posts and forumhub_search_posts. Tags provide finer-grained labels like "accessibility", "news", "improvements", etc.

Args:
  - per_page: Number of results per page (default 100)
  - page: Page number (default 1)
  - hide_empty: If true, hide tags with no posts (default true)

Returns: List of tags with names, IDs, and post counts.`,
      inputSchema: ListTagsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListTagsInput) => {
      try {
        const { data: tags, pagination } = await wpGetPaginated<WPTag>("/tags", {
          per_page: params.per_page,
          page: params.page,
          hide_empty: params.hide_empty,
          _fields: "id,name,slug,count,description",
        });

        if (!tags.length) {
          return {
            content: [{ type: "text" as const, text: "No tags found." }],
          };
        }

        const lines: string[] = [
          `# Forum Hub Tags (page ${pagination.current_page} of ${pagination.total_pages}, ${pagination.total} total)`,
          "",
          ...tags.map(tagToMarkdown),
        ];

        if (pagination.has_more) {
          lines.push("", `---`, `*More tags available. Request page ${pagination.current_page + 1}.*`);
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
