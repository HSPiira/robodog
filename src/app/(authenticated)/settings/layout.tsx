'use client';

import { Settings, Users, Shield, Bell, Database, Car, Building2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const settingsSections = [
  {
    title: 'System Settings',
    description: 'Manage your basic preferences and account settings',
    icon: Settings,
    href: '/settings',
  },
  {
    title: 'Data Lists',
    description: 'Manage system enums and configurations',
    icon: Database,
    href: '/settings/enums',
  },
  {
    title: 'Vehicle Configuration',
    description: 'Manage vehicle types, body types, and categories',
    icon: Car,
    href: '/settings/vehicles',
  },
  {
    title: 'Insurers',
    description: 'Manage insurance companies and their details',
    icon: Building2,
    href: '/settings/insurers',
  },
  {
    title: 'Users',
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
    <div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-48 space-y-0.5">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isActive = section.href === pathname;

            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
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
