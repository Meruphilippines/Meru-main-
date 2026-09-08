"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Newspaper, Check, Send, Globe, Star } from "lucide-react";

export default function NewsPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  const newsArticles = [
    {
      id: 1,
      date: "May 28, 2026",
      category: "Expansion",
      title: "Meru Global Team Establishes Regional Center in Bogota",
      desc: "Our South American operations office is now fully staffed and coordinating with municipal education departments to roll out subsidized civic fellowships.",
      grad: "from-blue-400 to-indigo-500",
    },
    {
      id: 2,
      date: "May 15, 2026",
      category: "Admissions",
      title: "Announcing the 2026 Youth Civic Leadership Fellowship Roster",
      desc: "Following a record 4,200 applicants, our advisory board has finalized the 120 delegates who will receive seed grant credentials and 6 months of civic coaching.",
      grad: "from-purple-400 to-pink-500",
    },
    {
      id: 3,
      date: "April 10, 2026",
      category: "Partnerships",
      title: "Meru Partners with 12 New European Academic Councils",
      desc: "The joint agreement facilitates direct credit transfers and curriculum recognition, allowing exchange participants in Germany to earn ECTS credits smoothly.",
      grad: "from-emerald-400 to-teal-500",
    },
  ];

  const events = [
    {
      id: 1,
      day: "12",
      month: "JUN",
      title: "Tokyo Semester Orientation Webinar",
      time: "10:00 AM UTC",
      location: "Zoom Virtual Session",
      desc: "An introduction for enrolled Tokyo exchange students. We will cover housing coordinates, university schedules, and translation apps.",
    },
    {
      id: 2,
      day: "20",
      month: "JUN",
      title: "Executive Corporate Governance Round",
      time: "02:00 PM UTC",
      location: "London Headquarters / Hybrid",
      desc: "A closed-door audit workshop for partner compliance directors. Covers ESG modeling and local regulatory risk audits.",
    },
    {
      id: 3,
      day: "05",
      month: "JUL",
      title: "Civic Fellowship Launch Summit",
      time: "01:00 PM UTC",
      location: "Global Broadcast Hub",
      desc: "The official inauguration for our 2026 delegates. Keynote lectures on civic policy drafting and stakeholder engagement metrics.",
    },
  ];

  const mediaMentions = [
    { outlet: "World Education News", title: "Bridging the Gap: How Meru Reaches Remote Scholars", date: "April 2026" },
    { outlet: "Global Development Journal", title: "Subsidized Civic Networks as a Model for Youth Upliftment", date: "March 2026" },
    { outlet: "Corporate Compliance Weekly", title: "Next-Gen ESG Governance Frameworks in Practice", date: "February 2026" },
  ];

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Press & Events
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          News & Events Portal
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Get the latest updates on global office expansions, partnership press releases, and virtual orientation schedules.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: News Articles */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            Latest Announcements
          </h2>
          
          <div className="space-y-6">
            {newsArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-6"
              >
                {/* Visual date card */}
                <div className={`sm:w-36 h-28 bg-gradient-to-tr ${article.grad} rounded-2xl flex flex-col items-center justify-center text-white p-4 flex-shrink-0 shadow-xs relative`}>
                  <div className="absolute inset-0 bg-slate-950/10" />
                  <span className="text-xs font-black uppercase tracking-wider z-10">{article.category}</span>
                  <span className="text-[10px] text-white/80 font-bold mt-1 z-10">{article.date.split(",")[0]}</span>
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-snug hover:text-blue-600 transition-colors cursor-pointer">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-2">
                      {article.desc}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Published by Media Relations Board
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Events & Newsletter widgets */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Events Calendar Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-xs">
            <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="h-4.5 w-4.5 text-blue-600" />
              Events Calendar
            </h2>

            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event.title)}
                  className="flex gap-4 p-3 rounded-2xl border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all cursor-pointer group"
                >
                  {/* Calendar block */}
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex flex-col items-center justify-center flex-shrink-0 select-none">
                    <span className="text-sm font-black leading-none">{event.day}</span>
                    <span className="text-[8px] font-extrabold tracking-wider leading-none mt-0.5">{event.month}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Mention Links */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-xs">
            <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-100 pb-3">
              Media Mentions
            </h2>
            <div className="space-y-4 text-xs">
              {mediaMentions.map((mention, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">
                    {mention.outlet}
                  </span>
                  <a href="#" className="font-bold text-slate-800 hover:text-blue-600 hover:underline leading-snug block">
                    {mention.title}
                  </a>
                  <span className="text-[10px] text-slate-400 font-bold block">{mention.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-lg border border-slate-800">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Newsletter Signup
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Subscribe to get immediate notification on admissions orientations, global exchange deadlines, and program updates.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                ✓ Thank you! You have subscribed.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:bg-slate-800"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Event Details Dialog Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Click outer to close */}
            <div className="absolute inset-0" onClick={() => setSelectedEvent(null)} />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-3 py-1 rounded-full tracking-wider">
                  Session Reservation
                </span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <Calendar className="h-4.5 w-4.5" />
                </button>
              </div>

              <div>
                <h3 className="font-heading text-lg font-extrabold text-slate-900">
                  {selectedEvent}
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2">
                  {events.find((ev) => ev.title === selectedEvent)?.desc || "Join our upcoming orientation review led by regional program leads and alumni coordinators."}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs text-slate-600 font-bold border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Time: {events.find((ev) => ev.title === selectedEvent)?.time || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Platform: {events.find((ev) => ev.title === selectedEvent)?.location || "Virtual Zoom"}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors text-center"
              >
                Register & Save Seat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
