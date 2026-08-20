# 🏙️ CivicPulse Pune — Live Civic Intelligence Platform

**Built for Into the Scrape-Verse Hackathon** (WeMakeDevs × Bright Data)

**CivicPulse Pune** is an AI-powered, real-time civic infrastructure audit platform for Pune, India. Powered by **Bright Data Scraper Studio**, **Gemini 1.5 Flash AI**, and **Leaflet**, it continuously monitors news sites, citizen grievance portals, and social media to classify, severity-score, geocode, and visualize municipal issues (potholes, garbage overflow, waterlogging, streetlight failures) on an interactive dark-mode dashboard.

---

## 🌟 Key Features

1. **Self-Healing Scraper Pipeline (Bright Data Scraper Studio)**
   - 11 active data collectors monitoring Pune news, RSS feeds, Reddit (`r/pune`), and citizen portals.
   - Built-in resilience: selector fallback chains, rate-limit backoff, and self-healing status tracking displayed on a live status grid.

2. **AI Classification & Location Extraction (Gemini 1.5 Flash)**
   - Automatically determines if content is a genuine civic complaint.
   - Classifies issues into 4 core categories: **Pothole/Road Damage**, **Garbage/Trash Overflow**, **Waterlogging/Drainage**, **Streetlight Failure**.
   - Extracts severity score (1–5) and identifies Pune neighborhood/ward names (e.g. *Kothrud, Baner, Hadapsar, Hinjewadi*).

3. **Geocoding & Interactive Mapping (Leaflet + Nominatim)**
   - Converts neighborhood text into precise lat/lon coordinates.
   - **Pin View** with animated SVG pulse markers sized by severity.
   - **Heatmap View** showing spatial issue density across Pune.
   - **Slide-in Issue Detail Panel** with title, full description, severity bar, category pill, and original source link.

4. **City Health Index & Neighborhood Ranking**
   - Live **City Health Score** (0–100) computed in real-time.
   - Ranked **Pune Area Breakdown** displaying issue distribution by neighborhood.
   - Auto-scrolling **Live Feed Ticker** showing recent grievances.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, React 19.2)
- **Styling:** Tailwind CSS v4 (Custom OKLCH dark design system)
- **Mapping:** React Leaflet, Leaflet Heatmap, CartoDB Dark Tiles
- **Database:** SQLite via Drizzle ORM
- **Scraping:** Bright Data Scraper Studio & CLI
- **AI & Geocoding:** Google Gemini 1.5 Flash + OpenStreetMap Nominatim
- **Validation:** Zod + Drizzle compile-time type safety

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables
Ensure `.env.local` contains:
```env
DATABASE_URL=file:local.db
GEMINI_API_KEY=your_gemini_api_key
BRIGHTDATA_API_TOKEN=your_brightdata_token
DEFAULT_MAP_CENTER=18.5204,73.8567
DEFAULT_MAP_ZOOM=12
```

### 3. Database Seed & Migrations
To instantly populate 38 realistic Pune issues and scraper health records for demo:
```bash
pnpm seed
```

### 4. Run Live Ingestion Pipeline
To run the live scrapers with Gemini AI classification:
```bash
pnpm ingest
```

### 5. Start Application
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 🛡️ Self-Healing Mechanism

When layout drift or selector failure occurs:
1. Pipeline logs error message to `scraper_runs` table.
2. Dashboard grid updates collector status to **Self-Healing** (yellow pulse).
3. Automatic selector fallback and exponential backoff retry execution.
4. CLI self-heal command can be issued: `brightdata scraper heal <collector_id> "<feedback>"`
5. Data flow recovers seamlessly without database schema changes or frontend redeploys.

---

## 🏆 Hackathon Tracks & Alignment

- **Web-Slinger Track (Grand Prize - Best Use of Bright Data):** 11 collectors orchestrated with Scraper Studio.
- **Suit-Up Track (Best UI):** Premium dark glassmorphism dashboard, animated markers, heatmaps, slide-in panels, and interactive health gauge.
- **Spider-Sense Track (Cleanest Code):** Strict TypeScript compile-time safety, Zod validation, modular component architecture.
