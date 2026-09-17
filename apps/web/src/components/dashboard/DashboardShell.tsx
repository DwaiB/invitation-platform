import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DashboardNav } from './DashboardNav';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardShellProps {
  userEmail?: string;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({
  userEmail,
  breadcrumbs,
  title,
  subtitle,
  action,
  children,
}: DashboardShellProps) {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-500/10 to-yellow-300/5 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-rose-500/5 to-amber-400/5 blur-[140px]" />
      </div>

      {/* Top Navigation */}
      <DashboardNav userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-amber-300 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-neutral-200 font-medium' : ''}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Page Header (if title is provided) */}
        {title && (
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-neutral-400 max-w-2xl">{subtitle}</p>
              )}
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
          </div>
        )}

        {/* Page Body */}
        {children}
      </main>
    </div>
  );
}
