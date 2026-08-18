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
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
});

// --- COMPILE-TIME TYPE SAFETIES ---
// Enforce that issues table exactly mirrors the Issue type from lib/types/issue.ts.
// Any additions, deletions, or type discrepancies will cause a TypeScript compiler error.
type SchemaSelect = typeof issues.$inferSelect;

// 1. Verify Drizzle schema output satisfies Zod Issue type
type _VerifyDrizzleToZod = SchemaSelect extends Issue ? true : never;
const _assertDrizzleToZod: _VerifyDrizzleToZod = true;

// 2. Verify Zod Issue type structure satisfies Drizzle schema
type _VerifyZodToDrizzle = {
  [K in keyof Issue]-?: NonNullable<Issue[K]>;
} extends {
  [K in keyof SchemaSelect]-?: NonNullable<SchemaSelect[K]>;
} ? true : never;
const _assertZodToDrizzle: _VerifyZodToDrizzle = true;
