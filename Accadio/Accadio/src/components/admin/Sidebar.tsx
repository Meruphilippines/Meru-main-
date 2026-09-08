"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  FileText,
  Image,
  Video,
  MessageSquareQuote,
  GraduationCap,
  ClipboardList,
  History,
  Phone,
  Inbox,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/inbox", label: "Inquiries", icon: Inbox },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/history", label: "History Slots", icon: History },
  { href: "/admin/photos", label: "Photos", icon: Image },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/contact", label: "Contact", icon: Phone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (
    <>
      {/* Logo/Brand */}
      <div className={`px-5 py-6 border-b border-slate-100 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 font-heading">MERU Admin</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content Manager</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-4">
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-slate-200 shadow-md text-slate-600"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 shadow-xl flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
