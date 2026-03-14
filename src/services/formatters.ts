/**
 * Shared formatting utilities for converting WP API responses
 * into human-readable markdown or structured JSON.
 */

import { CHARACTER_LIMIT } from "../constants.js";
import type { WPPost, WPPage, WPCategory, WPTag } from "../types.js";

/**
 * Strips WordPress/Visual Composer shortcodes like [vc_row ...], [/vc_row], etc.
 */
function stripShortcodes(text: string): string {
  // Remove shortcode blocks: [tag attr="val"] and [/tag]
  return text.replace(/\[\/?\w+[^\]]*\]/g, "");
}

/**
 * Strips HTML tags, WordPress shortcodes, and decodes common HTML entities.
 */
export function stripHtml(html: string): string {
  return stripShortcodes(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "\u2019") // right single quote
    .replace(/&#8216;/g, "\u2018") // left single quote
    .replace(/&#8220;/g, "\u201C") // left double quote
    .replace(/&#8221;/g, "\u201D") // right double quote
    .replace(/&#8211;/g, "\u2013") // en-dash
    .replace(/&#8212;/g, "\u2014") // em-dash
    .replace(/&#8230;/g, "\u2026") // ellipsis
    .replace(/&#8243;/g, "\u2033") // double prime
    .replace(/&#8242;/g, "\u2032") // single prime
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&#\d+;/g, "") // catch any remaining numeric entities
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats a WordPress date string into a readable format.
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a single post as markdown.
 */
export function postToMarkdown(post: WPPost, includeContent = false): string {
  const title = stripHtml(post.title.rendered);
  const date = formatDate(post.date);
  const excerpt = stripHtml(post.excerpt.rendered);

  const lines: string[] = [
    `## ${title}`,
    `**Date:** ${date} | **ID:** ${post.id} | [View on Forum Hub](${post.link})`,
    "",
  ];

  if (includeContent) {
    const content = stripHtml(post.content.rendered);
    lines.push(content, "");
  } else {
    lines.push(excerpt, "");
  }

  return lines.join("\n");
}

/**
 * Formats a single page as markdown.
 */
export function pageToMarkdown(page: WPPage, includeContent = false): string {
  const title = stripHtml(page.title.rendered);
  const date = formatDate(page.date);

  const lines: string[] = [
    `## ${title}`,
    `**Date:** ${date} | **ID:** ${page.id} | [View](${page.link})`,
    "",
  ];

  if (includeContent) {
    const content = stripHtml(page.content.rendered);
    lines.push(content, "");
  } else if (page.excerpt.rendered) {
    const excerpt = stripHtml(page.excerpt.rendered);
    lines.push(excerpt, "");
  }

  return lines.join("\n");
}

/**
 * Formats a category as markdown.
 */
export function categoryToMarkdown(cat: WPCategory): string {
  return `- **${cat.name}** (ID: ${cat.id}) — ${cat.count} posts${cat.description ? ` — ${stripHtml(cat.description)}` : ""}`;
}

/**
 * Formats a tag as markdown.
 */
export function tagToMarkdown(tag: WPTag): string {
  return `- **${tag.name}** (ID: ${tag.id}) — ${tag.count} posts`;
}

/**
 * Truncates text content if it exceeds the character limit.
 * Returns the text and a flag indicating if truncation occurred.
 */
export function truncateIfNeeded(text: string): { text: string; truncated: boolean } {
  if (text.length <= CHARACTER_LIMIT) {
    return { text, truncated: false };
  }
  const truncated = text.slice(0, CHARACTER_LIMIT);
  const message =
    "\n\n---\n*Response truncated due to length. Use more specific filters or request fewer results.*";
  return { text: truncated + message, truncated: true };
}
