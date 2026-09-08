"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  bgColor?: string;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  color = "text-blue-600",
  bgColor = "bg-blue-50",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-heading">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
