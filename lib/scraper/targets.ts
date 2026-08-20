import type { ScraperTarget } from "./client";

// Pune-Based Collectors & Targets Mapping:
// 1. c_msytjogw20erpmmgps — Pune Opinify civic portal (test_pune_opinify.json)
//    Covers: Potholes, road damage, traffic, and general infrastructure complaints.
// 2. c_mt1efh5i1k2bvvc79f — Pune Reddit Detail (test_reddit_detail_raw.json)
//    Covers: Local discussion threads on r/pune regarding civic issues, street signs, and local hazards.

export const SCRAPER_TARGETS: Record<string, ScraperTarget> = {
  // Default mock collector for pipeline checks (Pune coordinates focused)
  c_mock_collector: "http://mock-grievance-portal.local",

  // Pune Opinify target local cache
  c_msytjogw20erpmmgps: "test_pune_opinify.json",

  // Pune Reddit Detail target local cache
  c_mt1efh5i1k2bvvc79f: "test_reddit_detail_raw.json",
};