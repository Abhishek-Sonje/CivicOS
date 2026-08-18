import { z } from "zod";

export const SourceTypeSchema = z.enum([
  "citizen_platform",
  "news_letter",
  "social",
  "mock",
]);

/**
 * Raw issue payload scraped from target sources.
 * This represents the structure immediately after extraction before LLM/geocoding enrichment.
 */
export const IssueRawSchema = z.object({
  post_title: z.string().min(1, "Post title is required"),
  description_text: z.string().optional().nullable(),
  image_url: z.string().url("Must be a valid image URL").optional().nullable(),
  timestamp: z.string().min(1, "Timestamp is required"),
  location_text: z.string().min(1, "Location text is required"),
  source_url: z.string().url("Must be a valid source URL"),
});

/**
 * Validated, enriched, and persisted issue shape.
 * Extends the raw layout with classification, geocoding, and unique identifier fields.
 * This is the single source of truth for downstream API endpoints and database models.
 */
export const IssueSchema = IssueRawSchema.extend({
  id: z.string().min(1, "ID is required"),
  category: z.string().min(1, "Category is required"),
  severity: z.number().int().min(1).max(5, "Severity score must be between 1 and 5"),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  geocode_status: z.enum(["ok", "failed"]),
  source_type: SourceTypeSchema,
  relevance_score: z.number().min(0).max(1),
});

export type IssueRaw = z.infer<typeof IssueRawSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;

/** Issues shown on the map must meet this relevance threshold. */
export const MAP_RELEVANCE_THRESHOLD = 0.7;
