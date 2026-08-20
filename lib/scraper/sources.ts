export type SourceType = "citizen_platform" | "news_letter" | "social" | "mock";

export interface CollectorSource {
  type: SourceType;
  city: string;
  /** Minimum classifier confidence required before persisting a record. */
  relevanceThreshold: number;
}

export const COLLECTOR_SOURCES: Record<string, CollectorSource> = {
  c_mock_collector: {
    type: "mock",
    city: "Nashik",
    relevanceThreshold: 0,
  },
  // Mid-Day citizen letter / Problems columns
  c_msysw2mi1tutw6mudf: {
    type: "news_letter",
    city: "Mumbai",
    relevanceThreshold: 0.7,
  },
  // Opinify civic grievance portal
  c_msytjogw20erpmmgps: {
    type: "citizen_platform",
    city: "Pune",
    relevanceThreshold: 0.6,
  },
  // Reddit — low-trust; strict filtering applied
  c_msyuag5p1o4xpkft2r: {
    type: "social",
    city: "Nashik",
    relevanceThreshold: 0.75,
  },
  // New Pune Reddit post detail collector
  c_mt1efh5i1k2bvvc79f: {
    type: "social",
    city: "Pune",
    relevanceThreshold: 0.75,
  },
  // New Ludhiana Tribune news articles collector
  c_mt1e500o2i6bg5i312: {
    type: "news_letter",
    city: "Ludhiana",
    relevanceThreshold: 0.7,
  },
};

export const DEFAULT_COLLECTOR_SOURCE: CollectorSource = {
  type: "social",
  city: "India",
  relevanceThreshold: 0.7,
};

export function getCollectorSource(collectorId: string): CollectorSource {
  return COLLECTOR_SOURCES[collectorId] ?? DEFAULT_COLLECTOR_SOURCE;
}
