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

  // MyPunePulse listing targets
  c_mt1gftp52qo35dfh4j: { type: "news_letter", city: "Pune", relevanceThreshold: 0.7 },
  c_mypunepulse_dhanori: { type: "news_letter", city: "Pune", relevanceThreshold: 0.7 },
  c_mypunepulse_warje: { type: "news_letter", city: "Pune", relevanceThreshold: 0.7 },
  c_mypunepulse_sahakarnagar: { type: "news_letter", city: "Pune", relevanceThreshold: 0.7 },
  c_mypunepulse_waterlogging: { type: "news_letter", city: "Pune", relevanceThreshold: 0.7 },

  // RSS news listing targets
  c_rss_pune_potholes: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },
  c_rss_pune_garbage: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },
  c_rss_pune_waterlogging: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },
  c_rss_pune_streetlights: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },

  // Detail article collectors (invoked in the second stage)
  c_mt1fwqb12eu0izt0mj: { type: "news_letter", city: "Pune", relevanceThreshold: 0.7 },
  c_mt1ftvsc2lr045je50: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },
  c_mt1g9ds7lsy9z0tw3: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },
  c_mt1g3jb914o0umgsa5: { type: "news_letter", city: "Pune", relevanceThreshold: 0.6 },
};

export const DEFAULT_COLLECTOR_SOURCE: CollectorSource = {
  type: "news_letter",
  city: "Pune",
  relevanceThreshold: 0.7,
};

export function getCollectorSource(collectorId: string): CollectorSource {
  return COLLECTOR_SOURCES[collectorId] ?? DEFAULT_COLLECTOR_SOURCE;
}
