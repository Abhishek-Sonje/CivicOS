"use client";

import { useState } from "react";
import { COPY } from "../../lib/constants/copy";

interface CollectorStatus {
  id: string;
  name: string;
  status: "healthy" | "failed" | "healing";
  lastRun: string;
  itemCount: number;
  errorDetail?: string;
}

interface ScraperHealthPanelProps {
  failedGeocodeCount?: number;
}

export default function ScraperHealthPanel({ failedGeocodeCount = 0 }: ScraperHealthPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Simulated status matching Bright Data collector specs for the week
  const collectors: CollectorStatus[] = [
    {
      id: "c_municipal_grievances",
      name: "Municipal Grievance Board Scraper",
      status: "healthy",
      lastRun: "2026-08-18 11:24:12",
      itemCount: 14,
    },
    {
      id: "c_regional_news_feed",
      name: "Regional News Comments Scraper",
      status: "failed",
      lastRun: "2026-08-18 12:45:00",
      itemCount: 0,
      errorDetail: "Selector for 'description_text' returned null. Parent layout changed from 'div.comment' to 'article.reply'.",
    },
  ];

  return (
    <div className="fixed bottom-0 left-4 z-[2000] font-sans">
      {/* Drawer Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface border border-border text-foreground px-4 py-2 rounded-t-panel font-semibold text-xs shadow-lg hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer"
        id="scraper-health-toggle"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-severity-critical opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-severity-critical"></span>
        </span>
        {COPY.scraperHealth.panelTitle}
        <span className="text-[10px] opacity-65 ml-1">{isOpen ? "▼ Close" : "▲ Open"}</span>
      </button>

      {/* Drawer Body */}
      {isOpen && (
        <div className="bg-surface border border-border border-b-0 rounded-tr-panel shadow-2xl p-4 w-[380px] flex flex-col gap-4 max-h-[420px] overflow-y-auto transition-transform duration-300">
          <div className="flex flex-col gap-1 border-b border-border pb-2">
            <h3 className="text-sm font-bold text-foreground">{COPY.scraperHealth.panelTitle}</h3>
            <p className="text-[10px] text-foreground/60">
              Read-only collector status. Run self-heal commands from your terminal.
            </p>
          </div>

          {failedGeocodeCount > 0 && (
            <div className="bg-severity-critical/10 border border-severity-critical/20 text-severity-critical p-3 rounded-panel text-xs font-semibold flex flex-col gap-1">
              <span>Location Pending Issues</span>
              <span className="font-normal text-foreground/80 text-[10px] leading-normal">
                {failedGeocodeCount} issue{failedGeocodeCount > 1 ? "s animate-pulse" : ""} need manual location details.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {collectors.map((collector) => {
              const isFailed = collector.status === "failed";
              const isHealthy = collector.status === "healthy";
              
              let statusLabel = COPY.scraperHealth.statusHealthy;
              let statusBg = "bg-severity-low/10";
              let statusText = "text-severity-low";

              if (isFailed) {
                statusLabel = COPY.scraperHealth.statusFailed;
                statusBg = "bg-severity-critical/10";
                statusText = "text-severity-critical";
              } else if (collector.status === "healing") {
                statusLabel = COPY.scraperHealth.statusHealing;
                statusBg = "bg-severity-moderate/10";
                statusText = "text-severity-moderate";
              }

              return (
                <div
                  key={collector.id}
                  className={`p-3 rounded-panel border flex flex-col gap-2 ${
                    isFailed ? "border-severity-critical/30 bg-severity-critical/5" : "border-border bg-surface-muted"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{collector.name}</span>
                      <code className="text-[9px] text-foreground/50 font-mono mt-0.5">{collector.id}</code>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBg} ${statusText}`}>
                      {isHealthy ? "Active" : "Failed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-foreground/75 mt-1 border-t border-border/40 pt-1.5">
                    <div>
                      <span className="opacity-60 block">Last Run:</span>
                      <span className="font-medium">{collector.lastRun}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Items Fetched:</span>
                      <span className={`font-bold ${isFailed ? "text-severity-critical" : "text-foreground"}`}>
                        {collector.itemCount}
                      </span>
                    </div>
                  </div>

                  {isFailed && (
                    <div className="flex flex-col gap-1.5 mt-1 bg-surface border border-severity-critical/20 p-2 rounded-panel text-[10px]">
                      <span className="text-severity-critical font-bold">[Error] Extraction Failed</span>
                      <p className="text-foreground/75 leading-normal">{collector.errorDetail}</p>
                      <div className="border-t border-border/45 pt-1.5 mt-1 flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-wider text-foreground/50 font-bold">
                          CLI healing command:
                        </span>
                        <code className="bg-surface-muted px-1.5 py-1 rounded text-[8px] font-mono select-all border border-border text-foreground break-all">
                          brightdata scraper heal {collector.id} "markup drifted"
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
