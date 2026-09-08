"use client";

import React, { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, CheckCircle2, Clock, Filter, Phone, Calendar, User } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export default function AdminInboxPage() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchInquiries = () => {
    fetch("/api/admin/inbox")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInquiries(data);
          if (selectedInquiry) {
            const updated = data.find((i: Inquiry) => i.id === selectedInquiry.id);
            if (updated) setSelectedInquiry(updated);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showToast("success", `Marked as ${status}`);
        fetchInquiries();
      } else {
        showToast("error", "Failed to update status");
      }
    } catch {
      showToast("error", "Network error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/inbox?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("success", "Inquiry deleted");
        if (selectedInquiry?.id === deleteId) {
          setSelectedInquiry(null);
        }
        fetchInquiries();
      } else {
        showToast("error", "Failed to delete");
      }
    } catch {
      showToast("error", "Network error");
    }
    setDeleteId(null);
  };

  const filtered = inquiries.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading inquiries..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Inquiry Inbox</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Review and respond to messages submitted through the website contact forms.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {["all", "new", "read", "replied"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                filter === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No inquiries found</p>
              <p className="text-xs text-slate-400 mt-1">Inquiries submitted by website visitors will appear here.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedInquiry(item);
                  if (item.status === "new") {
                    updateStatus(item.id, "read");
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedInquiry?.id === item.id
                    ? "bg-blue-50/60 border-blue-200 shadow-sm"
                    : item.status === "new"
                    ? "bg-white border-blue-100 shadow-sm font-semibold"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.status === "new" ? (
                      <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300 flex-shrink-0" />
                    )}
                    <p className="text-sm text-slate-900 truncate font-bold">{item.name}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(item.createdAt).split(",")[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.department}
                  </span>
                  <span className="text-xs text-slate-500 truncate">{item.email}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{item.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Message Details */}
        <div className="lg:col-span-7">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 font-heading">{selectedInquiry.name}</h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        selectedInquiry.status === "new"
                          ? "bg-blue-50 text-blue-600"
                          : selectedInquiry.status === "replied"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedInquiry.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">
                        {selectedInquiry.email}
                      </a>
                    </span>
                    {selectedInquiry.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedInquiry.phone}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(selectedInquiry.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteId(selectedInquiry.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete inquiry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</span>
                <p className="text-sm font-semibold text-slate-800 capitalize">{selectedInquiry.department}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message Content</span>
                <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=RE: Accadio Inquiry (${selectedInquiry.department})`}
                  onClick={() => updateStatus(selectedInquiry.id, "replied")}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Reply via Email
                </a>

                {selectedInquiry.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(selectedInquiry.id, "replied")}
                    className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Mark as Replied
                  </button>
                )}

                {selectedInquiry.status !== "read" && (
                  <button
                    onClick={() => updateStatus(selectedInquiry.id, "read")}
                    className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <MailOpen className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Select an inquiry</p>
              <p className="text-xs text-slate-400 mt-1">Choose a message from the list to view its complete details.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
