# Idea Validator

A blunt, practical chatbot that helps non-technical founders understand the real challenges of building their app idea. No motivational fluff — just honest feedback about risks, tradeoffs, and what it'll actually take.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### 1. Classification System (`/lib/classifier.ts`)

The classifier uses keyword-based scoring to determine what type of app you're building:

**Categories:**
- **Marketplace** — Two-sided platforms (buyers & sellers)
- **SaaS / Productivity** — Tools and software products
- **Social / Community** — Apps centered on user connections
- **Subscription Content** — Paid content or courses
- **Live Streaming** — Real-time video/audio
- **AI-Powered Tool** — Apps leveraging AI/ML
- **Other / Hybrid** — Doesn't fit clean categories

**How scoring works:**
- Each category has keyword groups with weights (1-3)
- Higher weights for category-defining terms (e.g., "marketplace" → 3)
- Lower weights for related but not definitive terms
- If two categories score similarly (within 60%), it's flagged as "hybrid"
- Confidence levels (low/medium/high) based on score distribution

### 2. Question Selection (`/lib/questions.ts`)

Questions are selected based on:

1. **Primary category** — Category-specific questions come first
2. **Priority score** (1-10) — Higher priority questions asked earlier
3. **Hybrid handling** — If hybrid, pulls from both category banks
4. **Universal questions** — Asked regardless of category
5. **No repeats** — Already-asked questions are filtered out

**Question types by category:**

| Category | Focus Areas |
|----------|-------------|
| Marketplace | Supply acquisition, cold start, disputes, disintermediation |
| SaaS | Usage frequency, switching costs, mission criticality |
| Social | Content creation, retention after novelty, moderation |
| Subscription | Pricing, churn after month 1, discovery |
| Live Streaming | Cost tradeoffs, viewer scale, recording needs |
| AI Tool | Error handling, accuracy expectations, ChatGPT differentiation |

### 3. Report Generation (`/lib/report.ts`)

The final report analyzes:

- **Strengths** — Positive signals from user answers
- **Weaknesses** — Concerning patterns or gaps
- **Wedge identification** — What unfair advantage exists (or doesn't)
- **MVP scope** — Category-specific minimum viable features
- **Risks** — Top 3 things that could kill the idea
- **Next decisions** — Concrete actions to take

## Adding New Question Banks

1. Open `/lib/questions.ts`
2. Find the `QUESTION_BANKS` array
3. Add questions following this structure:

```typescript
const MY_CATEGORY_QUESTIONS: Question[] = [
  {
    id: 'mycat-1',                    // Unique ID
    category: 'my-category',          // Must match AppCategory
    text: 'Your hard question here?', // The actual question
    suggestedAnswers: [
      { text: 'Display text', value: 'internal-value' },
      // ... more options
    ],
    priority: 10,                     // 1-10, higher = asked earlier
  },
];
```

4. Add to `QUESTION_BANKS`:

```typescript
const QUESTION_BANKS: QuestionBank[] = [
  // ... existing banks
  { category: 'my-category', questions: MY_CATEGORY_QUESTIONS },
];
```

5. If adding a new category, also update:
   - `AppCategory` type in `/types.ts`
   - `CATEGORY_LABELS` in `/types.ts`
   - `CATEGORY_KEYWORDS` in `/lib/classifier.ts`
   - Category-specific logic in `/lib/report.ts`

## Architecture

```
/app
  /page.tsx              # Landing page with idea input
  /validator/page.tsx    # Main chat + reality check experience
  /layout.tsx            # Root layout with fonts
  /globals.css           # Global styles

/components
  /Chat.tsx              # Chat transcript with suggested answers
  /RealityCheckPanel.tsx # Live-updating sidebar panel

/lib
  /classifier.ts         # Keyword-based app type classification
  /questions.ts          # Question banks and selection logic
  /report.ts             # Final report generation

/types.ts                # TypeScript interfaces
```

## Features

- **No backend** — Everything runs in the browser
- **Session storage** — Idea persists across page refreshes during session
- **Export to JSON** — Download your validation results
- **Responsive** — Works on mobile and desktop
- **Dark mode** — Because it's 2024

## Philosophy

This tool is opinionated. It will tell you:

- "This is crowded."
- "This is harder than you think."
- "If you won't accept this tradeoff, don't build this."

It avoids:
- Generic questions like "Who is your target market?"
- Technical jargon
- Motivational fluff
- Fake precision about costs or timelines

## License

MIT
