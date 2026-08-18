"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Issue } from "../../lib/types/issue";
import IssueMarker from "./issue-marker";
import SeverityLegend from "./severity-legend";
import L from "leaflet";

// Leaflet default CSS and compatibility fixes
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface IssueMapProps {
  issues: Issue[];
  defaultCenter: [number, number];
  defaultZoom: number;
}

/**
 * Controller component that dynamically adjusts map viewport bounds to fit all active markers.
 */
function MapBoundsController({
  geocodedIssues,
}: {
  geocodedIssues: (Issue & { lat: number; lon: number })[];
}) {
  const map = useMap();

  useEffect(() => {
    if (geocodedIssues.length > 0) {
      const bounds = L.latLngBounds(
        geocodedIssues.map((issue) => [issue.lat, issue.lon])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [geocodedIssues, map]);

  return null;
}

export default function IssueMap({ issues, defaultCenter, defaultZoom }: IssueMapProps) {
  const geocodedIssues = issues.filter(
    (item) => item.lat !== null && item.lon !== null
  ) as (Issue & { lat: number; lon: number })[];

  return (
    <div className="relative w-full h-[600px] rounded-panel border border-border overflow-hidden shadow-inner bg-surface-muted">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geocodedIssues.map((issue) => (
          <IssueMarker key={issue.id} issue={issue} />
        ))}
        <MapBoundsController geocodedIssues={geocodedIssues} />
      </MapContainer>
      <SeverityLegend />
    </div>
  );
}
