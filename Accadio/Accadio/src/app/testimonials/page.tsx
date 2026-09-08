"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Search, Play, X, Volume2, Pause, SkipForward, ArrowRight, Loader2 } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  speaker: string;
  details: string;
  duration: string;
  grad: string;
  videoUrl?: string;
  thumbnail?: string;
}

interface WrittenItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  program: string;
  region: string;
}

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Video mockup play state
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(35);

  const [videoTestimonials, setVideoTestimonials] = useState<VideoItem[]>([]);
  const [writtenTestimonials, setWrittenTestimonials] = useState<WrittenItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic testimonials from database API
  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.videos && data.written) {
          setVideoTestimonials(data.videos);
          setWrittenTestimonials(data.written);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load testimonials:", err);
        setLoading(false);
      });
  }, []);

  const handleOpenVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setVideoPlaying(true);
    setVideoProgress(35);
    setVideoModalOpen(true);
  };

  // Filter written reviews
  const filteredReviews = writtenTestimonials.filter((rev) => {
    const matchesSearch =
      rev.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === "all" || rev.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Community Voices
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Success Stories & Testimonials
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Read reviews and watch feedback clips from academic partners, corporate leaders, and summit delegates.
        </p>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 text-center py-20">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Loading stories & testimonials...</p>
        </div>
      ) : (
        <>
          {/* Video Testimonials Section */}
          {videoTestimonials.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
              <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600 fill-current" />
                Featured Video Reviews
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {videoTestimonials.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row items-stretch"
                  >
                    {/* Video Thumbnail */}
                    <div
                      className={`sm:w-48 ${
                        video.thumbnail
                          ? "bg-slate-900"
                          : `bg-gradient-to-tr ${video.grad || "from-blue-400 to-indigo-500"}`
                      } p-6 flex flex-col justify-between relative overflow-hidden flex-shrink-0 min-h-[160px]`}
                    >
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition-colors" />
                      )}
                      <span className="text-[10px] font-black text-white bg-slate-900/35 backdrop-blur-md px-2 py-0.5 rounded-md w-fit z-10">
                        {video.duration}
                      </span>

                      {/* Play Trigger */}
                      <button
                        onClick={() => handleOpenVideo(video)}
                        className="mx-auto my-auto p-4 rounded-full bg-white/95 text-blue-600 hover:scale-110 shadow-lg transition-transform z-10"
                        aria-label="Play video testimonial"
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-heading text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-2">{video.speaker}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {video.details}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenVideo(video)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-4"
                      >
                        Watch Story <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Written Feed Panel */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Filters Sidebar */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 h-fit space-y-6">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Filter Feed
                </h3>

                {/* Search Input */}
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                {/* Rating Stars Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ratings</h4>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "All Ratings", value: "all" },
                      { label: "5 Stars Only", value: 5 },
                      { label: "4 Stars & Up", value: 4 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setRatingFilter(item.value as any)}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          ratingFilter === item.value
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{item.label}</span>
                        {typeof item.value === "number" && (
                          <div className="flex text-amber-400 gap-0.5">
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonial List Grid */}
              <div className="lg:col-span-9 space-y-6">
                {filteredReviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-xs hover:border-blue-100 transition-colors"
                      >
                        <div className="space-y-4">
                          {/* Rating */}
                          <div className="flex text-amber-400 gap-0.5">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed font-semibold italic">
                            &ldquo;{rev.quote}&rdquo;
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                          <div>
                            <cite className="not-italic font-heading text-sm font-extrabold text-slate-900 block">
                              {rev.author}
                            </cite>
                            <span className="text-xs text-slate-400 font-bold block mt-0.5">
                              {rev.role}
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold bg-slate-50 border border-slate-100 text-slate-400 uppercase px-2.5 py-1 rounded-md tracking-wider">
                            {rev.region}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-500">No written reviews match filters.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setRatingFilter("all");
                      }}
                      className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clear search filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Video Modal Player */}
      <AnimatePresence>
        {videoModalOpen && activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 w-full max-w-2xl text-white relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-400 fill-current" />
                  <span className="text-xs font-bold text-slate-300 truncate max-w-sm">
                    {activeVideo.title}
                  </span>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {activeVideo.videoUrl ? (
                (() => {
                  const url = activeVideo.videoUrl;
                  let embedUrl: string | null = null;
                  if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
                  } else if (url.includes("vimeo.com")) {
                    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
                    if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
                  }

                  return embedUrl ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={embedUrl}
                        title={activeVideo.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={activeVideo.videoUrl}
                      poster={activeVideo.thumbnail || undefined}
                      controls
                      autoPlay
                      className="aspect-video w-full bg-black"
                    />
                  );
                })()
              ) : (
                <div className="aspect-video bg-gradient-to-tr from-slate-950 to-slate-900 flex flex-col items-center justify-center relative p-8 text-center">
                  <div className="p-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 animate-pulse">
                    <Play className="h-8 w-8 fill-current ml-1" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white max-w-md">
                    &ldquo;{activeVideo.title}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    Speaker: {activeVideo.speaker} ({activeVideo.details})
                  </p>

                  <div className="absolute bottom-4 left-6 right-6 flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>01:15</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <span>{activeVideo.duration}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
