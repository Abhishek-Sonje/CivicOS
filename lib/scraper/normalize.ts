import { IssueRawSchema, type IssueRaw } from "../types/issue";
import { ZodError } from "zod";

/**
 * Normalizes and validates a raw scraper payload against the IssueRaw schema.
 * Dynamically maps varying naming schemas from different platforms (Reddit, Mid-Day, Opinify)
 * to a standardized unified format.
 */
export function normalizeIssueRaw(payload: any): IssueRaw {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Payload must be a non-null object");
  }

  // 1. Dynamic mapping of varying title structures
  const post_title =
    payload.post_title ||
    payload.article_title ||
    payload.issue_title ||
    payload.title ||
    "Untitled Issue";

  // 2. Dynamic mapping of varying description/text fields
  const description_text =
    payload.description_text ||
    payload.post_text ||
    payload.post_body ||
    payload.short_description ||
    payload.article_content ||
    payload.description ||
    null;

  // 3. Dynamic mapping of varying image fields
  let image_url =
    payload.image_url ||
    payload.featured_image ||
    payload.image ||
    null;

  // Sanitize image URL to prevent Zod validation failures on invalid formats
  if (typeof image_url === "string" && image_url.trim() !== "") {
    try {
      new URL(image_url);
    } catch {
      image_url = null;
    }
  } else {
    image_url = null;
  }

  // 4. Dynamic mapping of varying timestamp names
  const timestamp =
    payload.timestamp ||
    payload.post_timestamp ||
    payload.publish_date ||
    payload.timestamp_value ||
    new Date().toLocaleString();

  // 5. Dynamic mapping of location references or city fallbacks
  let location_text = payload.location_text || payload.location;
  if (typeof location_text === "string") {
    if (location_text.toLowerCase().includes("r/pune")) {
      location_text = "Pune, India";
    } else if (location_text.toLowerCase().includes("r/nashik")) {
      location_text = "Nashik, India";
    }
  }

  if (!location_text) {
    const textContext = (
      (payload.input?.url || "") + 
      (payload.report_url || "") + 
      (payload.product_page_url || "") + 
      post_title + 
      (description_text || "")
    ).toLowerCase();

    if (textContext.includes("mumbai")) {
      location_text = "Mumbai";
    } else if (textContext.includes("pune")) {
      location_text = "Pune";
    } else if (textContext.includes("nashik")) {
      location_text = "Nashik";
    } else {
      location_text = "India";
    }
  }

  // 6. Dynamic mapping of varying source/origin URL names
  let source_url =
    payload.source_url ||
    payload.post_url ||
    payload.report_url ||
    payload.product_page_url ||
    payload.article_url ||
    payload.input?.url ||
    "http://unknown-source.local";

  // Sanitize source URL to ensure valid format
  if (typeof source_url === "string" && source_url.trim() !== "") {
    try {
      new URL(source_url);
    } catch {
      source_url = "http://unknown-source.local";
    }
  } else {
    source_url = "http://unknown-source.local";
  }

  const normalizedObject = {
    post_title,
    description_text,
    image_url,
    timestamp,
    location_text,
    source_url,
  };

  try {
    return IssueRawSchema.parse(normalizedObject);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((err) => {
        const fieldName = err.path.join(".") || "payload";
        return `"${fieldName}" (${err.message})`;
      });
      throw new Error(`Normalization failed: Missing or invalid fields: ${fieldErrors.join(", ")}`);
    }
    throw error;
  }
}
