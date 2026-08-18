"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import type { Issue } from "../../lib/types/issue";
import IssueMarker from "./issue-marker";
import SeverityLegend from "./severity-legend";

// Leaflet default CSS and compatibility fixes
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface IssueMapProps {
  issues: Issue[];
}

export default function IssueMap({ issues }: IssueMapProps) {
  // Center on Springfield, IL (default coordinates returned by Nominatim in ingest)
  const defaultCenter: [number, number] = [39.799, -89.64];
  
  // Calculate average coordinates of current issues to center the map nicely
  const center: [number, number] =
    issues.length > 0
      ? [
          issues.reduce((sum, item) => sum + item.lat, 0) / issues.length,
          issues.reduce((sum, item) => sum + item.lon, 0) / issues.length,
        ]
      : defaultCenter;

  const zoom = issues.length > 0 ? 11 : 4;

  return (
    <div className="relative w-full h-[600px] rounded-panel border border-border overflow-hidden shadow-inner bg-surface-muted">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map((issue) => (
          <IssueMarker key={issue.id} issue={issue} />
        ))}
      </MapContainer>
      <SeverityLegend />
    </div>
  );
}
