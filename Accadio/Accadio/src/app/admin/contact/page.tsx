"use client";

import React, { useEffect, useState } from "react";
import { Save, Phone, Mail, MapPin, Video as YoutubeIcon } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { notifyLiveUpdate } from "@/lib/liveSync";

const FacebookIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XTwitterIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

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
        notifyLiveUpdate();
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
    { key: "facebook", label: "Facebook", icon: FacebookIcon, placeholder: "https://facebook.com/..." },
    { key: "twitter", label: "X (Twitter)", icon: XTwitterIcon, placeholder: "https://x.com/..." },
    { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "https://instagram.com/..." },
    { key: "linkedin", label: "LinkedIn", icon: LinkedinIcon, placeholder: "https://linkedin.com/..." },
    { key: "youtube", label: "YouTube", icon: YoutubeIcon, placeholder: "https://youtube.com/..." },
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
