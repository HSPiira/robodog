'use client';

import { Settings, Users, Shield, Bell, Database } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const settingsSections = [
  {
    title: 'General Settings',
    description: 'Manage your basic preferences and account settings',
    icon: Settings,
    href: '/settings',
  },
  {
    title: 'Enum Management',
    description: 'Manage system enums and configurations',
    icon: Database,
    href: '/settings/enums',
  },
  {
    title: 'User Management',
    description: 'Manage user roles and permissions',
    icon: Users,
    href: '/settings/users',
  },
  {
    title: 'Privacy & Security',
    description: 'Configure your privacy and security settings',
    icon: Shield,
    href: '/settings/privacy',
  },
  {
    title: 'Notifications',
    description: 'Customize your notification preferences',
    icon: Bell,
    href: '/settings/notifications',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-56 space-y-1">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isActive = section.href === pathname;

            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{section.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
