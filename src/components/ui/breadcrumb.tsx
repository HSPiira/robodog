'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { settingsSections } from '@/app/(authenticated)/settings/layout';
import { cn } from '@/lib/utils';

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  isLastItem?: boolean;
}

interface BreadcrumbLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function BreadcrumbItem({ children, className, isLastItem = false, ...props }: BreadcrumbItemProps) {
  return (
    <li className={cn("flex items-center", className)} {...props}>
      {children}
      {!isLastItem && <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground flex-shrink-0" />}
    </li>
  );
}

export function BreadcrumbLink({ href, children, className }: BreadcrumbLinkProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "text-muted-foreground hover:text-muted-foreground/80 transition-colors flex items-center",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        "text-muted-foreground cursor-default flex items-center",
        className
      )}
    >
      {children}
    </span>
  );
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  // Convert children to array to find last item
  const childrenArray = React.Children.toArray(children);

  // Clone each child and add isLastItem prop
  const childrenWithProps = childrenArray.map((child, index) => {
    if (React.isValidElement<BreadcrumbItemProps>(child)) {
      return React.cloneElement(child, {
        ...child.props,
        isLastItem: index === childrenArray.length - 1
      });
    }
    return child;
  });

  return (
    <nav aria-label="breadcrumb" className={cn("flex", className)} {...props}>
      <ol className="flex items-center">
        {childrenWithProps}
      </ol>
    </nav>
  );
}

// Handle settings pages
export function SettingsBreadcrumb() {
  const pathname = usePathname();

  // Handle settings pages
  if (pathname.startsWith('/settings')) {
    const currentSection = settingsSections.find(section => section.href === pathname);

    if (!currentSection) {
      return (
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Unknown Section</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      );
    }

    return (
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{currentSection.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    );
  }

  return null;
}
