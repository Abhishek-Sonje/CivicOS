import type { ScraperTarget } from "./client";

// Verified Collectors & Cities Mapping (see lib/scraper/sources.ts for source types):
// c_msysw2mi1tutw6mudf — Mumbai Mid-Day citizen letters (test_mumbai_midday.json)
// c_msytjogw20erpmmgps — Pune Opinify civic portal (test_pune_opinify.json)
// c_msyuag5p1o4xpkft2r — Nashik Reddit (test_nashik_reddit.json) — strict pre-filter applied
// c_mt1efh5i1k2bvvc79f — Pune Reddit Detail (test_reddit_detail_raw.json)
// c_mt1e500o2i6bg5i312 — Ludhiana Tribune (test_tribune_ludhiana_raw.json)

export const SCRAPER_TARGETS: Record<string, ScraperTarget> = {
  // Default mock collector for pipeline checks
  c_mock_collector: "http://mock-grievance-portal.local",

  // Mumbai target local cache
  c_msysw2mi1tutw6mudf: "test_mumbai_midday.json",

  // Pune target local cache
  c_msytjogw20erpmmgps: "test_pune_opinify.json",

  // Nashik target local cache
  c_msyuag5p1o4xpkft2r: "test_nashik_reddit.json",

  // New Pune Reddit Detail collector
  c_mt1efh5i1k2bvvc79f: "test_reddit_detail_raw.json",

  // New Ludhiana Tribune news articles collector
  c_mt1e500o2i6bg5i312: "test_tribune_ludhiana_raw.json",
};