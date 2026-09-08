"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  GraduationCap,
  ExternalLink,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import SlotMediaUpload from "@/components/admin/SlotMediaUpload";

interface Program {
  id: string;
  name: string;
  description: string;
  date: string;
  featuredImagePath: string;
  videoUrl?: string;
  category?: string;
  tag?: string;
  createdAt: string;
}

const emptyForm = {
  name: "",
  description: "",
  date: "",
  featuredImagePath: "",
  videoUrl: "",
  category: "academic",
  tag: "Academic Program",
};

export default function AdminProgramsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = () => {
    fetch("/api/admin/programs")
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

  const openEdit = (item: Program) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      date: item.date,
      featuredImagePath: item.featuredImagePath || "",
      videoUrl: item.videoUrl || "",
      category: item.category || "academic",
      tag: item.tag || "Academic Program",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      showToast("error", "Program name is required");
      return;
    }
    setSaving(true);

    try {
      if (editId) {
        const res = await fetch(`/api/admin/programs/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("success", "Program updated!");
          fetchItems();
          setShowForm(false);
        } else {
          showToast("error", "Failed to update program");
        }
      } else {
        const res = await fetch("/api/admin/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("success", "Program added!");
          fetchItems();
          setShowForm(false);
        } else {
          showToast("error", "Failed to add program");
        }
      }
    } catch {
      showToast("error", "Failed to save program");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/programs/${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("success", "Program deleted");
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
    } else {
      showToast("error", "Failed to delete");
    }
    setDeleteId(null);
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading programs..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Programs & Seminars
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Add and manage training programs, event details, photos, and video previews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/programs"
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
            <Plus className="h-3.5 w-3.5" /> Add Program
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
                {editId ? "Edit Program" : "Add Program"}
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
                <label className="text-xs font-bold text-slate-600">Program Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Global Exchange Seminar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Category Tag</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. Academic Exchange"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Event Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed description of the program and objectives..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Featured Photo Slot */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <SlotMediaUpload
                  value={form.featuredImagePath}
                  onChange={(url) => setForm({ ...form, featuredImagePath: url })}
                  mediaType="image"
                  label="Program Featured Photo"
                  helpText="Upload cover image for this program card (JPG, PNG, WebP)"
                  placement="programs"
                />
              </div>

              {/* Program Video Slot */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <SlotMediaUpload
                  value={form.videoUrl}
                  onChange={(url) => setForm({ ...form, videoUrl: url })}
                  mediaType="video"
                  label="Program Video Preview (Optional)"
                  helpText="Upload MP4/WebM promotional clip or paste YouTube / Vimeo link"
                  placement="programs"
                />
              </div>
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
                {editId ? "Update Program" : "Add Program"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Programs Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              <div className="h-44 relative bg-slate-900 overflow-hidden flex items-center justify-center">
                {item.featuredImagePath ? (
                  <img
                    src={item.featuredImagePath}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-blue-300" />
                  </div>
                )}

                {item.videoUrl && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                    <Film className="h-3 w-3" />
                    Video Attached
                  </div>
                )}

                {item.tag && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.tag}
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  {item.date && (
                    <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Edit className="h-3 w-3" /> Edit & Media
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete program"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No programs yet. Add your first program.</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Program"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
