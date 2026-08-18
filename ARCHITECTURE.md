# Civic Infrastructure Audit Dashboard — Architecture

## 1. What this is

A pipeline that scrapes long-tail civic sources (regional news comment threads,
municipal grievance boards) with Bright Data Scraper Studio, classifies and
geocodes the complaints with an LLM, and renders them as a live, color-coded
map. The centerpiece is a self-heal loop: when a target site's markup
changes, the scraper repairs itself without any change to the frontend or
data contract.

Built for **Into the Scrape-Verse** (Bright Data hackathon). Scope is
intentionally cut to what ships clean in a week — see §7.

---

## 2. Tech stack (current stable, as of Aug 2026)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19.2) | Server Components for the ingestion/read path, Server Actions for mutations, no separate API server needed |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`) | Design tokens live in one CSS file — required for the "no hardcoded colors/text" rule below |
| Map | React Leaflet + OpenStreetMap tiles | Free, no API key friction, sufficient for pins + popups |
| Data store | SQLite via Drizzle ORM (or Postgres if deployed) | Typed schema, zero-config for local hackathon dev |
| LLM (classification + severity) | Gemini API (text-first, vision as enhancement) | Already used across your other projects (Archie, ChalkAI) |
| Geocoding | OpenStreetMap Nominatim | Free, no LLM round-trip needed for lat/lon |
| Scraping | Bright Data CLI + Scraper Studio (`brightdata scraper create / run / heal`) | Hackathon's required technology |
| Package manager | pnpm | Faster installs, strict node_modules |
| Validation | Zod | Single source of truth for the payload schema, shared between scraper output, API routes, and DB |

No class components, no `getServerSideProps`, no `tailwind.config.js`, no CSS-in-JS. If a dependency's docs still describe the Pages Router or Tailwind v3 config, that dependency doesn't go in this project.

---

## 3. Directory structure

```
civic-audit-dashboard/
├── app/
│   ├── layout.tsx                # root layout, font + theme setup
│   ├── page.tsx                  # map dashboard (Server Component shell)
│   ├── globals.css               # ALL design tokens live here — see §5
│   └── api/
│       └── issues/route.ts       # GET issues as JSON for the client map
│
├── components/
│   ├── map/
│   │   ├── issue-map.tsx         # Leaflet map, client component
│   │   ├── issue-marker.tsx      # single pin + popup
│   │   └── severity-legend.tsx   # color key
│   ├── health/
│   │   └── scraper-health-panel.tsx  # "Scraper Health Status" drawer
│   └── ui/                       # small shared primitives (button, badge, drawer)
│
├── lib/
│   ├── scraper/
│   │   ├── client.ts             # thin wrapper around Bright Data CLI/API calls
│   │   └── normalize.ts          # raw scrape payload -> validated Issue shape
│   ├── ai/
│   │   ├── classify-issue.ts     # Gemini call: category + severity
│   │   └── geocode.ts            # Nominatim lookup: location_text -> lat/lon
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (single source of truth)
│   │   └── client.ts
│   ├── constants/
│   │   └── copy.ts               # all static UI text lives here, not inline in JSX
│   └── types/
│       └── issue.ts              # Zod schema + inferred TS type, shared everywhere
│
├── scripts/
│   └── ingest.ts                 # cron-able script: trigger scraper -> classify -> geocode -> store
│
└── ARCHITECTURE.md
```

Rule of thumb: `app/` only holds routing and composition. Anything with real
logic (scraping, classification, geocoding, DB access) lives in `lib/` so it's
testable without spinning up Next.js.

---

## 4. Data flow

```
Bright Data collector (c_*)
        │  POST /dca/trigger
        ▼
scripts/ingest.ts
        │  raw payload: post_title, description_text, image_url,
        │  timestamp, location_text, source_url
        ▼
lib/scraper/normalize.ts  ──►  validates against IssueRaw (Zod)
        ▼
lib/ai/classify-issue.ts  ──►  { category, severity (1-5) }
        ▼
lib/ai/geocode.ts         ──►  { lat, lon }
        ▼
lib/db/schema.ts (issues table)  ──►  persisted, validated Issue
        ▼
app/api/issues/route.ts   ──►  serves current issues as JSON
        ▼
components/map/issue-map.tsx  ──►  renders pins, live on the dashboard
```

**Self-heal path** (the demo):

```
scraper run  →  0 items / null fields
        ▼
scraper-health-panel.tsx shows: "Scraper c_xxx — Extraction Failed"
        ▼
brightdata scraper heal <collector_id> "<what broke, in plain language>"
        ▼
brightdata scraper approve   (human-in-the-loop review of the diff)
        ▼
scraper run  →  same schema, same Collector ID, data flows again
        ▼
No change to normalize.ts, no change to the frontend
```

The collector ID never changes across a heal. That's the point being
demonstrated — the data contract downstream is stable even when the source
site isn't.

---

## 5. Styling rules (no hardcoded values, ever)

Every color, spacing scale, radius, and font lives in `app/globals.css` under
`@theme`. Components only reference tokens, never raw hex/px values.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* severity scale — the only place these colors are defined */
  --color-severity-critical: oklch(63% 0.22 25);   /* red */
  --color-severity-moderate: oklch(83% 0.15 85);   /* yellow */
  --color-severity-low: oklch(65% 0.15 240);       /* blue */

  --color-surface: oklch(99% 0 0);
  --color-surface-muted: oklch(96% 0 0);
  --color-border: oklch(90% 0 0);
  --color-foreground: oklch(20% 0 0);

  --font-sans: "Inter", ui-sans-serif, system-ui;
  --radius-panel: 0.75rem;
}
```

Usage in components: `bg-severity-critical`, `text-foreground`,
`rounded-panel` — never `bg-[#ef4444]` or an inline `style={{ color: ... }}`.

Static UI copy (labels, button text, empty states) lives in
`lib/constants/copy.ts`, not inline in JSX, so there's one place to review
wording and no risk of duplicated strings drifting apart.

---

## 6. Code style / cleanliness rules

- **Comment the "why," not the "what."** No comment on `const [x, setX] = useState()`. A comment earns its place above the geocoding fallback logic, the severity-score thresholds, or the heal-approval step — anywhere a future reader would otherwise have to guess intent.
- **One export per concern.** `lib/ai/classify-issue.ts` does classification only; it doesn't also format the result for the UI.
- **Types flow from `lib/types/issue.ts` outward.** The scraper output, the DB schema, and the API response all derive from the same Zod schema — no duplicated shape definitions.
- **No dead code, no commented-out blocks left in.** If Tier 2/3 features (grievance drawer, leaderboard, heatmap — see below) aren't built, they aren't stubbed either; they're listed under "Future Work" in the README instead.
- **Server Components by default.** `"use client"` only on the map, the health panel, and anything with interactivity or browser APIs.

---

## 7. Scope tiers (for the week)

**Tier 1 — ships no matter what:**
Two Scraper Studio collectors → normalize → Gemini text classification →
Nominatim geocode → Leaflet map with colored pins and popups → live
self-heal demo.

**Tier 2 — if Tier 1 lands early:**
Grievance draft drawer (labeled as a draft for citizen review, not a legal
document), ward-level issue leaderboard.

**Tier 3 — explicitly out of scope, noted in README as future work:**
Heatmap layer, full image-based authenticity verification, any automated
submission to real municipal portals.

---

## 8. Environment / config

All secrets (Gemini API key, Bright Data API token) go in `.env.local`,
never committed. `lib/env.ts` validates them at startup with Zod so a
missing key fails loudly at boot instead of silently at runtime.
