# Architecture Overview

**Project:** Tech For Artists - Brand Health Analyzer (Tool 3)
**Last Updated:** 2026-02-07 (Pre-development)
**Full Plan:** `C:\Users\marce\.claude\plans\tool3-brand-consistency-analyzer.md`

---

## Tech Stack

### Core Technologies
- **Next.js 16** - React framework with App Router (file-based routing)
- **React 19** - UI library with hooks
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & Validation
- **Zustand 5** - Lightweight state management with persist middleware
- **Zod 3** - Schema validation with TypeScript type inference

### AI & Data Processing (NEW for Tool 3)
- **@anthropic-ai/sdk** - Claude API client for multimodal analysis
- **Vercel AI SDK (`ai`)** - Streaming responses from server to client
- **cheerio** - Server-side HTML parsing
- **@mozilla/readability** - Content extraction from web pages

### Testing
- **Jest 29** - Test runner and assertion library
- **React Testing Library** - Component testing utilities

### Hosting
- **Vercel** - Deployment with GitHub integration

---

## Data Flow Architecture

```
Step 1: URL Input (client)
    Artist enters platform URLs (2-10)
    ↓
    Platform auto-detection (URL → PlatformId)
    ↓
Step 2: Screenshots (client)
    Guided screenshot instructions for walled platforms
    Artist uploads screenshots → client-side resize → base64
    ↓
Step 3: Processing (server + client)
    Auto-fetch public pages ──→ /api/fetch-page ──→ fetch + parse HTML
    ↓                                                  ↓
    Extracted content stored in state              ExtractedContent
    ↓
    All data assembled (fetched content + screenshots)
    ↓
    POST to /api/analyze
    ↓
    Claude API call (multimodal: text + images, Sonnet 4.5)
    ↓
    Streaming response ──→ Client renders progressively
    ↓
Step 4: Report (client)
    Part 1: Consistency scores + mismatches
    Part 2: Completeness scores + gaps
    Combined action items
    ↓
    Optional: print, email, start new analysis
```

---

## Key Data Types

### Platform Classification
- **Fetchable platforms:** website, LinkedIn, Behance, DeviantArt, Etsy, ArtStation, YouTube
- **Screenshot platforms:** Instagram, TikTok, Facebook, Twitter/X, Pinterest
- **Max platforms per analysis:** 10

### Analysis Output
Two-part report structure:
1. **Consistency** (6 categories): name, bio, visual, contact, crossLinks, tone
2. **Completeness** (5 categories): platformCoverage, purchasePath, socialProof, eventsAndShows, artistStory

Full type definitions in the plan file, Section 4.

---

## API Architecture

### `/api/fetch-page` (POST)
- Input: `{ url: string, platform: PlatformId }`
- Process: Fetch URL → parse HTML with cheerio/readability → extract content
- Output: `ExtractedContent` (title, description, images, links, colors, text)
- Error handling: timeout (10s), 403/404, rate limiting

### `/api/analyze` (POST, streaming)
- Input: All platform data (fetched content + screenshot base64)
- Process: Build multimodal prompt → call Claude API with streaming → parse response
- Output: Streaming `BrandReport` JSON
- Model: Sonnet 4.5 (cost-efficient, strong at structured + vision)

---

## Security Considerations

- `ANTHROPIC_API_KEY` is server-side only (never exposed to browser)
- No user credentials collected — screenshots are the solution for walled platforms
- Rate limiting: 10 analyses per IP per hour
- Client-side image resize before upload (max 1920px, reduces token cost)
- Input validation with Zod on all API routes

---

## Current Implementation Status

### Completed
- Project directory and documentation system created

### Next
- **Iteration 1:** Project scaffold, shared UI, landing page
- See `TASKS.md` for full task breakdown

---

**Note:** Update this file whenever new components, routes, or architectural changes are made.
