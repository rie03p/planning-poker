/**
 * Issue input parsing utilities
 */

export type ParsedIssue = {
  title: string;
  url?: string;
};

const MARKDOWN_LINK_REGEX = /^-\s*\[([^\]]+)]\(([^)]+)\)\s*$/;
const ISSUE_PREFIX_REGEX = /^[A-Z]+-\d+:\s*/;
const MAX_TITLE_LENGTH = 100;

/**
 * Parse a single markdown link line
 * Example: "- [Task title](https://example.com)"
 */
export function parseMarkdownLink(line: string): ParsedIssue | undefined {
  const match = MARKDOWN_LINK_REGEX.exec(line);
  if (!match) {
    return undefined;
  }

  const title = match[1];
  const url = match[2];

  // Extract just the title without the prefix (e.g., "Hoge: ")
  const cleanTitle = title.replace(ISSUE_PREFIX_REGEX, '').trim().slice(0, MAX_TITLE_LENGTH);

  return {
    title: cleanTitle,
    url,
  };
}

/**
 * Check if a line is a markdown link
 */
export function isMarkdownLink(line: string): boolean {
  return MARKDOWN_LINK_REGEX.test(line);
}

/**
 * Parse multiple lines of input and return parsed issues
 */
export function parseIssueInput(input: string): ParsedIssue[] {
  if (!input.trim()) {
    return [];
  }

  const trimmedInput = input.trim();
  const lines = trimmedInput
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Check if all lines are markdown links
  const allMarkdownLinks = lines.length > 0 && lines.every(line => isMarkdownLink(line));

  if (allMarkdownLinks) {
    // Parse markdown links and return issues with URLs
    return lines
      .map(line => parseMarkdownLink(line))
      .filter((issue): issue is ParsedIssue => issue !== undefined);
  }

  // If not all lines are markdown links, treat each non-empty line as a plain issue title.
  return lines.map(line => ({
    title: line.slice(0, MAX_TITLE_LENGTH),
  }));
}
