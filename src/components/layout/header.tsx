"use client";

import { usePathname } from "next/navigation";
import {
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  BookMarked,
  Building2,
  Star,
  FileCode,
  Users,
  HeartHandshake,
  Download,
  HelpCircle,
  Globe,
  Book,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
          robodog
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-[10px] font-normal text-muted-foreground tracking-wider">
          {formattedPageName}
        </span>
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
          <MessageSquare size={18} className="text-pink-400" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
        >
          <Bell size={18} className="text-muted-foreground" />
        </Button>
        <ThemeToggle />
        <div className="flex items-center gap-2 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0 rounded-full">
                <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center gap-2 p-2">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <span className="text-base font-medium text-muted-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user?.role?.toLowerCase() || "User"}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Your profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookMarked className="mr-2 h-4 w-4" />
                <span>Your projects</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                <span>Your favorites</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileCode className="mr-2 h-4 w-4" />
                <span>Your templates</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" />
                <span>Organization settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Team management</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HeartHandshake className="mr-2 h-4 w-4" />
                <span>Billing & plans</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & support</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Globe className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Community</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
