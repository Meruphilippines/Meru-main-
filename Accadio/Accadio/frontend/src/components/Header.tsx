"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ChevronDown, Globe, Compass, Users, Sparkles, BookOpen, Clock, Landmark, MessageSquare, Newspaper, Mail } from "lucide-react";
import Logo from "./Logo";
import { languageOptions, useTranslation } from "./LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
    setLanguageMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Disable scroll when mobile drawer or search is open
  useEffect(() => {
    if (isOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, searchOpen]);

  // Handle Search items database
  const searchItems = [
    { title: "Programs Overview", category: "Programs", path: "/programs", desc: "View all global capabilities and program list." },
    { title: "Global Exchange Initiatives", category: "Programs", path: "/programs?cat=exchange", desc: "International cultural and educational exchange pathways." },
    { title: "Corporate Excellence Development", category: "Programs", path: "/programs?cat=corporate", desc: "Professional skills, management, and executive training." },
    { title: "Youth Leadership Summit", category: "Programs", path: "/programs?cat=youth", desc: "Empowering next-generation civic and social leaders." },
    { title: "Our Founding Story", category: "History", path: "/history", desc: "How Meru Global Team started and expanded." },
    { title: "Milestones Timeline", category: "History", path: "/history#timeline", desc: "Interactive map of our growth milestones." },
    { title: "Leadership Team", category: "About", path: "/about#leadership", desc: "Meet our directors, regional leads, and visionaries." },
    { title: "Organizational Chart", category: "About", path: "/about#structure", desc: "View Meru's functional departments." },
    { title: "Video Testimonials", category: "Testimonials", path: "/testimonials#videos", desc: "Hear stories from our global program alumni." },
    { title: "Events Calendar", category: "News", path: "/news#calendar", desc: "Upcoming global webinars, summits, and drives." },
    { title: "Press Releases", category: "News", path: "/news#press", desc: "Official media coverage and announcements." },
    { title: "Office Locations", category: "Contact", path: "/contact#locations", desc: "Addresses and contacts in US, London, Tokyo, Singapore." },
    { title: "Registrations & Admissions", category: "Contact", path: "/contact", desc: "Enroll in upcoming semesters and courses." },
  ];

  const filteredSearch = searchQuery.trim() === ""
    ? []
    : searchItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSearchNavigate = (path: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  const currentLanguage = languageOptions.find((option) => option.code === language) ?? languageOptions[0];

  const handleLanguageSelect = (code: (typeof languageOptions)[number]["code"]) => {
    setLanguage(code);
    setLanguageMenuOpen(false);
  };

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    {
      name: t("nav.about"),
      path: "/about",
      hasMega: true,
      dropdownKey: "about",
      megaItems: [
        { title: "Profile & Philosophy", desc: "Our core vision, mission, and guiding metrics.", path: "/about", icon: Compass },
        { title: "Leadership Team", desc: "Meet the executive board and global directors.", path: "/about#leadership", icon: Users },
        { title: "Organizational Structure", desc: "Our framework for scaling global impact.", path: "/about#structure", icon: Sparkles },
      ]
    },
    {
      name: t("nav.programs"),
      path: "/programs",
      hasMega: true,
      dropdownKey: "programs",
      megaItems: [
        { title: "All Programs", desc: "Explore our catalog of certified learning tracks.", path: "/programs", icon: BookOpen },
        { title: "Global Exchange", desc: "Cross-border academic and cultural exchanges.", path: "/programs?cat=exchange", icon: Globe },
        { title: "Corporate Excellence", desc: "Executive training and corporate governance.", path: "/programs?cat=corporate", icon: Landmark },
      ]
    },
    { name: t("nav.history"), path: "/history" },
    { name: t("nav.testimonials"), path: "/testimonials" },
    { name: t("nav.news"), path: "/news" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo variant="horizontal" iconSize={52} animateGlobe={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div
                  key={link.path}
                  className="relative"
                  onMouseEnter={() => link.hasMega && setActiveDropdown(link.dropdownKey)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 hover:bg-slate-50 ${
                      pathname === link.path
                        ? "text-blue-600 bg-blue-50/50"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {link.name}
                    {link.hasMega && (
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200" />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {link.hasMega && activeDropdown === link.dropdownKey && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 mt-1 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 grid gap-2 z-50"
                      >
                        {link.megaItems?.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={item.title}
                              href={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Header Right Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                aria-label="Search site"
              >
                <Search className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                  aria-label="Choose language"
                  aria-expanded={languageMenuOpen}
                >
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  {currentLanguage.shortLabel}
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${languageMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {languageMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50"
                    >
                      {languageOptions.map((option) => (
                        <button
                          key={option.code}
                          onClick={() => handleLanguageSelect(option.code)}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                            language === option.code
                              ? "text-blue-600 bg-blue-50"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Actions (Hamburger + Search + Language) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={() => setLanguageMenuOpen((open) => !open)}
                className="p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Choose language"
              >
                <Globe className="h-5 w-5 text-blue-600" />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-20 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-y-0 right-0 top-20 z-30 w-full max-w-sm bg-white shadow-xl flex flex-col border-l border-slate-100 lg:hidden"
              >
                <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Language</p>
                    <div className="grid grid-cols-2 gap-2">
                      {languageOptions.map((option) => (
                        <button
                          key={option.code}
                          onClick={() => handleLanguageSelect(option.code)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            language === option.code
                              ? "text-blue-600 bg-blue-50 border border-blue-100"
                              : "text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <div key={link.path} className="border-b border-slate-100 pb-3">
                        <Link
                          href={link.path}
                          className={`text-lg font-bold block ${
                            pathname === link.path ? "text-blue-600" : "text-slate-800"
                          }`}
                        >
                          {link.name}
                        </Link>
                        {link.hasMega && (
                          <div className="mt-2 pl-4 grid gap-2">
                            {link.megaItems?.map((subItem) => (
                              <Link
                                key={subItem.title}
                                href={subItem.path}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-800 py-1 block"
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Global Interactive Command Palette (Search Dialog) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-24 px-4"
          >
            {/* Click outer to close */}
            <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Search Bar */}
              <div className="flex items-center border-b border-slate-100 px-5 py-4">
                <Search className="h-5 w-5 text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-slate-800 placeholder-slate-400 border-none outline-hidden text-base bg-transparent font-medium"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm font-medium">Type to search the Meru portal...</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md mx-auto">
                      {["Programs", "Milestones", "Leadership", "Offices", "Events"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredSearch.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
                      Results ({filteredSearch.length})
                    </p>
                    {filteredSearch.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchNavigate(item.path)}
                        className="w-full text-left flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors mt-0.5">
                          {item.category === "Programs" && <BookOpen className="h-4.5 w-4.5" />}
                          {item.category === "History" && <Clock className="h-4.5 w-4.5" />}
                          {item.category === "About" && <Users className="h-4.5 w-4.5" />}
                          {item.category === "News" && <Newspaper className="h-4.5 w-4.5" />}
                          {item.category === "Contact" && <Mail className="h-4.5 w-4.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm font-medium">No results found for &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-xs mt-1">Try searching with a different term.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Language Picker */}
      <AnimatePresence>
        {languageMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end justify-center px-4 pb-8 lg:hidden"
          >
            <div className="absolute inset-0" onClick={() => setLanguageMenuOpen(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-bold text-slate-800">Choose Language</p>
                <button
                  onClick={() => setLanguageMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => handleLanguageSelect(option.code)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      language === option.code
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
