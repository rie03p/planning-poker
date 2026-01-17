import {describe, it, expect} from 'vitest';
import {parseIssueInput, parseMarkdownLink, isMarkdownLink} from '../issueInputParser';

describe('issueInputParser', () => {
  describe('isMarkdownLink', () => {
    it('should return true for valid markdown links', () => {
      expect(isMarkdownLink('- [Title](https://example.com)')).toBe(true);
      expect(isMarkdownLink('- [SRS-1947: Task title](https://linear.app/issue/123)')).toBe(true);
    });

    it('should return false for invalid markdown links', () => {
      expect(isMarkdownLink('Plain text')).toBe(false);
      expect(isMarkdownLink('[Title](https://example.com)')).toBe(false); // Missing dash
      expect(isMarkdownLink('- Title https://example.com')).toBe(false);
    });
  });

  describe('parseMarkdownLink', () => {
    it('should parse a simple markdown link', () => {
      const result = parseMarkdownLink('- [Simple Title](https://example.com)');
      expect(result).toEqual({
        title: 'Simple Title',
        url: 'https://example.com',
      });
    });

    it('should remove issue prefix from title', () => {
      const result = parseMarkdownLink('- [SRS-1947: Task description](https://linear.app)');
      expect(result).toEqual({
        title: 'Task description',
        url: 'https://linear.app',
      });
    });

    it('should handle various prefixes', () => {
      expect(parseMarkdownLink('- [ABC-123: Title](url)')?.title).toBe('Title');
      expect(parseMarkdownLink('- [XYZ-999: Another title](url)')?.title).toBe('Another title');
    });

    it('should truncate long titles to 100 characters', () => {
      const longTitle = 'A'.repeat(150);
      const result = parseMarkdownLink(`- [SRS-123: ${longTitle}](https://example.com)`);
      expect(result?.title.length).toBe(100);
    });

    it('should return null for invalid markdown links', () => {
      expect(parseMarkdownLink('Plain text')).toBeNull();
      expect(parseMarkdownLink('[No dash](url)')).toBeNull();
    });

    it('should handle titles without prefix', () => {
      const result = parseMarkdownLink('- [No prefix title](https://example.com)');
      expect(result?.title).toBe('No prefix title');
    });
  });

  describe('parseIssueInput', () => {
    it('should return empty array for empty input', () => {
      expect(parseIssueInput('')).toEqual([]);
      expect(parseIssueInput('   ')).toEqual([]);
    });

    it('should parse a single plain text issue', () => {
      const result = parseIssueInput('Single issue title');
      expect(result).toEqual([
        {title: 'Single issue title'},
      ]);
    });

    it('should parse multiple plain text lines', () => {
      const input = `First issue
Second issue
Third issue`;
      const result = parseIssueInput(input);
      expect(result).toEqual([
        {title: 'First issue'},
        {title: 'Second issue'},
        {title: 'Third issue'},
      ]);
    });

    it('should parse single markdown link', () => {
      const input = '- [SRS-1947: Task title](https://linear.app/issue/123)';
      const result = parseIssueInput(input);
      expect(result).toEqual([
        {
          title: 'Task title',
          url: 'https://linear.app/issue/123',
        },
      ]);
    });

    it('should parse multiple markdown links', () => {
      const input = `- [SRS-1947: First task](https://linear.app/1)
- [SRS-1948: Second task](https://linear.app/2)
- [SRS-1949: Third task](https://linear.app/3)`;
      const result = parseIssueInput(input);
      expect(result).toEqual([
        {title: 'First task', url: 'https://linear.app/1'},
        {title: 'Second task', url: 'https://linear.app/2'},
        {title: 'Third task', url: 'https://linear.app/3'},
      ]);
    });

    it('should ignore empty lines', () => {
      const input = `First issue

Second issue

Third issue`;
      const result = parseIssueInput(input);
      expect(result).toEqual([
        {title: 'First issue'},
        {title: 'Second issue'},
        {title: 'Third issue'},
      ]);
    });

    it('should trim whitespace from lines', () => {
      const input = `  First issue  
  Second issue  `;
      const result = parseIssueInput(input);
      expect(result).toEqual([
        {title: 'First issue'},
        {title: 'Second issue'},
      ]);
    });

    it('should truncate long plain text titles to 100 characters', () => {
      const longTitle = 'A'.repeat(150);
      const result = parseIssueInput(longTitle);
      expect(result[0].title.length).toBe(100);
    });

    it('should truncate each line in multiple plain text issues', () => {
      const longTitle1 = 'A'.repeat(150);
      const longTitle2 = 'B'.repeat(150);
      const input = `${longTitle1}\n${longTitle2}`;
      const result = parseIssueInput(input);
      expect(result[0].title.length).toBe(100);
      expect(result[1].title.length).toBe(100);
    });

    it('should not mix markdown links with plain text', () => {
      // If some lines are markdown and some are not, treat all as plain text
      const input = `- [SRS-1947: Task](https://linear.app)
Plain text issue`;
      const result = parseIssueInput(input);
      // Should treat as plain text since not ALL lines are markdown
      expect(result).toEqual([
        {title: '- [SRS-1947: Task](https://linear.app)'},
        {title: 'Plain text issue'},
      ]);
    });

    it('should handle markdown links with special characters in URL', () => {
      const input = '- [Task](https://example.com/path?query=value&foo=bar#anchor)';
      const result = parseIssueInput(input);
      expect(result[0].url).toBe('https://example.com/path?query=value&foo=bar#anchor');
    });

    it('should handle different issue prefixes', () => {
      const input = `- [ABC-123: First](url1)
- [XYZ-456: Second](url2)
- [DEF-789: Third](url3)`;
      const result = parseIssueInput(input);
      expect(result[0].title).toBe('First');
      expect(result[1].title).toBe('Second');
      expect(result[2].title).toBe('Third');
    });
  });
});
