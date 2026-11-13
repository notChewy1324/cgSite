<div align="center">

```
 ██████╗ ██████╗     ██╗   ██╗     ███╗   ██╗██╗  ██╗      ██╗██████╗ ██████╗ ██╗  ██╗
██╔════╝██╔════╝     ██║   ██║     ████╗  ██║╚██╗██╔╝     ███║╚════██╗╚════██╗██║  ██║
██║     ██║  ███╗    ██║   ██║     ██╔██╗ ██║ ╚███╔╝█████╗╚██║ █████╔╝ █████╔╝███████║
██║     ██║   ██║    ╚██╗ ██╔╝     ██║╚██╗██║ ██╔██╗╚════╝ ██║ ╚═══██╗██╔═══╝ ╚════██║
╚██████╗╚██████╔╝     ╚████╔╝      ██║ ╚████║██╔╝ ██╗      ██║██████╔╝███████╗     ██║
 ╚═════╝ ╚═════╝       ╚═══╝       ╚═╝  ╚═══╝╚═╝  ╚═╝      ╚═╝╚═════╝ ╚══════╝     ╚═╝
```

### `// WALLACE CORP — NEXUS-9 PERSONNEL ARCHIVE`

🛰️ **The personal site of Cam Garrison — operator `NX-1324`.**
A cybersecurity & network systems portfolio built as an immersive, in-universe experience —
and hardened like one of the systems it writes about.

[![Status](https://img.shields.io/badge/STATUS-ACTIVE-2dd4bf?style=for-the-badge&labelColor=050608)](https://camgarrison.com)
![Clearance](https://img.shields.io/badge/CLEARANCE-TIER--9-6ba3d8?style=for-the-badge&labelColor=050608)
![Baseline](https://img.shields.io/badge/BASELINE-91.20%25-b8d6ed?style=for-the-badge&labelColor=050608)
![Stack](https://img.shields.io/badge/STACK-VANILLA_JS-3a6fa8?style=for-the-badge&labelColor=050608)
![CDN](https://img.shields.io/badge/THIRD--PARTY_JS-ZERO-2dd4bf?style=for-the-badge&labelColor=050608)
![Deploy](https://img.shields.io/badge/DEPLOY-CLOUDFLARE_PAGES-6ba3d8?style=for-the-badge&labelColor=050608)

</div>

---

> 🧬 *"More human than human" is not a slogan. It is a **specification**.*
> *And specifications, in this profession, are the difference between a system and a wish.*

---

## 📡 TRANSMISSION

This is a portfolio with a costume on. Every page is themed end-to-end around the world of
*Blade Runner 2049* — and the theming is itself the point. The brief I set for myself was the
same one I want to chase professionally: **hide the technology so completely that what's left
is a feeling.** Atmosphere first, information second, a consistent fiction holding it all together.

The second brief arrived later, and it's the one that makes this repo different from most
themed portfolios: **the security posture had to be real.** A cybersecurity portfolio that
ships with no CSP is a costume with the zipper showing. So the in-universe "defense grid"
on the uplink console isn't lore — it reads this site's *actual* response headers back from
the edge, live, and renders the result.

🔒 No frameworks. No build step. No trackers. No third-party JavaScript — not even a CDN —
and the fonts are self-hosted too. Hand-built vanilla `HTML / CSS / JS`, served static on
Cloudflare Pages behind a locked-down header policy. The only external calls the CSP permits
are the two APIs that power the live-weather atmosphere. (The Cloudflare Web Analytics beacon
is commented out, and the CSP does not allow it until it is switched on.)

---

## 🌃 IMMERSION FIRST

Most portfolios present **information**.

This project presents a **world.**

The goal was never to bolt a theme onto a website. The goal was to build a *believable system* — something that feels like it already exists inside the universe of *Blade Runner 2049*, and that you happen to have been granted access to.

Every visual effect, interaction, animation, transition, terminal command, dossier, and subsystem was designed around a single question:

> ⛓️ *Would this make the world feel more real?*

Only once the atmosphere is convincing does the site start delivering the actual signal underneath it — projects, skills, experience, and technical work. The fiction is the interface; the substance is real.

**Immersion first. Information second. Both, on purpose.**

---

## 🛰️ SUBSYSTEMS ONLINE

| | Subsystem | Description |
| :--: | :-- | :-- |
| 🌧️ | **Atmospheric engine** | Layered canvas rain + dust, scanlines, grain, vignette, and animated haze — with pointer/tilt **parallax depth** and a scroll-depth shade that darkens as you descend |
| ⛈️ | **Live sector weather** | The site checks the *actual* weather at the visitor's location (IP-located, no permission prompt) — when it's raining where you are, it rains in the archive, in every theme. `wx` in the terminal reads the feed |
| 🔊 | **Ambient audio** | Opt-in, fully procedural Web Audio — band-filtered noise rain, a wind swell, a low machine hum, and tiny UI ticks. Zero audio files; the rain bed swells when it's visually raining |
| 🖱️ | **Custom cursor** | SVG arrowhead with a particle trail; the native cursor is fully suppressed (and yields to the 3D rig + embedded docs) |
| 🎨 | **Three themes** | `dark` → `light` → `rain`, persisted to `localStorage` and applied *before first paint* (no flash) |
| 🌐 | **Operations Uplink** | A live console: a **dotted cyberpunk Earth** with real continents, glowing coastlines, atmosphere + a scanning meridian — plus spectrum analyzer, synthetic syslog, and ICMP ping log |
| 🛡️ | **Defense grid** | The one console panel that is **not** synthetic — it `HEAD`-requests its own origin and renders the real security headers it gets back, shield by shield |
| 🖥️ | **3D workstation** | Real-time WebGL (Three.js, self-hosted) tower modelled on my actual white build — orbit, zoom, and hover any part to light up its spec |
| ⌨️ | **Virtual terminal** | Interactive read-only shell with a fake filesystem, history, tab-complete — plus a recon suite: `nmap`, `traceroute`, `netstat`, a live `headers` interrogation, and a `decrypt` cipher puzzle hiding a lore fragment |
| 🗝️ | **Clearance system** | Everyone enters at TIER-9. TIER-OMEGA exists. There are two ways up — one is an override passphrase the baseline test keeps circling, the other is a code older than this archive |
| 🧬 | **Voight-Kampff** | A multiple-choice interrogation that tracks a synthetic "baseline" |
| 🧩 | **Memory reconstruction** | A node-graph salvage puzzle that unredacts operator memories as you solve it |
| 🪪 | **Builds dossier** | Modal-driven case studies of shipped work, rendered from a single data array — with an embedded PDF document library |
| 🔗 | **Deep links** | Every field note and build dossier has its own address (`/blog#NX-0006`, `/builds#BUILD-001`). Copy-link button, previous / next stepping, and the Back button closes the dialog |
| 📝 | **Markdown blog** | Field Notes posts are plain Markdown files in `/posts`, rendered in the browser by a dependency-free, escape-first renderer, with an RSS feed at `/feed.xml` |
| 🏷️ | **Field note filters** | Tag chips built from the posts themselves, plus a reading-time estimate on every card |
| 🔤 | **Decode headings** | Section titles scramble from archive glyphs into legible text as they scroll into view |
| 🌙 | **Idle veil** | Walk away for 90 seconds and the archive notices — the page dims behind a `SIGNAL IDLE` readout until you return |

---

## 🛡️ DEFENSE GRID — THE REAL ONE

The site practices what the field notes preach. Highlights of the shipped posture
(full policy in [`_headers`](./_headers)):

| Shield | Posture |
| :-- | :-- |
| **Content-Security-Policy** | `default-src 'none'` baseline; scripts limited to `'self'` plus a SHA-256 hash of the single inline theme-bootstrap script — no `'unsafe-inline'` in `script-src`, anywhere. `style-src-elem 'self'` blocks injected `<style>` blocks; only style *attributes* are allowed inline |
| **Third-party JS** | **Zero.** Three.js is vendored at `js/three.min.js` and the fonts are self-hosted in `/fonts`, so no external origin can serve script or style to this site. `connect-src` names exactly two data APIs (IP locate + weather) |
| **HSTS** | `max-age=31536000; includeSubDomains; preload` |
| **Framing** | `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN` (the site frames only its own PDFs) |
| **MIME / referrer / permissions** | `nosniff`, `strict-origin-when-cross-origin`, and a Permissions-Policy that denies camera, mic, geolocation, payment, and friends (motion sensors are `(self)` — they drive the mobile tilt parallax) |
| **Isolation** | `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` |
| **Disclosure** | RFC 9116 [`/.well-known/security.txt`](./.well-known/security.txt) — found something? say something |
| **Input handling** | The terminal escapes every byte of user input before it touches the DOM; the virtual filesystem is read-only by design |

> 🔭 Verify it yourself: open the **Archive** page and read the defense grid panel,
> or open the **Archive** terminal and run `headers`. Both pull live values from the
> response you are currently holding — not a hardcoded list.

---

## 🗺️ SECTOR MAP

```mermaid
%%{init: {'theme':'base','themeVariables':{
  'background':'#050608','primaryColor':'#0b121c','primaryTextColor':'#b8d6ed',
  'primaryBorderColor':'#6ba3d8','lineColor':'#2dd4bf','fontFamily':'monospace',
  'clusterBkg':'#080d14','clusterBorder':'#234a6e','titleColor':'#6ba3d8'}}}%%
flowchart TD
  V([" VISITOR "]):::edge --> HOME[" index — personnel file "]:::core
  V -.-> WX[" live local weather ▸ rain engine "]:::teal
  HOME --> BG[" background — record "]
  HOME --> B[" builds — flagship work "]:::hot
  HOME --> FN[" field notes "]
  HOME --> AR[" archive "]
  AR --> USE[" loadout — 3D rig "]
  AR --> UP[" uplink — telemetry "]:::hot
  UP --> DG[" defense grid — LIVE headers "]:::teal
  B --> DOC[" bearcast document library "]:::teal
  AR --> T[" terminal + recon suite "]
  AR --> VK[" voight-kampff "]:::teal
  AR --> MEM[" memory salvage "]:::teal
  T --> OMEGA[" tier-omega ▸ replicants.idx "]:::edge
  classDef core fill:#0b121c,stroke:#6ba3d8,color:#b8d6ed;
  classDef hot fill:#101a26,stroke:#2dd4bf,color:#d7f5ef;
  classDef teal fill:#0a1512,stroke:#2dd4bf,color:#2dd4bf;
  classDef edge fill:#1a0e0e,stroke:#ff4d36,color:#ffd9d2;
```

```text
index.html       🪪  Personnel file — hero, identity, recent deployments
background.html  🎓  Full academic + internship record, skills inventory
builds.html      🛠️  Flagship builds — Bearcast Media, NetSweep, this archive
blog.html        📝  Field Notes — technical writeups & lab stories
archive.html     🗂️  Off-record — terminal, recon suite, V-K, memory puzzle,
                     the 3D loadout (#loadout) and the operations uplink (#uplink)
404.html         💀  "Memory not found" — glitched fallback
```

---

## ⌨️ FIELD MANUAL — THE TERMINAL

The archive's shell rewards the curious. A non-exhaustive tour:

```text
help                 the honest list
nmap wallace.corp    service-scan a registry host (simulated; the real attack
                     surface of this site is port 443 and a static file server)
traceroute           eight hops, one of which does not want to be found
headers              interrogate the LIVE security headers of the page you're on
wx                   the weather where YOU are — and whether the archive is raining
cat defense.cfg      the posture, written down
ls                   there is a file with a .enc extension. you know what to do.
ls field-notes       the posts, as files. cat one for a summary, open <id> to read it
decrypt ghost.enc    cipher recovery — recovers something worth reading
clearance            TIER-9. for now.
override <code>      the word the baseline test keeps coming back to.
incept               the date you first made contact (stored only on your machine)
goto builds          the terminal is also a nav system
```

Somewhere above the terminal, a ten-key sequence from an older archive also still works.

---

## 🧰 TECH STACK

- 🧱 **Markup / style** — semantic HTML5, hand-authored CSS (custom properties, `color-mix`, grid, layered canvas effects)
- ⚡ **Behavior** — vanilla ES6+, zero dependencies, one `main.js` (plus a ~150-line `markdown.js` loaded only on the blog)
- 🧊 **3D** — [Three.js](https://threejs.org/) r128, **vendored** at `js/three.min.js`, lazy-loaded on `archive.html` only when the loadout schematic nears the viewport; custom orbit/zoom, no OrbitControls, no CDN
- 🔤 **Type** — Major Mono Display *(display)*, JetBrains Mono *(mono)*, Syne *(sans)* — **self-hosted** variable `woff2` in `/fonts`, preloaded, no Google Fonts at runtime
- 🔊 **Sound** — procedural Web Audio (noise-synth rain, wind, hum, UI ticks); no audio files, context created only after opt-in
- ⛈️ **Weather** — `ipwho.is` (IP → city, no prompt) + `open-meteo.com` (conditions), cached 30 min, drives the rain canvas
- ☁️ **Hosting** — Cloudflare Pages with a [`_headers`](./_headers) policy, configured with [`wrangler`](https://developers.cloudflare.com/workers/wrangler/)
- ♿ **Quality floor** — `prefers-reduced-motion` quiets the atmosphere, parallax, and decode effects; skip-to-content link; visible keyboard focus ring; cards open with Enter / Space; the dossier modal traps and restores keyboard focus and makes the page behind it inert; content stays readable (and the native cursor stays visible) if JavaScript never loads; theme applied before first paint

---

## 🎨 DESIGN SYSTEM

A deliberately **cold** palette — no orange, no amber. Red is reserved for warnings only (the V-K's tell — and now, the TIER-OMEGA grant).

| Swatch | Token | Role | Value |
| :--: | :-- | :-- | :-- |
| <img src="https://placehold.co/18x18/6ba3d8/6ba3d8.png" width="14"/> | `--accent` | primary — steel glow | `#6ba3d8` |
| <img src="https://placehold.co/18x18/2dd4bf/2dd4bf.png" width="14"/> | `--accent-2` | secondary — teal | `#2dd4bf` |
| <img src="https://placehold.co/18x18/b8d6ed/b8d6ed.png" width="14"/> | `--accent-3` | highlight — ice / "Joi white" | `#b8d6ed` |
| <img src="https://placehold.co/18x18/ff4d36/ff4d36.png" width="14"/> | `--accent-4` | **V-K warning only** — crimson | `#ff4d36` |
| <img src="https://placehold.co/18x18/050608/050608.png" width="14"/> | `--bg` | the void | `#050608` |

> 🌧️ Each of the three themes re-binds these tokens — including a dedicated set of globe variables — so every subsystem, down to the rotating Earth, recolors itself with no reload.

---

## ⚙️ RUN IT LOCAL

It's a static site — any server works:

```bash
# clone
git clone https://github.com/notChewy1324/cgSite.git
cd cgSite

# serve (pick one)
python3 -m http.server 8080
#   or
npx serve .
```

Then open `http://localhost:8080` 🌐

> Note: the defense grid will honestly report `EXPOSED` for most shields on a local
> server — `_headers` only applies at the Cloudflare edge. That's the point of it
> being real.

---

## 🚀 DEPLOY

Configured for Cloudflare Pages via `wrangler.jsonc`:

```bash
npm install -g wrangler
wrangler pages deploy .
```

> ⚠️ If you ever edit the inline theme-bootstrap `<script>` in the HTML heads, the CSP
> hash in `_headers` must be recomputed — the command to do it is written in a comment
> at the top of that file. All six pages share one identical inline script on purpose.
>
> 🧊 `style.css` and `main.js` are linked as `style.css?v=YYYYMMDD` / `main.js?v=YYYYMMDD`.
> Bump that stamp in all six pages whenever either file changes — the zone's browser cache
> TTL holds them for hours, and a fresh page with a stale script is how bugs get shipped.
>
> 🔐 HSTS is requested in `_headers`, but the zone-level setting in the Cloudflare dashboard
> (SSL/TLS → Edge Certificates → HSTS) wins. If the defense grid reports HSTS as `DISABLED`,
> that toggle is why.

---

## 🗂️ PROJECT STRUCTURE

```
cgSite/
├── index.html              # 🪪 home / personnel file
├── background.html         # 🎓 academic + experience record
├── builds.html             # 🛠️ flagship project dossiers
├── blog.html               # 📝 field notes
├── archive.html            # 🗂️ terminal + V-K + memory puzzle + 3D loadout + uplink console
├── 404.html                # 💀 fallback
├── style.css               # 🎨 all styling, themes, components
├── main.js                 # ⚡ all behavior + build data (PROJECTS, V-K questions, etc.)
├── markdown.js             # 🔤 tiny safe Markdown renderer for blog posts (browser + Node)
├── posts/                  # 📝 one Markdown file per field note + generated index.json
├── tools/blog.mjs          # 🧰 scaffolds posts, rebuilds posts/index.json and feed.xml
├── feed.xml                # 📡 generated RSS feed
├── _headers                # 🛡️ Cloudflare Pages security header policy (CSP, HSTS, ...)
├── _redirects              # ↪️ legacy URLs + keeps repo housekeeping files off the public site
├── robots.txt              # 🤖 crawlers welcome, replicants tolerated
├── sitemap.xml             # 🗺️ for the indexers
├── .well-known/
│   └── security.txt        # 📨 RFC 9116 disclosure channel
├── js/
│   └── three.min.js        # 🧊 vendored Three.js r128 (no CDN)
├── fonts/                  # 🔤 self-hosted variable woff2 (no Google Fonts at runtime)
├── wrangler.jsonc          # ☁️ Cloudflare Pages config
├── docs/                   # 📜 embedded PDFs (white papers, diagram)
└── imgs/                   # 🖼️ favicons, touch icons, og-card social image
```

> 📝 **Editing content:** builds live in `window.PROJECTS` at the top of `main.js`. Add an
> object — it renders itself, card *and* modal included. Blog posts are separate Markdown
> files — see **Writing a field note** below.
>
> 📜 **Build documents:** the Bearcast dossier embeds PDFs from a `docs/` folder next to
> `index.html` (committed to the repo; Cloudflare Pages serves them as static files).
> Expected files: `docs/BearcastMedia-Technical-WhitePaper-v2.0.pdf`, `docs/BearcastMedia-Cybersecurity-WhitePaper-v2.0.pdf`,
> and `docs/BearcastMedia-Architecture-Diagram-v2.0.pdf`. Keep each under ~25 MB (Cloudflare Pages per-file limit).

---

## ✍️ WRITING A FIELD NOTE

Field Notes is a real blog: every post is one Markdown file in `/posts`, and nothing about
a post lives in `main.js`.

```bash
node tools/blog.mjs new "why i rebuilt my home lab"   # creates posts/NX-0007.md as a draft
# ...write the post, then delete the "draft: true" line...
node tools/blog.mjs                                    # rebuilds posts/index.json + feed.xml
```

Commit the post together with the two regenerated files and deploy. That's the whole workflow.

A post starts with a small header, then plain Markdown:

```markdown
---
id: NX-0007
title: why i rebuilt my home lab
date: 2026-11-13
tags: LAB, NOTES
color: teal
excerpt: One or two sentences for the card and the RSS feed.
---

Opening paragraph.

## a section heading

Text with **bold**, *italic*, `inline code`, and a [link](https://example.com).

> A pull quote.
```

- **Supported Markdown:** `##` / `###` headings, paragraphs, bold, italic, inline code, fenced
  code blocks, blockquotes, bullet and numbered lists, links, images, and `---` rules.
  Raw HTML is shown as text on purpose — the renderer ([`markdown.js`](./markdown.js)) escapes
  everything first, so a post can never inject markup.
- **Images:** put them in `imgs/` and reference them as `![alt text](imgs/my-diagram.png)`.
  The CSP only allows images from this site.
- **`color`** tints the card: empty (steel), `teal`, `ice`, or `red`.
- **Drafts** (`draft: true`) stay out of the index and the feed. They are unlisted, not
  private: a committed draft file is still reachable by anyone who guesses its URL.
- **Links:** every post is addressable as `/blog#NX-0007`, and the feed is at `/feed.xml`.
- The tool is a convenience, not a build step — the deployed site is still plain static
  files. `posts/index.json` can be edited by hand if you'd rather.

---

## 🔌 ESTABLISH UPLINK

- 🌐 **Site** — [camgarrison.com](https://camgarrison.com)
- 📨 **Disclosure** — [/.well-known/security.txt](https://camgarrison.com/.well-known/security.txt)

<div align="center">

---

`© 2026 CAM GARRISON ◊ ARCHIVE NX-1324 ◊ THIS RECORD WILL NOT REMEMBER YOU`

⛓️ *Cells interlinked within cells interlinked.* ⛓️

</div>
