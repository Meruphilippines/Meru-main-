"use client";

import React, { useEffect, useState } from "react";
import { Image, Video, FileText, Clock, Upload, Edit, ClipboardList } from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface DashboardStats {
  photos: number;
  videos: number;
  totalPages: number;
  totalInquiries?: number;
  newInquiries?: number;
  totalRegistrations?: number;
  pendingRegistrations?: number;
  lastUpdated: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Loading dashboard..." />;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Welcome back. Here&apos;s an overview of your website content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard icon={ClipboardList} label="Registrations" value={`${stats?.totalRegistrations ?? 0} (${stats?.pendingRegistrations ?? 0} new)`} color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatsCard icon={FileText} label="Inquiries" value={`${stats?.totalInquiries ?? 0} (${stats?.newInquiries ?? 0} new)`} color="text-sky-600" bgColor="bg-sky-50" />
        <StatsCard icon={Image} label="Total Photos" value={stats?.photos ?? 0} color="text-blue-600" bgColor="bg-blue-50" />
        <StatsCard icon={Video} label="Total Videos" value={stats?.videos ?? 0} color="text-purple-600" bgColor="bg-purple-50" />
        <StatsCard icon={FileText} label="Total Pages" value={stats?.totalPages ?? 0} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatsCard
          icon={Clock}
          label="Last Updated"
          value={stats?.lastUpdated ? formatDate(stats.lastUpdated).split(",")[0] : "N/A"}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/registrations"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Program Registrations</p>
              <p className="text-xs text-slate-400">View and review applicant submissions</p>
            </div>
          </Link>

          <Link
            href="/admin/photos"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Photos & Placements</p>
              <p className="text-xs text-slate-400">Assign photos to History Journal & pages</p>
            </div>
          </Link>

          <Link
            href="/admin/videos"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all group"
          >
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Videos & Testimonials</p>
              <p className="text-xs text-slate-400">Manage video placements and embeds</p>
            </div>
          </Link>

          <Link
            href="/admin/inbox"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-100 transition-all group"
          >
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Inquiry Inbox</p>
              <p className="text-xs text-slate-400">View and respond to contact messages</p>
            </div>
          </Link>

          <Link
            href="/admin/pages"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Edit className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Edit Pages</p>
              <p className="text-xs text-slate-400">Manage website content</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Last Updated */}
      {stats?.lastUpdated && (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-700">Last content update</p>
              <p className="text-xs text-slate-400">{formatDate(stats.lastUpdated)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
