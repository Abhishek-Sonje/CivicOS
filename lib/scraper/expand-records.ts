import { extractComplaintsFromArticle } from "../ai/extract-complaints";
import type { SourceType } from "./sources";

/**
 * Expands a raw scraper record into zero or more complaint-level records.
 * News articles with citizen letter sections become multiple map-ready items.
 */
export function expandRawRecords(
  raw: Record<string, unknown>,
  sourceType: SourceType
): Record<string, unknown>[] {
  if (sourceType === "news_letter" && (raw.article_content || raw.article_title)) {
    const extracted = extractComplaintsFromArticle(raw);
    return extracted;
  }

  return [raw];
}
