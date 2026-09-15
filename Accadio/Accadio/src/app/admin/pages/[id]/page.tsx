"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  RotateCcw,
  FileCheck,
  Clock,
  Type,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { DEFAULT_PAGE_CONTENTS } from "@/lib/defaultPageContents";
import { notifyLiveUpdate } from "@/lib/liveSync";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  lastUpdated: string;
}

export default function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((data) => {
        // Fallback to default rich content if empty
        const effectiveContent =
          data.content && data.content.trim()
            ? data.content
            : DEFAULT_PAGE_CONTENTS[data.slug] || "";

        setPage({ ...data, content: effectiveContent });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async (status?: "draft" | "published") => {
    if (!page) return;
    setSaving(true);
    try {
      const body = { ...page };
      if (status) body.status = status;
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setPage(updated);
        showToast(
          "success",
          status === "published" ? "Page published live!" : "Draft saved successfully!"
        );
        notifyLiveUpdate();
      } else {
        showToast("error", "Failed to save page");
      }
    } catch {
      showToast("error", "Network error while saving");
    }
    setSaving(false);
  };

  const handleResetToDefault = () => {
    if (!page) return;
    const defaultText = DEFAULT_PAGE_CONTENTS[page.slug];
    if (defaultText) {
      setPage({ ...page, content: defaultText });
      showToast("info", "Populated standard page template");
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading page editor..." />;
  if (!page) return <p className="text-sm text-red-500">Page not found.</p>;

  // Metrics
  const plainText = page.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const publicHref = page.slug === "home" ? "/" : `/${page.slug}`;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/pages")}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Back to Pages"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
                {page.title}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  page.status === "published"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {page.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mt-0.5">
              <span>Path: {publicHref}</span>
              <span>•</span>
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> Live Page
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
            title="Restore standard rich template for this page"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset to Template</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Hide Preview" : "Live Split Preview"}
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors disabled:bg-slate-300 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:bg-slate-300 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {saving ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Publish Changes
          </button>
        </div>
      </div>

      {/* Contextual Card for Pages with Dynamic Slots */}
      {page.slug === "history" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              History Archival Slots with Photos & Videos
            </h4>
            <p className="text-xs text-blue-700 mt-0.5">
              The /history page displays 6 dedicated historical cards. You can upload photos and videos specifically to each event slot.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/history")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            Manage History Slots & Media &rarr;
          </button>
        </div>
      )}

      {page.slug === "testimonials" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              Featured Video Reviews & Reviewer Photo Slots
            </h4>
            <p className="text-xs text-purple-700 mt-0.5">
              The /testimonials page renders video feedback cards and reviewer portraits. You can upload or link videos and thumbnails directly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/testimonials")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            Manage Testimonials & Videos &rarr;
          </button>
        </div>
      )}

      {page.slug === "programs" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Programs Catalog Slots & Media
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              The /programs page displays course cards with dates, descriptions, featured cover photos, and optional video trailers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/programs")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            Manage Programs & Media &rarr;
          </button>
        </div>
      )}

      {/* Editor Content Stats Bar */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60">
        <span className="flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-blue-500" />
          {wordCount} words ({plainText.length} characters)
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          ~{readingTimeMinutes} min read
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
          Last updated:{" "}
          {new Date(page.lastUpdated).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Main Editor + Split Preview */}
      <div
        className={`grid gap-6 ${
          showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        <div>
          <RichTextEditor
            content={page.content}
            onChange={(html) => setPage({ ...page, content: html })}
            placeholder="Start writing or editing page content..."
          />
        </div>

        {showPreview && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-auto max-h-[700px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Preview: /{page.slug}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Rendered Output</span>
            </div>
            <div
              className="prose prose-slate max-w-none text-slate-800 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  page.content ||
                  "<p class='text-slate-400 italic'>No content written yet</p>",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
