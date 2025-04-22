"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  ChevronRight,
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
import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [clientName, setClientName] = useState<string>("Client Vehicles");

  // Get current section/page from pathname
  const getCurrentPage = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  };

  const currentPage = getCurrentPage();

  // Get clientId from search params if it exists
  const clientId = searchParams.get("clientId");

  // Fetch client name if clientId is present
  useEffect(() => {
    if (clientId && pathname.includes("/vehicles")) {
      const fetchClientName = async () => {
        try {
          const response = await fetch(`/api/clients/${clientId}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.name) {
              setClientName(data.name);
            }
          }
        } catch (error) {
          console.error("Error fetching client name:", error);
        }
      };

      fetchClientName();
    }

    // For client details page
    if (pathname.includes("/clients/") && !pathname.includes("/vehicles")) {
      const clientId = pathname.split("/").pop();
      if (clientId) {
        const fetchClientName = async () => {
          try {
            const response = await fetch(`/api/clients/${clientId}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.name) {
                setClientName(data.name);
              }
            }
          } catch (error) {
            console.error("Error fetching client name:", error);
          }
        };

        fetchClientName();
      }
    }
  }, [clientId, pathname]);

  // Determine if we're on a client's vehicles page
  const isClientVehicles = pathname.includes("/vehicles") && clientId;

  // Determine if we're on a client details page
  const isClientDetails = pathname.includes("/clients/") && pathname.split("/").length > 2;

  // Get the current page within a client context
  const getClientSubpage = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 3) return null;

    // If we're in a client's context and have a subpage
    if (segments[0] === "clients" && segments.length >= 3) {
      return segments[2].charAt(0).toUpperCase() + segments[2].slice(1);
    }
    return null;
  };

  const clientSubpage = getClientSubpage();

  return (
    <header className="h-14 px-4 flex items-center justify-between bg-background fixed top-0 right-0 left-16 z-20 border-b">
      <div className="flex items-center">
        <div className="flex items-center text-xs h-full my-auto">
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent flex items-center">
            robodog
          </span>

          <span className="text-muted-foreground mx-1 flex items-center">.</span>

          {isClientVehicles ? (
            <>
              <Link
                href="/clients"
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
              >
                Clients
              </Link>
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
              <Link
                href={`/clients/${clientId}`}
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
              >
                {clientName}
              </Link>
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-medium flex items-center">
                Vehicles
              </span>
            </>
          ) : isClientDetails && !clientSubpage ? (
            <>
              <Link
                href="/clients"
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
              >
                Clients
              </Link>
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-medium flex items-center">
                {clientName}
              </span>
            </>
          ) : isClientDetails && clientSubpage ? (
            <>
              <Link
                href="/clients"
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
              >
                Clients
              </Link>
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
              <Link
                href={`/clients/${pathname.split("/")[2]}`}
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
              >
                {clientName}
              </Link>
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-medium flex items-center">
                {clientSubpage}
              </span>
            </>
          ) : pathname.startsWith('/settings') ? (
            <Breadcrumb />
          ) : (
            <>
              <Link
                href={`/${currentPage.toLowerCase()}`}
                className="text-foreground font-medium flex items-center"
              >
                {currentPage}
              </Link>
              {pathname.includes('/import') && (
                <>
                  <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground font-medium flex items-center">
                    Import
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-[400px] mr-2">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            placeholder="Search for policies, clients, vehicles..."
            className="pl-9 h-9 text-sm font-normal bg-muted/50 border-0 w-full rounded-full placeholder:text-xs text-foreground placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
          aria-label="Messages"
        >
          <MessageSquare size={18} className="text-pink-400" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
          aria-label="Notifications"
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
