"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Video,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import SlotMediaUpload from "@/components/admin/SlotMediaUpload";
import { notifyLiveUpdate } from "@/lib/liveSync";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoPath: string;
  type: "written" | "video";
  videoUrl: string;
  thumbnail: string;
  duration: string;
  displayOrder: number;
  createdAt: string;
}

const emptyForm = {
  name: "",
  role: "",
  quote: "",
  photoPath: "",
  type: "written" as "written" | "video",
  videoUrl: "",
  thumbnail: "",
  duration: "",
};

export default function AdminTestimonialsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = () => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      quote: item.quote,
      photoPath: item.photoPath,
      type: item.type || "written",
      videoUrl: item.videoUrl || "",
      thumbnail: item.thumbnail || "",
      duration: item.duration || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.quote) {
      showToast("error", "Name and quote/title are required");
      return;
    }
    setSaving(true);

    try {
      if (editId) {
        const res = await fetch(`/api/admin/testimonials/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("success", "Testimonial updated!");
          fetchItems();
          setShowForm(false);
          notifyLiveUpdate();
        } else {
          showToast("error", "Failed to update testimonial");
        }
      } else {
        const res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("success", "Testimonial added!");
          fetchItems();
          setShowForm(false);
          notifyLiveUpdate();
        } else {
          showToast("error", "Failed to add testimonial");
        }
      }
    } catch {
      showToast("error", "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/testimonials/${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("success", "Testimonial deleted");
      setItems((prev) => prev.filter((t) => t.id !== deleteId));
      notifyLiveUpdate();
    } else {
      showToast("error", "Failed to delete");
    }
    setDeleteId(null);
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;

    const reordered = [...items];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];

    const updates = reordered.map((item, i) => ({ ...item, displayOrder: i }));
    setItems(updates);
    notifyLiveUpdate();

    for (const item of [updates[idx], updates[newIdx]]) {
      await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: item.displayOrder }),
      });
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading testimonials..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Testimonials & Reviews
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage written reviews and featured video feedback slots.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/testimonials"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            View Live Page
          </a>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editId ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Testimonial Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as "written" | "video" })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="written">Written review</option>
                  <option value="video">Featured video review</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {form.type === "video" ? "Speaker *" : "Name *"}
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={form.type === "video" ? "e.g. Dr. Emily Thorne" : "e.g. Sarah Jenkins"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {form.type === "video" ? "Speaker Details / Org" : "Role / Title"}
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder={form.type === "video" ? "Chief Strategy Officer, Global Ventures" : "Academic Delegate"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  {form.type === "video" ? "Video Title *" : "Quote / Review Text *"}
                </label>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder={
                    form.type === "video"
                      ? "e.g. Reshaping our Corporate ESG Policies"
                      : "Write what the participant said..."
                  }
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Type-specific media slots */}
              {form.type === "written" ? (
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <SlotMediaUpload
                    value={form.photoPath}
                    onChange={(url) => setForm({ ...form, photoPath: url })}
                    mediaType="image"
                    label="Reviewer Photo"
                    helpText="Upload author portrait or avatar (JPG, PNG, WebP)"
                    placement="testimonials"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Video Duration</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 3:42"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <SlotMediaUpload
                      value={form.videoUrl}
                      onChange={(url) => setForm({ ...form, videoUrl: url })}
                      mediaType="video"
                      label="Featured Video Slot"
                      helpText="Upload MP4/WebM video or paste direct link / YouTube URL"
                      placement="testimonials"
                    />
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <SlotMediaUpload
                      value={form.thumbnail}
                      onChange={(url) => setForm({ ...form, thumbnail: url })}
                      mediaType="image"
                      label="Video Card Thumbnail"
                      helpText="Upload video cover thumbnail photo (JPG, PNG, WebP)"
                      placement="testimonials"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:bg-slate-300 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {editId ? "Update Testimonial" : "Add Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm p-5 flex items-start gap-4 transition-all"
            >
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(item.id, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded-lg text-slate-300 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => moveItem(item.id, "down")}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded-lg text-slate-300 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {item.type === "video" ? (
                item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="h-16 w-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-20 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                )
              ) : item.photoPath ? (
                <img
                  src={item.photoPath}
                  alt={item.name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-slate-100 shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    {item.role && (
                      <p className="text-xs text-slate-500 font-medium">{item.role}</p>
                    )}
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 ${
                        item.type === "video"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.type === "video" ? `Video Review (${item.duration || "N/A"})` : "Written Review"}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                      title="Edit slot & media"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors"
                      title="Delete testimonial"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
                {item.videoUrl && (
                  <p className="text-[11px] text-indigo-600 font-mono mt-1 truncate">
                    Video: {item.videoUrl}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-sm font-medium text-slate-600">No testimonials yet.</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Testimonial"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
