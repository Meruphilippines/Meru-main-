"use client";

import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface TickerItem {
  id: string;
  label: string;
  date: string;
  text: string;
  color: string;
}

interface HomepageData {
  heroTitle: string;
  heroSubtitle: string;
  heroImagePath: string;
  heroVideoUrl: string;
  logoRotation: boolean;
  tickerItems: TickerItem[];
}

const COLORS = ["blue", "emerald", "purple", "amber", "rose", "sky"];

export default function AdminHomepagePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("success", "Homepage settings saved successfully!");
      } else {
        showToast("error", "Failed to save homepage settings");
      }
    } catch {
      showToast("error", "Network error");
    }
    setSaving(false);
  };

  const addTickerItem = () => {
    if (!data) return;
    const newItem: TickerItem = {
      id: Date.now().toString(),
      label: "NEWS",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase(),
      text: "New ticker item",
      color: COLORS[data.tickerItems.length % COLORS.length],
    };
    setData({ ...data, tickerItems: [...data.tickerItems, newItem] });
  };

  const removeTickerItem = (id: string) => {
    if (!data) return;
    setData({ ...data, tickerItems: data.tickerItems.filter((t) => t.id !== id) });
  };

  const updateTickerItem = (id: string, field: keyof TickerItem, value: string) => {
    if (!data) return;
    setData({
      ...data,
      tickerItems: data.tickerItems.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    });
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading homepage settings..." />;
  if (!data) return <p className="text-sm text-red-500">Failed to load homepage data.</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Homepage</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage hero section, ticker, and logo settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:bg-slate-300 shadow-lg shadow-blue-600/20"
        >
          {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-bold text-slate-800">Hero Section</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hero Title</label>
            <input
              type="text"
              value={data.heroTitle}
              onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hero Subtitle</label>
            <input
              type="text"
              value={data.heroSubtitle}
              onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hero Image Path</label>
            <input
              type="text"
              value={data.heroImagePath}
              onChange={(e) => setData({ ...data, heroImagePath: e.target.value })}
              placeholder="/uploads/images/hero.webp"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Background Video URL</label>
            <input
              type="text"
              value={data.heroVideoUrl}
              onChange={(e) => setData({ ...data, heroVideoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.logoRotation}
              onChange={(e) => setData({ ...data, logoRotation: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
          <span className="text-sm font-semibold text-slate-700">Enable Logo Rotation</span>
        </div>
      </div>

      {/* News Ticker */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">News Ticker</h2>
          <button
            onClick={addTickerItem}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {data.tickerItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <GripVertical className="h-5 w-5 text-slate-300 mt-2 shrink-0 cursor-move" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateTickerItem(item.id, "label", e.target.value)}
                  placeholder="Label"
                  className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) => updateTickerItem(item.id, "date", e.target.value)}
                  placeholder="Date"
                  className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateTickerItem(item.id, "text", e.target.value)}
                  placeholder="Ticker text"
                  className="sm:col-span-2 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={item.color}
                onChange={(e) => updateTickerItem(item.id, "color", e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-2 px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={() => removeTickerItem(item.id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0 mt-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {data.tickerItems.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No ticker items yet. Click &quot;Add Item&quot; to create one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
