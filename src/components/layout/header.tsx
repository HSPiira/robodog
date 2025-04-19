"use client";

import { usePathname } from "next/navigation";
import { Search, MessageSquare, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/context/auth-context";

export function Header() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Get the current page name from the pathname
    const getPageName = (path: string) => {
        const segments = path.split("/").filter(Boolean);
        return segments[0] || "home";
    };

    const currentPage = getPageName(pathname);
    const formattedPageName =
        currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <header className="h-14 px-4 flex items-center justify-between bg-background fixed top-0 right-0 left-16 z-20 border-b">
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
                        placeholder="Search for policies, customers, vehicles..."
                        className="pl-9 h-9 text-sm font-normal bg-muted/50 border-0 w-full rounded-full placeholder:text-xs text-foreground placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full hover:bg-muted/50"
                >
                    <Bell size={18} className="text-muted-foreground" />
                </Button>
                <ThemeToggle />
                <div className="flex items-center gap-2 ml-2">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                            {user?.name?.charAt(0) || "U"}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <div>
                            <div className="text-sm font-medium tracking-wide text-foreground">
                                {user?.name || "User"}
                            </div>
                            <div className="text-xs font-normal text-muted-foreground">
                                {user?.role || "User"}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => logout()}
                            className="ml-2"
                        >
                            <ChevronDown size={16} className="text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
} 