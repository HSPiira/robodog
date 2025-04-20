import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
  asChild?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-3 w-3" />, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "nav"

    return (
      <Comp
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex items-center", className)}
        {...props}
      />
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

export interface BreadcrumbListProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "ol"

    return (
      <Comp
        ref={ref}
        className={cn("flex flex-wrap items-center gap-1 md:gap-2", className)}
        {...props}
      />
    )
  }
)
BreadcrumbList.displayName = "BreadcrumbList"

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "li"

    return (
      <Comp
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      />
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "li"

    return (
      <Comp
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("text-muted-foreground", className)}
        {...props}
      />
    )
  }
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export interface BreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const BreadcrumbEllipsis = React.forwardRef<HTMLLIElement, BreadcrumbEllipsisProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "li"

    return (
      <Comp
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("flex h-9 w-9 items-center justify-center text-muted-foreground", className)}
        {...props}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
      </Comp>
    )
  }
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"

    return (
      <Comp
        ref={ref}
        className={cn("transition-colors hover:text-foreground text-muted-foreground/90", className)}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbLink,
}
