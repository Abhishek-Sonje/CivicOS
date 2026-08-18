import { IssueRawSchema, type IssueRaw } from "../types/issue";
import { ZodError } from "zod";

/**
 * Normalizes and validates a raw scraper payload against the IssueRaw schema.
 * Returns the validated object (with any extra fields stripped) or throws a clear
 * descriptive error specifying which fields failed validation.
 */
export function normalizeIssueRaw(payload: unknown): IssueRaw {
  try {
    // IssueRawSchema.parse will validate and strip any unexpected properties
    return IssueRawSchema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((err) => {
        const fieldName = err.path.join(".") || "payload";
        return `"${fieldName}" (${err.message})`;
      });
      throw new Error(`Validation failed: Missing or invalid fields: ${fieldErrors.join(", ")}`);
    }
    throw error;
  }
}
