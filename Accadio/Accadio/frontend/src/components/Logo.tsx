"use client";

import React from "react";
import Image from "next/image";
import MeruGlobe3D from "./MeruGlobe3D";

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  animateGlobe?: boolean;
  variant?: "horizontal" | "vertical" | "icon";
  hero3d?: boolean;
}

/** Official MERU logo aspect ratio (width / height) from brand asset */
const LOGO_ASPECT = 0.72;

export default function Logo({
  className = "",
  iconSize = 80,
  showText = true,
  animateGlobe = true,
  variant = "vertical",
  hero3d = false,
}: LogoProps) {
  const logoHeight =
    variant === "horizontal"
      ? Math.max(iconSize + 8, 52)
      : Math.round(iconSize * (hero3d ? 2.5 : 2.2));

  const logoWidth = Math.round(logoHeight * LOGO_ASPECT);

  const animationClass = animateGlobe
    ? hero3d
      ? ""
      : variant === "horizontal"
        ? "animate-meru-logo-subtle"
        : "animate-meru-logo-float"
    : "";

  if (hero3d && variant === "vertical" && showText) {
    const globeSize = Math.round(iconSize * 1.22);

    return (
      <div className={`flex flex-col items-center text-center select-none font-serif ${className}`}>
        <MeruGlobe3D size={globeSize} />
        <h1
          className="m-0 mt-5 mb-2 font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-400 to-indigo-400"
          style={{
            fontSize: "clamp(52px, 9vw, 88px)",
            letterSpacing: "0.18em",
          }}
        >
          MERU
        </h1>
        <p
          className="m-0 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300"
          style={{
            fontSize: "clamp(20px, 3.5vw, 36px)",
            letterSpacing: "0.04em",
          }}
        >
          Reaching The Unreached
        </p>
      </div>
    );
  }

  if (!showText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div
          className={`meru-logo-stage ${animationClass}`}
          style={{ width: logoWidth, height: logoHeight }}
        >
          <Image
            src="/images/meru-logo.png"
            alt="MERU"
            width={logoWidth}
            height={logoHeight}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className} ${
        variant === "vertical" ? "flex-col text-center" : ""
      }`}
    >
      <div
        className={`meru-logo-stage relative ${animationClass}`}
        style={{ width: logoWidth, height: logoHeight }}
      >
        <Image
          src="/images/meru-logo.png"
          alt="MERU — Reaching The Unreached"
          width={logoWidth}
          height={logoHeight}
          priority={hero3d}
          className="h-full w-full object-contain object-center"
        />
      </div>
    </div>
  );
}
