# Forum Hub MCP Server

MCP server that gives Claude read-only access to both the **Silverchair Platform Forum Hub** and the **ScholarOne Manuscripts Forum Hub** via the WordPress REST API. Claude can search posts, browse pages, pull release notes, and retrieve client-facing documentation directly from the Forum Hub.

## Quick Setup

**Prerequisites:** Node.js 18+ and Git must be installed on your machine.

### Option 1: Let Claude Do It (Recommended)

Open Claude Desktop and paste this prompt:

```
I need you to add the ForumHub MCP server to my Claude Desktop config. Here's what to do:

1. Open my Claude Desktop config file at %APPDATA%\Claude\claude_desktop_config.json
2. Back it up first (copy to claude_desktop_config.json.bak in the same folder)
3. Add this entry inside the "mcpServers" object:

"forumhub": {
  "command": "npx",
  "args": ["-y", "github:fairbanks-sc/forumhub-mcp-server"],
  "env": {
    "WP_USERNAME": "silverchair.user",
    "WP_APP_PASSWORD": "vZuU bIDD vIRw MYRz zAuP wvID"
  }
}

Important rules:
- Do NOT use PowerShell's ConvertFrom-Json/ConvertTo-Json to edit the file — it corrupts the encoding
- Edit the raw JSON text directly (read as string, make targeted edit, write back)
- Make sure there's a comma between this entry and any existing entries
- After writing, validate the JSON parses correctly before confirming

Then tell me to restart Claude Desktop.
```

After pasting that prompt, Claude will handle the config edit for you. Restart Claude Desktop when it tells you to, and you're done.

### Option 2: Manual Setup

1. Press `Win+R`, type `%APPDATA%\Claude`, and hit Enter
2. Copy `claude_desktop_config.json` to `claude_desktop_config.json.bak` (backup!)
3. Open `claude_desktop_config.json` in Notepad or VS Code
4. Add this inside the `"mcpServers"` object (don't forget a comma after the previous entry):

```json
"forumhub": {
  "command": "npx",
  "args": ["-y", "github:fairbanks-sc/forumhub-mcp-server"],
  "env": {
    "WP_USERNAME": "silverchair.user",
    "WP_APP_PASSWORD": "vZuU bIDD vIRw MYRz zAuP wvID"
  }
}
```

5. Save, fully quit Claude Desktop (system tray > Quit or Ctrl+Q), and reopen it

### Verify It Works

Ask Claude:
> "List the latest 5 posts from the Forum Hub"

If you see results, you're all set.

## What You Get

Once connected, Claude has 8 tools for querying the Forum Hub:

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
| "npm ERR! Could not resolve" | You need Git installed and GitHub access configured. Run `git ls-remote https://github.com/fairbanks-sc/forumhub-mcp-server` to test. |

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

## Questions?

Reach out to John Fairbanks (jfairbanks@silverchair.com) for GitHub repo access or any setup issues.
