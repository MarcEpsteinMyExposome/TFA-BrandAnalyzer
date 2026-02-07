# Architectural Decision Records

**Project:** Tech For Artists - Brand Health Analyzer (Tool 3)
**Purpose:** Document key decisions and their rationale

---

## ADR-001: Separate Repository

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Tool 3 gets its own repo (`TFA-BrandAnalyzer`), separate from Tools 1 and 2.

**Rationale:**
- Clean documentation — each tool has its own CLAUDE.md, TASKS.md, etc.
- Independent Claude Code instances per tool
- Independent deployment to Vercel
- Easier to combine later (monorepo) than to separate later

**Consequence:** Shared UI components are copied, not linked. This is fine at 3 tools; consider monorepo extraction at 4+.

---

## ADR-002: Hybrid Fetch + Screenshot Data Collection

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Auto-fetch public pages server-side; use guided screenshot uploads for walled platforms (Instagram, TikTok, Facebook, etc.).

**Alternatives considered:**
- OAuth integration — too complex for v1, requires platform app review
- User provides login credentials — security liability, ToS violations
- Screenshot-only — misses fetchable data, worse UX
- Fetch-only — can't access walled platforms

**Rationale:** Hybrid gives the best balance of data quality, security, and UX. Screenshots are zero-liability. Guided instructions make it easy.

**Future:** Screen sharing via `getDisplayMedia()` and/or OAuth integration in v2+.

---

## ADR-003: Claude API for Analysis (Sonnet 4.5)

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Use Claude Sonnet 4.5 via `@anthropic-ai/sdk` for runtime analysis. Opus for building the tool (dev work).

**Rationale:**
- Sonnet 4.5 is excellent at structured analysis + vision tasks
- ~$0.02-0.10 per analysis vs $0.10-0.50 for Opus
- Cost matters when real artists use it at scale
- Structured JSON output keeps parsing reliable

**Consequence:** Token budget management needed — truncate long page content, resize images client-side.

---

## ADR-004: Two-Part Analysis (Consistency + Completeness)

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Report has two distinct parts:
1. **Consistency** — do platforms match each other? (6 categories)
2. **Completeness** — what's missing? (5 categories)

**Rationale:**
- An artist can score high on consistency but low on completeness (or vice versa)
- Completeness surfaces opportunities artists don't know they're missing (no shop link, no testimonials, missing key platforms)
- "Where can I buy this?" check is one of the most common gaps
- Context-aware: doesn't penalize for irrelevant gaps based on artist's medium

**Consequence:** Report UI needs clear visual separation between the two parts. Action items carry a `source` badge.

---

## ADR-005: Streaming Responses

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Use Vercel AI SDK to stream Claude's analysis response to the client in real-time.

**Rationale:**
- Full analysis takes 10-30 seconds — streaming prevents "is it working?" anxiety
- Progressive display keeps the user engaged
- Vercel AI SDK provides clean abstraction over Server-Sent Events

**Alternative:** Wait for full response, show spinner. Rejected — poor UX for a 30-second wait.

---

## ADR-006: 4-Step UI Flow

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Analysis flow is 4 distinct steps: URLs → Screenshots → Processing → Report.

**Alternative:** 3 steps (merge fetch + screenshots into one screen). Rejected — cleaner UI with separation.

**Rationale:** Each step has a clear purpose and distinct UI. Users aren't overwhelmed. Progress indicator makes the flow feel manageable.

---

## ADR-007: No User Accounts for v1

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** No login, no accounts. Reports are ephemeral (exist only in browser state).

**Rationale:**
- Reduces friction to zero — artist can start immediately
- No backend/database needed for v1
- Rate limiting by IP is sufficient abuse prevention
- Email via Formspree handles report delivery

**Future:** Saved reports with permalinks requires a database (v2+).

---

## ADR-008: Warm Conversational Tone

**Date:** 2026-02-07
**Status:** Accepted (carried from Tool 2)

**Decision:** All user-facing copy uses warm, conversational tone. Not corporate, not overly casual.

**Examples:**
- "Let's check your brand health across the web"
- "We couldn't fetch this page — upload a screenshot instead"
- Not: "Error 403: Access Denied" or "Please provide authentication credentials"

---

## ADR-009: Max 10 Platforms Per Analysis

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** Limit to 10 platform URLs per analysis.

**Rationale:**
- Most artists have 4-6 online presences
- 10 gives headroom without blowing token budget
- More than 10 screenshots would hit API limits and increase cost significantly
- Can increase later if needed

---

## ADR-010: LinkedIn Fetch with Fallback

**Date:** 2026-02-07
**Status:** Accepted

**Decision:** LinkedIn is classified as fetchable. Try server-side fetch first; if it fails (login wall), gracefully fall back to screenshot upload.

**Rationale:** Many LinkedIn public profiles are accessible without login. Better to try and fall back than to preemptively require screenshots.

---

**Note:** Add new ADRs as architectural decisions are made during development.
