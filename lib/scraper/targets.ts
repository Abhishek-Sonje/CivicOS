import type { ScraperTarget } from "./client";

// Verified Collectors & Cities Mapping:
// c_msysw2mi1tutw6mudf — Mumbai (mid-day.com search results)
// c_msytjogw20erpmmgps — Pune (pothole.opinify.co.in tracker)
// c_msyuag5p1o4xpkft2r — Nashik (reddit.com r/nashik search JSON feed)

export const SCRAPER_TARGETS: Record<string, ScraperTarget> = {
  // Default mock collector for pipeline checks
  c_mock_collector: "http://mock-grievance-portal.local",

  // Mumbai target search URL
  c_msysw2mi1tutw6mudf: "https://www.mid-day.com/search/mumbai-potholes-articles",

  // Pune target search URL
  c_msytjogw20erpmmgps: "https://pothole.opinify.co.in/",

  // Nashik target search URL
  c_msyuag5p1o4xpkft2r: "https://www.reddit.com/r/nashik/search.json?q=potholes+OR+roads+OR+garbage+OR+light&sort=new&limit=100",
};