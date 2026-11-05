import React from "react";

interface WalletLogoProps {
  provider: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const SIZE_MAP = {
  xs: "w-5 h-5",
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export default function WalletLogo({ provider, className = "", size = "md" }: WalletLogoProps) {
  const norm = provider.toLowerCase();
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  if (norm.includes("bkash")) {
    return (
      <div className={`relative flex items-center justify-center p-1 rounded-xl bg-white shadow-xs border border-pink-100 shrink-0 ${sizeClass} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/bkash.png"
          alt="bKash"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (norm.includes("nagad")) {
    return (
      <div className={`relative flex items-center justify-center p-1 rounded-xl bg-white shadow-xs border border-orange-100 shrink-0 ${sizeClass} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/nagad.png"
          alt="Nagad"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (norm.includes("rocket") || norm.includes("dbbl")) {
    return (
      <div className={`relative flex items-center justify-center p-1 rounded-xl bg-white shadow-xs border border-purple-100 shrink-0 ${sizeClass} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/rocket.png"
          alt="Rocket"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Commercial Bank Fallback
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-blue-50 text-blue-700 shadow-xs border border-blue-100 shrink-0 ${sizeClass} ${className}`}>
      <span className="material-symbols-outlined text-[20px]">account_balance</span>
    </div>
  );
}

