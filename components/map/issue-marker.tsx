"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Issue } from "../../lib/types/issue";

interface IssueMarkerProps {
  issue: Issue & { lat: number; lon: number };
  onClick?: (issue: Issue) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Pothole/Road Damage": "#ef4444",
  "Garbage/Trash Overflow": "#f59e0b",
  "Waterlogging/Drainage": "#3b82f6",
  "Streetlight Failure": "#a855f7",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Pothole/Road Damage": "🕳️",
  "Garbage/Trash Overflow": "🗑️",
  "Waterlogging/Drainage": "💧",
  "Streetlight Failure": "💡",
};

function createMarkerIcon(category: string, severity: number) {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";
  const size = severity >= 4 ? 18 : severity >= 3 ? 15 : 12;
  const pulseSize = size + 8;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${pulseSize}" height="${pulseSize}" viewBox="0 0 ${pulseSize} ${pulseSize}">
      <circle cx="${pulseSize / 2}" cy="${pulseSize / 2}" r="${size / 2 + 2}" fill="${color}" opacity="0.2">
        <animate attributeName="r" values="${size / 2};${size / 2 + 5};${size / 2}" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${pulseSize / 2}" cy="${pulseSize / 2}" r="${size / 2}" fill="${color}" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      ${severity >= 4 ? `<circle cx="${pulseSize / 2}" cy="${pulseSize / 2}" r="3" fill="white" opacity="0.9"/>` : ""}
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [pulseSize, pulseSize],
    iconAnchor: [pulseSize / 2, pulseSize / 2],
    popupAnchor: [0, -(pulseSize / 2 + 4)],
  });
}

export default function IssueMarker({ issue, onClick }: IssueMarkerProps) {
  const icon = createMarkerIcon(issue.category, issue.severity);
  const catIcon = CATEGORY_ICONS[issue.category] ?? "📋";
  const catColor = CATEGORY_COLORS[issue.category] ?? "#6b7280";

  const severityLabel = ["", "Minor", "Low", "Moderate", "High", "Critical"][issue.severity] ?? "Unknown";
  const severityColor = issue.severity >= 4 ? "#ef4444" : issue.severity >= 3 ? "#f59e0b" : "#22c55e";

  const truncatedTitle = issue.post_title.length > 80
    ? issue.post_title.slice(0, 77) + "..."
    : issue.post_title;

  return (
    <Marker
      position={[issue.lat, issue.lon]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(issue),
      }}
    >
      <Popup maxWidth={280} minWidth={240}>
        <div style={{ fontFamily: "Inter, sans-serif", padding: "2px 0" }}>
          {/* Category badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px" }}>{catIcon}</span>
            <span style={{
              fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "2px 6px", borderRadius: "4px",
              background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`,
            }}>
              {issue.category.split("/")[0]}
            </span>
            {issue.area && (
              <span style={{ fontSize: "9px", color: "#9ca3af", marginLeft: "auto" }}>
                📍 {issue.area}
              </span>
            )}
          </div>

          {/* Title */}
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#f3f4f6", lineHeight: 1.4, margin: "0 0 8px 0" }}>
            {truncatedTitle}
          </p>

          {/* Severity bar */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "9px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Severity</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: severityColor }}>{severityLabel} ({issue.severity}/5)</span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", background: "#374151", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(issue.severity / 5) * 100}%`, background: severityColor, borderRadius: "2px", transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Description snippet */}
          {issue.description_text && (
            <p style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1.5, margin: "0 0 10px 0" }}>
              {issue.description_text.slice(0, 100)}...
            </p>
          )}

          {/* Click to expand */}
          <div style={{
            fontSize: "10px", color: "#4ade80", textAlign: "center",
            padding: "6px", borderRadius: "6px", border: "1px solid #4ade8033",
            background: "#4ade8011", cursor: "pointer", fontWeight: 600,
          }}>
            Click pin for full details →
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
