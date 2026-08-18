"use client";

import { Marker, Popup } from "react-leaflet";
import type { Issue, SourceType } from "../../lib/types/issue";
import L from "leaflet";

interface IssueMarkerProps {
  issue: Issue & { lat: number; lon: number };
}

const SOURCE_DETAILS: Record<
  SourceType,
  { label: string; bgClass: string; textClass: string }
> = {
  citizen_platform: {
    label: "Citizen Portal",
    bgClass: "bg-blue-500/10 border-blue-500/20",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  news_letter: {
    label: "News Column",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  social: {
    label: "Social Media",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  mock: {
    label: "Mock Data",
    bgClass: "bg-purple-500/10 border-purple-500/20",
    textClass: "text-purple-600 dark:text-purple-400",
  },
};

function getSeverityToken(severity: number): "low" | "moderate" | "critical" {
  if (severity <= 2) return "low";
  if (severity === 3) return "moderate";
  return "critical";
}

/**
 * Creates a custom HTML Leaflet icon utilizing our Tailwind severity color tokens.
 */
function createMarkerIcon(severity: number) {
  const token = getSeverityToken(severity);
  let colorClass = "";
  if (token === "low") {
    colorClass = "bg-severity-low text-white";
  } else if (token === "moderate") {
    colorClass = "bg-severity-moderate text-black";
  } else {
    colorClass = "bg-severity-critical text-white";
  }

  return L.divIcon({
    html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-xs ${colorClass}">${severity}</div>`,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function IssueMarker({ issue }: IssueMarkerProps) {
  const icon = createMarkerIcon(issue.severity);
  const source = SOURCE_DETAILS[issue.source_type] || SOURCE_DETAILS.social;

  return (
    <Marker position={[issue.lat, issue.lon]} icon={icon}>
      <Popup>
        <div className="flex flex-col gap-2.5 max-w-[250px] text-foreground font-sans">
          {issue.image_url && (
            <img
              src={issue.image_url}
              alt={issue.post_title}
              className="w-full h-28 object-cover rounded-panel border border-border"
            />
          )}

          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold leading-tight">{issue.post_title}</h4>
            
            {/* Metadata Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-foreground/50">
                {issue.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${source.bgClass} ${source.textClass}`}
              >
                {source.label}
              </span>
              <span className="text-[9px] font-bold font-mono text-primary ml-auto">
                {(issue.relevance_score * 100).toFixed(0)}% relevance
              </span>
            </div>
          </div>

          {issue.description_text && (
            <p className="text-xs text-foreground/80 leading-normal line-clamp-3 border-t border-border/40 pt-2">
              {issue.description_text}
            </p>
          )}

          <div className="border-t border-border pt-1.5 text-[9px] text-foreground/45 flex justify-between">
            <span>Reported: {new Date(issue.timestamp).toLocaleDateString()}</span>
            <span className="font-semibold">Severity: {issue.severity}/5</span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
