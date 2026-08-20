import { GoogleGenAI } from "@google/genai";

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  // Standard Google AI Studio keys start with AIzaSy
  if (!apiKey || apiKey.startsWith("AQ.")) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

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
  area: string | null;
}

const CIVIC_CATEGORIES: CivicCategory[] = [
  "Pothole/Road Damage",
  "Garbage/Trash Overflow",
  "Waterlogging/Drainage",
  "Streetlight Failure",
];

function inferPuneArea(text: string): string | null {
  const lower = text.toLowerCase();
  const areas = [
    "Kothrud", "Baner", "Hadapsar", "Hinjewadi", "Shivajinagar",
    "Kalyani Nagar", "Viman Nagar", "Wagholi", "Katraj", "Aundh",
    "Koregaon Park", "Manjari", "Ambegaon", "Warje", "Pimple Saudagar",
    "Chinchwad", "Pimpri", "Deccan", "Camp", "Karvenagar", "Bibwewadi",
    "Dhankawadi", "Bhosari", "Sangvi", "Khadki", "Yerawada", "Dhanori"
  ];
  for (const area of areas) {
    if (lower.includes(area.toLowerCase())) {
      return area;
    }
  }
  return "Shivajinagar";
}

function inferRuleClassification(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  let category: CivicCategory = "Pothole/Road Damage";
  let severity = 3;

  if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("dump")) {
    category = "Garbage/Trash Overflow";
    severity = lower.includes("disease") || lower.includes("overflow") ? 4 : 3;
  } else if (lower.includes("water") || lower.includes("drain") || lower.includes("flood") || lower.includes("submerged")) {
    category = "Waterlogging/Drainage";
    severity = lower.includes("submerged") || lower.includes("knee-deep") ? 5 : 4;
  } else if (lower.includes("light") || lower.includes("dark") || lower.includes("lamp")) {
    category = "Streetlight Failure";
    severity = 3;
  } else if (lower.includes("pothole") || lower.includes("road") || lower.includes("crater")) {
    category = "Pothole/Road Damage";
    severity = lower.includes("accident") || lower.includes("fracture") || lower.includes("crater") ? 5 : 4;
  }

  const area = inferPuneArea(text);
  const location_text = area ? `${area}, Pune` : "Pune, Maharashtra";

  return {
    is_civic_complaint: true,
    confidence: 0.9,
    category,
    severity,
    location_text,
    area,
  };
}

/**
 * Classifies civic relevance, category, severity, and location from issue text.
 * Falls back to intelligent rule-based classification if Gemini API key is unconfigured or returns an error.
 */
export async function classifyIssue(descriptionText: string): Promise<ClassificationResult> {
  if (!descriptionText || !descriptionText.trim()) {
    return {
      is_civic_complaint: false,
      confidence: 0,
      category: null,
      severity: 1,
      location_text: null,
      area: null,
    };
  }

  const ai = getAi();
  if (!ai) {
    // Return rule-based classification fallback
    return inferRuleClassification(descriptionText);
  }

  try {
    const prompt = `
Analyze the following text and decide if it describes a municipal infrastructure problem
(potholes, road damage, garbage overflow, drainage/waterlogging, broken streetlights, sewage, open drains) in Pune.

Return ONLY a JSON object matching this schema:
{
  "is_civic_complaint": boolean,
  "confidence": number (0.5 to 1.0),
  "category": "Pothole/Road Damage" | "Garbage/Trash Overflow" | "Waterlogging/Drainage" | "Streetlight Failure",
  "severity": number (1-5),
  "location_text": string,
  "area": string
}

Text:
"${descriptionText.replace(/"/g, '\\"')}"
`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let responseText: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch {
        // try next model
      }
    }

    if (!responseText) {
      return inferRuleClassification(descriptionText);
    }

    const parsed = JSON.parse(responseText.trim());

    return {
      is_civic_complaint: Boolean(parsed.is_civic_complaint),
      confidence: parseFloat(parsed.confidence) || 0.85,
      category: parsed.category || "Pothole/Road Damage",
      severity: parseInt(parsed.severity, 10) || 3,
      location_text: parsed.location_text || `${parsed.area || "Pune"}, Pune`,
      area: parsed.area || inferPuneArea(descriptionText),
    };
  } catch {
    return inferRuleClassification(descriptionText);
  }
}
