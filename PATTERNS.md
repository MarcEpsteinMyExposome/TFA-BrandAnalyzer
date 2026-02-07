# Code Patterns & Conventions

**Project:** Tech For Artists - Brand Health Analyzer (Tool 3)
**Purpose:** Document coding patterns, conventions, and examples to follow
**Last Updated:** 2026-02-07 (Pre-development)

---

## How to Use This File

This carries forward proven patterns from Tool 2 and adds new patterns for Tool 3's unique features (API calls, streaming, image handling). When in doubt, check Tool 2's source at `C:\Users\marce\Documents\Projects\TechForArtistsQuestionaire` for working examples.

---

## File Naming Conventions

### Components
- **Format:** PascalCase with descriptive names
- **Location:** `components/[category]/[ComponentName].tsx`
- **Examples:** `components/report/MismatchCard.tsx`, `components/ui/Button.tsx`

### Tests
- **Format:** Same name with `.test.tsx` or `.test.ts`
- **Location:** `__tests__/[mirrors-source-path]/[filename].test.ts`

### Schemas
- **Format:** Descriptive name with `.schema.ts` suffix
- **Location:** `lib/schemas/[name].schema.ts`

---

## TypeScript Conventions

- **Types/Interfaces:** PascalCase (`BrandReport`, `PlatformEntry`)
- **Functions/Variables:** camelCase (`fetchPage`, `buildPrompt`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_PLATFORMS`, `SUPPORTED_PLATFORMS`)
- **Components:** PascalCase (`MismatchCard`, `ScoreGauge`)
- **Use `type`** for unions/intersections; **`interface`** for object shapes
- **Infer from Zod schemas** when possible (DRY)

---

## Testing Patterns

### Component Test Pattern
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScoreGauge } from '@/components/report/ScoreGauge'

describe('ScoreGauge', () => {
  it('renders score with correct color for high scores', () => {
    render(<ScoreGauge score={85} label="Name Consistency" />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '85')
  })

  it('shows green for scores 80+', () => {
    render(<ScoreGauge score={90} label="Visual" />)
    // test color class or style
  })
})
```

**Key principles:**
- Use `describe()` + `it()` with clear descriptions
- Arrange -> Act -> Assert
- Use accessible queries: `getByRole`, `getByLabelText` (not test IDs)
- Test user behavior, not implementation

### Schema Test Pattern
```typescript
import { ReportSchema } from '@/lib/schemas/report.schema'

describe('ReportSchema', () => {
  it('accepts valid report data', () => {
    const valid = { /* ... */ }
    expect(ReportSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects scores outside 0-100', () => {
    const invalid = { /* score: 150 */ }
    expect(ReportSchema.safeParse(invalid).success).toBe(false)
  })
})
```

### API Route Test Pattern
```typescript
// Mock the Claude SDK
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ /* mock response */ })
    }
  }))
}))
```

---

## Zustand Store Patterns

### Store with Persist (from Tool 2)
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // state + actions
    }),
    { name: 'tfa-brand-analyzer-store' }
  )
)
```

### Hydration Pattern (SSR safety)
```typescript
const [hydrated, setHydrated] = useState(false)
useEffect(() => { setHydrated(true) }, [])
if (!hydrated) return <LoadingState />
```

### Store Mock Pattern (for tests)
```typescript
jest.mock('@/lib/store/appStore', () => ({
  useAppStore: jest.fn(),
}))

const mockUseAppStore = useAppStore as unknown as jest.Mock
mockUseAppStore.mockImplementation((selector) => {
  const state = { /* mock state */ }
  return selector(state)
})
```

---

## NEW: Claude API Patterns

### Client Singleton
```typescript
import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return client
}
```

### Multimodal Prompt Construction
```typescript
// Text content block
{ type: 'text', text: `Platform: ${platform.name}\nBio: ${content.description}` }

// Image content block (screenshot)
{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Data } }
```

### Streaming Response (Vercel AI SDK)
```typescript
// Server: app/api/analyze/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const data = await req.json()
  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(data) }],
  })
  return result.toDataStreamResponse()
}

// Client: useAnalysis hook
import { useCompletion } from 'ai/react'
```

---

## NEW: Image Handling Patterns

### Client-Side Resize
```typescript
// Resize before upload to save tokens
async function resizeImage(file: File, maxWidth = 1920): Promise<Blob> {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / img.width)
  const canvas = new OffscreenCanvas(img.width * scale, img.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
}
```

### File to Base64
```typescript
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

---

## Tailwind CSS 4 Notes

```typescript
// CORRECT (Tailwind 4 opacity)
className="bg-indigo-900/30 border-indigo-500/50"

// WRONG (Tailwind 3 — breaks)
className="bg-indigo-900 bg-opacity-30"
```

---

## Git Commit Patterns

```
<type>: <short summary>

<optional detailed description>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `style:`, `chore:`

---

## Anti-Patterns to Avoid

### Don't: Write tests without reading source
The #1 lesson from Tool 2. Always read the actual implementation before writing tests.

### Don't: Expose API keys to the client
`ANTHROPIC_API_KEY` must only be used in server-side code (API routes, Server Actions). Never in client components.

### Don't: Send raw HTML to Claude when extracted content suffices
Parse HTML server-side and send structured content. Raw HTML wastes tokens.

### Don't: Skip image resize
Always resize screenshots client-side before sending to API. Large images waste tokens and can exceed limits.

### Don't: Use test IDs when accessible queries exist
```typescript
// BAD
getByTestId('score-display')
// GOOD
getByRole('meter', { name: /consistency/i })
```

---

**Note:** Update this file as new patterns are established during development.
