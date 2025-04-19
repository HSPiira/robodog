"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Users,
    FileText,
    Car,
    Settings,
    BarChart,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
    icon: React.ReactNode;
    tooltip: string;
    href: string;
}

function SidebarItem({ icon, tooltip, href }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={href}
                        className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12),0_2px_4px_-2px_rgba(0,0,0,0.07)] scale-110 translate-y-[-1px]"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 hover:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.08)] hover:translate-y-[-1px]"
                        )}
                    >
                        {icon}
                    </Link>
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    className="bg-popover text-popover-foreground border-none text-xs font-medium tracking-wide"
                >
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

const navigation = [
    { name: "Dashboard", href: "/home", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Policies", href: "/policies", icon: FileText },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "Analytics", href: "/analytics", icon: BarChart },
];

export function Sidebar() {
    return (
        <div className="w-16 bg-background fixed left-0 top-0 bottom-0 flex flex-col items-center py-4 z-30 border-r">
            <Link href="/home" className="flex items-center justify-center mb-6">
                <Image
                    src="/robodog-logo.png"
                    alt="robodog"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                    priority
                />
            </Link>
            <div className="flex flex-col gap-1 flex-1">
                {navigation.map((item) => (
                    <SidebarItem
                        key={item.name}
                        icon={<item.icon size={20} />}
                        tooltip={item.name}
                        href={item.href}
                    />
                ))}
            </div>
            <SidebarItem
                icon={<Settings size={20} />}
                tooltip="Settings"
                href="/settings"
            />
        </div>
    );
} 