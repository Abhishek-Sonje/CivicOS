import { runCollector } from "../lib/scraper/client";
import { normalizeIssueRaw } from "../lib/scraper/normalize";
import { classifyIssue } from "../lib/ai/classify-issue";
import { geocodeLocation } from "../lib/ai/geocode";
import { db } from "../lib/db/client";
import { issues } from "../lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local for command-line execution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runIngestion() {
  const collectorId = process.argv[2] || process.env.BRIGHTDATA_COLLECTOR_ID || "c_mock_collector";
  console.log(`🚀 Starting ingestion pipeline for collector: ${collectorId}`);

  let rawPayloads: any;

  try {
    // 1. Shell out to Bright Data CLI
    const result = await runCollector(collectorId);
    console.log("📥 Scraper run completed. Parsing results...");

    // Extracts items flexibly based on what the JSON output contains
    if (Array.isArray(result)) {
      rawPayloads = result;
    } else if (result && Array.isArray(result.results)) {
      rawPayloads = result.results;
    } else if (result && Array.isArray(result.items)) {
      rawPayloads = result.items;
    } else if (result && typeof result === "object") {
      // If it is an envelope with data details, or a single item
      rawPayloads = [result];
    } else {
      rawPayloads = [];
    }
  } catch (error) {
    console.warn(
      `⚠️ Bright Data CLI execution failed: ${(error as Error).message}`
    );
    console.log("ℹ️ Falling back to mock raw scraper payloads for demonstration...");

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

  console.log(`📊 Found ${rawPayloads.length} raw records to process.`);
  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rawPayloads.length; i++) {
    const rawRecord = rawPayloads[i];
    const indexStr = `[Record ${i + 1}/${rawPayloads.length}]`;

    try {
      console.log(`\n--- ${indexStr} Processing: "${rawRecord.post_title || "Untitled"}" ---`);

      // 2. Normalize and validate against IssueRaw schema
      const normalized = normalizeIssueRaw(rawRecord);
      console.log("✅ Normalization passed.");

      // Check for duplicates in the DB by source URL to maintain idempotency
      const existing = await db
        .select()
        .from(issues)
        .where(eq(issues.source_url, normalized.source_url))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️ Record already exists in DB (source_url matches). Skipping.`);
        skippedCount++;
        continue;
      }

      // 3. Classify with Gemini
      console.log("🧠 Classifying with Gemini...");
      const classification = await classifyIssue(
        normalized.description_text || normalized.post_title
      );
      console.log(
        `   ↳ Category: "${classification.category}", Severity: ${classification.severity}/5`
      );

      // 4. Geocode with OSM Nominatim
      console.log(`📍 Geocoding address: "${normalized.location_text}"...`);
      const coords = await geocodeLocation(normalized.location_text);

      if (!coords) {
        console.warn(`⏭️ Geocoding failed (returned null) for: "${normalized.location_text}". Skipping record.`);
        skippedCount++;
        continue;
      }
      console.log(`   ↳ Latitude: ${coords.lat}, Longitude: ${coords.lon}`);

      // 5. Save to the database
      console.log("💾 Saving to database...");
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

      console.log("✅ Successfully saved.");
      successCount++;
    } catch (err) {
      // Log and skip record on validation/classification/processing error
      console.error(
        `❌ Failed to process record: ${(err as Error).message}. Skipping to prevent crash.`
      );
      skippedCount++;
    }
  }

  console.log(`\n🎉 Ingestion run finished! Success: ${successCount}, Skipped/Duplicates: ${skippedCount}`);
}

runIngestion();
