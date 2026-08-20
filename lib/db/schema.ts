import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import type { Issue } from "../types/issue";

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  post_title: text("post_title").notNull(),
  description_text: text("description_text"),
  image_url: text("image_url"),
  timestamp: text("timestamp").notNull(),
  location_text: text("location_text").notNull(),
  source_url: text("source_url").notNull(),
  category: text("category").notNull(),
  severity: integer("severity").notNull(),
  lat: real("lat"),
  lon: real("lon"),
  geocode_status: text("geocode_status", { enum: ["ok", "failed"] }).notNull(),
  source_type: text("source_type", {
    enum: ["citizen_platform", "news_letter", "social", "mock"],
  }).notNull(),
  relevance_score: real("relevance_score").notNull(),
  area: text("area"),
});

// --- COMPILE-TIME TYPE SAFETIES ---
type SchemaSelect = typeof issues.$inferSelect;

type _VerifyDrizzleToZod = SchemaSelect extends Issue ? true : never;
const _assertDrizzleToZod: _VerifyDrizzleToZod = true;

type _VerifyZodToDrizzle = {
  [K in keyof Issue]-?: NonNullable<Issue[K]>;
} extends {
  [K in keyof SchemaSelect]-?: NonNullable<SchemaSelect[K]>;
}
  ? true
  : never;
const _assertZodToDrizzle: _VerifyZodToDrizzle = true;

export const scraperRuns = sqliteTable("scraper_runs", {
  id: text("id").primaryKey(),
  collector_id: text("collector_id").notNull(),
  status: text("status", { enum: ["healthy", "failed", "healing"] }).notNull(),
  items_fetched: integer("items_fetched").notNull(),
  last_run: text("last_run").notNull(),
  error_message: text("error_message"),
});
