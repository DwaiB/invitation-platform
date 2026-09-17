import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: string;
}

export function StatCard({ label, value, icon, subtitle, trend }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 backdrop-blur-xl transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {label}
          </p>
          <p className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-500 font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/15 transition-all">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs font-medium text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
