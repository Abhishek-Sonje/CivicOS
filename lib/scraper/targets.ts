import type { ScraperTarget } from "./client";

/**
 * Maps Bright Data Scraper Studio collector IDs to their crawl target URLs or local files.
 * Key: collector_id
 * Value: single URL string, array of URL strings, or path to an input file.
 */
export const SCRAPER_TARGETS: Record<string, ScraperTarget> = {
  c_mock_collector: "http://mock-grievance-portal.local",

  // Maps to Google News search RSS feed. This starts a two-stage flow:
  // 1. Fetch search RSS feed and extract item link URLs.
  // 2. Batch scrape article titles and content via the Bright Data CLI.
c_msylkl601pxsajf3v8: "https://www.freepressjournal.in/pune/nashik-pothole-crisis-four-lives-lost-as-public-anger-mounts-corporators-demand-action-against-civic-administration",

  // Official Indian grievance portals are login/token-gated, not
  // publicly listable — repurposed this collector for a public
  // civic-complaint source instead. Fill with a specific Reddit thread
  // (e.g. r/nashik or r/india) once you've picked one.
  c_msylxvsj5jpsgd945: "https://english.bombaysamachar.com/mumbai/nashik-rain-107-mm-downpour-uproots-25-trees-waterlogging-disrupts-normal-life-across-city",
};