"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  active?: boolean;
  tooltip?: string;
  href?: string;
}

export function SidebarItem({
  icon,
  active = false,
  tooltip,
  href,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = active || (href && pathname === href);
  const ButtonOrLink = href ? Link : "button";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonOrLink
            href={href || "#"}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
              isActive
                ? "bg-zinc-200/80 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12),0_2px_4px_-2px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.3)] scale-110 translate-y-[-1px]"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105 hover:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.3)] hover:translate-y-[-1px]"
            )}
          >
            {icon}
          </ButtonOrLink>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent
            side="right"
            className="bg-sidebar-accent text-sidebar-accent-foreground border-none text-xs font-medium tracking-wide"
          >
            {tooltip}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
