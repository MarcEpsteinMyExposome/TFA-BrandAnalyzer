# CLAUDE.md - Project Context

## Project Overview

**Project:** Technology for Artists - Brand Health Analyzer (Tool 3)
**Status:** Feature-complete (v0.5) — pending Vercel deploy
**Full Plan:** `C:\Users\marce\.claude\plans\tool3-brand-consistency-analyzer.md` — **READ THIS FIRST**
**Predecessor:** Tool 2 (Tech Intake Questionnaire) at `C:\Users\marce\Documents\Projects\TechForArtistsQuestionaire`

An AI-powered brand health analyzer for artists. The artist provides links to their online presences and uploads screenshots of walled platforms. The app auto-fetches public pages, then sends everything to Claude (Sonnet 4.5) for a two-part analysis:
- **Part 1: Consistency** — do your platforms match each other? (name, bio, visual, contact, cross-links, tone)
- **Part 2: Completeness** — what's missing? (platform coverage, purchase path, social proof, events, artist story)

Returns a structured report with scores, specific findings, and prioritized action items.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | Same as Tools 1-2 |
| Language | TypeScript 5 | Same |
| UI | React 19 + Tailwind CSS 4 | Same |
| State | Zustand 5 with persist | Same |
| Validation | Zod 3 | Same |
| Testing | Jest 29 + React Testing Library | Same |
| **AI** | **@anthropic-ai/sdk** | **NEW** — Claude API for multimodal analysis |
| **Fetching** | **cheerio + @mozilla/readability** | **NEW** — server-side HTML parsing |
| **Streaming** | **Vercel AI SDK (`ai`)** | **NEW** — streaming Claude responses to UI |
| Hosting | Vercel | Same |

### Environment Variables
- `ANTHROPIC_API_KEY` — Claude API key (server-side only, never exposed to browser)
- `NEXT_PUBLIC_SITE_URL` — for OG meta tags

---

## Key Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm test         # Run tests
npm run build    # Production build
npm run lint     # Run ESLint
```

---

## Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero, "How It Works", CTA to start analysis |
| Analyze | `/analyze` | 4-step flow: URLs -> Screenshots -> Processing -> Report |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/fetch-page` | POST | Fetch + parse a single URL, return extracted content |
| `/api/analyze` | POST | Send all data to Claude, stream back analysis |

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **This file** - Start here |
| `FUTURES.md` | Future features roadmap & brainstormed extensions |
| `TASKS.md` | Task list with status |
| `SESSION.md` | Session notes for continuity |
| `ARCHITECTURE.md` | System architecture, data flow |
| `DECISIONS.md` | Architectural Decision Records |
| `PATTERNS.md` | Code patterns, testing conventions |

---

## Project Structure

```
TFA-BrandAnalyzer/
├── app/
│   ├── layout.tsx                  # Root layout + branding
│   ├── page.tsx                    # Landing page
│   ├── globals.css                 # Tailwind + global styles
│   ├── analyze/
│   │   └── page.tsx                # Analysis flow page
│   ├── api/
│   │   ├── fetch-page/
│   │   │   └── route.ts            # URL fetching endpoint
│   │   └── analyze/
│   │       └── route.ts            # Claude analysis endpoint
│   ├── not-found.tsx               # 404 page
│   └── error.tsx                   # Error boundary
│
├── components/
│   ├── analyze/                    # Analysis flow components
│   │   ├── AnalysisShell.tsx       # Main layout (stepper + content)
│   │   ├── StepIndicator.tsx       # Step 1-2-3-4 progress
│   │   ├── UrlInputStep.tsx        # Step 1: Enter URLs
│   │   ├── ScreenshotStep.tsx      # Step 2: Upload screenshots
│   │   ├── ProcessingStep.tsx      # Step 3: Fetching + analyzing
│   │   └── ReportStep.tsx          # Step 4: Results
│   │
│   ├── url-input/                  # URL entry components
│   │   ├── PlatformUrlField.tsx
│   │   ├── AddPlatformButton.tsx
│   │   └── PlatformIcon.tsx
│   │
│   ├── screenshots/                # Screenshot components
│   │   ├── ScreenshotGuide.tsx
│   │   ├── ScreenshotUpload.tsx
│   │   ├── ImagePreview.tsx
│   │   └── guides/                 # Per-platform instructions
│   │
│   ├── report/                     # Report display components
│   │   ├── BrandReport.tsx         # Full two-part report layout
│   │   ├── DualScoreHero.tsx       # Side-by-side scores
│   │   ├── ScoreGauge.tsx          # Visual score indicator
│   │   ├── ConsistencyPanel.tsx    # Part 1 display
│   │   ├── MismatchCard.tsx        # Consistency finding
│   │   ├── PlatformComparisonTable.tsx
│   │   ├── CompletenessPanel.tsx   # Part 2 display
│   │   ├── CompletenessGapCard.tsx # Completeness finding
│   │   ├── ActionItemList.tsx      # Combined prioritized fixes
│   │   └── ReportActions.tsx       # Print, email, download
│   │
│   ├── ui/                         # Shared UI (copied from Tool 2)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── SectionHeading.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── platforms/                  # Platform registry + detection
│   │   ├── registry.ts
│   │   ├── detect.ts
│   │   └── types.ts
│   │
│   ├── fetching/                   # Server-side page fetching
│   │   ├── fetchPage.ts
│   │   ├── extractContent.ts
│   │   ├── extractors/
│   │   └── types.ts
│   │
│   ├── analysis/                   # Claude API integration
│   │   ├── client.ts
│   │   ├── buildPrompt.ts
│   │   ├── parseReport.ts
│   │   ├── prompt-template.ts
│   │   └── types.ts
│   │
│   ├── images/                     # Image processing
│   │   ├── resize.ts
│   │   ├── toBase64.ts
│   │   └── types.ts
│   │
│   ├── schemas/                    # Zod validation
│   ├── store/                      # Zustand state management
│   └── testing/                    # Mock data factories
│
├── public/
│   ├── platforms/                  # Platform icons (SVGs)
│   └── screenshot-examples/        # Guide example images
│
├── __tests__/                      # Tests (mirrors source structure)
│
├── CLAUDE.md                       # This file
├── TASKS.md                        # Task tracking
├── SESSION.md                      # Session notes
├── ARCHITECTURE.md                 # Architecture doc
├── DECISIONS.md                    # ADRs
└── PATTERNS.md                     # Code patterns
```

---

## Implementation Plan

**Full plan:** `C:\Users\marce\.claude\plans\tool3-brand-consistency-analyzer.md`

8 iterations, 30 tasks, heavy parallelism:

| IT | Name | Key Deliverable | Agents |
|----|------|----------------|--------|
| 1 | Project Scaffold | Repo, configs, docs, shared UI, landing page | 4 |
| 2 | Data Layer | Schemas, store, platform registry | 3 |
| 3 | URL Input | Step 1 UI, URL validation, platform detection | 3 |
| 4 | Web Fetching | Server-side fetch + parse, progress UI | 3 |
| 5 | Screenshots | Upload component, platform guides, step integration | 3 |
| 6 | Claude Engine | API integration, prompt, streaming, parsing | 2-3 |
| 7 | Report Display | Dual scores, consistency, completeness, actions, export | 5 |
| 8 | Polish + Deploy | Accessibility, mobile, error handling, Vercel | 5 |

---

## Branding & Design

- **Same TFA brand** as Tools 1-2: clean, minimal, neutral palette
- `bg-gray-50` body, `gray-900` text, white cards with `gray-200` borders
- Art-forward landing page (public domain art for v1, Marcel's art later)
- Warm, professional tone throughout

---

## Critical Lessons from Tool 2

### Tests Must Read Source First
**CRITICAL:** When spawning agents to write tests, the agent MUST read the actual source file before writing any tests. In Tool 2 IT2, an agent wrote 50 tests based on assumptions about the API — all 50 failed. Tests must reflect what the code actually does.

### Windows Path Gotcha
- Bash tool mangles backslash paths: `tail C:\Users\...` becomes `C:Users...`
- **Always use the Read tool** for reading files with Windows paths
- If Bash is required, convert to forward slashes: `C:/Users/marce/...`

### Tailwind CSS 4 Opacity Syntax
```typescript
// CORRECT (Tailwind 4)
className="bg-indigo-900/30 border-indigo-500/50"

// WRONG (Tailwind 3 — breaks in Tailwind 4)
className="bg-indigo-900 bg-opacity-30"
```

### Zustand Hydration
SSR → client rehydration requires guarding:
```typescript
const [hydrated, setHydrated] = useState(false)
useEffect(() => { setHydrated(true) }, [])
if (!hydrated) return <LoadingState />
```

### JSON Config Files
Corrupted JSON in settings files (e.g., period instead of comma) silently breaks all permissions. Be careful with manual edits.

---

## User Workflow Preferences

- **Run parallel subagents** to keep chat free for discussion
- **Wave-based approach:** independent work parallel, integration sequential, tests last
- **Main agent stays in chat** — ALL implementation work delegated to subagents
- **Task files** as separate .md files under `.claude/tasks/`
- **Task IDs:** `IT{iteration}-{number}` (e.g., IT1-01, IT1-02)
- **Always update docs** after completing work (TASKS.md, CLAUDE.md, SESSION.md)

---

## Task Management Protocol

**When completing a task:**
1. Mark status as `DONE` in `TASKS.md`
2. Update the task file with completion notes
3. **Move task file to `.claude/tasks/archive/`**
4. Update `SESSION.md` with session notes
5. Update `CLAUDE.md` if features changed

Task specs live in `.claude/tasks/` (active) and `.claude/tasks/archive/` (completed).

---

## Reference: Tool 2 Source

The predecessor project (Tech Intake Questionnaire) has working examples of:
- Shared UI components (Button, Card, Input, Select, SectionHeading)
- Zustand store with persist middleware
- Zod schema patterns
- Jest + RTL test patterns
- Next.js App Router page structure
- Formspree email integration

Located at: `C:\Users\marce\Documents\Projects\TechForArtistsQuestionaire`

Copy patterns and UI components from there — don't reinvent.

---

## Getting Started

1. Read the full plan: `C:\Users\marce\.claude\plans\tool3-brand-consistency-analyzer.md`
2. Start with **Iteration 1** — 4 parallel tasks:
   - IT1-01: Repo scaffold + tooling (`create-next-app`, Jest, dependencies)
   - IT1-02: Documentation system (this file is already started)
   - IT1-03: Shared UI components (copy from Tool 2)
   - IT1-04: Landing page
3. Run `npm test` + `npm run build` to verify before moving to IT2

---

## Common Issues

### Testing Patterns
- Use accessible queries: `getByRole`, `getByLabelText` (not test IDs)
- Test user behavior, not implementation details
- All features require tests before completion

### Zod Validation
- Schemas are source of truth for TypeScript types
- Use `safeParse()` for user input validation
- All data entering system must be validated

### Next.js App Router
- Server components by default, add `'use client'` only when hooks are needed
- API routes in `app/api/[name]/route.ts`
- Use `NextResponse.json()` for API responses
