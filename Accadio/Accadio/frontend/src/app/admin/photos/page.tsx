"use client";

import React, { useEffect, useState } from "react";
import {
  Trash2,
  Maximize2,
  X,
  Sliders,
  Check,
  Tag,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MediaUpload from "@/components/admin/MediaUpload";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  title?: string | null;
  caption?: string | null;
  placement?: string | null;
  tag?: string | null;
  year?: string | null;
  type: "image" | "video";
  size: number;
  path: string;
  uploadedAt: string;
}

const PLACEMENT_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "General Library", color: "bg-slate-100 text-slate-700 border-slate-200" },
  history: { label: "History Journal (/history)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  programs: { label: "Programs (/programs)", color: "bg-purple-50 text-purple-700 border-purple-200" },
  homepage: { label: "Homepage Spotlight", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function AdminPhotosPage() {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<MediaItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editPlacement, setEditPlacement] = useState("general");
  const [editTag, setEditTag] = useState("Event");
  const [editYear, setEditYear] = useState(new Date().getFullYear().toString());
  const [editCaption, setEditCaption] = useState("");

  const fetchPhotos = () => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data: MediaItem[]) => {
        setPhotos(data.filter((m) => m.type === "image"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    if (res.ok) {
      showToast("success", `${files.length} photo(s) uploaded successfully!`);
      fetchPhotos();
    } else {
      showToast("error", "Failed to upload photos");
      throw new Error("Upload failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/media/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("success", "Photo deleted");
      setPhotos((prev) => prev.filter((p) => p.id !== deleteId));
    } else {
      showToast("error", "Failed to delete photo");
    }
    setDeleteId(null);
  };

  const openEditModal = (photo: MediaItem) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title || photo.originalName.replace(/\.[^/.]+$/, ""));
    setEditPlacement(photo.placement || "general");
    setEditTag(photo.tag || "Event");
    setEditYear(photo.year || new Date().getFullYear().toString());
    setEditCaption(photo.caption || "");
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/media/${editingPhoto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          placement: editPlacement,
          tag: editTag,
          year: editYear,
          caption: editCaption,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPhotos((prev) =>
          prev.map((p) => (p.id === editingPhoto.id ? { ...p, ...updated } : p))
        );
        showToast("success", "Placement & photo metadata saved!");
        setEditingPhoto(null);
      } else {
        showToast("error", "Failed to update photo placement");
      }
    } catch {
      showToast("error", "Error updating photo details");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const filteredPhotos = photos.filter((p) => {
    if (activeFilter === "all") return true;
    return (p.placement || "general") === activeFilter;
  });

  if (loading) return <LoadingSpinner size="lg" label="Loading photos..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Photos & Placements</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Upload images and specify where they should be displayed on the public website (e.g., History Photo Journal, Programs, Homepage).
          </p>
        </div>
      </div>

      <MediaUpload
        accept="image/*"
        onUpload={handleUpload}
        label="Drag & drop images here, or click to browse"
      />

      {/* Placement Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> Filter by Placement:
        </span>
        {[
          { key: "all", label: `All Photos (${photos.length})` },
          { key: "history", label: `History Journal (${photos.filter((p) => p.placement === "history").length})` },
          { key: "programs", label: `Programs (${photos.filter((p) => p.placement === "programs").length})` },
          { key: "homepage", label: `Homepage (${photos.filter((p) => p.placement === "homepage").length})` },
          { key: "general", label: `General (${photos.filter((p) => !p.placement || p.placement === "general").length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === f.key
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredPhotos.map((photo) => {
            const placementConfig =
              PLACEMENT_LABELS[photo.placement || "general"] || PLACEMENT_LABELS.general;

            return (
              <div
                key={photo.id}
                className="group rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Container */}
                <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                  <img
                    src={photo.path}
                    alt={photo.title || photo.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Placement Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-xs ${placementConfig.color}`}
                    >
                      {placementConfig.label.split("(")[0].trim()}
                    </span>
                  </div>

                  {/* Year/Tag badge if History */}
                  {photo.placement === "history" && (
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      {photo.tag && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                          {photo.tag}
                        </span>
                      )}
                      {photo.year && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/90 text-slate-800 shadow-xs">
                          {photo.year}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewUrl(photo.path)}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 transition-colors shadow-xs"
                      title="Preview Full Size"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(photo)}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-blue-600 transition-colors shadow-xs font-bold"
                      title="Set Placement & Info"
                    >
                      <Sliders className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(photo.id)}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-rose-600 transition-colors shadow-xs"
                      title="Delete Photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Card Body */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {photo.title || photo.originalName}
                    </h4>
                    {photo.caption && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                        {photo.caption}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-semibold">
                    <span>{formatSize(photo.size)}</span>
                    <button
                      onClick={() => openEditModal(photo)}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <Sliders className="h-3 w-3" /> Change Placement
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <p className="text-sm font-medium">No photos found in this placement category.</p>
        </div>
      )}

      {/* Edit Placement & Details Modal */}
      {editingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-blue-600" />
                <h3 className="font-heading text-lg font-extrabold text-slate-900">
                  Photo Placement & Details
                </h3>
              </div>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
              <img
                src={editingPhoto.path}
                alt="thumb"
                className="w-16 h-16 object-cover rounded-xl border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {editingPhoto.originalName}
                </p>
                <p className="text-[10px] text-slate-400">{formatSize(editingPhoto.size)}</p>
              </div>
            </div>

            {/* Placement Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Website Display Location (Placement)
              </label>
              <select
                value={editPlacement}
                onChange={(e) => setEditPlacement(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="general">General Media Library</option>
                <option value="history">Historical Photo Journal (/history)</option>
                <option value="programs">Programs Catalog (/programs)</option>
                <option value="homepage">Homepage Spotlight Highlights</option>
              </select>
              <p className="text-[10px] text-slate-400 font-medium">
                Selecting &quot;Historical Photo Journal&quot; displays this photo in the timeline gallery on /history.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Title / Caption Label</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. First London Forum, Tokyo Seminars"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Conditional fields for History Journal */}
            {editPlacement === "history" && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-blue-900 block uppercase">
                    Year
                  </label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full bg-white border border-blue-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-blue-900 block uppercase">
                    Tag / Category
                  </label>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl py-1.5 px-2 text-xs font-bold text-slate-800"
                  >
                    <option value="Event">Event</option>
                    <option value="Academic">Academic</option>
                    <option value="Expansion">Expansion</option>
                    <option value="Summit">Summit</option>
                    <option value="Field">Field</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>
            )}

            {/* Description / Caption */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Notes / Caption</label>
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows={2}
                placeholder="Brief description or photo credit..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Check className="h-4 w-4" />
                {savingEdit ? "Saving..." : "Save Placement"}
              </button>
              <button
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
