"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Activity,
  RefreshCw,
  Box,
  Link2,
  File,
  Bell,
  Settings,
  Sticker,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";

interface SidebarProps {
  selectedTab: string;
}

export function Sidebar({ selectedTab }: SidebarProps) {
  return (
    <div className="w-16 bg-sidebar-background fixed left-0 top-0 bottom-0 flex flex-col items-center py-4 z-30">
      <Link href="/reported" className="flex items-center justify-center mb-6">
        <Image src="/robodog-logo.svg" alt="Robodog" width={32} height={32} />
      </Link>
      <div className="flex flex-col gap-1 flex-1">
        <SidebarItem
          icon={<Home size={20} />}
          active={selectedTab === "home"}
          tooltip="Home"
          href="/home"
        />
        <SidebarItem
          icon={<Sticker size={20} />}
          tooltip="Sticker"
          active={selectedTab === "sticker"}
          href="/sticker"
        />
        <SidebarItem
          icon={<RefreshCw size={20} />}
          tooltip="History"
          active={selectedTab === "history"}
          href="/history"
        />
        <SidebarItem
          icon={<Box size={20} />}
          tooltip="Assets"
          active={selectedTab === "assets"}
          href="/assets"
        />
        <SidebarItem
          icon={<Link2 size={20} />}
          tooltip="Connections"
          active={selectedTab === "connections"}
          href="/connections"
        />
        <SidebarItem
          icon={<File size={20} />}
          tooltip="Documents"
          active={selectedTab === "documents"}
          href="/documents"
        />
        <SidebarItem
          icon={<Bell size={20} />}
          tooltip="Notifications"
          active={selectedTab === "notifications"}
          href="/notifications"
        />
      </div>
      <SidebarItem
        icon={<Settings size={20} />}
        tooltip="Settings"
        active={selectedTab === "settings"}
        href="/settings"
      />
    </div>
  );
}
