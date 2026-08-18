/**
 * Static UI copy constants. All UI text lives here.
 * Rule: No component should ever hardcode a color or a string.
 */
export const COPY = {
  appTitle: "Civic Infrastructure Audit Dashboard",
  emptyState: "No civic infrastructure issues reported in this area.",
  severity: {
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
  },
  scraperHealth: {
    panelTitle: "Scraper Health Status",
    statusHealthy: "Scraper Healthy - Active",
    statusFailed: "Scraper Failed - Extraction Failed",
    statusHealing: "Scraper Healing - Diff Review",
  },
};
