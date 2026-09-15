"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/session");
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setMustChangePassword(data.mustChangePassword);
        if (isLoginPage) {
          router.replace("/admin");
        }
      } else {
        setAuthenticated(false);
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      }
    } catch {
      setAuthenticated(false);
      if (!isLoginPage) {
        router.replace("/admin/login");
      }
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Auto-logout on inactivity (30 min)
  useEffect(() => {
    if (!authenticated) return;

    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
      }, 30 * 60 * 1000);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [authenticated]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors
    }
    setAuthenticated(false);
    router.replace("/admin/login");
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Login page — no sidebar
  if (isLoginPage) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">{children}</div>
      </ToastProvider>
    );
  }

  // Not authenticated — will redirect
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Redirecting..." />
      </div>
    );
  }

  // Force password change in useEffect safely
  useEffect(() => {
    if (authenticated && mustChangePassword && pathname !== "/admin/settings") {
      router.replace("/admin/settings");
    }
  }, [authenticated, mustChangePassword, pathname, router]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50/50">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
