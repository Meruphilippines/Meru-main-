"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Calendar,
  ExternalLink,
  Tag,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import SlotMediaUpload from "@/components/admin/SlotMediaUpload";

interface HistorySlotItem {
  id: string;
  title: string;
  year: string;
  tag: string;
  caption: string | null;
  photoPath: string | null;
  videoUrl: string | null;
  gradient: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: "",
  year: "",
  tag: "Event",
  caption: "Global Expedition Journey",
  photoPath: "",
  videoUrl: "",
  gradient: "from-blue-400 to-indigo-500",
};

const tagOptions = [
  "Event",
  "Academic",
  "Expansion",
  "Corporate",
  "Summit",
  "Field",
  "Milestone",
  "Partnership",
];

const gradientOptions = [
  { label: "Blue to Indigo", value: "from-blue-400 to-indigo-500" },
  { label: "Purple to Pink", value: "from-purple-400 to-pink-500" },
  { label: "Emerald to Teal", value: "from-emerald-400 to-teal-500" },
  { label: "Amber to Orange", value: "from-amber-400 to-orange-500" },
  { label: "Sky to Blue", value: "from-sky-400 to-blue-600" },
  { label: "Rose to Purple", value: "from-rose-400 to-purple-600" },
];

export default function AdminHistoryPage() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<HistorySlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/admin/history");
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error("Error fetching history slots:", err);
      showToast("error", "Failed to load history slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: HistorySlotItem) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      year: item.year,
      tag: item.tag || "Event",
      caption: item.caption || "Global Expedition Journey",
      photoPath: item.photoPath || "",
      videoUrl: item.videoUrl || "",
      gradient: item.gradient || "from-blue-400 to-indigo-500",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.year.trim()) {
      showToast("error", "Title and Year are required");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/admin/history/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("success", "History slot updated successfully!");
          fetchSlots();
          setShowForm(false);
        } else {
          showToast("error", "Failed to update slot");
        }
      } else {
        const res = await fetch("/api/admin/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("success", "History slot added successfully!");
          fetchSlots();
          setShowForm(false);
        } else {
          showToast("error", "Failed to add slot");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/history/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("success", "History slot deleted");
        setSlots((prev) => prev.filter((s) => s.id !== deleteId));
      } else {
        showToast("error", "Failed to delete slot");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "Failed to delete slot");
    } finally {
      setDeleteId(null);
    }
  };

  const moveSlot = async (id: string, direction: "up" | "down") => {
    const idx = slots.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slots.length) return;

    const reordered = [...slots];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];

    const updated = reordered.map((item, i) => ({ ...item, order: i + 1 }));
    setSlots(updated);

    try {
      await Promise.all([
        fetch(`/api/admin/history/${updated[idx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updated[idx].order }),
        }),
        fetch(`/api/admin/history/${updated[targetIdx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updated[targetIdx].order }),
        }),
      ]);
    } catch (err) {
      console.error("Failed to persist slot order:", err);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading history slots..." />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
              History Archival Slots
            </h1>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
              {slots.length} Slots
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Upload photos and videos directly to archival history cards displayed on the public timeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/history"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            View Live /history
          </a>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add History Slot
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
                {editId ? "Edit History Slot" : "Add New History Slot"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Slot Event Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. First London Forum"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Year *</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="e.g. 2019"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tag & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Category Tag</label>
                  <select
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {tagOptions.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Caption / Subtitle</label>
                  <input
                    type="text"
                    value={form.caption}
                    onChange={(e) => setForm({ ...form, caption: e.target.value })}
                    placeholder="Global Expedition Journey"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Gradient Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Card Gradient Theme (Fallback when no photo)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {gradientOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, gradient: opt.value })}
                      className={`h-10 rounded-xl bg-gradient-to-br ${opt.value} border-2 transition-all cursor-pointer ${
                        form.gradient === opt.value
                          ? "border-slate-900 scale-105 shadow-md"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              {/* Slot Photo Upload */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <SlotMediaUpload
                  value={form.photoPath}
                  onChange={(url) => setForm({ ...form, photoPath: url })}
                  mediaType="image"
                  label="Slot Photo"
                  helpText="Upload a high-res photo for this archival slot (JPG, PNG, WebP)"
                  placement="history"
                />
              </div>

              {/* Slot Video Upload (Optional) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <SlotMediaUpload
                  value={form.videoUrl}
                  onChange={(url) => setForm({ ...form, videoUrl: url })}
                  mediaType="video"
                  label="Slot Video (Optional)"
                  helpText="Upload MP4/WebM video or paste direct link / YouTube URL for this event"
                  placement="history"
                />
              </div>
            </div>

            {/* Modal Actions */}
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
                {editId ? "Update Slot" : "Create Slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      {slots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot, idx) => (
            <div
              key={slot.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Media Preview Area */}
              <div
                className={`h-48 w-full relative overflow-hidden flex items-center justify-center ${
                  slot.photoPath
                    ? "bg-slate-900"
                    : `bg-gradient-to-br ${slot.gradient}`
                }`}
              >
                {slot.photoPath ? (
                  <img
                    src={slot.photoPath}
                    alt={slot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/80 p-4 text-center">
                    <ImageIcon className="h-8 w-8 mb-1.5 opacity-60" />
                    <span className="text-xs font-semibold">No photo uploaded</span>
                    <span className="text-[10px] text-white/60 mt-0.5">Click Edit to add photo</span>
                  </div>
                )}

                {/* Tag Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {slot.tag}
                </div>

                {/* Video Indicator */}
                {slot.videoUrl && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1">
                    <Film className="h-3 w-3" />
                    Has Video
                  </div>
                )}

                {/* Year Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-extrabold text-slate-900 shadow-sm">
                  {slot.year}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {slot.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {slot.caption || "Global Expedition Journey"}
                  </p>
                </div>

                {/* Card Actions & Reorder */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSlot(slot.id, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlot(slot.id, "down")}
                      disabled={idx === slots.length - 1}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(slot)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit & Media
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(slot.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-600">No history slots found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &ldquo;Add History Slot&rdquo; to create your first archival entry.
          </p>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete History Slot"
        message="Are you sure you want to delete this history slot? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
