export interface GeocodeResult {
  lat: number;
  lon: number;
}

/**
 * Geocodes a natural-language location description using OpenStreetMap Nominatim.
 * Returns { lat, lon } or null if not found or if the API call fails.
 * Fails gracefully to prevent crashing the ingestion pipeline.
 */
export async function geocodeLocation(locationText: string): Promise<GeocodeResult | null> {
  if (!locationText || !locationText.trim()) {
    console.warn("Geocoding warning: Empty location text provided.");
    return null;
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", locationText);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        // OSM Nominatim API strictly requires a descriptive User-Agent to prevent getting blocked
        "User-Agent": "CivicInfrastructureAuditDashboard/1.0 (contact: support@civic-audit-dashboard.local)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as any[];

    if (!Array.isArray(data) || data.length === 0) {
      console.info(`Geocoding: No results returned from Nominatim for: "${locationText}"`);
      return null;
    }

    const firstResult = data[0];
    const lat = parseFloat(firstResult.lat);
    const lon = parseFloat(firstResult.lon);

    if (isNaN(lat) || isNaN(lon)) {
      console.warn(
        `Geocoding warning: Coordinates returned by Nominatim were not parseable. Raw: lat="${firstResult.lat}", lon="${firstResult.lon}"`
      );
      return null;
    }

    return { lat, lon };
  } catch (error) {
    console.error(`Geocoding error: Failed to fetch coordinates for location "${locationText}". Exception:`, error);
    // Never crash the pipeline: fail gracefully
    return null;
  }
}
