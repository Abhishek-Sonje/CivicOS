import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicPulse Pune — Live Civic Intelligence Platform",
  description: "AI-powered real-time dashboard tracking civic infrastructure issues across Pune. Potholes, garbage, waterlogging and streetlight failures — monitored continuously by self-healing scrapers.",
  keywords: ["Pune civic issues", "pothole map", "garbage complaints", "waterlogging Pune", "PMC complaints"],
  openGraph: {
    title: "CivicPulse Pune — Live Civic Intelligence",
    description: "Real-time map of civic infrastructure issues across Pune, powered by self-healing web scrapers and AI classification.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "oklch(11% 0.01 265)" }}>
        {children}
      </body>
    </html>
  );
}
