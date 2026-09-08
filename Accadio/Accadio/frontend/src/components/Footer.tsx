"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, Mail, Phone, MapPin, Check } from "lucide-react";
import Logo from "./Logo";
import { useTranslation } from "./LanguageContext";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  // Mock social feed images (rendered with beautiful abstract gradients and descriptions)
  const socialFeed = [
    { id: 1, title: "Leadership Forum London", gradient: "from-blue-400 to-indigo-500" },
    { id: 2, title: "Youth Outreach Colombia", gradient: "from-pink-400 to-rose-500" },
    { id: 3, title: "Corporate Excellence Dubai", gradient: "from-violet-400 to-purple-500" },
    { id: 4, title: "Academic Signing Tokyo", gradient: "from-emerald-400 to-teal-500" },
    { id: 5, title: "Team Expansion Singapore", gradient: "from-amber-400 to-orange-500" },
    { id: 6, title: "Milestone Celebration NY", gradient: "from-sky-400 to-blue-500" },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-100 pt-16 pb-8 text-slate-600 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-slate-100 pb-12">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 flex flex-col space-y-5">
            <Logo variant="horizontal" iconSize={40} animateGlobe={false} />
            <p className="text-sm text-slate-500 leading-relaxed">
              Meru Global Team connects global opportunities through excellence. Reaching the unreached and establishing international standard capability buildings since 2018.
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-blue-600 mt-0.5" />
                <span>120 St James&apos;s Square, London, SW1Y 4JH, UK</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-blue-600" />
                <span>+44 20 7946 0192</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-blue-600" />
                <span>connect@meruglobal.org</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <h3 className="font-heading text-sm font-extrabold uppercase text-slate-900 tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-blue-600 transition-colors">
                  {t("nav.programs")}
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-blue-600 transition-colors">
                  {t("nav.history")}
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-blue-600 transition-colors">
                  {t("nav.testimonials")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-blue-600 transition-colors">
                  {t("nav.news")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Media Grid */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <h3 className="font-heading text-sm font-extrabold uppercase text-slate-900 tracking-wider">
              Global Feed
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {socialFeed.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 group cursor-pointer shadow-xs"
                  title={item.title}
                >
                  {/* Colorful abstract background representative of actual photo */}
                  <div className={`w-full h-full bg-gradient-to-tr ${item.gradient} opacity-90 transition-transform duration-300 group-hover:scale-110`} />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <svg className="h-4.5 w-4.5 text-white" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Follow our community highlights on Instagram and LinkedIn.
            </p>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <h3 className="font-heading text-sm font-extrabold uppercase text-slate-900 tracking-wider">
              Newsletter
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Subscribe to receive updates on program admissions, global webinars, and annual milestone journals.
            </p>

            <form onSubmit={handleSubscribe} className="relative flex items-center mt-2">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold"
                disabled={subscribed}
              />
              <button
                type="submit"
                disabled={loading || subscribed}
                className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200"
                aria-label="Subscribe"
              >
                {subscribed ? (
                  <Check className="h-4.5 w-4.5" />
                ) : (
                  <Send className={`h-4.5 w-4.5 ${loading ? "animate-pulse" : ""}`} />
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ✓ Successfully subscribed! Check your inbox soon.
              </p>
            )}
          </div>
        </div>

        {/* Lower Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-400 gap-4">
          <p>© 2026 Meru Global Team. All rights reserved. Reaching the Unreached.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Use</a>
            <span>•</span>
            {/* Social media links */}
            <div className="flex items-center gap-2.5 ml-2">
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
