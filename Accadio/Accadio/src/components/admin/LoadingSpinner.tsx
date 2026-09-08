"use client";

import React from "react";

export default function LoadingSpinner({ size = "md", label }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} rounded-full border-slate-200 border-t-blue-600 animate-spin`}
      />
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
    </div>
  );
}
