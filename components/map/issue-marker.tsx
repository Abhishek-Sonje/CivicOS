"use client";

import { Marker, Popup } from "react-leaflet";
import type { Issue } from "../../lib/types/issue";
import L from "leaflet";

interface IssueMarkerProps {
  issue: Issue;
}

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

  return (
    <Marker position={[issue.lat, issue.lon]} icon={icon}>
      <Popup>
        <div className="flex flex-col gap-2 max-w-[240px] text-foreground font-sans">
          {issue.image_url && (
            <img
              src={issue.image_url}
              alt={issue.post_title}
              className="w-full h-28 object-cover rounded-panel border border-border"
            />
          )}
          <div className="flex flex-col">
            <h4 className="text-sm font-bold leading-tight">{issue.post_title}</h4>
            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide mt-0.5">
              {issue.category}
            </span>
          </div>
          {issue.description_text && (
            <p className="text-xs text-foreground/85 leading-normal line-clamp-3">
              {issue.description_text}
            </p>
          )}
          <div className="border-t border-border pt-1 mt-1 text-[9px] text-foreground/55">
            Reported: {new Date(issue.timestamp).toLocaleString()}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
