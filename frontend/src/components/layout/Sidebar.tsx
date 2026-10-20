"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";
import { useLanguage } from "@/lib/language";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const displayName = user?.name || "Account User";
  const displayPhone = user?.phone ? user.phone : "01XXXXXXXXX";
  const initial = displayName.charAt(0).toUpperCase();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "home" },
    { href: "/send-money", label: "Transfer", icon: "swap_horiz" },
    { href: "/linked-wallets", label: "Wallets", icon: "account_balance_wallet" },
    { href: "/transactions", label: "Activity", icon: "receipt_long" },
    { href: "/security-settings", label: "Security", icon: "verified_user" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <aside className="hidden md:flex h-full w-72 lg:w-80 rounded-r-2xl bg-surface-container-low/95 backdrop-blur-xl border-r border-outline-variant/30 shadow-lg flex-col p-6 fixed inset-y-0 left-0 z-[60]">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 pb-5 border-b border-outline-variant/30 group">
        <img
          src="/logo.png"
          alt="CrossCash"
          className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-outline-variant/20 group-hover:scale-105 transition-transform"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-title-lg text-title-lg text-primary font-bold tracking-tight">CrossCash</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[9px] font-bold uppercase">
              Live
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Interoperable Portal</span>
        </div>
      </Link>

      {/* Profile Card */}
      <div className="flex items-center gap-3.5 my-5 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 shadow-xs">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-white font-bold text-base shadow-sm">
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center ring-2 ring-surface text-[9px] font-bold">
            ✓
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface font-bold truncate">
              {displayName}
            </h2>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
            ID: {displayPhone}
          </div>
          <div className="font-label-md text-[11px] text-tertiary font-medium flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            Tier 2 KYC Verified
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
        <div className="px-3 pb-1 text-[11px] font-bold text-outline uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white font-bold shadow-sm"
                  : "text-on-surface hover:bg-surface-container-high/70"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-primary-container"}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body-md text-body-md flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Area */}
      <div className="mt-auto pt-4 pb-4 mb-2 border-t border-outline-variant/30 space-y-3">
        {/* Language Switcher */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Language</span>
          <div className="inline-flex items-center rounded-full bg-surface-container-high p-0.5">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                language === "en" ? "bg-surface text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                language === "bn" ? "bg-surface text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              BN
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3.5 py-2.5 rounded-xl text-error hover:bg-error-container/30 transition-colors duration-150 font-bold"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-body-md text-body-md flex-1 text-left">{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
