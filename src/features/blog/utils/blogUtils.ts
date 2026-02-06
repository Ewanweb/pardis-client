const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "mark",
  "div",
]);

const GLOBAL_ATTRS = new Set(["id", "class", "dir", "lang"]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set([
    "src",
    "alt",
    "title",
    "width",
    "height",
    "loading",
    "decoding",
  ]),
  figure: new Set(["class"]),
  figcaption: new Set(["class"]),
};

const SAFE_URL_PATTERN = /^(https?:|mailto:|tel:|\/|#)/i;

export const createSlug = (value: string) => {
  if (!value) return "section";
  return (
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "section"
  );
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const normalizeContent = (value: string) => {
  if (!value) return "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  if (looksLikeHtml) {
    return value;
  }
  return value
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

export const sanitizeHtml = (raw: string) => {
  if (!raw) return "";

  // Enhanced XSS protection - strip script tags and dangerous content first
  const cleanedRaw = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "");

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanedRaw, "text/html");

  const traverse = (node: Element) => {
    const tagName = node.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      const text = doc.createTextNode(node.textContent || "");
      node.replaceWith(text);
      return;
    }

    const allowedAttrs = ALLOWED_ATTRS[tagName] || new Set();

    Array.from(node.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.toLowerCase();

      // Remove dangerous attributes
      if (
        attrName.startsWith("on") ||
        attrValue.includes("javascript:") ||
        attrValue.includes("vbscript:") ||
        attrValue.includes("data:text/html")
      ) {
        node.removeAttribute(attr.name);
        return;
      }

      if (!allowedAttrs.has(attrName) && !GLOBAL_ATTRS.has(attrName)) {
        node.removeAttribute(attr.name);
        return;
      }

      if (
        (attrName === "href" || attrName === "src") &&
        !SAFE_URL_PATTERN.test(attr.value)
      ) {
        node.removeAttribute(attr.name);
      }
    });

    if (tagName === "a") {
      const href = node.getAttribute("href");
      if (href && href.startsWith("http")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (tagName === "img") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("decoding", "async");
      if (!node.getAttribute("alt")) {
        node.setAttribute("alt", "");
      }
    }
  };

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
  const elements: Element[] = [];

  while (walker.nextNode()) {
    elements.push(walker.currentNode as Element);
  }

  elements.forEach((el) => traverse(el));

  return doc.body.innerHTML;
};

export const prepareBlogContent = (rawContent: string) => {
  const normalized = normalizeContent(rawContent || "");
  const sanitized = sanitizeHtml(normalized);
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, "text/html");

  const toc: Array<{ id: string; text: string; level: number }> = [];
  const usedIds = new Set<string>();

  doc.querySelectorAll("h2, h3, h4").forEach((heading) => {
    const text = heading.textContent?.trim();
    if (!text) return;
    const level = Number(heading.tagName.substring(1));
    let id = heading.getAttribute("id") || createSlug(text);
    let uniqueId = id;
    let counter = 1;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter += 1;
    }
    usedIds.add(uniqueId);
    heading.setAttribute("id", uniqueId);
    toc.push({ id: uniqueId, text, level });
  });

  return {
    html: doc.body.innerHTML,
    toc,
  };
};

export const buildBlogPostingSchema = ({
  title,
  description,
  canonicalUrl,
  imageUrl,
  publishedAt,
  modifiedAt,
  author,
  categoryTitle,
  tags,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  author?: string | null;
  categoryTitle?: string | null;
  tags?: string[];
}) => {
  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    mainEntityOfPage: canonicalUrl,
    datePublished: publishedAt || undefined,
    dateModified: modifiedAt || publishedAt || undefined,
    author: author
      ? {
          "@type": "Person",
          name: author,
        }
      : undefined,
    image: imageUrl ? [imageUrl] : undefined,
    articleSection: categoryTitle || undefined,
    keywords: tags?.length ? tags.join(", ") : undefined,
  };
};

export const buildBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>,
) => {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

export const ensureAbsoluteUrl = (url: string, origin: string) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
};
