"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/components/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // Admin routes render their own layout — no public Header/Footer
    return <>{children}</>;
  }

  return (
    <LanguageProvider>
      <Header />
      <main className="flex-1 w-full relative">{children}</main>
      <Footer />
      <WhatsAppButton />
    </LanguageProvider>
  );
}
