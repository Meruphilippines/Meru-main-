"use client";

import React, { useEffect, useState } from "react";
import { Save, Phone, Mail, MapPin, Globe, Share2, Link as LinkIcon, Video as YoutubeIcon } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface ContactData {
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  googleMapsEmbed: string;
}

export default function AdminContactPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("success", "Contact info saved!");
      } else {
        showToast("error", "Failed to save contact info");
      }
    } catch {
      showToast("error", "Network error");
    }
    setSaving(false);
  };

  const updateSocial = (key: string, value: string) => {
    if (!data) return;
    setData({ ...data, socialLinks: { ...data.socialLinks, [key]: value } });
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading contact info..." />;
  if (!data) return <p className="text-sm text-red-500">Failed to load contact data.</p>;

  const socialFields = [
    { key: "facebook", label: "Facebook", icon: Globe, placeholder: "https://facebook.com/..." },
    { key: "twitter", label: "X (Twitter)", icon: Share2, placeholder: "https://x.com/..." },
    { key: "instagram", label: "Instagram", icon: Globe, placeholder: "https://instagram.com/..." },
    { key: "linkedin", label: "LinkedIn", icon: LinkIcon, placeholder: "https://linkedin.com/in/..." },
    { key: "youtube", label: "YouTube", icon: YoutubeIcon, placeholder: "https://youtube.com/@..." },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Contact</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage contact details and social media links.</p>
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

      {/* Contact Details */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-bold text-slate-800">Contact Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5" /> Address
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-bold text-slate-800">Social Media Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <field.icon className="h-3.5 w-3.5" /> {field.label}
              </label>
              <input
                type="url"
                value={data.socialLinks[field.key as keyof typeof data.socialLinks]}
                onChange={(e) => updateSocial(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Google Maps */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-bold text-slate-800">Google Maps Embed</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">Embed Code (iframe src URL)</label>
          <textarea
            value={data.googleMapsEmbed}
            onChange={(e) => setData({ ...data, googleMapsEmbed: e.target.value })}
            rows={3}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none font-mono"
          />
        </div>
        {data.googleMapsEmbed && (
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <iframe
              src={data.googleMapsEmbed}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>
        )}
      </div>
    </div>
  );
}
