#!/usr/bin/env node
/* ============================================================
   FIELD NOTES — index + feed builder (zero dependencies)

   The site itself has no build step. This script only keeps two
   generated files in sync with the Markdown posts in /posts:

     posts/index.json   the card list the site fetches
     feed.xml           the RSS feed

   Usage (from the repo root):
     node tools/blog.mjs               rebuild index.json + feed.xml
     node tools/blog.mjs new "title"   scaffold the next post as a draft

   Commit the regenerated files along with the post.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(ROOT, 'posts');
const SITE = 'https://camgarrison.com';

await import('../markdown.js');            // defines globalThis.NXMarkdown
const { render, parse, esc } = globalThis.NXMarkdown;

const COLORS = ['', 'teal', 'ice', 'red'];
const postFiles = () => readdirSync(POSTS).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort();

function load(file) {
  const { meta, body } = parse(readFileSync(path.join(POSTS, file), 'utf8'));
  const problems = [];
  for (const k of ['id', 'title', 'date', 'excerpt']) if (!meta[k]) problems.push(`missing "${k}"`);
  if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) problems.push('date must be YYYY-MM-DD');
  if (meta.id && !/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(meta.id)) problems.push('id may only use letters, digits, and hyphens');
  if (meta.id && file !== `${meta.id}.md`) problems.push(`file should be named ${meta.id}.md`);
  if (meta.color && !COLORS.includes(meta.color)) problems.push(`color must be one of: teal, ice, red (or empty)`);
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return {
    file, problems, body,
    draft: /^(true|yes|1)$/i.test(meta.draft || ''),
    entry: {
      id: meta.id,
      title: meta.title,
      date: meta.date,
      tags: (meta.tags || '').split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
      color: meta.color || '',
      excerpt: meta.excerpt,
      minutes: Math.max(1, Math.round(words / 220)),
      file
    }
  };
}

function build() {
  const all = postFiles().map(load);
  const bad = all.filter(p => p.problems.length);
  if (bad.length) {
    bad.forEach(p => console.error(`✗ posts/${p.file}: ${p.problems.join(', ')}`));
    process.exit(1);
  }
  const ids = new Set();
  for (const p of all) {
    if (ids.has(p.entry.id.toLowerCase())) { console.error(`✗ duplicate id ${p.entry.id}`); process.exit(1); }
    ids.add(p.entry.id.toLowerCase());
  }
  const live = all.filter(p => !p.draft)
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date) || b.entry.id.localeCompare(a.entry.id));

  writeFileSync(path.join(POSTS, 'index.json'), JSON.stringify(live.map(p => p.entry), null, 2) + '\n');

  const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
  const items = live.slice(0, 30).map(p => {
    const e = p.entry, url = `${SITE}/blog#${e.id}`;
    // Feed readers have no base URL: make site relative links absolute.
    const html = render(p.body).replace(/(href|src)="(?!https?:|mailto:|#)\/?([^"]*)"/g, `$1="${SITE}/$2"`);
    return `    <item>
      <title>${esc(e.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(e.date + 'T12:00:00Z').toUTCString()}</pubDate>
${e.tags.map(t => `      <category>${esc(t)}</category>`).join('\n')}
      <description>${esc(e.excerpt)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
    </item>`;
  }).join('\n');
  const newest = live[0] ? new Date(live[0].entry.date + 'T12:00:00Z').toUTCString() : new Date().toUTCString();
  writeFileSync(path.join(ROOT, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Field Notes // NX-1324</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Cam Garrison on cybersecurity, networking, things in progress, and thoughts on tech.</description>
    <language>en</language>
    <lastBuildDate>${newest}</lastBuildDate>
${items}
  </channel>
</rss>
`);

  const drafts = all.filter(p => p.draft);
  console.log(`✓ posts/index.json  ${live.length} published`);
  console.log(`✓ feed.xml          ${Math.min(live.length, 30)} items`);
  if (drafts.length) console.log(`  drafts held back: ${drafts.map(p => p.entry.id).join(', ')}`);
}

function scaffold(title) {
  if (!title) { console.error('usage: node tools/blog.mjs new "post title"'); process.exit(1); }
  const nums = postFiles().map(f => (f.match(/^NX-(\d+)\.md$/) || [])[1]).filter(Boolean).map(Number);
  const id = `NX-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0')}`;
  const file = path.join(POSTS, `${id}.md`);
  if (existsSync(file)) { console.error(`✗ ${file} already exists`); process.exit(1); }
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(file, `---
id: ${id}
title: ${title.toLowerCase()}
date: ${today}
tags: NOTES
color:
excerpt: One or two sentences that sell the post on its card.
draft: true
---

Opening paragraph. Say what happened or what you are thinking about.

## a section heading

Body text with **bold**, *italic*, and \`inline code\`.

> A pull quote, if the post has one line worth repeating.
`);
  console.log(`✓ created posts/${id}.md (draft)`);
  console.log(`  write it, delete the "draft: true" line, then run: node tools/blog.mjs`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'new') scaffold(rest.join(' ').trim());
else if (!cmd || cmd === 'build') build();
else { console.error('usage: node tools/blog.mjs [build | new "post title"]'); process.exit(1); }
