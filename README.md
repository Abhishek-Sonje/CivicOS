# Civic Infrastructure Audit Dashboard

A pipeline and real-time dashboard that crawls long-tail civic sources (e.g., regional news comments, municipal boards), normalizes and validates complaints, enriches them using Gemini and Nominatim geocoding, and renders them on a map.

The system's core capability is demonstrating a self-healing loop: when a target website's markup structure drifts and breaks extraction, the crawler can repair itself via CLI AI prompts, restoring data integrity without changes to the database schema or frontend code.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19.2)
- **Styling:** Tailwind CSS v4 (CSS-first configuration under `@theme` inside globals.css)
- **Map:** React Leaflet + OpenStreetMap
- **Database:** SQLite via Drizzle ORM
- **Scraping:** Bright Data CLI & Scraper Studio
- **Enrichment:** Gemini API (classification) + OSM Nominatim (geocoding)
- **Validation:** Zod (Single source of truth types)

---

## Setup Steps

### 1. Install Dependencies
Ensure you have `pnpm` installed, then run:
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and add your keys:
```bash
cp .env.local.example .env.local
```
Update the keys inside `.env.local`:
- `DATABASE_URL=file:local.db`
- `GEMINI_API_KEY=your_gemini_api_key`
- `BRIGHTDATA_API_TOKEN=your_brightdata_api_token`

### 3. Run Database Migrations
Generate and run the SQLite schema migrations:
```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Trigger Ingestion (Mock & Live Scrapers)
To run the crawler ingestion script:
```bash
pnpm ingest
```
*Note: To run ingestion using offline mock data (useful for checking setup), use the `--mock` flag:*
```bash
pnpm ingest --mock
```
*When running in live mode, ensure that `GEMINI_API_KEY` is correctly configured in your `.env.local` file. The ingestion pipeline will not perform silent fallbacks if the API key is missing or failed.*

### 5. Start the App
Start the development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the map dashboard.

---

## Self-Heal Demo Walkthrough

To demonstrate the self-heal loop:

1. **Setup a Mock Target Page:** Host a local HTML file containing a div of class `.comment` containing issue details.
2. **First Run:** Initialize the scraper using `npx @brightdata/cli scraper create` targeting that selector. Run `pnpm ingest`. The dashboard shows the collector is healthy.
3. **Trigger Drift Failure:** Edit the mock target HTML file, changing the tag's class name from `.comment` to `.reply` (simulating a layout redesign).
4. **Second Run:** Run `pnpm ingest`. The scraper fails to extract descriptions (0 items or null values). The dashboard health drawer flips to `Failed (Extraction Failed)`.
5. **Self-Heal CLI Command:** Run the healing command:
   ```bash
   npx @brightdata/cli scraper heal <collector_id> "The description field returned null because the tag class drifted from .comment to .reply. Re-target the description to extract text from article.reply."
   ```
6. **Approve Diff:** Approve the AI patch from the command line:
   ```bash
   npx @brightdata/cli scraper approve <collector_id>
   ```
7. **Verify Run:** Re-run `pnpm ingest`. The status badge changes back to healthy (green) and data flows again without any changes made to the Next.js application codebase.

---

## Hackathon AI Tool Disclosure (Rule #10)

This project was built with the assistance of **Antigravity**, an agentic AI coding assistant developed by Google DeepMind.
- **Role:** Antigravity helped bootstrap the Next.js 16 app layout, configure Drizzle compile-time type schemas matching Zod types, structure Nominatim geocoding logic, encapsulate CLI shell spawning in helper modules, and implement Tailwind CSS v4 design tokens.
- **Human Oversight:** All architectural decisions, workflow structures, and code logic reviews were audited, verified, and integrated by the human author.

---

## Future Work (Tier 3 Features)

Features intentionally excluded from this iteration due to timeframe bounds:
- **Heatmap Layer:** Density mapping of infrastructure grievances to identify high-density municipal neglect areas.
- **Image Authenticity Verification:** Vision-based LLM check on submitted image attachments to verify issue presence and prevent spam.
- **Automated Submission:** Integration scripts to automatically submit validated issues directly to official municipal portals (e.g. city 311 systems).
