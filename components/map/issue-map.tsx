"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Issue } from "../../lib/types/issue";
import IssueMarker from "./issue-marker";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

if (typeof window !== "undefined") {
  require("leaflet.heat");
}

interface IssueMapProps {
  issues: Issue[];
  defaultCenter: [number, number];
  defaultZoom: number;
  mapMode: "pin" | "heat";
  onIssueClick?: (issue: Issue) => void;
}

function MapBoundsController({ geocodedIssues }: { geocodedIssues: (Issue & { lat: number; lon: number })[] }) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && geocodedIssues.length > 0) {
      const bounds = L.latLngBounds(geocodedIssues.map((i) => [i.lat, i.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
      setInitialized(true);
    }
  }, [geocodedIssues, map, initialized]);

  return null;
}

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    let heatLayer: any = null;

    map.whenReady(() => {
      if (!map.getPane("overlayPane")) return;
      heatLayer = (L as any).heatLayer(points, {
        radius: 32,
        blur: 22,
        maxZoom: 16,
        gradient: {
          0.2: "#3b82f6",
          0.5: "#f59e0b",
          0.8: "#ef4444",
          1.0: "#dc2626",
        },
      });
      heatLayer.addTo(map);
    });

    return () => {
      if (heatLayer && map) {
        try { map.removeLayer(heatLayer); } catch {}
      }
    };
  }, [map, points]);

  return null;
}

export default function IssueMap({ issues, defaultCenter, defaultZoom, mapMode, onIssueClick }: IssueMapProps) {
  const geocodedIssues = issues.filter(
    (i) => i.lat !== null && i.lon !== null
  ) as (Issue & { lat: number; lon: number })[];

  const heatPoints: [number, number, number][] = geocodedIssues.map((i) => [
    i.lat, i.lon, i.severity / 5,
  ]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: "500px" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* Dark CartoDB tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {mapMode === "pin"
          ? geocodedIssues.map((issue) => (
              <IssueMarker key={issue.id} issue={issue} onClick={onIssueClick} />
            ))
          : <HeatmapLayer points={heatPoints} />
        }

        <MapBoundsController geocodedIssues={geocodedIssues} />
      </MapContainer>
    </div>
  );
}
