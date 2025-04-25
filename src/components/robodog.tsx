"use client";

import { useState } from "react";
import { Sidebar } from "./layout/sidebar";
import { Header } from "./layout/header";
import { ThemeProvider } from "./theme-provider";

export function RoboDog() {
  const [selectedTab, setSelectedTab] = useState("reported");
  const [selectedStop, setSelectedStop] = useState("S141");
  const [viewMode, setViewMode] = useState("2D");

  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background">
            {/* Main content */}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
