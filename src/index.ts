#!/usr/bin/env node
/**
 * Forum Hub MCP Server
 *
 * Provides read-only access to the Silverchair Forum Hub (WordPress)
 * for the ScholarOne Manuscripts client space via the WP REST API.
 *
 * Authentication (checked in order):
 *   1. WP_USERNAME + WP_APP_PASSWORD  →  Basic Auth (preferred)
 *   2. WP_COOKIE                      →  Cookie-based auth
 *   3. Neither                        →  No auth (public endpoints only)
 *
 * Transport: stdio (for local Claude Desktop / Claude Code integration)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAuthMode } from "./services/wordpress-client.js";
import { registerPostTools } from "./tools/posts.js";
import { registerPageTools } from "./tools/pages.js";
import { registerTaxonomyTools } from "./tools/taxonomy.js";
import { registerSearchTools } from "./tools/search.js";

// Create MCP server instance
const server = new McpServer({
  name: "forumhub-mcp-server",
  version: "1.0.0",
});

// Register all tools
registerPostTools(server);
registerPageTools(server);
registerTaxonomyTools(server);
registerSearchTools(server);

// Start the server
async function main(): Promise<void> {
  const authMode = getAuthMode();
  console.error(`[forumhub-mcp] Starting with auth mode: ${authMode}`);
  console.error(`[forumhub-mcp] Tools registered: forumhub_list_posts, forumhub_get_post, forumhub_search_posts, forumhub_list_pages, forumhub_get_page, forumhub_list_categories, forumhub_list_tags, forumhub_search_content`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[forumhub-mcp] Server running via stdio");
}

main().catch((error) => {
  console.error("[forumhub-mcp] Fatal error:", error);
  process.exit(1);
});
