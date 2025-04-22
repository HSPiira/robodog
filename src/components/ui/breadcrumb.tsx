'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { settingsSections } from '@/app/(authenticated)/settings/layout';

export function Breadcrumb() {
  const pathname = usePathname();

  // Handle settings pages
  if (pathname.startsWith('/settings')) {
    const currentSection = settingsSections.find(section => section.href === pathname);

    if (!currentSection) {
      return (
        <div className="flex items-center text-xs">
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
          >
            Settings
          </Link>
          <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
          <span className="text-foreground font-medium flex items-center">
            Unknown Section
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-xs">
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center"
        >
          Settings
        </Link>
        <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />
        <span className="text-foreground font-medium flex items-center">
          {currentSection.title}
        </span>
      </div>
    );
  }

  return null;
}
