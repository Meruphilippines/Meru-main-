"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Check,
  Sparkles,
  BookOpen,
  Users,
  Compass,
  Landmark,
  Loader2,
  X,
  Mail,
  User,
  Phone,
  GraduationCap,
  FileText,
  Send,
  CheckCircle2,
  Play,
} from "lucide-react";

interface ProgramItem {
  id: string;
  title: string;
  slug?: string;
  category: string;
  tag: string;
  desc: string;
  eligibility: string;
  benefits: string[];
  gradient: string;
  iconName?: string;
  featuredImagePath?: string | null;
  videoUrl?: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  Compass,
  BookOpen,
  Landmark,
  Users,
};

function ProgramsCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCat = searchParams.get("cat") || "all";

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration Modal state
  const [registeringProgram, setRegisteringProgram] = useState<ProgramItem | null>(null);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEducation, setRegEducation] = useState("");
  const [regStatement, setRegStatement] = useState("");
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [videoModalProgram, setVideoModalProgram] = useState<ProgramItem | null>(null);

  const getEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
    }
    if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null;
    }
    return null;
  };

  // Sync state if search params change
  useEffect(() => {
    const cat = searchParams.get("cat") || "all";
    setActiveCategory(cat);
  }, [searchParams]);

  // Fetch dynamic programs from API
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (activeCategory !== "all") query.set("cat", activeCategory);
    if (searchQuery) query.set("q", searchQuery);

    fetch(`/api/programs?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPrograms(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load programs:", err);
        setLoading(false);
      });
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "all") {
      router.push("/programs");
    } else {
      router.push(`/programs?cat=${cat}`);
    }
  };

  const triggerDownload = (programTitle: string) => {
    setToastMessage(`Starting download: Brochure_${programTitle.replace(/\s+/g, "_")}.pdf`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const openRegisterModal = (program: ProgramItem) => {
    setRegisteringProgram(program);
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegEducation("");
    setRegStatement("");
    setRegError(null);
    setRegSuccess(false);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringProgram) return;

    if (!regName.trim() || !regEmail.trim()) {
      setRegError("Please provide your full name and a valid email address.");
      return;
    }

    setSubmittingReg(true);
    setRegError(null);

    try {
      const res = await fetch("/api/programs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: registeringProgram.id,
          programName: registeringProgram.title,
          name: regName,
          email: regEmail,
          phone: regPhone,
          education: regEducation,
          statement: regStatement,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setRegSuccess(true);
      } else {
        setRegError(data.error || "Failed to submit registration. Please try again.");
      }
    } catch {
      setRegError("A network error occurred. Please try again.");
    } finally {
      setSubmittingReg(false);
    }
  };

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Admissions & Catalog
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Explore Our Programs
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Accredited modular frameworks tailored for university exchange, corporate governance, and youth civic engagement.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: "All Portfolios", value: "all" },
            { label: "Global Exchange", value: "exchange" },
            { label: "Corporate Excellence", value: "corporate" },
            { label: "Youth Leadership", value: "youth" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleCategoryChange(tab.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === tab.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Text Search */}
        <div className="relative w-full max-w-xs flex items-center">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* Programs Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[300px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse space-y-4">
                <div className="h-36 bg-slate-200 rounded-2xl" />
                <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                <div className="h-12 bg-slate-100 rounded-md" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => {
              const isExpanded = expandedCard === program.id;
              const CardIcon = (program.iconName && iconMap[program.iconName]) || Compass;

              return (
                <div
                  key={program.id}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Decorative Banner or Image */}
                  <div
                    className={`h-40 relative p-6 flex items-end overflow-hidden ${
                      program.featuredImagePath
                        ? "bg-slate-900"
                        : `bg-gradient-to-tr ${program.gradient || "from-blue-400 to-indigo-500"}`
                    }`}
                  >
                    {program.featuredImagePath ? (
                      <img
                        src={program.featuredImagePath}
                        alt={program.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-950/10" />
                    )}

                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-white z-10">
                      {program.tag}
                    </span>

                    {program.videoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoModalProgram(program);
                        }}
                        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" />
                        Watch Video
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-tight">
                      {program.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed flex-1 font-semibold">
                      {program.desc}
                    </p>

                    {/* Expandable Info Panel */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 pt-4 space-y-4 animate-fadeIn">
                        {program.eligibility && (
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Eligibility
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                              {program.eligibility}
                            </p>
                          </div>
                        )}
                        {program.benefits && program.benefits.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Benefits & Outcomes
                            </h4>
                            <ul className="space-y-1">
                              {program.benefits.map((benefit, i) => (
                                <li key={i} className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                                  <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : program.id)}
                        className="w-full py-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Collapse Info
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Eligibility & Benefits
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerDownload(program.title)}
                          className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Brochure
                        </button>
                        <button
                          onClick={() => openRegisterModal(program)}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8">
            <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700 font-heading">No programs found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or switching to a different category portfolio tab above.
            </p>
          </div>
        )}
      </section>

      {/* Program Registration Modal */}
      {registeringProgram && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !submittingReg && setRegisteringProgram(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                  {registeringProgram.tag}
                </span>
                <h3 className="font-heading text-xl font-extrabold text-slate-900 mt-2">
                  Apply for Admission
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {registeringProgram.title}
                </p>
              </div>
              <button
                onClick={() => setRegisteringProgram(null)}
                disabled={submittingReg}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success State */}
            {regSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-extrabold text-slate-900">
                    Registration Received!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed font-medium">
                    Thank you, <span className="font-bold text-slate-800">{regName}</span>. Your application for{" "}
                    <span className="font-bold text-blue-600">{registeringProgram.title}</span> has been logged. Our admissions director will review your details and reach out via email shortly.
                  </p>
                </div>
                <button
                  onClick={() => setRegisteringProgram(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Phone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Education / Current Role
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={regEducation}
                        onChange={(e) => setRegEducation(e.target.value)}
                        placeholder="e.g. B.A. Graduate, Ministry Worker"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Statement of Interest / Goals
                  </label>
                  <textarea
                    rows={3}
                    value={regStatement}
                    onChange={(e) => setRegStatement(e.target.value)}
                    placeholder="Briefly describe what you hope to achieve through this program..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submittingReg}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    {submittingReg ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Application
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submittingReg}
                    onClick={() => setRegisteringProgram(null)}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Program Video Modal */}
      {videoModalProgram && videoModalProgram.videoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setVideoModalProgram(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalProgram(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              {getEmbedUrl(videoModalProgram.videoUrl) ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={getEmbedUrl(videoModalProgram.videoUrl)!}
                    title={videoModalProgram.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={videoModalProgram.videoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] object-contain rounded-2xl"
                />
              )}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">{videoModalProgram.title}</h3>
                <span className="text-xs text-slate-400 uppercase font-mono">Program Preview</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-slideUp z-50">
          <Check className="h-4 w-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <ProgramsCatalog />
    </Suspense>
  );
}
