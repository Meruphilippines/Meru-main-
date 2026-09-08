"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  Clock,
  UserCheck,
  XCircle,
  Trash2,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  X,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface Registration {
  id: string;
  programId?: string | null;
  programName: string;
  name: string;
  email: string;
  phone?: string | null;
  education?: string | null;
  statement?: string | null;
  status: "pending" | "contacted" | "approved" | "rejected" | string;
  createdAt: string;
}

export default function AdminRegistrationsPage() {
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/admin/registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      } else {
        showToast("error", "Failed to fetch registrations");
      }
    } catch {
      showToast("error", "Network error while fetching registrations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRegistrations();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
        );
        if (selectedReg?.id === id) {
          setSelectedReg((prev) => (prev ? { ...prev, status: updated.status } : null));
        }
        showToast("success", `Status updated to ${newStatus}`);
      } else {
        showToast("error", "Failed to update registration status");
      }
    } catch {
      showToast("error", "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/registrations?id=${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRegistrations((prev) => prev.filter((r) => r.id !== deleteId));
        if (selectedReg?.id === deleteId) setSelectedReg(null);
        showToast("success", "Registration record deleted");
      } else {
        showToast("error", "Failed to delete registration");
      }
    } catch {
      showToast("error", "Error deleting registration");
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="h-3 w-3" /> Contacted
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  const filtered = registrations.filter((reg) => {
    if (statusFilter !== "all" && reg.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = reg.name.toLowerCase().includes(q);
      const matchEmail = reg.email.toLowerCase().includes(q);
      const matchProg = reg.programName.toLowerCase().includes(q);
      const matchPhone = reg.phone?.toLowerCase().includes(q) ?? false;
      return matchName || matchEmail || matchProg || matchPhone;
    }
    return true;
  });

  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  if (loading) return <LoadingSpinner size="lg" label="Loading program registrations..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Program Registrations</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                {pendingCount} new pending
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Review, evaluate, and track admissions submissions from prospective candidates.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { key: "all", label: `All (${registrations.length})` },
            { key: "pending", label: `Pending (${registrations.filter((r) => r.status === "pending").length})` },
            { key: "contacted", label: `Contacted (${registrations.filter((r) => r.status === "contacted").length})` },
            { key: "approved", label: `Approved (${registrations.filter((r) => r.status === "approved").length})` },
            { key: "rejected", label: `Rejected (${registrations.filter((r) => r.status === "rejected").length})` },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === item.key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Registrations Table / List */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Program</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Applicant */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{reg.name}</p>
                        {reg.education && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {reg.education}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Program */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {reg.programName}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <a
                          href={`mailto:${reg.email}`}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-semibold"
                        >
                          <Mail className="h-3 w-3 text-slate-400" />
                          {reg.email}
                        </a>
                        {reg.phone && (
                          <a
                            href={`tel:${reg.phone}`}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-medium text-[11px]"
                          >
                            <Phone className="h-3 w-3 text-slate-400" />
                            {reg.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(reg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          value={reg.status}
                          disabled={updatingId === reg.id}
                          onChange={(e) => handleUpdateStatus(reg.id, e.target.value)}
                          className="appearance-none bg-transparent pl-2 pr-6 py-1 rounded-full text-xs font-bold border border-slate-200 cursor-pointer focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="View Full Application"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(reg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Registration"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No registrations found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters or search terms to see more records."
              : "When prospective students or participants register via the /programs page, their submissions will be listed here."}
          </p>
        </div>
      )}

      {/* Details View Modal */}
      {selectedReg && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedReg(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-extrabold text-slate-900">
                    {selectedReg.name}
                  </h3>
                  {getStatusBadge(selectedReg.status)}
                </div>
                <p className="text-xs font-bold text-blue-600 mt-1">
                  Applying for: {selectedReg.programName}
                </p>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedReg.email}`}
                    className="font-bold text-slate-800 hover:text-blue-600 break-all"
                  >
                    {selectedReg.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <p className="font-bold text-slate-800">
                    {selectedReg.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Educational Background & Experience
                </span>
                <div className="p-3 bg-slate-50 rounded-xl font-medium text-slate-700 leading-relaxed">
                  {selectedReg.education || "No background details provided"}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Statement of Interest / Motivation
                </span>
                <div className="p-3 bg-slate-50 rounded-xl font-medium text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedReg.statement || "No statement provided"}
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Submitted on{" "}
                  {new Date(selectedReg.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status Update Quick Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500">Update Status:</span>
              <div className="flex gap-1.5">
                {(["pending", "contacted", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedReg.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      selectedReg.status === st
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Registration"
        message="Are you sure you want to permanently delete this registration record? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
