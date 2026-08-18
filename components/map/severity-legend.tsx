import { COPY } from "../../lib/constants/copy";

export default function SeverityLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-surface p-4 rounded-panel border border-border shadow-lg max-w-xs">
      <h4 className="text-sm font-semibold text-foreground mb-2">
        {COPY.severity.low ? "Severity Levels" : "Legend"}
      </h4>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-severity-low border border-border" />
          <span className="text-xs font-medium text-foreground">
            {COPY.severity.low} (1-2)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-severity-moderate border border-border" />
          <span className="text-xs font-medium text-foreground">
            {COPY.severity.moderate} (3)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-severity-critical border border-border" />
          <span className="text-xs font-medium text-foreground">
            {COPY.severity.critical} (4-5)
          </span>
        </div>
      </div>
    </div>
  );
}
