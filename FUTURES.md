# Future Features & Roadmap — Brand Health Analyzer

**Project:** Technology for Artists - Brand Health Analyzer (Tool 3)
**Created:** 2026-02-08
**Purpose:** Capture all future feature ideas, extensions, and enhancements beyond v0.5

---

## Quick Reference: What's Already Built (v0.5)

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

### 1.3 PDF Export
**Currently:** Print-to-PDF only (browser print dialog).
**Enhancement:** Generate a styled PDF report with branding, charts, and action items that can be saved and shared. Use a library like `@react-pdf/renderer` or `puppeteer` for server-side generation.

---

### 1.4 Re-Analysis / Progress Tracking
**Currently:** Each analysis is ephemeral.
**Enhancement:** Save reports to a database. Allow re-running analysis on the same URLs and show a comparison: "Your consistency score improved from 62 → 78 since last month." Requires user accounts or at least a unique link system.

---

### 1.5 Integration with Tool 2 (Tech Intake Questionnaire)
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

If picking the next features after v0.5:

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | Web Presence Search (1.1) | Unique differentiator, high wow-factor, answers a real pain point |
| 2 | Search Visibility (1.2) | Natural companion to 1.1, high value for artists |
| 3 | Link Health Checker (2.5) | Easy to implement, immediately actionable findings |
| 4 | PDF Export (1.3) | Most-requested feature for any report tool |
| 5 | Content Freshness (2.7) | Low effort, high insight |
| 6 | AI-Generated Fixes (3.5) | Leverages existing Claude integration |
| 7 | Re-Analysis Tracking (1.4) | Requires database, but huge retention value |
| 8 | Tool 2 Integration (1.5) | Strengthens the TFA ecosystem |

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

**Last updated:** 2026-02-08 (Session 4)
**Status:** Living document — add ideas as they come up
