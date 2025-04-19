"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar/sidebar";
import { Header } from "./header/header";

export default function Robodog() {
  const [selectedTab, setSelectedTab] = useState("reported");
  const [selectedStop, setSelectedStop] = useState("S141");
  const [viewMode, setViewMode] = useState("2D");

  return (
    <div className="flex h-screen bg-[#F5EBE1]">
      <Sidebar selectedTab={selectedTab} />

      <div className="flex-1 flex flex-col min-w-0 pl-16">
        <Header />

        <div className="flex-1 p-4 min-w-0 mt-14">
          {/* Content goes here */}
        </div>
      </div>
    </div>
  );
}
