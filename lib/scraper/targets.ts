import type { ScraperTarget } from "./client";

// Verified Collectors & Cities Mapping:
// c_msysw2mi1tutw6mudf — Mumbai (using cached test_mumbai_midday.json)
// c_msytjogw20erpmmgps — Pune (using cached test_pune_opinify.json)
// c_msyuag5p1o4xpkft2r — Nashik (using cached test_nashik_reddit.json)

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