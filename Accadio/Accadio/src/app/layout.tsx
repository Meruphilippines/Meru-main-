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
  title: "Meru Global Team",
  description: "The MERU Global Team is committed to carrying Christ's name into places where He is yet unknown. Our focus is on building strong foundations in the Word of God, equipping believers to live out their faith and share the Gospel across nations. By connecting people worldwide to the Great Commission, MERU empowers Christians of every generation in their faith and to become witnesses of Christ's love in communities that remain unreached.",
  keywords: ["Meru Global Team", "Meru Global", "Great Commission", "Gospel", "Christ", "Reaching the Unreached", "Evangelism", "Discipleship", "Faith"],
  authors: [{ name: "Meru Global Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Meru Global Team",
    description: "The MERU Global Team is committed to carrying Christ's name into places where He is yet unknown. Our focus is on building strong foundations in the Word of God, equipping believers to live out their faith and share the Gospel across nations. By connecting people worldwide to the Great Commission, MERU empowers Christians of every generation in their faith and to become witnesses of Christ's love in communities that remain unreached.",
    url: "https://meruglobalteam.org",
    siteName: "Meru Global Team",
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
