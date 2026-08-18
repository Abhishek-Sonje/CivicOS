import type { ScraperTarget } from "./client";

/**
 * Maps Bright Data Scraper Studio collector IDs to their crawl target URLs or local files.
 * Key: collector_id
 * Value: single URL string, array of URL strings, or path to an input file.
 */
export const SCRAPER_TARGETS: Record<string, ScraperTarget> = {
  // Default mock collector for out-of-the-box pipeline testing
  c_mock_collector: "http://mock-grievance-portal.local",

  // Target placeholder entries for actual collectors
  c_municipal_grievances: "",
  c_regional_news_feed: "",
};
