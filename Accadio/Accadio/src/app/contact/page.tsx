"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Office {
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

interface ContactDetails {
  phone: string;
  email: string;
  address: string;
  socialLinks: Record<string, string>;
  googleMapsEmbed: string;
  offices: Office[];
}

function ContactForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "general",
    message: "",
  });

  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);

  // Fetch dynamic contact data & offices from database API
  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.offices) {
          setContactDetails(data);
        }
      })
      .catch((err) => console.error("Error fetching contact details:", err));
  }, []);

  // Auto-populate program from query string if passing from Programs page
  useEffect(() => {
    const programName = searchParams.get("program");
    if (programName) {
      setFormData((prev) => ({
        ...prev,
        department: "admissions",
        message: `Hi Admissions Board, I am writing to register for the "${programName}" course. Please provide the syllabus, enrollment schedule, and fee metrics.`,
      }));
    }
  }, [searchParams]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setFormSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "general",
          message: "",
        });
      } else {
        setFormError(data.error || "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setFormError("Network connection error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const fallbackOffices = [
    {
      city: "London (HQ)",
      address: "120 St James's Square, London, SW1Y 4JH",
      phone: "+44 20 7946 0192",
      email: "london.hq@meruglobal.org",
      hours: "9:00 AM - 5:30 PM GMT",
    },
    {
      city: "Singapore (Asia Hub)",
      address: "10 Anson Rd, International Plaza, Singapore 079903",
      phone: "+65 6789 0122",
      email: "singapore.ops@meruglobal.org",
      hours: "9:00 AM - 6:00 PM SGT",
    },
    {
      city: "Bogota (LATAM Hub)",
      address: "Cra. 11 #78-22, Bogota, Colombia",
      phone: "+57 601 456 7890",
      email: "bogota.ops@meruglobal.org",
      hours: "8:00 AM - 5:00 PM COT",
    },
    {
      city: "Tokyo Office",
      address: "1-chome, Shinjuku, Shinjuku City, Tokyo 160-0022",
      phone: "+81 3 5555 0143",
      email: "tokyo.relations@meruglobal.org",
      hours: "9:00 AM - 6:00 PM JST",
    },
  ];

  const offices = contactDetails?.offices || fallbackOffices;

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Contact Portal
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Connect with Our Boards
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Select specific departments for admissions, partnerships, technical support, or regional coordinates.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
          <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Advanced Inquiry Form
          </h2>

          {formError && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800"
            >
              <p className="text-sm font-bold flex items-center gap-2">✓ {t("contact.success")}</p>
              <p className="text-xs mt-1.5 text-emerald-600 leading-relaxed font-semibold">
                Your ticket has been logged directly into our system and forwarded to the designated department. A representative will follow up via email shortly.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-xs font-bold underline hover:text-emerald-950"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-600">{t("contact.name")}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Jane Doe"
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
                    placeholder="jane@example.com"
                    className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-600">{t("contact.phone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+1 (555) 000-0000"
                    className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-600">{t("contact.department")}</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:border-blue-600 font-semibold"
                  >
                    <option value="general">{t("contact.dept1")}</option>
                    <option value="admissions">{t("contact.dept2")}</option>
                    <option value="press">{t("contact.dept3")}</option>
                    <option value="support">{t("contact.dept4")}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-600">{t("contact.message")}</label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="How can our board assist you?"
                  className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:bg-slate-200 shadow-lg hover:shadow-blue-600/10"
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

        {/* Right Column: Direct Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Help Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-lg border border-slate-800">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Immediate Support
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              If you have urgent enrollment queries or travel coordinate emergencies for exchange semesters, please contact our 24/7 central desk.
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-2">
                <Phone className="h-4.5 w-4.5 text-emerald-500" />
                Direct Hotline: {contactDetails?.phone || "+44 20 7946 0192"}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-blue-400" />
                Support Ticket: {contactDetails?.email || "admissions@meruglobal.org"}
              </span>
            </div>
            <a
              href="https://wa.me/442079460192"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Start WhatsApp Live Chat
            </a>
          </div>

          {/* Social connections */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-xs">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Stay Connected
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Follow our executive board announcements and annual civic fellowship directories online.
            </p>
            <div className="flex gap-2">
              <a
                href={contactDetails?.socialLinks?.linkedin || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
              <a
                href={contactDetails?.socialLinks?.twitter || "https://twitter.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
                Twitter / X
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Coordinates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
            Regional Coordinates
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Hubs Around the World
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offices.map((office) => (
            <div
              key={office.city}
              className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-xs hover:border-blue-100 transition-colors"
            >
              <div>
                <h3 className="font-heading text-base font-extrabold text-slate-900 mb-2">
                  {office.city}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
                  {office.address}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{office.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{office.email}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 font-bold">Hours: {office.hours}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
