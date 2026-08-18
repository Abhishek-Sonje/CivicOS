import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI client only if the key is available
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface ClassificationResult {
  category: "Pothole/Road Damage" | "Garbage/Trash Overflow" | "Waterlogging/Drainage" | "Streetlight Failure";
  severity: number;
}

const DEFAULT_RESULT: ClassificationResult = {
  category: "Streetlight Failure", // Safe fallback category
  severity: 1,
};

/**
 * Classifies the given civic issue description using the Gemini API.
 * Returns a category and a 1-5 severity rating.
 * Fails gracefully by returning default fallbacks rather than throwing to prevent breaking ingestion.
 */
export async function classifyIssue(descriptionText: string): Promise<ClassificationResult> {
  if (!ai) {
    console.warn("AI warning: GEMINI_API_KEY is not configured. Using default fallback classification.");
    return DEFAULT_RESULT;
  }

  // Handle empty or whitespace-only descriptions early
  if (!descriptionText || !descriptionText.trim()) {
    console.warn("AI warning: Empty description provided. Returning default classification.");
    return DEFAULT_RESULT;
  }

  try {
    const prompt = `
Analyze the following description of a municipal or infrastructure issue.
Provide your response strictly as a JSON object matching this schema:
{
  "category": "Pothole/Road Damage" | "Garbage/Trash Overflow" | "Waterlogging/Drainage" | "Streetlight Failure",
  "severity": number (an integer between 1 and 5, where 1 is minor/low and 5 is critical/severe)
}

Choose the single best matching category from the list above. If none match perfectly, assign the closest category.
Do not include any commentary, formatting backticks, or other text outside the JSON object.

Description:
"${descriptionText}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No text returned in Gemini response.");
    }

    const parsed = JSON.parse(responseText.trim());

    // Validate the category returned from the AI
    const validCategories = [
      "Pothole/Road Damage",
      "Garbage/Trash Overflow",
      "Waterlogging/Drainage",
      "Streetlight Failure",
    ];

    let category = parsed.category;
    if (!validCategories.includes(category)) {
      console.warn(`AI warning: Invalid category "${category}" returned. Defaulting to fallback.`);
      category = DEFAULT_RESULT.category;
    }

    // Validate the severity returned from the AI
    let severity = parseInt(parsed.severity, 10);
    if (isNaN(severity) || severity < 1 || severity > 5) {
      console.warn(`AI warning: Invalid severity "${parsed.severity}" returned. Defaulting to fallback.`);
      severity = DEFAULT_RESULT.severity;
    }

    return {
      category: category as ClassificationResult["category"],
      severity,
    };
  } catch (error) {
    console.error("AI error: Failed to classify issue with Gemini. Exception detail:", error);
    // Never crash the ingestion pipeline: return fallback values
    return DEFAULT_RESULT;
  }
}
