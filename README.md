# Forum Hub MCP Server

MCP server that gives Claude read-only access to both the **Silverchair Platform Forum Hub** and the **ScholarOne Manuscripts Forum Hub** via the WordPress REST API. This allows Claude to search posts, browse pages, pull release notes, and retrieve client-facing documentation directly from the Forum Hub.

## What This Does

Once connected, Claude gets 8 tools for querying the Forum Hub:

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

Both Forum Hubs live on the same WordPress instance. You distinguish between them by filtering on parent pages or categories:

- **Silverchair Platform Forum Hub** — Parent page ID `3399` (`/clients/`)
- **ScholarOne Forum Hub** — Content under category ID `288` and pages under `/s1m-clients/`

## Prerequisites

- **Node.js 18+** installed on your machine
- **Git** installed
- **Claude Desktop** (Cowork or Chat mode)
- **WordPress Application Password** — contact Steph Lovegrove Hansen to get credentials for the `silverchair.user` account. She'll provide a username and an application password (a string of 6 space-separated 4-character groups like `xxxx xxxx xxxx xxxx xxxx xxxx`).

## Setup (Step by Step)

### 1. Clone the repo

```powershell
cd "C:\Users\YOUR_USERNAME\claude code"
git clone https://github.com/fairbanks-sc/forumhub-mcp-server.git
cd forumhub-mcp-server
```

> **Note:** If you get a "dubious ownership" error from Git, run:
> ```powershell
> git config --global --add safe.directory 'C:/Users/YOUR_USERNAME/claude code/forumhub-mcp-server'
> ```

### 2. Install dependencies and build

```powershell
npm install
npm run build
```

This compiles the TypeScript source into `dist/index.js`, which is what Claude Desktop runs.

### 3. Find your Claude Desktop config file

The config file is at:
```
C:\Users\YOUR_USERNAME\AppData\Roaming\Claude\claude_desktop_config.json
```

You can open this folder quickly by pressing `Win+R` and typing:
```
%APPDATA%\Claude
```

### 4. Back up your config (important!)

Before editing, **always** make a copy:
```powershell
copy claude_desktop_config.json claude_desktop_config.json.bak
```

### 5. Add the forumhub server to your config

Open `claude_desktop_config.json` in a text editor (Notepad, VS Code, etc.) and add the `forumhub` entry inside the `"mcpServers"` object. Here's what the entry should look like:

```json
"forumhub": {
  "command": "node",
  "args": [
    "C:\\Users\\YOUR_USERNAME\\claude code\\forumhub-mcp-server\\dist\\index.js"
  ],
  "env": {
    "WP_USERNAME": "silverchair.user",
    "WP_APP_PASSWORD": "YOUR_APP_PASSWORD_FROM_STEPH"
  }
}
```

**Important:**
- Replace `YOUR_USERNAME` with your actual Windows username
- Replace `YOUR_APP_PASSWORD_FROM_STEPH` with the application password Steph provided
- Make sure you add a comma after the previous server entry if there are other servers already in the config
- The backslashes in the path must be doubled (`\\`) since this is JSON

**Example** — if your config already has other MCP servers, it might look like:
```json
{
  "mcpServers": {
    "confluence": { ... },
    "jira": { ... },
    "forumhub": {
      "command": "node",
      "args": [
        "C:\\Users\\jdoe\\claude code\\forumhub-mcp-server\\dist\\index.js"
      ],
      "env": {
        "WP_USERNAME": "silverchair.user",
        "WP_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

### 6. Restart Claude Desktop

Fully quit Claude Desktop (system tray → Quit, or Ctrl+Q) and reopen it. The forumhub tools will appear in your connector list.

### 7. Verify it works

In any Claude conversation, try asking:
> "List the latest 5 posts from the Forum Hub"

or:
> "Search the Forum Hub for 'release notes'"

If you see results, you're good to go.

## Troubleshooting

**"Could not load app settings" error on Claude Desktop launch:**
Your config JSON is malformed. Restore from backup (`claude_desktop_config.json.bak`) and try the edit again. Common issues: missing comma between server entries, unescaped backslashes in paths, or a trailing comma after the last entry.

> **Warning:** Do NOT use PowerShell's `ConvertFrom-Json | ConvertTo-Json` to edit the config file. PowerShell's JSON serialization introduces encoding issues that will corrupt the file. Always edit the raw text directly.

**401 Authentication errors:**
Check that `WP_USERNAME` and `WP_APP_PASSWORD` are correct in your config. The application password should include the spaces between groups.

**Server not appearing in Claude Desktop:**
Make sure the path in `args` points to the correct location of `dist/index.js` on your machine. The path must use double backslashes in JSON.

**Tools return empty results:**
The Forum Hub content is password-protected. Without valid credentials, you'll only see public content. Confirm your application password with Steph.

## Authentication Modes

The server auto-detects which auth to use based on environment variables:

| Priority | Env Vars | Auth Method |
|----------|----------|-------------|
| 1 (preferred) | `WP_USERNAME` + `WP_APP_PASSWORD` | Basic Auth (Application Password) |
| 2 (temporary) | `WP_COOKIE` | Cookie-based auth (expires) |
| 3 (fallback) | Neither set | No auth (public content only) |

Application Passwords are strongly preferred because they don't expire. Cookie auth requires manually updating the cookie value every time your WordPress session expires.

## Key Content IDs for Reference

These IDs are useful for filtering queries:

### Forum Hub Parent Pages
- **Silverchair Platform Forum Hub** — Page ID `3399` (parent of all platform client pages)
- **ScholarOne Forum Hub** — Pages under `/s1m-clients/` path

### Useful Categories
- **ScholarOne** — Category ID `288` (31 posts about S1M product updates, roadmap, etc.)
- **Clients** — Category ID `88` (129 posts, general client-facing content)
- **News** — Category ID `10` (173 posts, company and product news)
- **Accessibility** — Category ID `67` (17 posts)

### Useful Tags
- **community** — Tag ID `76` (63 posts)
- **clients** — Tag ID `104` (57 posts)
- **events** — Tag ID `75` (37 posts)
- **accessibility** — Tag ID `84` (17 posts)
- **Platform Strategies** — Tag ID `72` (24 posts)

## Development

```bash
npm run dev    # Watch mode with auto-reload (requires tsx)
npm run build  # Compile TypeScript to dist/
npm start      # Run the compiled server
```

## Questions?

Reach out to John Fairbanks (jfairbanks@silverchair.com) for repo access, or Steph Lovegrove Hansen for WordPress Application Password credentials.
