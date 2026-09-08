"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Compass, Sparkles, Award, ShieldCheck, HeartHandshake, Target, ChevronRight, Briefcase, Network } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export default function AboutPage() {
  const { t } = useTranslation();
  const [selectedDept, setSelectedDept] = useState<string>("executive");

  // Leadership team data
  const leaders = [
    {
      name: "Dr. Alistair Meru",
      role: "Founder & Chief Executive Officer",
      bio: "Former UN education consultant and capability development specialist. Dr. Alistair founded Meru Global Team to bridge resource gaps in emerging economies.",
      initial: "A",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      name: "Maria C. Santos",
      role: "Director of Global Operations",
      bio: "Spearheads operational logistics across 45+ countries. Over 15 years of experience setting up academic exchange networks in Latin America and the EU.",
      initial: "M",
      gradient: "from-pink-500 to-purple-600",
    },
    {
      name: "Kenji Tanaka",
      role: "Director of Academic Relations",
      bio: "Liaises with partner institutions and academic boards globally. Oversees certification approvals and curriculum alignments with international standards.",
      initial: "K",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      name: "Amb. Sarah Jenkins",
      role: "Global Youth Ambassador Lead",
      bio: "Advocates for civic youth empowerment at international forums. Leads recruitment for the annual Civic Leadership Summit and regional workshops.",
      initial: "S",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  // Org chart departments data
  const departments = {
    executive: {
      name: "Executive Board",
      desc: "Sets the long-term vision, manages capital allocation, and establishes major international partnerships.",
      lead: "Dr. Alistair Meru (CEO)",
      responsibilities: ["Strategic Planning", "Legal & Compliance", "Board Partnerships", "Fund Management"],
    },
    operations: {
      name: "Global Operations",
      desc: "Handles regional office coordinators, program logistics, event setups, and day-to-day delivery metrics.",
      lead: "Maria C. Santos (COO)",
      responsibilities: ["Regional Office Support", "Field Logistics", "Language & Translation Services", "Local Compliance"],
    },
    academic: {
      name: "Research & Academic Council",
      desc: "Curates lesson architectures, establishes certification credentials, and verifies university course alignments.",
      lead: "Kenji Tanaka (CAO)",
      responsibilities: ["Curriculum Quality", "Instructor Certifications", "Credit Transfer Coordination", "Scholarship Allocation"],
    },
    admissions: {
      name: "Public Admissions & Marketing",
      desc: "Manages student enrollments, partner sponsorships, website information hubs, and student support inquiries.",
      lead: "Marcus Vance (Director of Admissions)",
      responsibilities: ["Student Onboarding", "Support Desk", "Corporate Partner Enrollment", "Brochure Distribution"],
    },
  };

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Organization Profile
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Meru Global Team
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Reaching the unreached, Connecting generations to the great commission.
        </p>
      </div>

      {/* 1. Core Profile Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-center">
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Our Founding Purpose & Global Reach
          </h2>
          <p className="text-slate-500 leading-relaxed font-medium">
            The MERU Global Team is committed to carrying Christ’s name into places where He is yet unknown. Our focus is on building strong foundations in the Word of God, equipping believers to live out their faith and share the Gospel across nations.
          </p>
          <p className="text-slate-500 leading-relaxed font-medium">
            By connecting people worldwide to the Great Commission, MERU empowers Christians of every generation in their faith and to become witnesses of Christ’s love in communities that remain unreached..
          </p>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div>
              <span className="block text-2xl font-heading font-black text-blue-600">2012</span>
              <span className="text-xs text-slate-400 font-bold uppercase">Founded</span>
            </div>
            <div>
              <span className="block text-2xl font-heading font-black text-[#9d174d]">45+</span>
              <span className="text-xs text-slate-400 font-bold uppercase">Countries Active</span>
            </div>
            <div>
              <span className="block text-2xl font-heading font-black text-emerald-600">10k+</span>
              <span className="text-xs text-slate-400 font-bold uppercase">Alumni Base</span>
            </div>
          </div>
        </div>

        {/* Visual Card */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-radial from-blue-100/50 to-transparent blur-2xl -z-10 rounded-full"></div>
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-lg flex flex-col space-y-6">
            <h3 className="font-heading text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Strategic Anchors
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">1</span>
                <div>
                  <h4 className="font-bold text-slate-800">Training Programs</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Equipping beliverswith biblicalknowledge, cross-cultural skills, and practical tools to stand firm in faith and share the gospel effectively.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">2</span>
                <div>
                  <h4 className="font-bold text-slate-800">Conferences</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Gathering christians from across nations and generations to be inspired, strengthened, and mobilized for the freat commission through teaching , worship,and fellowship.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">3</span>
                <div>
                  <h4 className="font-bold text-slate-800">Building bridges</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Building connections across cultures, denominations, and organizations to open pathways for mission work and foster unity in reaching the unreached</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Interactive Organizational Structure */}
      <section id="structure" className="py-20 bg-white border-y border-slate-100 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Corporate Governance
            </span>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
              Organizational Structure
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Click a department block to inspect our leadership team hierarchy and operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Interactive tree chart list */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              {Object.keys(departments).map((key) => {
                const isSelected = selectedDept === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDept(key)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between ${isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/10"
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Network className={`h-5 w-5 ${isSelected ? "text-white" : "text-blue-600"}`} />
                      <span className="font-heading text-base font-extrabold">
                        {departments[key as keyof typeof departments].name}
                      </span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${isSelected ? "translate-x-1" : ""}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Display Details */}
            <div className="lg:col-span-7 bg-slate-50/50 rounded-3xl border border-slate-100 p-8 min-h-[300px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDept}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-3 py-1 rounded-full tracking-wider">
                      Department Details
                    </span>
                    <h3 className="font-heading text-2xl font-extrabold text-slate-900 mt-4">
                      {departments[selectedDept as keyof typeof departments].name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed font-semibold">
                      {departments[selectedDept as keyof typeof departments].desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Officer</h4>
                      <p className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Users className="h-4.5 w-4.5 text-blue-600" />
                        {departments[selectedDept as keyof typeof departments].lead}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Core Operations</h4>
                      <ul className="space-y-1 mt-1.5">
                        {departments[selectedDept as keyof typeof departments].responsibilities.map((resp, i) => (
                          <li key={i} className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Leadership Team Grid */}
      <section id="leadership" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
            The Team
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
            Leadership Team
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            A network of global educators, policy advocates, and operations leads driving success.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {leaders.map((leader, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Leader visual cover */}
              <div className={`h-40 bg-gradient-to-br ${leader.gradient} flex items-center justify-center text-white text-5xl font-heading font-black relative`}>
                <span>{leader.initial}</span>
                <div className="absolute bottom-4 left-4 p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-3">
                <div>
                  <h4 className="font-heading text-base font-extrabold text-slate-950 leading-tight">
                    {leader.name}
                  </h4>
                  <span className="text-xs text-blue-600 font-bold block mt-0.5">
                    {leader.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold flex-1">
                  {leader.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
