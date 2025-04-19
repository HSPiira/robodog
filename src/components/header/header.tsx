"use client";

import { Search, MessageSquare, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // Get the current page name from the pathname
  const getPageName = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    return segments[0] || "home";
  };

  const currentPage = getPageName(pathname);
  const formattedPageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  return (
    <header className="h-14 px-4 flex items-center justify-between bg-background fixed top-0 right-0 left-16 z-20">
      <h1 className="text-xl font-medium tracking-wide text-foreground flex items-center gap-1">
        <span>robodog</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm font-normal">{formattedPageName}</span>
      </h1>

      <div className="flex items-center gap-2">
        <div className="relative w-[400px] mr-2">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            placeholder="Search for customer orders, jobs, vehicles and assets"
            className="pl-9 h-9 text-sm font-normal bg-muted/50 border-0 w-full rounded-full placeholder:text-xs text-foreground placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
        >
          <MessageSquare size={18} className="text-pink-400" />
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-foreground hover:bg-foreground/90 text-background text-xs font-medium tracking-wide px-4 rounded-full"
        >
          Submit Work
        </Button>
        <ThemeToggle />
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
        >
          <MessageSquare size={18} className="text-muted-foreground" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">RR</span>
          </div>
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium tracking-wide text-foreground">
                Robert Robertson
              </div>
              <div className="text-xs font-normal text-muted-foreground">Admin</div>
            </div>
            <ChevronDown size={16} className="ml-1 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
