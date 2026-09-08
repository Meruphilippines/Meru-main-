import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "Meru Global Team | Reaching The Unreached",
  description: "Connecting Global Opportunities Through Excellence. Discover our international youth leadership, professional capability building, and global academic exchange programs.",
  keywords: ["Meru Global", "Global Exchange", "Youth Leadership", "Corporate Training", "Professional Excellence", "Reaching the Unreached"],
  authors: [{ name: "Meru Global Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Meru Global Team | Reaching The Unreached",
    description: "Connecting Global Opportunities Through Excellence. Join our certified international tracks.",
    url: "https://meruglobal.org",
    siteName: "Meru Global",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
