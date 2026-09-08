"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "./LanguageContext";

export default function WhatsAppButton() {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const whatsappNumber = "442079460192";
  const defaultMessage = encodeURIComponent(
    "Hi Meru Global Team, I would like to inquire about your programs and global initiatives."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-xl transition-colors duration-300"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Custom official WhatsApp SVG Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="w-6 h-6 flex-shrink-0"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.993C16.255 1.87 13.78 .836 11.144.836 5.71.836 1.284 5.256 1.28 10.7c-.001 1.716.452 3.39 1.312 4.869L1.642 20.4l5.005-1.246zm12.518-7.39c-.318-.159-1.884-.93-2.176-1.037-.291-.106-.503-.159-.715.159-.211.318-.819 1.037-1.004 1.249-.186.212-.371.238-.689.079-.318-.159-1.341-.494-2.555-1.577-.945-.843-1.583-1.885-1.768-2.203-.186-.318-.02-.489.139-.648.143-.142.318-.371.477-.556.16-.186.212-.318.318-.53.106-.212.053-.4-.027-.558-.079-.16-.715-1.724-.98-2.361-.258-.62-.52-.536-.715-.546-.185-.01-.397-.012-.609-.012s-.556.08-.847.397c-.291.317-1.11 1.084-1.11 2.643 0 1.558 1.137 3.064 1.296 3.277.159.213 2.238 3.418 5.42 4.793.757.327 1.348.522 1.808.669.76.241 1.452.207 2.001.125.612-.092 1.884-.77 2.148-1.478.265-.707.265-1.314.186-1.439-.079-.125-.291-.204-.61-.363z" />
        </svg>

        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-bold tracking-wide whitespace-nowrap overflow-hidden pr-1"
            >
              {t("contact.whatsapp")}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.a>
    </div>
  );
}
