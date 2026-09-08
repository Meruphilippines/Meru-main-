"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Edit, Circle } from "lucide-react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface PageData {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  lastUpdated: string;
}

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => { setPages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Loading pages..." />;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
    } catch { return "N/A"; }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Pages</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your website pages with the visual editor.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/admin/pages/${page.id}`}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                page.status === "published"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}>
                <Circle className="h-2 w-2 fill-current" />
                {page.status}
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">{page.title}</h3>
            <p className="text-xs text-slate-400 mt-1">/{page.slug}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
              <span className="text-[10px] text-slate-400 font-semibold">Updated {formatDate(page.lastUpdated)}</span>
              <Edit className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
