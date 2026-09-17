'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LayoutDashboard, MailOpen, LogOut, Plus } from 'lucide-react';
import { clearAuth } from '@/lib/auth';

interface DashboardNavProps {
  userEmail?: string;
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.replace('/auth/login');
  };

  const isNavActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 font-bold text-neutral-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 fill-neutral-950" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              Celebrato
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                isNavActive('/dashboard')
                  ? 'bg-neutral-900 text-amber-300 shadow-sm border border-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Studio Overview</span>
            </Link>
            <Link
              href="/dashboard/invitations"
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                isNavActive('/dashboard/invitations')
                  ? 'bg-neutral-900 text-amber-300 shadow-sm border border-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <MailOpen className="h-4 w-4" />
              <span>All Invitations</span>
            </Link>
          </nav>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/invitations/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Create Invitation</span>
          </Link>

          {userEmail && (
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="max-w-[180px] truncate">{userEmail}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all"
            title="Log out of your account"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
