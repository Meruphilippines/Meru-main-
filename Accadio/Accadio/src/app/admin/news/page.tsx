"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, Newspaper, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { notifyLiveUpdate } from "@/lib/liveSync";

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  desc: string;
  content: string;
  gradient: string;
  imagePath: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

const GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-sky-400 to-blue-500",
];

const CATEGORIES = [
  "Expansion",
  "Admissions",
  "Partnerships",
  "Milestone",
  "Event",
  "General",
  "Alumni",
  "Academic",
];

const emptyForm = {
  title: "",
  category: "General",
  date: new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
  desc: "",
  content: "",
  gradient: "from-blue-400 to-indigo-500",
  imagePath: "",
  isPublished: true,
};

export default function AdminNewsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = () => {
    fetch("/api/admin/news")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast("error", "Article title is required");
      return;
    }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/admin/news/${editId}` : "/api/admin/news";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("success", editId ? "Article updated!" : "Article published!");
        notifyLiveUpdate();
        setShowForm(false);
        setEditId(null);
        setForm(emptyForm);
        fetchItems();
      } else {
        const err = await res.json();
        showToast("error", err.error || "Failed to save article");
      }
    } catch {
      showToast("error", "Network error");
    }
    setSaving(false);
  };

  const handleEdit = (item: NewsArticle) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      date: item.date,
      desc: item.desc,
      content: item.content || "",
      gradient: item.gradient,
      imagePath: item.imagePath || "",
      isPublished: item.isPublished,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/news/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Article deleted");
        notifyLiveUpdate();
        fetchItems();
      } else {
        showToast("error", "Failed to delete article");
      }
    } catch {
      showToast("error", "Network error");
    }
    setDeleteId(null);
  };

  const handleTogglePublish = async (item: NewsArticle) => {
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (res.ok) {
        showToast("success", item.isPublished ? "Article hidden" : "Article published!");
        notifyLiveUpdate();
        fetchItems();
      }
    } catch {
      showToast("error", "Network error");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading news articles..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">News & Updates</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage news articles displayed on the public News page.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        )}
      </div>

      {/* Article Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-slate-800">
              {editId ? "Edit Article" : "New Article"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article headline"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Date
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. June 5, 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Summary / Description
              </label>
              <textarea
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                rows={3}
                placeholder="Short summary shown on the news listing page"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Full Content (optional)
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                placeholder="Full article body text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Color Gradient
              </label>
              <select
                value={form.gradient}
                onChange={(e) => setForm({ ...form, gradient: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {GRADIENTS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Image Path (optional)
              </label>
              <input
                type="text"
                value={form.imagePath}
                onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
                placeholder="/uploads/images/article.webp"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
              <span className="text-sm font-semibold text-slate-700">Publish immediately</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:bg-slate-300 shadow-lg shadow-blue-600/20"
            >
              {saving ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editId ? "Update Article" : "Publish Article"}
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Newspaper className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No articles yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Article" to create your first news post.</p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-5"
          >
            {/* Color preview */}
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-tr ${item.gradient} flex-shrink-0 flex items-center justify-center shadow-sm`}
            >
              <Newspaper className="h-7 w-7 text-white/80" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">· {item.date}</span>
                {!item.isPublished && (
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Draft
                  </span>
                )}
              </div>
              <h3 className="font-heading text-sm font-extrabold text-slate-900 leading-snug">
                {item.title}
              </h3>
              {item.desc && (
                <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{item.desc}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleTogglePublish(item)}
                title={item.isPublished ? "Unpublish" : "Publish"}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                {item.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Article"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
