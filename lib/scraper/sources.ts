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
    city: "Pune",
    relevanceThreshold: 0,
  },
  // Pune Opinify civic grievance portal
  c_msytjogw20erpmmgps: {
    type: "citizen_platform",
    city: "Pune",
    relevanceThreshold: 0.6,
  },
  // Pune Reddit post detail collector
  c_mt1efh5i1k2bvvc79f: {
    type: "social",
    city: "Pune",
    relevanceThreshold: 0.75,
  },
};

export const DEFAULT_COLLECTOR_SOURCE: CollectorSource = {
  type: "social",
  city: "Pune",
  relevanceThreshold: 0.7,
};

export function getCollectorSource(collectorId: string): CollectorSource {
  return COLLECTOR_SOURCES[collectorId] ?? DEFAULT_COLLECTOR_SOURCE;
}
