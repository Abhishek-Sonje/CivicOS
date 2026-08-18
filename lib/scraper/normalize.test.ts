import assert from "node:assert";
import { normalizeIssueRaw } from "./normalize";

// 1. Valid payload
const validPayload = {
  post_title: "Broken streetlight on Main St",
  description_text: "The street light has been out for a week.",
  image_url: "https://example.com/street.jpg",
  timestamp: "2026-08-18T12:00:00Z",
  location_text: "Main St and Elm St",
  source_url: "https://grievance-board.org/123",
};

// 2. Missing field payload (missing post_title)
const missingFieldPayload = {
  description_text: "The street light has been out for a week.",
  image_url: "https://example.com/street.jpg",
  timestamp: "2026-08-18T12:00:00Z",
  location_text: "Main St and Elm St",
  source_url: "https://grievance-board.org/123",
};

// 3. Wrong type payload (description_text is a number instead of a string)
const wrongTypePayload = {
  post_title: "Broken streetlight on Main St",
  description_text: 12345,
  image_url: "https://example.com/street.jpg",
  timestamp: "2026-08-18T12:00:00Z",
  location_text: "Main St and Elm St",
  source_url: "https://grievance-board.org/123",
};

// 4. Extra fields payload
const extraFieldsPayload = {
  post_title: "Broken streetlight on Main St",
  description_text: "The street light has been out for a week.",
  image_url: "https://example.com/street.jpg",
  timestamp: "2026-08-18T12:00:00Z",
  location_text: "Main St and Elm St",
  source_url: "https://grievance-board.org/123",
  extra_metadata: "some metadata we do not need",
  nested_extra: { key: "value" },
};

function runTests() {
  console.log("Running normalization tests...");

  // Test 1: Valid payload
  try {
    const result = normalizeIssueRaw(validPayload);
    assert.deepStrictEqual(result, validPayload);
    console.log("✅ Test 1 Passed: Valid payload normalized successfully.");
  } catch (err) {
    console.error("❌ Test 1 Failed:", err);
    process.exit(1);
  }

  // Test 2: Missing field
  try {
    assert.throws(
      () => normalizeIssueRaw(missingFieldPayload),
      (err: any) => {
        return (
          err instanceof Error &&
          err.message.includes("Validation failed:") &&
          err.message.includes("post_title") &&
          (err.message.includes("expected string") || err.message.includes("Required"))
        );
      }
    );
    console.log("✅ Test 2 Passed: Missing field threw expected validation error.");
  } catch (err) {
    console.error("❌ Test 2 Failed:", err);
    process.exit(1);
  }

  // Test 3: Wrong type
  try {
    assert.throws(
      () => normalizeIssueRaw(wrongTypePayload),
      (err: any) => {
        return (
          err instanceof Error &&
          err.message.includes("Validation failed:") &&
          err.message.includes("description_text") &&
          (err.message.includes("expected string, received number") ||
            err.message.includes("Expected string, received number"))
        );
      }
    );
    console.log("✅ Test 3 Passed: Wrong type threw expected validation error.");
  } catch (err) {
    console.error("❌ Test 3 Failed:", err);
    process.exit(1);
  }

  // Test 4: Extra fields
  try {
    const result = normalizeIssueRaw(extraFieldsPayload);
    // Should parse successfully but strip out extra fields
    assert.strictEqual((result as any).extra_metadata, undefined);
    assert.strictEqual((result as any).nested_extra, undefined);
    assert.deepStrictEqual(result, validPayload);
    console.log("✅ Test 4 Passed: Extra fields successfully stripped from payload.");
  } catch (err) {
    console.error("❌ Test 4 Failed:", err);
    process.exit(1);
  }

  console.log("🎉 All normalization tests completed successfully!");
}

runTests();
