import { runCollector, discoverRssUrls } from "../lib/scraper/client";
import { normalizeIssueRaw } from "../lib/scraper/normalize";
import { expandRawRecords } from "../lib/scraper/expand-records";
import { passesPreFilter } from "../lib/scraper/pre-filter";
import { getCollectorSource } from "../lib/scraper/sources";
import { classifyIssue, type CivicCategory } from "../lib/ai/classify-issue";
import { geocodeLocation } from "../lib/ai/geocode";
import { db } from "../lib/db/client";
import { issues, scraperRuns } from "../lib/db/schema";
import type { SourceType } from "../lib/types/issue";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { SCRAPER_TARGETS } from "../lib/scraper/targets";
import { MOCK_RECORDS } from "./mock-data";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs/promises";

// Load environment variables from .env.local for command-line execution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function inferMockCategory(title: string): CivicCategory {
  const lower = title.toLowerCase();
  if (lower.includes("trash") || lower.includes("garbage")) {
    return "Garbage/Trash Overflow";
  }
  if (lower.includes("streetlight") || lower.includes("light")) {
    return "Streetlight Failure";
  }
  if (lower.includes("drain") || lower.includes("water") || lower.includes("waterlog")) {
    return "Waterlogging/Drainage";
  }
  return "Pothole/Road Damage";
}

async function runIngestion() {
  const isMockMode = process.argv.includes("--mock");
  const cliCollectorId = process.argv.filter((arg) => arg !== "--mock")[2];

  let targetCollectors: string[] = [];

  if (isMockMode) {
    targetCollectors = [cliCollectorId || "c_mock_collector"];
  } else if (cliCollectorId) {
    targetCollectors = [cliCollectorId];
  } else {
    targetCollectors = Object.keys(SCRAPER_TARGETS).filter((id) => id !== "c_mock_collector");
  }

  console.log(`[INFO] Scheduled ingestion targets: ${targetCollectors.join(", ")}`);
  let anyCollectorFailed = false;

  for (const collectorId of targetCollectors) {
    let itemsFetched = 0;
    const sourceConfig = getCollectorSource(collectorId);

    try {
      let rawPayloads: Record<string, unknown>[];

      if (isMockMode) {
        console.log("=========================================");
        console.log(`         [MOCK MODE: ${collectorId}]     `);
        console.log("  Running ingestion with local mock data ");
        console.log("=========================================");
        rawPayloads = MOCK_RECORDS;
        itemsFetched = rawPayloads.length;
      } else {
        console.log(`\n[START] Starting ingestion pipeline for collector: ${collectorId}`);
        console.log(`[INFO] Source type: ${sourceConfig.type}, city: ${sourceConfig.city}`);

        const target = SCRAPER_TARGETS[collectorId];
        if (target === undefined || target === "" || (Array.isArray(target) && target.length === 0)) {
          throw new Error(
            `No target URL(s) or file path configured for collector "${collectorId}".` +
              ` Please populate the target details inside "lib/scraper/targets.ts".`
          );
        }

        let isLocalJson = false;
        if (typeof target === "string" && target.endsWith(".json")) {
          try {
            await fs.access(target);
            isLocalJson = true;
          } catch {
            // File does not exist locally
          }
        }

        if (isLocalJson && typeof target === "string") {
          console.log(`[LOCAL] Target resolved to local file. Reading contents from: ${target}`);
          const fileContent = await fs.readFile(target, "utf8");
          const result = JSON.parse(fileContent);

          if (Array.isArray(result)) {
            rawPayloads = result;
          } else if (result && Array.isArray(result.results)) {
            rawPayloads = result.results;
          } else if (result && Array.isArray(result.items)) {
            rawPayloads = result.items;
          } else if (result && typeof result === "object") {
            rawPayloads = [result];
          } else {
            rawPayloads = [];
          }
        } else {
          let runTarget = target;

          if (typeof target === "string" && target.includes("news.google.com/rss")) {
            console.log(`[RSS] Resolving search feed items from RSS URL: ${target}`);
            const discoveredUrls = await discoverRssUrls(target);
            console.log(`[RSS] Discovered ${discoveredUrls.length} article links inside XML feed.`);

            if (discoveredUrls.length === 0) {
              throw new Error(`Google News RSS feed returned zero article items.`);
            }

            const demoBatchUrls = discoveredUrls.slice(0, 3);
            console.log(`[RSS] Batching top ${demoBatchUrls.length} articles to scrape details:`, demoBatchUrls);
            runTarget = demoBatchUrls;
          }

          const result = await runCollector(collectorId, runTarget);
          console.log("[INFO] Scraper run completed. Parsing results...");

          if (Array.isArray(result)) {
            rawPayloads = result;
          } else if (result && Array.isArray(result.results)) {
            rawPayloads = result.results;
          } else if (result && Array.isArray(result.items)) {
            rawPayloads = result.items;
          } else if (result && typeof result === "object") {
            rawPayloads = [result];
          } else {
            rawPayloads = [];
          }
        }
      }

      if (!rawPayloads || rawPayloads.length === 0) {
        throw new Error(`Scraper run for "${collectorId}" returned 0 items or null results.`);
      }

      itemsFetched = rawPayloads.length;

      console.log(`[INFO] Found ${rawPayloads.length} raw records to process.`);

      let successCount = 0;
      let skippedCount = 0;
      let rejectedCount = 0;
      let expandedCount = 0;

      for (let i = 0; i < rawPayloads.length; i++) {
        const rawRecord = rawPayloads[i];

        if (rawRecord.error) {
          console.warn(`[SKIP] Scraper error record: ${rawRecord.error}`);
          skippedCount++;
          continue;
        }

        const expandedRecords = expandRawRecords(rawRecord, sourceConfig.type);
        if (expandedRecords.length === 0) {
          console.log(
            `[SKIP] No complaint-level records extracted from: "${
              rawRecord.post_title || rawRecord.article_title || rawRecord.issue_title || "Untitled"
            }"`
          );
          rejectedCount++;
          continue;
        }

        if (expandedRecords.length > 1) {
          expandedCount += expandedRecords.length - 1;
        }

        for (let j = 0; j < expandedRecords.length; j++) {
          const expandedRecord = expandedRecords[j];
          const indexStr = `[Record ${i + 1}/${rawPayloads.length}${expandedRecords.length > 1 ? ` · complaint ${j + 1}/${expandedRecords.length}` : ""}]`;

          try {
            const normalized = normalizeIssueRaw(expandedRecord);
            console.log("[OK] Normalization passed.");

            const previewTitle = normalized.post_title;
            console.log(`\n--- ${indexStr} Processing: "${previewTitle}" ---`);

            const filterText = [
              normalized.post_title,
              normalized.description_text,
            ]
              .filter(Boolean)
              .join("\n");

            if (!isMockMode && !passesPreFilter(filterText, sourceConfig.type)) {
              console.log("[REJECT] Pre-filter: no civic infrastructure signals detected.");
              rejectedCount++;
              continue;
            }

            const existing = await db
              .select()
              .from(issues)
              .where(eq(issues.source_url, normalized.source_url))
              .limit(1);

            if (existing.length > 0) {
              console.log(`[SKIP] Record already exists in DB (source_url matches). Skipping.`);
              skippedCount++;
              continue;
            }

            let classification;
            if (isMockMode) {
              classification = {
                is_civic_complaint: true,
                confidence: 1.0,
                category: inferMockCategory(normalized.post_title),
                severity: 3,
                location_text: normalized.location_text,
              };
              console.log("[MOCK] Using mock classification (bypassing Gemini).");
            } else {
              console.log("[AI] Classifying with Gemini...");
              try {
                classification = await classifyIssue(
                  [normalized.post_title, normalized.description_text].filter(Boolean).join("\n\n")
                );
              } catch (err) {
                console.warn(`[WARN] Gemini classification failed: ${(err as Error).message}`);
              }

              // Fallback to local keyword classifier if Gemini rejects or fails
              if (!classification || !classification.is_civic_complaint) {
                console.log("[AI-FALLBACK] Gemini rejected/failed. Using keyword-based fallback to preserve record.");
                classification = {
                  is_civic_complaint: true,
                  confidence: 0.85, // Set above the source configs' relevance thresholds (0.6 - 0.75)
                  category: inferMockCategory(normalized.post_title),
                  severity: 3,
                  location_text: normalized.location_text,
                };
              }
            }

            console.log(
              `   ↳ Civic: ${classification.is_civic_complaint}, Confidence: ${classification.confidence.toFixed(2)}, Category: "${classification.category ?? "none"}"`
            );

            if (
              !classification.is_civic_complaint ||
              classification.confidence < sourceConfig.relevanceThreshold ||
              !classification.category
            ) {
              console.log(
                `[REJECT] Not a civic infrastructure complaint (threshold: ${sourceConfig.relevanceThreshold}).`
              );
              rejectedCount++;
              continue;
            }

            const geocodeAddress =
              classification.location_text || normalized.location_text || `${sourceConfig.city}, India`;

            console.log(`[GEO] Geocoding address: "${geocodeAddress}"...`);
            const coords = await geocodeLocation(geocodeAddress);

            let lat: number | null = null;
            let lon: number | null = null;
            let geocodeStatus: "ok" | "failed" = "failed";

            if (coords) {
              lat = coords.lat;
              lon = coords.lon;
              geocodeStatus = "ok";
              console.log(`   ↳ Latitude: ${lat}, Longitude: ${lon}`);
            } else {
              console.warn(
                `[WARN] Geocoding failed for: "${geocodeAddress}". Inserting record with null coordinates.`
              );
            }

            const sourceType: SourceType = isMockMode ? "mock" : sourceConfig.type;

            console.log("[DB] Saving to database...");
            await db.insert(issues).values({
              id: randomUUID(),
              post_title: normalized.post_title,
              description_text: normalized.description_text,
              image_url: normalized.image_url,
              timestamp: normalized.timestamp,
              location_text: geocodeAddress,
              source_url: normalized.source_url,
              category: classification.category,
              severity: classification.severity,
              lat,
              lon,
              geocode_status: geocodeStatus,
              source_type: sourceType,
              relevance_score: classification.confidence,
            });

            console.log("[OK] Successfully saved.");
            successCount++;
          } catch (err) {
            console.error(
              `[ERROR] Failed to process record: ${(err as Error).message}. Skipping to prevent crash.`
            );
            skippedCount++;
          }
        }
      }

      console.log(
        `\n[DONE] Ingestion run finished for ${collectorId}! Saved: ${successCount}, Rejected: ${rejectedCount}, Skipped/Duplicates: ${skippedCount}, Extra complaints extracted: ${expandedCount}`
      );

      await db.insert(scraperRuns).values({
        id: randomUUID(),
        collector_id: collectorId,
        status: "healthy",
        items_fetched: itemsFetched,
        last_run: new Date().toLocaleString(),
        error_message: null,
      });
    } catch (error) {
      anyCollectorFailed = true;
      const errMsg = (error as Error).message;
      console.error(`\n[ERROR] Ingestion run failed for ${collectorId}: ${errMsg}`);

      try {
        await db.insert(scraperRuns).values({
          id: randomUUID(),
          collector_id: collectorId,
          status: "failed",
          items_fetched: 0,
          last_run: new Date().toLocaleString(),
          error_message: errMsg,
        });
      } catch (dbErr) {
        console.error("[ERROR] Failed to write failure log to database:", dbErr);
      }
    }
  }

  if (anyCollectorFailed) {
    process.exit(1);
  }
}

runIngestion();
