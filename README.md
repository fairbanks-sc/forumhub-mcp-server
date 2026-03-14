# Forum Hub MCP Server

MCP server for read-only access to the Silverchair Forum Hub (WordPress REST API) — specifically the ScholarOne Manuscripts client space.

## Tools

| Tool | Description |
|------|-------------|
| `forumhub_list_posts` | List recent posts with category/tag/date filtering |
| `forumhub_get_post` | Get full content of a single post by ID |
| `forumhub_search_posts` | Full-text search across posts |
| `forumhub_list_pages` | List static pages (docs, resources, etc.) |
| `forumhub_get_page` | Get full content of a single page by ID |
| `forumhub_list_categories` | List all content categories and their IDs |
| `forumhub_list_tags` | List all content tags and their IDs |
| `forumhub_search_content` | Search across all content types (posts + pages) |

## Authentication

The server supports three auth modes, auto-detected from environment variables:

### Option 1: Application Password (Preferred)
```bash
export WP_USERNAME="your-wp-username"
export WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
```
Generate an Application Password in WordPress: Profile → Application Passwords → Add New.

### Option 2: Cookie Auth (Temporary)
```bash
export WP_COOKIE="wordpress_logged_in_abc123=your-cookie-value"
```
Copy your logged-in cookie from browser DevTools → Application → Cookies.

### Option 3: No Auth
If neither is set, the server attempts unauthenticated requests (public endpoints only).

## Setup

```bash
npm install
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "forumhub": {
      "command": "node",
      "args": ["/path/to/forumhub-mcp-server/dist/index.js"],
      "env": {
        "WP_USERNAME": "your-username",
        "WP_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

## Usage with Claude Code

```bash
claude mcp add forumhub -- node /path/to/forumhub-mcp-server/dist/index.js
```

Then set environment variables before running Claude Code.

## Development

```bash
npm run dev    # Watch mode with auto-reload
npm run build  # Compile TypeScript
npm start      # Run compiled server
```
