import { runCollector } from "../lib/scraper/client";
import { normalizeIssueRaw } from "../lib/scraper/normalize";
import { classifyIssue } from "../lib/ai/classify-issue";
import { geocodeLocation } from "../lib/ai/geocode";
import { db } from "../lib/db/client";
import { issues } from "../lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { SCRAPER_TARGETS } from "../lib/scraper/targets";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local for command-line execution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runIngestion() {
  const collectorId = process.argv[2] || process.env.BRIGHTDATA_COLLECTOR_ID || "c_mock_collector";
  console.log(`[START] Starting ingestion pipeline for collector: ${collectorId}`);

  // Retrieve crawl target configuration from the map
  const target = SCRAPER_TARGETS[collectorId];
  if (target === undefined || target === "" || (Array.isArray(target) && target.length === 0)) {
    console.error(
      `[ERROR] No target URL(s) or file path configured for collector "${collectorId}".` +
      ` Please populate the target details inside "lib/scraper/targets.ts".`
    );
    process.exit(1);
  }

  let rawPayloads: any;

  try {
    // Shell out to Bright Data CLI with the target URL/file configuration
    const result = await runCollector(collectorId, target);
    console.log("[INFO] Scraper run completed. Parsing results...");

    // Extracts items flexibly based on what the JSON output contains
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
  } catch (error) {
    console.warn(
      `[WARN] Bright Data CLI execution failed: ${(error as Error).message}`
    );
    console.log("[INFO] Falling back to mock raw scraper payloads for demonstration...");

    // Mock raw scraper payloads for testing the pipeline
    rawPayloads = [
      {
        post_title: "Large pothole on Elm Street",
        description_text: "There is a deep pothole near the intersection of Elm and 4th Street that is damaging tires.",
        image_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2",
        timestamp: new Date().toISOString(),
        location_text: "Elm St and 4th St, Springfield",
        source_url: "https://springfieldgrievances.example/issue/101",
      },
      {
        post_title: "Overflowing trash bins at Pine Park",
        description_text: "Trash cans in the playground area have not been emptied for days. Garbage is flying everywhere.",
        image_url: null,
        timestamp: new Date().toISOString(),
        location_text: "Pine Street Park, Springfield",
        source_url: "https://springfieldgrievances.example/issue/102",
      },
      {
        post_title: "Streetlight out on Maple Avenue",
        description_text: "The streetlight post #42 is completely dead. The street is extremely dark at night.",
        image_url: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d",
        timestamp: new Date().toISOString(),
        location_text: "Maple Ave near 15th St, Springfield",
        source_url: "https://springfieldgrievances.example/issue/103",
      },
    ];
  }

  console.log(`[INFO] Found ${rawPayloads.length} raw records to process.`);
  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rawPayloads.length; i++) {
    const rawRecord = rawPayloads[i];
    const indexStr = `[Record ${i + 1}/${rawPayloads.length}]`;

    try {
      console.log(`\n--- ${indexStr} Processing: "${rawRecord.post_title || "Untitled"}" ---`);

      // Normalize and validate against IssueRaw schema
      const normalized = normalizeIssueRaw(rawRecord);
      console.log("[OK] Normalization passed.");

      // Check for duplicates in the DB by source URL to maintain idempotency
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

      // Classify with Gemini
      console.log("[AI] Classifying with Gemini...");
      const classification = await classifyIssue(
        normalized.description_text || normalized.post_title
      );
      console.log(
        `   ↳ Category: "${classification.category}", Severity: ${classification.severity}/5`
      );

      // Geocode with OSM Nominatim
      console.log(`[GEO] Geocoding address: "${normalized.location_text}"...`);
      const coords = await geocodeLocation(normalized.location_text);

      if (!coords) {
        console.warn(`[SKIP] Geocoding failed (returned null) for: "${normalized.location_text}". Skipping record.`);
        skippedCount++;
        continue;
      }
      console.log(`   ↳ Latitude: ${coords.lat}, Longitude: ${coords.lon}`);

      // Save to the database
      console.log("[DB] Saving to database...");
      await db.insert(issues).values({
        id: randomUUID(),
        post_title: normalized.post_title,
        description_text: normalized.description_text,
        image_url: normalized.image_url,
        timestamp: normalized.timestamp,
        location_text: normalized.location_text,
        source_url: normalized.source_url,
        category: classification.category,
        severity: classification.severity,
        lat: coords.lat,
        lon: coords.lon,
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

  console.log(`\n[DONE] Ingestion run finished! Success: ${successCount}, Skipped/Duplicates: ${skippedCount}`);
}

runIngestion();
