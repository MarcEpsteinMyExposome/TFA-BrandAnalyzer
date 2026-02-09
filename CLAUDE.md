# CLAUDE.md - Project Context

## Project Overview

**Project:** Technology for Artists - Brand Health Analyzer (Tool 3)
**Status:** v0.9 — deployed to Vercel, 689 tests passing
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

### `mkdir` Permission Blocked by Claude Code
`Bash(mkdir:*)` in settings.local.json does NOT auto-allow `mkdir` commands — Claude Code has a built-in safety override that always prompts for `mkdir` regardless of allow rules. Other filesystem-write commands (`git add`, `git commit`, `npm install`, `node`) auto-allow fine with the same `:*` syntax.
**Workaround:** Use `powershell -NoProfile -Command "New-Item -ItemType Directory -Path 'path' -Force"` (which auto-allows via `Bash(powershell:*)`) or use the Write tool to write a file in the target directory (which auto-creates parent dirs).

---

## Orchestration Charter

### Role
Claude acts as the **Orchestrator** for this repository. The orchestrator owns planning, wave sequencing, agent delegation, and quality gates. The main agent stays in the chat for discussion — ALL implementation work is delegated to subagents via the Task tool.

### Execution Model
- **Waves** are the unit of work. Each wave is a set of tasks that can run in parallel.
- **Subagents** are spawned via the `Task` tool with `subagent_type: "general-purpose"` for implementation work, or `"Explore"` / `"Plan"` for research.
- **Parallel by default.** Independent tasks within a wave run as parallel subagents in a single message.
- **Sequential between waves.** Wave N+1 starts only after Wave N passes its gate.

### Auto-Continue Rules
**After each wave gate passes, auto-continue to the next wave within the same turn.** Do NOT pause for user input between waves unless:
- A gate check fails (tests break, build fails, lint errors)
- There is genuine ambiguity that would cause >30 min of rework if guessed wrong
- A destructive or irreversible action is required (deletes, migrations, credential changes)
- The user explicitly asked to review between waves

When auto-continuing: print a brief wave summary (completed tasks, files changed, any warnings) then immediately launch the next wave. Keep summaries to 3-5 lines per wave — save the detailed report for the end.

### Wave Structure (Default)
When the user provides a feature request without a custom wave plan, use this default:

| Wave | Name | What happens |
|------|------|-------------|
| 0 | **Recon** | Read relevant source files, understand existing patterns, identify touch points |
| 1 | **Schema + Foundation** | Zod schemas, types, store changes, API route stubs |
| 2 | **Implementation** | Core logic, UI components, API wiring |
| 3 | **Tests + Polish** | Tests for all new code, build verification, doc updates |

If the user provides a custom wave plan, use that instead.

### Wave Gates (Mandatory)
Before proceeding to the next wave, the orchestrator MUST:
1. Verify all subagents completed successfully (check their outputs)
2. Run `npm test` to confirm no regressions
3. Run `npm run build` to confirm compilation
4. If either fails: fix the issue (spawn a fix agent) before proceeding
5. Print a brief summary: tasks done, files changed, any risks

### Subagent Guidelines
When spawning subagents:
- **Always include context.** Tell the agent which files to read first, what patterns to follow, and what the acceptance criteria are.
- **Always require source reading.** Include "Read the source file(s) before writing any code or tests" in every agent prompt. (Lesson from IT2: assumption-based tests all fail.)
- **Name agents descriptively.** Use names like `schema-update`, `resilience-panel`, `test-writer` — not `agent-1`, `agent-2`.
- **Limit scope.** Each agent gets one clear task. Don't ask one agent to do 3 unrelated things.
- **Use `run_in_background: true`** for agents whose output isn't needed before launching the next agent in the same wave.

### Quality Bar
- All new code must have tests before the feature is considered done
- `npm test` and `npm run build` must pass at every wave gate
- No unfinished TODOs unless explicitly noted and tracked in TASKS.md
- No dead code — if something is removed, remove it completely
- Follow existing repo patterns (Zod schemas, Zustand store, Tailwind 4 syntax, accessible queries in tests)

### Scope Discipline
- **Do not add features or refactors outside the stated goal**, even if they seem beneficial
- A bug fix doesn't need surrounding code cleaned up
- Don't add docstrings, comments, or type annotations to unchanged code
- Don't design for hypothetical future requirements
- If a side improvement is genuinely valuable, note it for the user but don't implement it

### Task Tracking
- **Task IDs:** `FT-{number}` for features (e.g., FT-03, FT-04)
- **Task files** as separate .md files under `.claude/tasks/` (active) and `.claude/tasks/archive/` (completed)
- **Always update docs** after completing work: TASKS.md, SESSION.md, CLAUDE.md if features changed

### Task Completion Protocol
When completing a task:
1. Mark status as `DONE` in `TASKS.md`
2. Update the task file with completion notes
3. **Move task file to `.claude/tasks/archive/`**
4. Update `SESSION.md` with session notes
5. Update `CLAUDE.md` if features changed

### How to Give Claude a Task
Minimal prompt format — you only need to specify **what**, not **how**:

```
Goal: [what you want built]

Wave plan (optional):
  Wave 1: [tasks]
  Wave 2: [tasks]
  Wave 3: [tasks]

Constraints (optional):
- [anything to avoid or require]
```

If no wave plan is provided, the default 4-wave structure applies. If no constraints are given, the standard quality bar and scope discipline apply.

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

1. Read this file (`CLAUDE.md`) — it's auto-loaded every session
2. Check `TASKS.md` for current priorities
3. Check `FUTURES.md` for feature specs and implementation plans
4. Follow the Orchestration Charter above for execution

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
