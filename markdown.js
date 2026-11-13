/* ============================================================
   WALLACE CORP — FIELD NOTE DECODER
   A small Markdown renderer for the posts in /posts. No
   dependencies. Loaded by blog.html in the browser and by
   tools/blog.mjs in Node (to build the RSS feed), so a post
   renders the same way in both places.

   Safe by construction: every character of the source is HTML
   escaped first, and the renderer only ever adds a fixed set of
   tags around it. Raw HTML in a post shows up as text.

   Supported:
     ## heading          ### smaller heading
     paragraphs          **bold**   *italic*   `code`
     > blockquote        - bullet list        1. numbered list
     ``` fenced code     [link](url)          ![alt](image)
     --- horizontal rule

   A post file starts with a front matter block:
     ---
     id: NX-0007
     title: the title
     date: 2026-11-13
     tags: LAB, STORY
     color: teal
     excerpt: One or two sentences for the card.
     draft: true
     ---
   ============================================================ */
(function (root) {
  'use strict';

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Links and images: http(s), mailto, or a path on this site. Anything
  // with another scheme (javascript:, data:, ...) is refused.
  function safeUrl(u) {
    if (!u || /[\s\u0000-\u001f]/.test(u) || u.startsWith('//')) return false;
    if (/^(https?:|mailto:)/i.test(u)) return true;
    return !/^[a-z][a-z0-9+.-]*:/i.test(u);
  }
  const isExternal = (u) => /^https?:/i.test(u);

  function inline(text) {
    // Code spans are lifted out first so nothing inside them is styled.
    const held = [];
    let s = String(text).replace(/`([^`]+)`/g, (_, code) => {
      held.push(`<code>${esc(code)}</code>`);
      return `\u0000${held.length - 1}\u0000`;
    });
    s = esc(s);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) =>
      safeUrl(url) ? `<img src="${url}" alt="${alt}" loading="lazy" decoding="async">` : m);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      if (!safeUrl(url)) return m;
      return isExternal(url)
        ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>`
        : `<a href="${url}">${label}</a>`;
    });
    s = s.replace(/\*\*(\S(?:[^*]*\S)?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(\S(?:[^*]*\S)?)\*/g, '<em>$1</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => held[+i]);
  }

  function render(src) {
    const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let para = [];
    const flush = () => {
      if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // fenced code block
      if (/^```/.test(line)) {
        flush();
        const code = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
        out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
        continue;
      }
      if (!line.trim()) { flush(); continue; }

      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { flush(); out.push('<hr>'); continue; }

      const h = line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
      if (h) {
        flush();
        // The post title is the dialog's h2, so body headings start at h3.
        const tag = h[1].length <= 2 ? 'h3' : 'h4';
        out.push(`<${tag}>${inline(h[2])}</${tag}>`);
        continue;
      }

      if (/^>\s?/.test(line)) {
        flush();
        const quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
        i--;
        out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
        continue;
      }

      const bullet = /^[-*]\s+/, number = /^\d+[.)]\s+/;
      if (bullet.test(line) || number.test(line)) {
        flush();
        const re = bullet.test(line) ? bullet : number;
        const tag = re === bullet ? 'ul' : 'ol';
        const items = [];
        while (i < lines.length && (re.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
          if (re.test(lines[i])) items.push(lines[i].replace(re, ''));
          else items[items.length - 1] += ' ' + lines[i].trim(); // wrapped item text
          i++;
        }
        i--;
        out.push(`<${tag}>${items.map(t => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
        continue;
      }

      para.push(line.trim());
    }
    flush();
    return out.join('\n');
  }

  // Split a post file into its front matter fields and its Markdown body.
  function parse(src) {
    const text = String(src).replace(/\r\n?/g, '\n');
    const meta = {};
    const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!m) return { meta, body: text };
    m[1].split('\n').forEach(row => {
      const at = row.indexOf(':');
      if (at < 1) return;
      meta[row.slice(0, at).trim().toLowerCase()] = row.slice(at + 1).trim();
    });
    return { meta, body: text.slice(m[0].length) };
  }

  root.NXMarkdown = { render, parse, esc };
})(typeof window !== 'undefined' ? window : globalThis);
