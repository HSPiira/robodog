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
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200",
              isActive
                ? "bg-[#F5EBE1] text-black"
                : "text-[#B4A69B] hover:bg-[#F5EBE1] hover:text-black"
            )}
          >
            {icon}
          </ButtonOrLink>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent
            side="right"
            className="bg-black text-white text-xs font-medium tracking-wide"
          >
            {tooltip}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
