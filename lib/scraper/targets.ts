import type { ScraperTarget } from "./client";

export interface ScraperTargetConfig {
  target: ScraperTarget;
  isListing?: boolean;
  isRss?: boolean;
  detailCollectorId?: string; // Collector ID to scrape child detail articles
}

/**
 * Pune Collector Targets Configuration:
 * Maps collector IDs to target endpoints or local raw dataset caches for two-stage ingestion.
 */
export const SCRAPER_TARGETS: Record<string, ScraperTargetConfig> = {
  // Default mock collector for testing pipeline fallbacks
  c_mock_collector: {
    target: "http://mock-grievance-portal.local",
  },

  // Pune Opinify civic portal
  c_msytjogw20erpmmgps: {
    target: "test_pune_opinify.json",
  },

  // Pune Reddit post detail collector
  c_mt1efh5i1k2bvvc79f: {
    target: "test_reddit_detail_raw.json",
  },

  // MyPunePulse Listing index (Kharadi)
  c_mt1gftp52qo35dfh4j: {
    target: "test_punepulse_list.json",
    isListing: true,
    detailCollectorId: "c_mt1fwqb12eu0izt0mj",
  },

  // MyPunePulse Dhanori Listing
  c_mypunepulse_dhanori: {
    target: "test_dhanori_list.json",
    isListing: true,
    detailCollectorId: "c_mt1fwqb12eu0izt0mj",
  },

  // MyPunePulse Warje Listing
  c_mypunepulse_warje: {
    target: "test_punepulse_list.json",
    isListing: true,
    detailCollectorId: "c_mt1fwqb12eu0izt0mj",
  },

  // MyPunePulse Sahakarnagar Listing
  c_mypunepulse_sahakarnagar: {
    target: "test_punepulse_list.json",
    isListing: true,
    detailCollectorId: "c_mt1fwqb12eu0izt0mj",
  },

  // MyPunePulse Waterlogging Listing
  c_mypunepulse_waterlogging: {
    target: "test_punepulse_list.json",
    isListing: true,
    detailCollectorId: "c_mt1fwqb12eu0izt0mj",
  },

  // RSS feeds
  c_rss_pune_potholes: {
    target: "test_punekarnews.json",
  },
  c_rss_pune_garbage: {
    target: "test_freepress.json",
  },
  c_rss_pune_waterlogging: {
    target: "test_bridgechronicle.json",
  },
  c_rss_pune_streetlights: {
    target: "test_punepulse.json",
  },

  // Detail article collectors (invoked in the second stage)
  c_mt1fwqb12eu0izt0mj: {
    target: "test_punepulse.json",
  },
  c_mt1ftvsc2lr045je50: {
    target: "test_punekarnews.json",
  },
  c_mt1g9ds7lsy9z0tw3: {
    target: "test_freepress.json",
  },
  c_mt1g3jb914o0umgsa5: {
    target: "test_bridgechronicle.json",
  },
};