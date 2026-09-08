"use client";

import React, { useState } from "react";
import { Save, Shield, Key } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast("error", data.error || "Failed to change password");
      }
    } catch {
      showToast("error", "Network error");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your account and security settings.</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
            <p className="text-xs text-slate-400 font-medium">Update your admin password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:bg-slate-300 shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Update Password
          </button>
        </form>
      </div>

      {/* Security Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Security</h2>
            <p className="text-xs text-slate-400 font-medium">Session & security info</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500 font-medium">Session timeout</span>
            <span className="text-sm text-slate-800 font-bold">30 minutes</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500 font-medium">Password hashing</span>
            <span className="text-sm text-slate-800 font-bold">bcrypt (12 rounds)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-500 font-medium">Cookies</span>
            <span className="text-sm text-slate-800 font-bold">HttpOnly, SameSite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
