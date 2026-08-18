import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type CivicCategory =
  | "Pothole/Road Damage"
  | "Garbage/Trash Overflow"
  | "Waterlogging/Drainage"
  | "Streetlight Failure";

export interface ClassificationResult {
  is_civic_complaint: boolean;
  confidence: number;
  category: CivicCategory | null;
  severity: number;
  location_text: string | null;
}

const CIVIC_CATEGORIES: CivicCategory[] = [
  "Pothole/Road Damage",
  "Garbage/Trash Overflow",
  "Waterlogging/Drainage",
  "Streetlight Failure",
];

const REJECTED_RESULT: ClassificationResult = {
  is_civic_complaint: false,
  confidence: 0,
  category: null,
  severity: 1,
  location_text: null,
};

/**
 * Classifies civic relevance, category, severity, and location from issue text.
 * Returns is_civic_complaint=false for non-infrastructure content (housing, food, crime, etc.).
 */
export async function classifyIssue(descriptionText: string): Promise<ClassificationResult> {
  if (!ai) {
    console.warn("AI warning: GEMINI_API_KEY is not configured. Rejecting record (no classification available).");
    return REJECTED_RESULT;
  }

  if (!descriptionText || !descriptionText.trim()) {
    console.warn("AI warning: Empty description provided. Rejecting record.");
    return REJECTED_RESULT;
  }

  try {
    const prompt = `
Analyze the following text and decide if it is a citizen report of a specific municipal infrastructure problem
(pothole, road damage, garbage overflow, drainage/waterlogging, broken streetlight, sewage, open drain, etc.).

Return ONLY a JSON object matching this schema:
{
  "is_civic_complaint": boolean (true ONLY if someone is reporting physical municipal infrastructure damage or neglect at a specific place),
  "confidence": number (0.0 to 1.0 — how confident you are that this is a real infrastructure complaint),
  "category": "Pothole/Road Damage" | "Garbage/Trash Overflow" | "Waterlogging/Drainage" | "Streetlight Failure" | null,
  "severity": number (integer 1-5; use 1 if not a complaint),
  "location_text": string | null (extract street, landmark, neighborhood, or area — e.g. "College Road, Nashik". null if none found)
}

REJECT (is_civic_complaint=false) for:
- College admissions, housing/rent, hotels, food/restaurant queries
- Crime, accidents, legal advice, police/FIR matters
- Product reviews, shopping, travel carpools
- General city opinions without a specific fixable infrastructure issue
- Political news about contractors/parties without a citizen complaint

ACCEPT (is_civic_complaint=true) for:
- Potholes, broken roads, waterlogging, garbage dumps, broken lights, drainage blocks
- Citizen letters to newspapers about specific civic neglect at a named location

If is_civic_complaint is false, set category to null and confidence below 0.5.

Text:
"${descriptionText.replace(/"/g, '\\"')}"
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

    const is_civic_complaint = Boolean(parsed.is_civic_complaint);

    let confidence = parseFloat(parsed.confidence);
    if (isNaN(confidence)) {
      confidence = is_civic_complaint ? 0.5 : 0;
    }
    confidence = Math.max(0, Math.min(1, confidence));

    let category: CivicCategory | null = parsed.category;
    if (!category || !CIVIC_CATEGORIES.includes(category)) {
      category = is_civic_complaint ? "Pothole/Road Damage" : null;
    }

    let severity = parseInt(parsed.severity, 10);
    if (isNaN(severity) || severity < 1 || severity > 5) {
      severity = 1;
    }

    const location_text =
      typeof parsed.location_text === "string" && parsed.location_text.trim()
        ? parsed.location_text.trim()
        : null;

    if (!is_civic_complaint) {
      return {
        is_civic_complaint: false,
        confidence,
        category: null,
        severity: 1,
        location_text,
      };
    }

    return {
      is_civic_complaint: true,
      confidence,
      category,
      severity,
      location_text,
    };
  } catch (error) {
    console.error("AI error: Failed to classify issue with Gemini. Exception detail:", error);
    return REJECTED_RESULT;
  }
}
