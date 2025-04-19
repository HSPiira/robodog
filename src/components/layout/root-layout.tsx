"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/header/header";
import { ThemeProvider } from "@/components/theme-provider";

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Convert pathname to selectedTab
    const getSelectedTab = (path: string) => {
        // Special case for root path - treat it as "reported"
        if (path === "/") return "reported";
        // Remove leading slash and return first segment
        return path.substring(1).split("/")[0];
    };

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen">
                <Sidebar selectedTab={getSelectedTab(pathname)} />
                <div className="flex-1 pl-16">
                    <Header />
                    <main className="flex-1 p-4 min-w-0 mt-14">
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
} 