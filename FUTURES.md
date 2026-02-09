# Future Features & Roadmap — Brand Health Analyzer

**Project:** Technology for Artists - Brand Health Analyzer (Tool 3)
**Created:** 2026-02-08
**Purpose:** Capture all future feature ideas, extensions, and enhancements beyond v0.5

---

## Quick Reference: What's Already Built (v0.8)

- 4-step flow: URLs → Screenshots → Processing → Report
- Auto-fetch public pages + guided screenshot upload for walled platforms
- Multi-screenshot per platform
- Claude Sonnet 4.5 analysis (consistency + completeness)
- Streaming response with real-time preview
- Formspree email report delivery
- Session persistence + resume
- Report source appendix
- Tuning notes for analysis customization
- 14-platform registry
- .docx report export with embedded screenshot thumbnails

---

## TIER 1: High-Impact, Near-Term (v1.0)

### 1.1 Web Presence Search — "Where Are You on the Internet?"
**User idea.** Before the artist even enters URLs, search the web for their name/brand and discover where they show up. This answers: "What platforms am I on that I forgot about?" and "What do people find when they Google me?"

**Implementation approach:**
- Add a "Search for your brand" input (artist name or brand name)
- Use a search API (Google Custom Search, Bing Web Search, or SerpAPI) to find references
- Parse results and match against platform registry
- Present found platforms as pre-filled suggestions in the URL input step
- Also surface unexpected mentions: blog features, press, marketplace listings, expired domains

**Why it matters:** Artists often forget about old profiles (DeviantArt from 10 years ago, a Tumblr, a forgotten Etsy). These abandoned profiles hurt brand consistency.

---

### 1.2 Search Visibility Analysis — "How Do You Rank?"
**User idea.** Analyze where the artist appears in search results for relevant terms. This is basically an artist-focused SEO audit.

**Implementation approach:**
- Search for the artist's name, brand name, and key terms (e.g., "[name] art", "[name] paintings", "[name] artist")
- Record which position each platform appears in search results
- Check if the artist's own website ranks above or below third-party platforms
- Check Google Knowledge Panel presence
- Report findings: "Your Etsy shop ranks #3 for 'Jane Smith art' but your website doesn't appear in the top 20"

**Why it matters:** An artist can have perfect brand consistency but still be invisible. This bridges the gap between "brand health" and "brand discoverability."

---

### 1.3 Editable Report Export (.docx) — DONE
**Status:** Implemented in v0.8
**Goal:** "Download as Word" button on the report page that generates a styled, editable .docx document.

**Why .docx over other formats:**
- Fully editable in Word, Google Docs (upload), LibreOffice
- Can include styled tables, colored cells, headers, images
- No external API keys needed (pure client-side generation)
- Google Docs upgrade path later if collaborative editing is needed

**Implementation plan:**

#### 1. Install dependency
- `npm install docx` — the `docx` npm package generates .docx files programmatically
- `npm install file-saver` — triggers browser download (or use native Blob + anchor approach)

#### 2. Create `lib/export/generateDocx.ts`
Takes a `BrandReport` + `PlatformEntry[]` and returns a .docx Blob. Structure:

```
TECHNOLOGY FOR ARTISTS — BRAND HEALTH REPORT
═══════════════════════════════════════════════

Executive Summary
[report.summary]

───────────────────────────────────────────────
BRAND CONSISTENCY — [score]/100
───────────────────────────────────────────────

┌──────────────┬───────┬──────────────────────────────┐
│ Category     │ Score │ Summary                      │
├──────────────┼───────┼──────────────────────────────┤
│ Name         │  85   │ Consistent across all...     │
│ Bio          │  62   │ Significant variation in...  │
│ Visual       │  78   │ Profile photos match but...  │
│ Contact      │  90   │ Email consistent, phone...   │
│ Cross-Links  │  45   │ Most platforms don't link... │
│ Tone         │  71   │ Generally professional...    │
└──────────────┴───────┴──────────────────────────────┘

Mismatches Found:
🔴 HIGH — [description] (Instagram, Website)
   → Recommendation: [recommendation]
🟡 MEDIUM — [description] (Facebook, LinkedIn)
   → Recommendation: [recommendation]

───────────────────────────────────────────────
BRAND COMPLETENESS — [score]/100
───────────────────────────────────────────────

[Same table + gaps format as consistency]

───────────────────────────────────────────────
ACTION ITEMS (Priority Order)
───────────────────────────────────────────────

┌────┬──────────┬─────────────────────────┬──────────┬────────┬──────────┐
│ #  │ Platform │ Action                  │ Impact   │ Effort │ Source   │
├────┼──────────┼─────────────────────────┼──────────┼────────┼──────────┤
│ 1  │ Website  │ Add purchase link to... │ High     │ Quick  │ Complete │
│ 2  │ Instagram│ Update bio to match...  │ High     │ Quick  │ Consist  │
└────┴──────────┴─────────────────────────┴──────────┴────────┴──────────┘

Sources Analyzed:
- Website: https://... (fetched)
- Instagram: (3 screenshots)
- Facebook: https://... (fetched)

───────────────────────────────────────────────
Generated by Technology for Artists — Brand Health Analyzer v0.5
```

**Styling details for the .docx:**
- TFA branding: header with "Technology for Artists"
- Score tables with colored cell backgrounds (green ≥80, yellow 50-79, red <50)
- Severity badges via colored text (red=high, orange=medium, gray=low)
- Action items table with alternating row shading
- Page breaks between major sections
- Footer with generation date + version

#### 3. Create `components/report/DownloadDocxButton.tsx`
- Button on the report page: "Download Report (.docx)"
- Calls `generateDocx(report, platforms)` → receives Blob → triggers download
- File named: `brand-health-report-YYYY-MM-DD.docx`

#### 4. Wire into ReportStep / ReportActions
- Add the download button alongside existing Print and Copy buttons
- Also optionally email the .docx as a Formspree attachment (or just email a note saying "report downloaded")

#### 5. Tests
- `__tests__/lib/export/generateDocx.test.ts` — verify Blob is generated, basic structure
- `__tests__/components/report/DownloadDocxButton.test.tsx` — button renders, click triggers download

#### 6. Future upgrade path
- Swap .docx for Google Docs API if collaborative editing is needed later
- Same `generateDocx` data could feed into a Google Doc builder
- Could also render score gauge images via canvas and embed in .docx for visual flair

---

### 1.3b Email/.docx Alignment
**Status:** Future idea
**Problem:** The auto-email (Formspree) sends a plain-text summary with only the top 5 findings, while the .docx export has color-coded tables, all findings, and TFA branding. Two very different documents for the same report.

**Options:**
1. **Replace Formspree with an attachment-capable service** (Resend, SendGrid) — generate .docx server-side, attach to email. Higher value, more setup.
2. **Enrich the plain-text email** — include all findings, better formatting. Limited by Formspree's text-only capability.
3. **Keep as-is** — email is a lightweight notification to TFA; .docx is the real deliverable for the artist.

**Note:** Formspree doesn't support file attachments, so Option 1 requires migrating to a different email provider.

---

### 1.3c PDF Export (Lower Priority)
**Currently:** Print-to-PDF only (browser print dialog).
**Enhancement:** Generate a styled PDF report with branding, charts, and action items that can be saved and shared. Use a library like `@react-pdf/renderer` or `puppeteer` for server-side generation. Lower priority than .docx since PDF is not editable.

---

### 1.4 Website Health & Technical Audit — "Is Your Website Actually Working?"
**User idea (Marcel).** Expand from "brand consistency" into a full website health tool. The current analyzer checks if platforms *match each other* and if anything is *missing* — but it doesn't check if the website itself is technically healthy. Dead links, slow loading, missing meta tags, broken SSL, accessibility issues — these are invisible to the artist but visible to every visitor and search engine.

**Why this matters for artists:**
- Artists are NOT developers — they won't run Lighthouse or Screaming Frog themselves
- A beautiful portfolio site with broken links, slow loading, and missing alt text is undermining the artist's work silently
- This turns the tool from "brand analysis" into a true "online presence health check"

---

#### Research Findings

**What existing tools check (and we should selectively adopt):**

| Category | What To Check | Tools That Do It |
|----------|--------------|-----------------|
| Dead links | Broken internal/external links, 404s, redirect chains | Screaming Frog, Ahrefs, Semrush |
| Performance | Page speed, Core Web Vitals, time to interactive | Lighthouse, PageSpeed Insights, GTmetrix |
| SSL/Security | Certificate validity, HTTPS enforcement, mixed content | SSL Labs, SecurityHeaders.com |
| Meta tags | Title, description, OG image, Twitter cards | Any SEO auditor |
| Accessibility | Alt text, contrast, ARIA, heading structure | axe-core, Lighthouse, WAVE |
| Structured data | Schema.org markup, JSON-LD | Google Rich Results Test |
| SEO basics | H1 tags, canonical URLs, sitemap, robots.txt | Any SEO auditor |
| Content freshness | Copyright year, last-updated dates, stale events | Manual / Claude analysis |
| Mobile | Responsive design, touch targets, viewport | Lighthouse, Chrome DevTools |
| Social meta | OG tags, Twitter Card tags, share preview | Facebook Debugger, Twitter Card Validator |

**What Claude can already assess (no new tools needed):**
- Content quality and readability scoring (from fetched HTML)
- HTML structure analysis (heading hierarchy, semantic HTML)
- Meta tag completeness (we already fetch the HTML)
- Content freshness (copyright dates, stale event listings)
- Visual assessment from screenshots (layout quality, mobile issues)

**What needs programmatic checks (Claude can't do these):**
- Actually following links to check if they're broken (needs HTTP HEAD requests)
- Real page speed / Core Web Vitals measurement
- SSL certificate inspection
- DNS resolution checks
- Actual accessibility rule checking (WCAG compliance)

---

#### Available MCP Servers

These existing MCP servers could plug directly into the analyzer:

| MCP Server | GitHub | What It Does | Maturity |
|------------|--------|-------------|----------|
| **Lighthouse MCP** | [danielsogl/lighthouse-mcp-server](https://github.com/danielsogl/lighthouse-mcp-server) | 13+ Lighthouse audit tools: performance, accessibility, SEO, security | Active, well-documented |
| **A11y MCP** | (skywork.ai) | Accessibility snapshots, WCAG checking via AI | Newer |
| **Schema.org Scraper MCP** | [Apify datavault/schemaorg](https://apify.com/datavault/schemaorg/api/mcp) | Extract JSON-LD, meta tags, OG tags, Twitter Cards | Active (Apify platform) |
| **SEO Inspector MCP** | [mgsrevolver/seo-inspector-mcp](https://github.com/mgsrevolver/seo-inspector-mcp) | On-page SEO audits from within Cursor/Claude | Active |
| **SE Ranking MCP** | [seranking/seo-data-api-mcp-server](https://github.com/seranking/seo-data-api-mcp-server) | Keyword research, domain analysis, backlinks, website audits | Active (needs SE Ranking account) |
| **SEO MCP (Ahrefs)** | [cnych/seo-mcp](https://github.com/cnych/seo-mcp) | Free SEO data based on Ahrefs | Active |

**Recommendation:** The **Lighthouse MCP Server** is the most relevant — it provides performance, accessibility, SEO, and security in one package. However, for v1.4 we should build the checks natively (simpler, no MCP dependency) and consider MCP integration as a v2 enhancement.

---

#### Available NPM Libraries (no external API keys needed)

| Library | npm | Purpose | Notes |
|---------|-----|---------|-------|
| **linkinator** | [linkinator](https://www.npmjs.com/package/linkinator) v7.5.3 | Broken link checking | Actively maintained, most popular |
| **axe-core** | [@axe-core/core](https://www.npmjs.com/package/axe-core) | Accessibility rule engine (WCAG 2.x) | Industry standard, used by Lighthouse |
| **cheerio** | (already installed) | HTML parsing for meta tags, headings, structure | Already in the project |
| **ssl-checker** | [ssl-checker](https://www.npmjs.com/package/ssl-checker) | SSL certificate status and expiry | Lightweight |

---

#### Free APIs (no cost for our volume)

| API | Free Tier | What It Returns | Integration |
|-----|-----------|----------------|-------------|
| **Google PageSpeed Insights** | Unlimited (API key recommended) | Full Lighthouse scores: performance, accessibility, SEO, best practices, Core Web Vitals | REST API, simple GET request |
| **SSL Labs API** | Free (rate limited) | Full SSL certificate analysis | REST API |
| **Google Safe Browsing** | Free (15k lookups/day) | Malware/phishing detection | REST API |

**Key insight:** The [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started) is the single most valuable free API — one call returns Lighthouse performance, accessibility, SEO, and best practices scores. No API key needed for basic use.

---

#### Implementation Plan

**Phase 1: Quick Wins (server-side, no new APIs)**
Add these checks to the existing `/api/analyze` flow or a new `/api/health-check` endpoint. These use data we already have (fetched HTML) or simple HTTP checks:

1. **Meta tag audit** — parse fetched HTML for title, description, OG tags, Twitter Cards, canonical URL, viewport tag
2. **Heading structure** — check for H1 presence, heading hierarchy (H1 → H2 → H3, not H1 → H4)
3. **Image alt text** — scan all `<img>` tags for missing alt attributes
4. **Content freshness** — look for copyright years, dates in content, stale event listings
5. **Basic link extraction** — extract all links from fetched pages (internal + external)
6. **HTTPS check** — does the URL redirect HTTP → HTTPS properly?

*These checks run on already-fetched HTML — zero additional API calls.*

**Phase 2: Link Health (new server-side checks)**
6. **Dead link checker** — use `linkinator` to check all extracted links (HTTP HEAD requests)
7. **Redirect chain detection** — flag links that bounce through 3+ redirects
8. **Social link validation** — verify that cross-platform links actually resolve

*New API route: `POST /api/check-links` — runs after page fetch, before Claude analysis.*

**Phase 3: Performance & Accessibility (external API)**
9. **PageSpeed Insights integration** — one API call per artist website URL, returns performance/accessibility/SEO scores
10. **Core Web Vitals** — LCP, FID, CLS from the same API response
11. **Accessibility score** — from Lighthouse via PageSpeed API

*New API route: `POST /api/page-speed` — calls Google PSI API, caches results.*

**Phase 4: SSL & Security**
12. **SSL certificate check** — use `ssl-checker` npm package: valid, expiry date, issuer
13. **Mixed content detection** — HTTP resources loaded on HTTPS pages
14. **Security headers** — check for HSTS, X-Frame-Options, CSP (from fetched response headers)

**Phase 5: Report Integration**
15. **New report section: "Website Health"** — add a third section to the report alongside Consistency and Completeness
16. **Health score** — weighted composite of all technical checks
17. **Claude synthesis** — send health check results to Claude for plain-English interpretation: "Your website loads in 8 seconds — most visitors will leave before seeing your art"
18. **Actionable fixes** — merge health issues into the existing Action Items list with effort/impact ratings

---

#### Architecture: Where Each Check Runs

```
┌─────────────────────────────────────────────────────────┐
│                    EXISTING FLOW                        │
│  URLs → Fetch HTML → Screenshots → Claude Analysis      │
│                                                         │
│  ADDED: Health Check Pipeline (parallel to Claude)      │
│  ┌──────────────────────────────────────────────┐      │
│  │ Phase 1: HTML Analysis (cheerio)              │      │
│  │  • Meta tags, headings, alt text, freshness   │      │
│  │  • Runs on already-fetched HTML — FREE        │      │
│  ├──────────────────────────────────────────────┤      │
│  │ Phase 2: Link Checker (linkinator)            │      │
│  │  • HTTP HEAD each link extracted in Phase 1   │      │
│  │  • Parallel, ~2-5s total                      │      │
│  ├──────────────────────────────────────────────┤      │
│  │ Phase 3: PageSpeed API (Google, free)         │      │
│  │  • One GET per website URL                    │      │
│  │  • Returns Lighthouse scores + CWV            │      │
│  ├──────────────────────────────────────────────┤      │
│  │ Phase 4: SSL Check (ssl-checker npm)          │      │
│  │  • One check per domain                       │      │
│  │  • Certificate validity + expiry              │      │
│  └──────────────────────────────────────────────┘      │
│                         ↓                               │
│  Health results passed to Claude alongside content      │
│  Claude interprets + synthesizes in plain English       │
│                         ↓                               │
│  Report: Consistency + Completeness + Website Health    │
└─────────────────────────────────────────────────────────┘
```

**Key design decision:** Health checks run in *parallel* with Claude analysis (not sequentially), so total time barely increases. Results are then fed to Claude for interpretation.

---

#### New Report Section: Website Health

```
───────────────────────────────────────────────
WEBSITE HEALTH — [score]/100
───────────────────────────────────────────────

Performance: 72/100       Accessibility: 85/100
SEO Score:   68/100       Security:      90/100

Issues Found:

🔴 HIGH — 3 broken links found across your platforms
   → /exhibitions links to a page that returns 404
   → Instagram bio link redirects to an expired landing page
   → "Buy prints" links to a Shopify store that's been closed

🟡 MEDIUM — Missing meta description on homepage
   → Search engines show a random snippet instead of your artist statement
   → Add: <meta name="description" content="[your 150-char summary]">

🟡 MEDIUM — 12 images have no alt text
   → Screen readers can't describe your artwork to visually impaired visitors
   → Search engines can't index your art by subject/medium

🟢 LOW — SSL certificate expires in 45 days
   → Your hosting provider should auto-renew, but verify

Page Speed: 3.2s load time (target: <2.5s)
   → Largest Contentful Paint: hero image is 4.2MB (resize to <500KB)
   → Consider lazy-loading gallery images below the fold
```

---

#### Effort Estimate

| Phase | Effort | New Dependencies | API Keys Needed |
|-------|--------|-----------------|----------------|
| Phase 1: HTML analysis | Small (1-2 sessions) | None (uses cheerio) | None |
| Phase 2: Link checker | Medium (1 session) | `linkinator` | None |
| Phase 3: PageSpeed | Medium (1 session) | None (REST API) | Optional (recommended) |
| Phase 4: SSL/Security | Small (1 session) | `ssl-checker` | None |
| Phase 5: Report integration | Medium-Large (2 sessions) | Schema + UI changes | None |

**Total: ~6-8 sessions**, can be phased in incrementally. Phase 1 alone adds significant value with zero new dependencies.

---

#### MCP Integration (Future Enhancement)

Once the native checks are working, MCP servers could extend them:
- **Lighthouse MCP** → full Lighthouse audit with more granularity than PageSpeed API
- **A11y MCP** → deeper WCAG compliance checking
- **SEO MCP servers** → backlink analysis, keyword positioning, competitor comparison
- These would be optional "power mode" features, not required for base functionality

---

#### Relationship to Existing FUTURES.md Items

This feature consolidates and supersedes several scattered ideas:
- **2.5 Link Health Checker** → becomes Phase 2 of this plan
- **2.7 Content Freshness Audit** → becomes part of Phase 1
- **3.6 Accessibility Audit** → becomes part of Phase 3
- **3.10 Domain & Technical Health** → becomes Phase 4
- Those sections remain in FUTURES.md for reference but are now covered here

---

### 1.5 Re-Analysis / Progress Tracking
**Currently:** Each analysis is ephemeral.
**Enhancement:** Save reports to a database. Allow re-running analysis on the same URLs and show a comparison: "Your consistency score improved from 62 → 78 since last month." Requires user accounts or at least a unique link system.

---

### 1.6 Integration with Tool 2 (Tech Intake Questionnaire)
Tool 2 collects detailed info about the artist's tech setup, goals, and challenges. That context could dramatically improve the brand analysis:
- If Tool 2 says the artist sells primarily through commissions, the completeness analysis should weight "purchase path" toward commission request forms rather than shop links
- If Tool 2 says the artist is a photographer, the analysis should expect portfolio-heavy platforms
- Pass Tool 2 data as additional context in the Claude prompt

---

## TIER 2: Medium-Impact Extensions (v1.x)

### 2.1 Competitor / Peer Comparison
Allow the artist to enter 1-3 URLs of artists they admire or compete with. Run the same analysis on those profiles and show a comparison:
- "Artist X has a purchase link on every platform. You're missing it on 3 of 5."
- "Artist Y's bio is consistent across all platforms. Yours varies significantly."
- Inspiration, not judgment — framed as "here's what's working for others in your space"

---

### 2.2 Platform-Specific Fix Wizards
**Already captured as a future idea.** After the report, offer guided walkthroughs:
- "Fix your Instagram bio" → step-by-step with screenshots showing where to go in the app
- "Add a shop link to your Facebook page" → specific instructions for that platform's UI
- Could use the same screenshot guide system already built for the screenshot step

---

### 2.3 "Ideal Profile" Templates
**Already captured.** For each platform, define what a complete, well-optimized artist profile looks like:
- Instagram: bio with medium + location + link in bio tool, highlight covers, consistent grid aesthetic
- Website: clear artist statement, contact form, portfolio, shop/commission info, about page
- Etsy: complete shop policies, about section with artist photo, clear item descriptions
- Grade the artist's actual profile against the ideal template

---

### 2.4 Social Proof Aggregation
Extend the analysis to actively find and catalog social proof:
- Search for reviews/testimonials mentioning the artist
- Find press mentions, blog features, podcast appearances
- Check Google Reviews, Yelp (for physical galleries), Facebook reviews
- Identify social proof the artist HAS but isn't leveraging (e.g., great Google reviews they never quote on their website)

---

### 2.5 Link Health Checker
Check every link found across all platforms:
- Broken links (404s)
- Redirect chains (old URLs that bounce through multiple redirects)
- HTTP vs HTTPS mismatches
- Links pointing to the wrong destination (e.g., Linktree link that goes to an old URL)
- "You have 3 broken links across your platforms" is an easy, high-impact finding

---

### 2.6 Image Consistency Analysis
Use Claude's vision capabilities more deeply:
- Compare profile photos across platforms — are they the same image? Same crop? Same vintage?
- Analyze color palette consistency across platforms
- Check if cover images / banners match or clash
- Identify outdated photos (e.g., a 2019 profile photo on LinkedIn vs a 2024 one on Instagram)
- "Your Instagram and website use warm earth tones, but your LinkedIn has a cold blue theme"

---

### 2.7 Content Freshness Audit
Check when each platform was last updated:
- Website: check for copyright year, blog post dates, event dates in the past
- Social media: last post date (where fetchable)
- "Your website still says '© 2023' and your events page lists shows from 2022"
- Stale content signals abandonment to potential buyers

---

## TIER 3: Advanced / Longer-Term (v2.0+)

### 3.1 Screen Sharing Mode
**Already captured.** Use `getDisplayMedia()` to let the artist share their screen while browsing their own profiles. The app captures frames automatically as they scroll, getting richer data than static screenshots.

**Challenges:** Limited mobile support, permission UX, frame selection intelligence.

---

### 3.2 OAuth Integration
**Already captured.** "Connect Instagram" / "Connect Facebook" buttons where the artist authorizes via the platform's own login flow. Gets richer data (follower count, engagement metrics, full profile fields) without screenshots.

**Challenges:** Requires platform developer app registration and review. Instagram/Facebook require Meta app review. Significant compliance overhead.

---

### 3.3 Saved Reports with Permalinks
**Already captured.** Store reports in a database with unique URLs. Artist can share their report link, revisit it later, or track progress over time.

**Requires:** Database (Postgres/Supabase), authentication or magic links, data retention policy.

---

### 3.4 Automated Monitoring / Alerts
Set up periodic re-checks of the artist's platforms:
- "Your Etsy shop title changed — it no longer matches your other platforms"
- "Your website SSL certificate expired"
- "Your Instagram bio link is now returning a 404"
- Could be a paid tier feature — monthly email with any changes detected

---

### 3.5 AI-Generated Fix Suggestions
Instead of just identifying problems, generate the actual fix:
- "Here's a suggested bio that would be consistent across all your platforms: [generated text]"
- "Here's an updated artist statement based on what we found across your profiles: [generated text]"
- Copy-paste ready improvements, not just advice

---

### 3.6 Accessibility Audit of Artist Platforms
Check the artist's own website for accessibility issues:
- Image alt text missing (critical for art websites!)
- Color contrast issues
- Mobile responsiveness
- "Your portfolio images have no alt text — screen reader users and search engines can't understand your art"
- This extends "completeness" into "quality"

---

### 3.7 Multi-Language / International Presence
For artists who sell internationally:
- Check if the website offers multiple languages
- Analyze if marketplace listings are optimized for different regions
- "Your Etsy shop ships worldwide but your descriptions are English-only"

---

### 3.8 E-commerce Deep Dive
For artists who sell online, go deeper into the purchase path:
- Check payment methods offered
- Analyze pricing presentation
- Review shipping/return policies
- Check if purchase path requires account creation (friction)
- "Your website requires account creation to buy — 70% of casual buyers abandon at this step"

---

### 3.9 Email / Newsletter Audit
Check if the artist has an email signup:
- Is there a signup form on the website?
- Is there a link to a newsletter in social bios?
- Does the artist mention email anywhere?
- "You have 5 active platforms but no email list — email is the only channel you fully own and control"

---

### 3.10 Domain & Technical Health
- DNS configuration (is the domain properly configured?)
- SSL certificate status and expiry
- Website loading speed (impacts both UX and SEO)
- Mobile-friendliness score
- "Your website takes 8 seconds to load on mobile — that's 3x slower than recommended"

---

## TIER 4: Ecosystem / Platform Ideas

### 4.1 Artist Dashboard
A central hub where the artist can:
- See all their reports over time
- Track improvements
- Get reminders ("It's been 3 months since your last check")
- Manage their platform list

### 4.2 TFA Tool Integration Hub
Connect all TFA tools:
- Tool 1 (whatever it is) feeds into Tool 2 feeds into Tool 3
- Unified artist profile across all tools
- "Based on your Tech Intake (Tool 2), here's what your Brand Analysis (Tool 3) should focus on"

### 4.3 White-Label / Consultant Mode
Let art consultants, gallery owners, or arts organizations run reports for their artists:
- Batch analysis: "Run reports for all 20 artists in my gallery"
- Comparison dashboard: "Which of my artists has the best online presence?"
- Branded reports with the consultant's logo

### 4.4 Community Benchmarks
Anonymized, aggregated data:
- "The average artist consistency score is 58. You're at 72 — above average!"
- "Most artists score lowest on Cross-Links. You're not alone."
- Helps artists understand where they stand relative to peers

### 4.5 API / Embed Mode
Offer the analysis as an API or embeddable widget:
- Art marketplaces could integrate it: "Check your brand health" button on Etsy seller dashboard
- Art schools could use it in curriculum
- Portfolio review services could include it

---

## Ideas Specifically From User (Marcel)

These were explicitly mentioned by the user and should be prioritized:

1. **Web search for artist references** (Tier 1.1) — "searching the web for references to the artist"
2. **Search term positioning** (Tier 1.2) — "inspecting where in search terms artist shows up"
3. **Screen sharing** (Tier 3.1) — mentioned in Session 0 planning
4. **OAuth integration** (Tier 3.2) — mentioned in Session 0 planning
5. **Integration with Tool 2** (Tier 1.5) — cross-tool data flow
6. **Marcel's art for landing page** — replace public domain art with Marcel's own artwork
7. **Two app modes** (user-facing vs admin) — mentioned in Session 4, partially implemented (currently shows report + emails)

---

## Implementation Priority Recommendation

If picking the next features after v0.8:

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | ~~.docx Report Export (1.3)~~ | **DONE** — implemented in v0.8 with screenshot thumbnails |
| 2 | **Website Health Audit (1.4)** | **Transforms tool from brand-only to full health check; phases 1-2 need no API keys** |
| 3 | Web Presence Search (1.1) | Unique differentiator, high wow-factor, answers a real pain point |
| 4 | Search Visibility (1.2) | Natural companion to 1.1, high value for artists |
| 5 | AI-Generated Fixes (3.5) | Leverages existing Claude integration |
| 6 | Re-Analysis Tracking (1.5) | Requires database, but huge retention value |
| 7 | Tool 2 Integration (1.6) | Strengthens the TFA ecosystem |

---

## Technical Considerations

### Search APIs (for features 1.1 and 1.2)
- **SerpAPI** — $50/mo for 5000 searches, easy REST API, returns structured results
- **Google Custom Search API** — Free tier: 100 queries/day, $5 per 1000 after
- **Bing Web Search API** — Free tier: 1000 calls/mo, good for starting
- **Brave Search API** — Free tier available, privacy-focused

### Database (for features 1.4, 3.3, 4.1)
- **Supabase** — free tier, Postgres, auth, realtime, good Next.js integration
- **PlanetScale** — MySQL, generous free tier, good for simple persistence
- **Vercel KV/Postgres** — native Vercel integration, simplest deployment

### PDF Generation (for feature 1.3)
- **@react-pdf/renderer** — React components → PDF, client-side
- **Puppeteer** — headless Chrome, server-side, can render existing React components
- **html2pdf.js** — client-side, converts DOM to PDF, simplest but least control

---

**Last updated:** 2026-02-09 (Session 5 — added §1.4 Website Health Audit plan)
**Status:** Living document — add ideas as they come up
