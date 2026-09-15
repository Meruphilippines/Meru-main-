"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLiveData } from "@/hooks/useLiveData";
import { motion } from "framer-motion";
import { Award, ShieldCheck, HeartHandshake, Compass, Users, Sparkles, Send } from "lucide-react";
import Logo from "@/components/Logo";
import { useTranslation } from "@/components/LanguageContext";

// Simple custom animated counter sub-component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = 0;
    const end = target;
    const duration = 2000; // 2 seconds
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          window.requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return <span ref={elementRef} className="font-heading text-4xl sm:text-5xl font-extrabold text-blue-600 tabular-nums">{count}{suffix}</span>;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactEmail, setContactEmail] = useState("connect@meruglobal.org");
  const [customContent, setCustomContent] = useState<string | null>(null);
  const [spotlightMedia, setSpotlightMedia] = useState<Array<{
    id: string;
    filename: string;
    title: string;
    caption: string;
    url: string;
    type: string;
  }>>([]);

  const starsCanvasRef = useRef<HTMLCanvasElement>(null);
  const [homepageData, setHomepageData] = useState<{
    heroTitle: string;
    heroSubtitle: string;
    heroImagePath?: string;
    heroVideoUrl?: string;
    logoRotation?: boolean;
    tickerItems: Array<{ id?: string; label: string; date: string; text: string; color: string }>;
  } | null>(null);

  // Live-polling data sources – auto-refresh every 5 s, on tab focus, and on admin broadcast
  const { data: liveHomepage } = useLiveData<typeof homepageData>("/api/homepage", 5000);
  const { data: livePageContent } = useLiveData<{ content?: string }>("/api/pages/home", 5000);
  const { data: liveMedia } = useLiveData<typeof spotlightMedia>("/api/media?placement=homepage", 5000);
  const { data: liveContact } = useLiveData<{ email?: string }>("/api/contact", 5000);

  useEffect(() => { if (liveHomepage) setHomepageData(liveHomepage); }, [liveHomepage]);
  useEffect(() => {
    if (livePageContent?.content && livePageContent.content.trim() !== "<p></p>") {
      setCustomContent(livePageContent.content);
    }
  }, [livePageContent]);
  useEffect(() => { if (Array.isArray(liveMedia)) setSpotlightMedia(liveMedia); }, [liveMedia]);
  useEffect(() => { if (liveContact?.email) setContactEmail(liveContact.email); }, [liveContact]);

  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Array<{
      x: number;
      y: number;
      r: number;
      a: number;
      speed: number;
      phase: number;
    }> = [];

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || 600;
      buildStars();
    };

    const buildStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 3200);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.2,
          a: Math.random(),
          speed: Math.random() * 0.004 + 0.001,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    let animationFrameId: number;

    const drawStars = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha})`;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(drawStars);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    animationFrameId = requestAnimationFrame(drawStars);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          department: "general",
        }),
      });
      if (res.ok) {
        setFormSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (err) {
      console.error("Quick contact submit error:", err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full relative overflow-hidden bg-slate-50/20 font-sans">

      {/* 1. HERO — animated logo and dynamic admin settings */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#05070f] px-5 py-16 border-b border-slate-900 overflow-hidden">
        {/* Starfield background */}
        <canvas ref={starsCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Optional Hero Background Image / Video from Admin */}
        {homepageData?.heroVideoUrl ? (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
            {homepageData.heroVideoUrl.includes("youtube.com") || homepageData.heroVideoUrl.includes("youtu.be") ? (
              <iframe
                src={`https://www.youtube.com/embed/${homepageData.heroVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1] || ""}?autoplay=1&mute=1&loop=1&playlist=${homepageData.heroVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1] || ""}&controls=0`}
                className="w-full h-full object-cover scale-150 pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            ) : (
              <video
                src={homepageData.heroVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : homepageData?.heroImagePath ? (
          <div
            className="absolute inset-0 z-0 opacity-25 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url(${homepageData.heroImagePath})` }}
          />
        ) : null}

        {/* Ambient glows */}
        <div className="glow-orb left" />
        <div className="glow-orb right" />

        <motion.div
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Logo
            variant="vertical"
            iconSize={220}
            animateGlobe={homepageData?.logoRotation !== false}
            hero3d={true}
            title="MERU"
            subtitle={homepageData?.heroTitle || "Reaching The Unreached"}
          />
          {homepageData?.heroSubtitle && (
            <p className="text-slate-300 font-medium text-sm sm:text-base md:text-lg max-w-2xl mt-4 leading-relaxed tracking-wide text-center">
              {homepageData.heroSubtitle}
            </p>
          )}
        </motion.div>
      </section>

      {/* 2. LIVE NEWS & UPDATES TICKER */}
      <section className="w-full bg-slate-900 text-white border-y border-slate-800 py-4.5 overflow-hidden select-none animate-marquee-paused">
        <div className="flex items-center">
          <div className="px-6 border-r border-slate-700 bg-slate-900 z-10 flex-shrink-0 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-heading text-xs font-black tracking-widest text-slate-300">
              {t("ticker.title")}
            </span>
          </div>

          <div className="w-full relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-12 font-medium text-sm text-slate-300 items-center">
              {(() => {
                const baseItems =
                  homepageData?.tickerItems && homepageData.tickerItems.length > 0
                    ? homepageData.tickerItems
                    : [
                        { id: "1", label: "EVENT", date: "JUNE 2026", text: t("ticker.item2"), color: "blue" },
                        { id: "2", label: "EXPANSION", date: "MAY 2026", text: t("ticker.item1"), color: "emerald" },
                        { id: "3", label: "MILESTONE", date: "APRIL 2026", text: t("ticker.item3"), color: "purple" },
                        { id: "4", label: "PARTNERS", date: "MARCH 2026", text: t("ticker.item4"), color: "amber" },
                      ];
                const repeatedItems =
                  baseItems.length <= 2
                    ? [...baseItems, ...baseItems, ...baseItems, ...baseItems]
                    : [...baseItems, ...baseItems];
                return repeatedItems.map((item, idx) => {
                  const colorMap: Record<string, string> = {
                    blue: "text-blue-400",
                    emerald: "text-emerald-400",
                    purple: "text-purple-400",
                    amber: "text-amber-400",
                    rose: "text-rose-400",
                    sky: "text-sky-400",
                  };
                  const colorClass = colorMap[item.color] || "text-blue-400";
                  return (
                    <span key={`${item.id}-${idx}`}>
                      <strong className={`${colorClass} mr-2`}>
                        [{item.date ? `${item.date} - ` : ""}{item.label || "NEWS"}]
                      </strong>
                      {item.text}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content from Admin Pages -> Home */}
      {customContent && customContent.trim() !== "<p></p>" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div
            className="p-8 sm:p-12 bg-white border border-slate-100 rounded-3xl shadow-sm prose prose-slate max-w-none text-slate-700 font-medium"
            dangerouslySetInnerHTML={{ __html: customContent }}
          />
        </section>
      )}

      {/* 3. ABOUT US SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Text Content */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
                {t("about.title")}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Reaching the Unreached, Connecting generations to the great commission.
              </h2>
            </div>

            <p className="text-slate-500 leading-relaxed text-base font-medium">
              {t("about.overview")}
            </p>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-blue-100 transition-colors">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 inline-block mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <h4 className="font-heading text-base font-extrabold text-slate-800 mb-2">{t("about.mission")}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{t("about.missionText")}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-purple-100 transition-colors">
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 inline-block mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-heading text-base font-extrabold text-slate-800 mb-2">{t("about.vision")}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{t("about.visionText")}</p>
              </div>
            </div>
          </div>

          {/* Stats Graphic & Counters */}
          <div className="lg:col-span-6 flex flex-col space-y-10">
            {/* Interactive Stats Grid */}
            <div className="grid grid-cols-2 gap-8 p-8 rounded-3xl bg-white border border-slate-100 shadow-md">
              <div className="flex flex-col border-r border-b border-slate-100 pb-6 pr-6">
                <AnimatedCounter target={45} suffix="+" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
                  {t("stats.countries")}
                </span>
              </div>
              <div className="flex flex-col border-b border-slate-100 pb-6 pl-6">
                <AnimatedCounter target={280} suffix="+" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
                  {t("stats.programs")}
                </span>
              </div>
              <div className="flex flex-col border-r border-slate-100 pt-6 pr-6">
                <AnimatedCounter target={120} suffix="+" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
                  {t("stats.partners")}
                </span>
              </div>
              <div className="flex flex-col pt-6 pl-6">
                <AnimatedCounter target={1500} suffix="+" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
                  {t("stats.team")}
                </span>
              </div>
            </div>

            {/* Core Values Accordion summary */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                {t("about.values")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: t("about.val1Title"), desc: t("about.val1Desc"), icon: Users },
                  { title: t("about.val2Title"), desc: t("about.val2Desc"), icon: Award },
                  { title: t("about.val3Title"), desc: t("about.val3Desc"), icon: HeartHandshake },
                  { title: t("about.val4Title"), desc: t("about.val4Desc"), icon: ShieldCheck },
                ].map((val, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="p-1.5 h-fit rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                      <val.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{val.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3b. HOMEPAGE SPOTLIGHT MEDIA (Photos & Videos from Admin) */}
      {spotlightMedia.length > 0 && (
        <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-2">
                Spotlight Highlights
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Media & Moments
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {spotlightMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700/60 shadow-lg flex flex-col transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {item.type === "video" ? (
                      item.url.includes("youtube.com") || item.url.includes("youtu.be") ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1] || ""}`}
                          className="w-full h-full"
                          allow="encrypted-media"
                        />
                      ) : (
                        <video src={item.url} controls className="w-full h-full object-cover" />
                      )
                    ) : (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-white text-base line-clamp-1">
                        {item.title}
                      </h4>
                      {item.caption && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. CONTACT US QUICK SECTION */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-stretch">

            {/* Form Column */}
            <div className="lg:col-span-6 flex flex-col space-y-6 justify-center">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
                  Connect With Us
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {t("contact.title")}
                </h2>
                <p className="text-slate-500 font-medium mt-2">
                  {t("contact.subtitle")}
                </p>
              </div>

              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800"
                >
                  <p className="text-sm font-bold flex items-center gap-2">
                    ✓ {t("contact.success")}
                  </p>
                  <p className="text-xs mt-1 text-emerald-600">
                    A representative from our admissions or global partnership board will email you within 24 business hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 text-xs font-bold underline hover:text-emerald-900"
                  >
                    Send another query
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-600">{t("contact.name")}</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-600">{t("contact.email")}</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-600">{t("contact.phone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-600">{t("contact.message")}</label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleFormChange}
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:bg-slate-200"
                  >
                    {formLoading ? (
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="h-4.5 w-4.5" />
                        {t("contact.submit")}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Donation Column */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="relative flex-1 min-h-[350px] rounded-3xl overflow-hidden border border-blue-100 shadow-md bg-white p-8 sm:p-10">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-[#b51682]"></div>

                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
                      <HeartHandshake className="h-4 w-4" />
                      Donate to Meru
                    </div>

                    <div>
                      <h3 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Help Meru reach more communities
                      </h3>
                      <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-slate-500">
                        Your contribution supports global exchange access, youth leadership programs, and outreach for learners and communities who need opportunity most.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {["$25", "$50", "$100", "Custom"].map((amount) => (
                        <a
                          key={amount}
                          href={`mailto:${contactEmail}?subject=Donation%20to%20Meru%20Organisation&body=Hello%20Meru%20Team,%0A%0AI%20would%20like%20to%20donate%20${encodeURIComponent(amount)}%20to%20the%20Meru%20organisation.%20Please%20share%20the%20next%20steps.%0A%0AThank%20you.`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center font-heading text-lg font-extrabold text-slate-900 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {amount}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Transparent support", icon: ShieldCheck },
                        { label: "Community outreach", icon: Users },
                        { label: "Global opportunity", icon: Award },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-xs font-bold text-slate-600">
                          <item.icon className="h-4 w-4 shrink-0 text-blue-600" />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={`mailto:${contactEmail}?subject=Donation%20to%20Meru%20Organisation&body=Hello%20Meru%20Team,%0A%0AI%20would%20like%20to%20make%20a%20donation%20to%20the%20Meru%20organisation.%20Please%20share%20the%20donation%20process.%0A%0AThank%20you.`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <HeartHandshake className="h-5 w-5" />
                      Donate Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
