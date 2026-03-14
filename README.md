# Forum Hub MCP Server

MCP server that gives Claude read-only access to both the **Silverchair Platform Forum Hub** and the **ScholarOne Manuscripts Forum Hub** via the WordPress REST API. Claude can search posts, browse pages, pull release notes, and retrieve client-facing documentation directly from the Forum Hub.

## Quick Setup

> **Silverchair colleagues:** Head to the [Confluence setup guide](https://confluence.silverchair.com/spaces/~jfairbanks/pages/472325618) for the fastest path — it has a copy-paste prompt that does everything for you.

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org) if not already installed
- **Claude Desktop** (Cowork or Chat mode)
- **WordPress Application Password** — credentials are on the [Confluence setup guide](https://confluence.silverchair.com/spaces/~jfairbanks/pages/472325618)

### Add to Claude Desktop

Add this entry inside the `"mcpServers"` object in your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
"forumhub": {
  "command": "npx",
  "args": ["-y", "github:fairbanks-sc/forumhub-mcp-server"],
  "env": {
    "WP_USERNAME": "YOUR_WP_USERNAME",
    "WP_APP_PASSWORD": "YOUR_WP_APP_PASSWORD"
  }
}
```

Replace `YOUR_WP_USERNAME` and `YOUR_WP_APP_PASSWORD` with the credentials from the Confluence guide.

Restart Claude Desktop (system tray > Quit or Ctrl+Q, then reopen).

### Verify It Works

Ask Claude:
> "List the latest 5 posts from the Forum Hub"

If you see results, you're all set.

## What You Get

Once connected, Claude has 8 read-only tools for querying Forum Hub content:

| Tool | What It Does |
|------|-------------|
| `forumhub_list_posts` | List recent posts with category/tag/date filtering |
| `forumhub_get_post` | Get full content of a single post by ID |
| `forumhub_search_posts` | Full-text search across posts with category/tag filtering |
| `forumhub_list_pages` | List static pages (docs, resources, release notes, etc.) |
| `forumhub_get_page` | Get full content of a single page by ID |
| `forumhub_list_categories` | List all content categories and their IDs |
| `forumhub_list_tags` | List all content tags and their IDs |
| `forumhub_search_content` | Search across all content types (posts + pages) |

## Two Forum Hubs, One Server

Both Forum Hubs live on the same WordPress instance. Filter between them using parent pages or categories:

- **Silverchair Platform Forum Hub** — Parent page ID `3399` (`/clients/`)
- **ScholarOne Forum Hub** — Content under category ID `288` and pages under `/s1m-clients/`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Could not load app settings" on Claude launch | Your config JSON is malformed. Restore from `.bak` backup and try again. Common issues: missing comma, unescaped backslashes, trailing comma. **Never use PowerShell's ConvertTo-Json** — it corrupts the file. |
| 401 Authentication errors | Check that `WP_USERNAME` and `WP_APP_PASSWORD` are correct. The password includes the spaces between groups. |
| Server not appearing in Claude | Make sure you restarted Claude Desktop completely (Quit from system tray, not just close the window). |
| npx hangs or times out | Check your internet connection. npx needs to pull the package from GitHub on first run. If behind a VPN, try disconnecting temporarily. |

## Key Content IDs

### Useful Categories
| Category | ID | Posts |
|----------|----|-------|
| ScholarOne | 288 | 31 |
| Clients | 88 | 129 |
| News | 10 | 173 |
| Accessibility | 67 | 17 |

### Useful Tags
| Tag | ID | Posts |
|-----|----|-------|
| community | 76 | 63 |
| clients | 104 | 57 |
| events | 75 | 37 |
| accessibility | 84 | 17 |
| Platform Strategies | 72 | 24 |

## Development

```bash
git clone https://github.com/fairbanks-sc/forumhub-mcp-server.git
cd forumhub-mcp-server
npm install
npm run dev    # Watch mode with auto-reload
npm run build  # Compile TypeScript to dist/
npm start      # Run the compiled server
```

## Questions?

Reach out to John Fairbanks (jfairbanks@silverchair.com) for any setup issues.
