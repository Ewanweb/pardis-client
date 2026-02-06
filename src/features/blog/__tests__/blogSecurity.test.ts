import { describe, it, expect } from "vitest";
import { sanitizeHtml, prepareBlogContent } from "../utils/blogUtils";

describe("Blog Security Tests", () => {
  describe("HTML Sanitization", () => {
    it("should remove script tags completely", () => {
      const maliciousHtml =
        '<p>Safe content</p><script>alert("XSS")</script><p>More content</p>';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("<script>");
      expect(result).not.toContain('alert("XSS")');
      expect(result).toContain("<p>Safe content</p>");
      expect(result).toContain("<p>More content</p>");
    });

    it("should remove iframe tags", () => {
      const maliciousHtml =
        '<p>Content</p><iframe src="javascript:alert(1)"></iframe>';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("<iframe>");
      expect(result).not.toContain("javascript:alert(1)");
      expect(result).toContain("<p>Content</p>");
    });

    it("should remove object and embed tags", () => {
      const maliciousHtml =
        '<object data="malicious.swf"></object><embed src="malicious.swf">';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("<object>");
      expect(result).not.toContain("<embed>");
      expect(result).not.toContain("malicious.swf");
    });

    it("should remove javascript: URLs", () => {
      const maliciousHtml = '<a href="javascript:alert(1)">Click me</a>';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("javascript:alert(1)");
      expect(result).toContain("<a>Click me</a>");
    });

    it("should remove vbscript: URLs", () => {
      const maliciousHtml = '<a href="vbscript:msgbox(1)">Click me</a>';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("vbscript:msgbox(1)");
      expect(result).toContain("<a>Click me</a>");
    });

    it("should remove data:text/html URLs", () => {
      const maliciousHtml =
        '<img src="data:text/html,<script>alert(1)</script>">';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("data:text/html");
      expect(result).not.toContain("<script>alert(1)</script>");
    });

    it("should remove event handlers", () => {
      const maliciousHtml =
        '<p onclick="alert(1)" onmouseover="alert(2)">Content</p>';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).not.toContain("onclick");
      expect(result).not.toContain("onmouseover");
      expect(result).not.toContain("alert(1)");
      expect(result).not.toContain("alert(2)");
      expect(result).toContain("<p>Content</p>");
    });

    it("should remove disallowed tags but preserve content", () => {
      const htmlWithDisallowedTags =
        "<p>Safe</p><style>body{color:red}</style><script>alert(1)</script>";
      const result = sanitizeHtml(htmlWithDisallowedTags);

      expect(result).not.toContain("<style>");
      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>Safe</p>");
      expect(result).toContain("body{color:red}"); // Content preserved as text
    });

    it("should preserve allowed tags and attributes", () => {
      const safeHtml = `
        <h2 id="heading">Heading</h2>
        <p class="intro">Introduction paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <blockquote>Quote text</blockquote>
        <a href="https://example.com" title="Example">External link</a>
        <img src="https://example.com/image.jpg" alt="Description" width="300" height="200">
      `;

      const result = sanitizeHtml(safeHtml);

      expect(result).toContain('<h2 id="heading">Heading</h2>');
      expect(result).toContain('<p class="intro">');
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>List item 1</li>");
      expect(result).toContain("<blockquote>Quote text</blockquote>");
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"'); // Should be added automatically
      expect(result).toContain('rel="noopener noreferrer"'); // Should be added automatically
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('loading="lazy"'); // Should be added automatically
    });

    it("should handle malformed HTML gracefully", () => {
      const malformedHtml =
        "<p>Unclosed paragraph<div>Nested incorrectly<span>More nesting</p></div></span>";
      const result = sanitizeHtml(malformedHtml);

      // Should not throw error and should produce some reasonable output
      expect(result).toBeTruthy();
      expect(result).toContain("Unclosed paragraph");
      expect(result).toContain("Nested incorrectly");
      expect(result).toContain("More nesting");
    });

    it("should handle empty and null input", () => {
      expect(sanitizeHtml("")).toBe("");
      expect(sanitizeHtml(null as any)).toBe("");
      expect(sanitizeHtml(undefined as any)).toBe("");
    });

    it("should preserve code blocks safely", () => {
      const codeHtml = `
        <pre><code>
          function example() {
            return "&lt;script&gt;alert('safe')&lt;/script&gt;";
          }
        </code></pre>
      `;

      const result = sanitizeHtml(codeHtml);

      expect(result).toContain("<pre>");
      expect(result).toContain("<code>");
      expect(result).toContain("function example()");
      expect(result).toContain("&lt;script&gt;"); // Should remain escaped
    });

    it("should handle complex nested attacks", () => {
      const complexAttack = `
        <div>
          <p>Normal content</p>
          <img src="x" onerror="alert(1)">
          <a href="javascript:void(0)" onclick="alert(2)">
            <span onmouseover="alert(3)">Click me</span>
          </a>
          <style>body { background: url('javascript:alert(4)'); }</style>
          <script>
            // This should be completely removed
            fetch('/api/steal-data').then(r => r.json()).then(console.log);
          </script>
        </div>
      `;

      const result = sanitizeHtml(complexAttack);

      expect(result).toContain("<p>Normal content</p>");
      expect(result).toContain('<img src="x"'); // src should be preserved if safe
      expect(result).not.toContain("onerror");
      expect(result).not.toContain("onclick");
      expect(result).not.toContain("onmouseover");
      expect(result).not.toContain("javascript:");
      expect(result).not.toContain("<style>");
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("fetch(");
      expect(result).not.toContain("alert(1)");
      expect(result).not.toContain("alert(2)");
      expect(result).not.toContain("alert(3)");
      expect(result).not.toContain("alert(4)");
    });
  });

  describe("Blog Content Preparation", () => {
    it("should generate table of contents with unique IDs", () => {
      const content = `
        <h2>Introduction</h2>
        <p>Some content</p>
        <h3>Getting Started</h3>
        <p>More content</p>
        <h2>Introduction</h2>
        <p>Duplicate heading</p>
      `;

      const result = prepareBlogContent(content);

      expect(result.toc).toHaveLength(3);
      expect(result.toc[0]).toEqual({
        id: "introduction",
        text: "Introduction",
        level: 2,
      });
      expect(result.toc[1]).toEqual({
        id: "getting-started",
        text: "Getting Started",
        level: 3,
      });
      expect(result.toc[2]).toEqual({
        id: "introduction-1",
        text: "Introduction",
        level: 2,
      }); // Should have unique ID

      expect(result.html).toContain('id="introduction"');
      expect(result.html).toContain('id="getting-started"');
      expect(result.html).toContain('id="introduction-1"');
    });

    it("should handle plain text content by wrapping in paragraphs", () => {
      const plainText = "Line 1\nLine 2\nLine 3";
      const result = prepareBlogContent(plainText);

      expect(result.html).toContain("<p>Line 1</p>");
      expect(result.html).toContain("<p>Line 2</p>");
      expect(result.html).toContain("<p>Line 3</p>");
      expect(result.toc).toHaveLength(0); // No headings in plain text
    });

    it("should sanitize malicious content in blog preparation", () => {
      const maliciousContent = `
        <h2>Safe Heading</h2>
        <script>alert('XSS')</script>
        <p onclick="alert('click')">Paragraph</p>
      `;

      const result = prepareBlogContent(maliciousContent);

      expect(result.html).not.toContain("<script>");
      expect(result.html).not.toContain("alert(");
      expect(result.html).not.toContain("onclick");
      expect(result.html).toContain('<h2 id="safe-heading">Safe Heading</h2>');
      expect(result.html).toContain("<p>Paragraph</p>");
      expect(result.toc).toHaveLength(1);
      expect(result.toc[0]).toEqual({
        id: "safe-heading",
        text: "Safe Heading",
        level: 2,
      });
    });
  });

  describe("Search Result Highlighting Security", () => {
    it("should sanitize highlighted search results", () => {
      const maliciousHighlight =
        'Test <mark onclick="alert(1)">search</mark> result';
      const result = sanitizeHtml(maliciousHighlight);

      expect(result).toContain("<mark>search</mark>");
      expect(result).not.toContain("onclick");
      expect(result).not.toContain("alert(1)");
    });

    it("should handle malicious content in search highlights", () => {
      const maliciousHighlight =
        "Test <mark><script>alert(1)</script>search</mark> result";
      const result = sanitizeHtml(maliciousHighlight);

      expect(result).toContain("<mark>");
      expect(result).toContain("search");
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert(1)");
    });
  });

  describe("URL Validation", () => {
    it("should allow safe URLs", () => {
      const safeUrls = [
        '<a href="https://example.com">Link</a>',
        '<a href="http://example.com">Link</a>',
        '<a href="mailto:test@example.com">Email</a>',
        '<a href="tel:+1234567890">Phone</a>',
        '<a href="/relative/path">Relative</a>',
        '<a href="#anchor">Anchor</a>',
      ];

      safeUrls.forEach((html) => {
        const result = sanitizeHtml(html);
        expect(result).toContain("href=");
        expect(result).toContain("Link");
      });
    });

    it("should remove dangerous URLs", () => {
      const dangerousUrls = [
        '<a href="javascript:alert(1)">Link</a>',
        '<a href="vbscript:msgbox(1)">Link</a>',
        '<a href="data:text/html,<script>alert(1)</script>">Link</a>',
        '<img src="javascript:alert(1)">',
        '<img src="vbscript:msgbox(1)">',
      ];

      dangerousUrls.forEach((html) => {
        const result = sanitizeHtml(html);
        expect(result).not.toContain("javascript:");
        expect(result).not.toContain("vbscript:");
        expect(result).not.toContain("data:text/html");
        expect(result).not.toContain("alert(");
        expect(result).not.toContain("msgbox(");
      });
    });
  });
});
