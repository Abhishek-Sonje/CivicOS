import type { SourceType } from "./sources";

const CIVIC_SIGNALS =
  /\b(pothole|khadda|khadd|waterlog|water\s*log|drain|drainage|garbage|trash|dump|overflow|streetlight|street\s*light|sewage|manhole|footpath|encroach|broken\s*road|road\s*damage|civic|bmc|pmc|nmc|municipal|sanitation|open\s*drain|dark\s*road|unlit|waterlogging|filth|debris|sewer|gutter|nala|nullah)\b/i;

const NON_CIVIC_SIGNALS =
  /\b(college|admission|cap\s*round|hostel|pg\s*for\s*rent|flat\s*on\s*rent|couple\s*friendly|buffet|beffet|wifi|broadband|valorant|meteor\s*350|motorcycle|bike\s*advice|movie|awarapan|trek|momos|maid|kamwali|food\s*near|restaurant|hit\s*and\s*run|fir\b|legal|lawyer|police\s*investigation|road\s*rage\s*advice|conflict\s*without|lonely|discord\s*server|bla\s*bla|travel\s*from\s*bangalore)\b/i;

/**
 * Cheap keyword gate run before Gemini to drop obvious non-civic noise,
 * especially from broad social-media searches.
 */
export function passesPreFilter(text: string, sourceType: SourceType): boolean {
  if (sourceType === "mock" || sourceType === "citizen_platform") {
    return true;
  }

  const combined = text.trim();
  if (!combined) {
    return false;
  }

  if (NON_CIVIC_SIGNALS.test(combined)) {
    return false;
  }

  if (sourceType === "social") {
    return CIVIC_SIGNALS.test(combined);
  }

  // News letters: either explicit Problems section or clear civic vocabulary
  return CIVIC_SIGNALS.test(combined) || /\bproblems\b/i.test(combined);
}
