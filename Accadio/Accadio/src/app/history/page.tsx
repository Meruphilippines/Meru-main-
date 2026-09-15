"use client";

import React, { useState, useEffect } from "react";
import { useLiveData } from "@/hooks/useLiveData";
import { motion } from "framer-motion";
import {
  Calendar,
  Compass,
  Globe,
  Award,
  BookOpen,
  Clock,
  HeartHandshake,
  Maximize2,
  X,
  Sparkles,
  Play,
  Film,
} from "lucide-react";

interface HistorySlotItem {
  id: string;
  year: string;
  title: string;
  tag: string;
  caption?: string | null;
  photoPath?: string | null;
  videoUrl?: string | null;
  gradient?: string;
}

const defaultMoments: HistorySlotItem[] = [
  { id: "1", year: "2019", title: "First London Forum", tag: "Event", gradient: "from-blue-400 to-indigo-500", photoPath: null, videoUrl: null, caption: "Global Expedition Journey" },
  { id: "2", year: "2021", title: "Tokyo Seminars Group", tag: "Academic", gradient: "from-purple-400 to-pink-500", photoPath: null, videoUrl: null, caption: "Global Expedition Journey" },
  { id: "3", year: "2022", title: "Bogota Office Opening", tag: "Expansion", gradient: "from-emerald-400 to-teal-500", photoPath: null, videoUrl: null, caption: "Global Expedition Journey" },
  { id: "4", year: "2023", title: "Corporate Review Board", tag: "Corporate", gradient: "from-amber-400 to-orange-500", photoPath: null, videoUrl: null, caption: "Global Expedition Journey" },
  { id: "5", year: "2025", title: "Global Youth Congress", tag: "Summit", gradient: "from-sky-400 to-blue-600", photoPath: null, videoUrl: null, caption: "Global Expedition Journey" },
  { id: "6", year: "2026", title: "Africa Initiative Launch", tag: "Field", gradient: "from-rose-400 to-purple-600", photoPath: null, videoUrl: null, caption: "Global Expedition Journey" }
];

export default function HistoryPage() {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [historySlots, setHistorySlots] = useState<HistorySlotItem[]>([]);
  const [activeMedia, setActiveMedia] = useState<{ type: "photo" | "video"; url: string; title: string } | null>(null);
  const [customContent, setCustomContent] = useState<string | null>(null);

  // Live-polling: refresh history slots and page content every 5 s, on focus, and on broadcast
  const { data: livePageContent } = useLiveData<{ content?: string }>("/api/pages/history", 5000);
  const { data: liveHistory } = useLiveData<HistorySlotItem[]>("/api/history", 5000);

  useEffect(() => {
    if (livePageContent?.content) setCustomContent(livePageContent.content);
  }, [livePageContent]);

  useEffect(() => {
    if (Array.isArray(liveHistory) && liveHistory.length > 0) {
      setHistorySlots(liveHistory);
    } else if (liveHistory !== null) {
      setHistorySlots(defaultMoments);
    }
  }, [liveHistory]);

  const defaultMilestones = [
    {
      year: "2010",
      title: "UPG Confrence at ASCM",
      desc: "The Unreached People Groups (UPG) conference at the Asian Seminary of Christian Ministries (ASCM) became the seedbed for MERU. Rev. Dr. Roland Vaughan, coordinator of Church of God World Missions (COGWM) UPG Missions, served as keynote speaker, inspiring partnerships that later shaped MERU.",
      icon: Compass,
      color: "border-blue-500 text-blue-600 bg-blue-50",
      imageGrad: "from-blue-400 to-indigo-500",
      photoPath: null as string | null,
    },
    {
      year: "2010",
      title: "Birth of partnerships",
      desc: "The conference fostered collaborations among leaders and missionaries who were instrumental in developing MERU’s vision and strategies..",
      icon: BookOpen,
      color: "border-purple-500 text-purple-600 bg-purple-50",
      imageGrad: "from-purple-400 to-pink-500",
      photoPath: null as string | null,
    },
    {
      year: "2011",
      title: "Doctor of ministry reaserch project",
      desc: "Dr. George Pappachen, an ASCM D.Min. graduate, conducted research on Christian Missions for the Unreached (CMU) among the Agta people of Palanan, Isabela, Philippines. His focus on “gospel inculturation” documented best practices and laid the foundation for innovative UPG mission strategies.",
      icon: Globe,
      color: "border-emerald-500 text-emerald-600 bg-emerald-50",
      imageGrad: "from-emerald-400 to-teal-500",
      photoPath: null as string | null,
    },
    {
      year: "2012",
      title: "Formation of MERU Global Team",
      desc: "Emerging from the mission's atmosphere of innovation and partnership, MERU Global Team was established as a new addition to organizations serving UPG missions worldwide. It stands as a testimony to the call of Christ to birthing ministries that connect people to the Great Commission..",
      icon: Award,
      color: "border-amber-500 text-amber-600 bg-amber-50",
      imageGrad: "from-amber-400 to-orange-500",
      photoPath: null as string | null,
    },
    {
      year: "2020",
      title: "Global Expansion",
      desc: "Today, MERU has spread to nations across the world, launching training programs, hosting conferences, and building bridges between generations and cultures. Through these initiatives, MERU continues to gather people for the Great Commission, empowering Christians to reach the unreached with the Gospel.",
      icon: HeartHandshake,
      color: "border-rose-500 text-rose-600 bg-rose-50",
      imageGrad: "from-rose-400 to-red-500",
      photoPath: null as string | null,
    },
  ];

  const tagIconMap: Record<string, any> = {
    Event: Compass,
    Academic: BookOpen,
    Expansion: Globe,
    Corporate: Award,
    Summit: HeartHandshake,
    Field: Globe,
    Milestone: Award,
    Partnership: HeartHandshake,
  };

  const dynamicMilestones =
    historySlots.length > 0
      ? historySlots.map((slot, idx) => {
          const colors = [
            "border-blue-500 text-blue-600 bg-blue-50",
            "border-purple-500 text-purple-600 bg-purple-50",
            "border-emerald-500 text-emerald-600 bg-emerald-50",
            "border-amber-500 text-amber-600 bg-amber-50",
            "border-rose-500 text-rose-600 bg-rose-50",
          ];
          return {
            year: slot.year,
            title: slot.title,
            desc: slot.caption || slot.title,
            icon: tagIconMap[slot.tag] || Compass,
            color: colors[idx % colors.length],
            imageGrad: slot.gradient || "from-blue-400 to-indigo-500",
            photoPath: slot.photoPath,
          };
        })
      : defaultMilestones;

  const milestones = dynamicMilestones;
  const displayMoments = historySlots.length > 0 ? historySlots : defaultMoments;

  const getYoutubeOrVimeoEmbed = (url: string) => {
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

  const handleCardClick = (moment: HistorySlotItem) => {
    if (moment.videoUrl) {
      setActiveMedia({ type: "video", url: moment.videoUrl, title: moment.title });
    } else if (moment.photoPath) {
      setActiveMedia({ type: "photo", url: moment.photoPath, title: moment.title });
    }
  };

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Milestones & Legacy
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Our Journey Timeline
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          MERU Global team&apos;s history timeline and archival records.
        </p>
      </div>

      {/* Admin Visual Editor Custom Content Banner if customized */}
      {customContent && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div
            className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm prose max-w-none text-slate-700 font-medium"
            dangerouslySetInnerHTML={{ __html: customContent }}
          />
        </section>
      )}

      {/* Vertical Interactive Timeline */}
      <section id="timeline" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-24">
        {/* Central timeline line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block"></div>

        <div className="space-y-16">
          {milestones.map((milestone, idx) => {
            const IconComp = milestone.icon;
            const isEven = idx % 2 === 0;

            return (
              <div key={idx} className="relative flex flex-col md:flex-row items-center">

                {/* Timeline node circle */}
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white bg-blue-600 shadow-md hidden md:flex items-center justify-center text-white z-10">
                  <Clock className="h-4 w-4" />
                </div>

                {/* Left Side (Even items get text, Odd items get layout placeholder) */}
                <div className={`w-full md:w-1/2 flex justify-end pr-0 md:pr-12 ${isEven ? "md:order-1" : "md:order-2"}`}>
                  {isEven ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveMilestone(idx)}
                      className="w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-xs hover:shadow-md transition-all cursor-pointer text-right flex flex-col items-end space-y-3"
                    >
                      <span className="text-xs font-black px-3 py-1 bg-blue-50 text-blue-700 rounded-full w-fit">
                        {milestone.year}
                      </span>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {milestone.desc}
                      </p>
                    </motion.div>
                  ) : (
                    /* Styled visual card representation for alternate side */
                    <div className="w-full h-44 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100/50 hidden md:flex items-center justify-center relative overflow-hidden group select-none">
                      {milestone.photoPath ? (
                        <img
                          src={milestone.photoPath}
                          alt={milestone.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-tr ${milestone.imageGrad} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                          <IconComp className="h-10 w-10 text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side (Odd items get text, Even items get layout placeholder) */}
                <div className={`w-full md:w-1/2 flex justify-start pl-0 md:pl-12 ${isEven ? "md:order-2" : "md:order-1"}`}>
                  {!isEven ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveMilestone(idx)}
                      className="w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col items-start space-y-3"
                    >
                      <span className="text-xs font-black px-3 py-1 bg-purple-50 text-purple-700 rounded-full w-fit">
                        {milestone.year}
                      </span>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {milestone.desc}
                      </p>
                    </motion.div>
                  ) : (
                    /* Styled visual card representation for alternate side */
                    <div className="w-full h-44 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100/50 hidden md:flex items-center justify-center relative overflow-hidden group select-none">
                      {milestone.photoPath ? (
                        <img
                          src={milestone.photoPath}
                          alt={milestone.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-tr ${milestone.imageGrad} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                          <IconComp className="h-10 w-10 text-slate-300 group-hover:text-purple-500 transition-colors duration-300" />
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Historical Image Journal Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
            Archival Records
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
            Historical Photo & Video Journal
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Captured snapshots and archival footage highlighting our international expansion and mission initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayMoments.map((moment, idx) => {
            const hasPhoto = Boolean(moment.photoPath);
            const hasVideo = Boolean(moment.videoUrl);
            const isClickable = hasPhoto || hasVideo;

            return (
              <div
                key={moment.id || idx}
                className={`bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-xs hover:shadow-md transition-all group ${
                  isClickable ? "cursor-pointer" : ""
                }`}
                onClick={() => handleCardClick(moment)}
              >
                {/* Photo or Gradient Container */}
                <div
                  className={`h-52 rounded-2xl overflow-hidden relative shadow-xs ${
                    !hasPhoto
                      ? `bg-gradient-to-br ${moment.gradient || "from-blue-400 to-indigo-500"} opacity-90`
                      : "bg-slate-100"
                  }`}
                >
                  {hasPhoto ? (
                    <img
                      src={moment.photoPath!}
                      alt={moment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition-colors" />
                  )}

                  {/* Tag badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                    {moment.tag}
                  </div>

                  {/* Video Play Badge overlay */}
                  {hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Photo Maximize indicator */}
                  {hasPhoto && !hasVideo && (
                    <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {moment.title}
                      {hasVideo && <Film className="h-3.5 w-3.5 text-indigo-500 shrink-0" />}
                    </h4>
                    <span className="text-xs text-slate-400 font-bold block mt-0.5">
                      {moment.caption || "Global Expedition Journey"}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-400 font-heading group-hover:text-blue-600 transition-colors">
                    {moment.year}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox / Video Modal */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            {activeMedia.type === "video" ? (
              <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                {getYoutubeOrVimeoEmbed(activeMedia.url) ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={getYoutubeOrVimeoEmbed(activeMedia.url)!}
                      title={activeMedia.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[80vh] object-contain rounded-2xl"
                  />
                )}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-sm font-bold">{activeMedia.title}</h3>
                  <span className="text-xs text-slate-400 uppercase font-mono">Archival Video</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title}
                  className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                />
                <p className="text-sm font-semibold text-white/90 mt-3 text-center">
                  {activeMedia.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
