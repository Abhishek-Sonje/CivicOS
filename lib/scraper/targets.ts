import type { ScraperTarget } from "./client";

// Verified Collectors & Cities Mapping (see lib/scraper/sources.ts for source types):
// c_msysw2mi1tutw6mudf — Mumbai Mid-Day citizen letters (test_mumbai_midday.json)
// c_msytjogw20erpmmgps — Pune Opinify civic portal (test_pune_opinify.json)
// c_msyuag5p1o4xpkft2r — Nashik Reddit (test_nashik_reddit.json) — strict pre-filter applied

export const SCRAPER_TARGETS: Record<string, ScraperTarget> = {
  // Default mock collector for pipeline checks
  c_mock_collector: "http://mock-grievance-portal.local",

  // Mumbai target local cache
  c_msysw2mi1tutw6mudf: "test_mumbai_midday.json",

  // Pune target local cache
  c_msytjogw20erpmmgps: "test_pune_opinify.json",

  // Nashik target local cache
  c_msyuag5p1o4xpkft2r: "test_nashik_reddit.json",
};