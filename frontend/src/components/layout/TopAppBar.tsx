"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";

interface TopAppBarProps {
  subtitle?: string;
}

export default function TopAppBar({ subtitle }: TopAppBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    router.push("/auth/login");
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/send-money")) return "Transfer Hub";
    if (pathname.startsWith("/linked-wallets")) return "Wallets Vault";
    if (pathname.startsWith("/transactions")) return "Activity History";
    if (pathname.startsWith("/security-settings")) return "Security & Access";
    return "Portal";
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "F";
  const displayName = user?.name || "Account User";
  const displayPhone = user?.phone || "01XXXXXXXXX";

  return (
    <header className="md:hidden fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between relative">
        <Link href="/" className="flex items-center gap-space-sm">
          <div className="h-8 w-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-primary-container leading-none font-bold">CrossCash</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">{getSubtitle()}</span>
          </div>
        </Link>

        <div className="flex items-center gap-space-sm">
          <Link
            aria-label="Notifications"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors relative"
            href="/transactions"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
          </Link>

          {/* Profile Menu Toggle */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Account Profile Menu"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative flex items-center justify-center pl-space-xs p-1 focus:outline-none"
            >
              <div className="relative p-0.5 rounded-full bg-surface-container-high hover:ring-2 hover:ring-primary-container/40 transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {initial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center ring-2 ring-surface">
                  <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                </span>
              </div>
            </button>

            {/* Profile Dropdown Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 py-3 px-4 z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-title-md text-on-surface font-bold truncate">
                      {displayName}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {displayPhone}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary-container mt-0.5">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Verified Citizen
                    </span>
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="flex flex-col gap-1 py-1">
                  <Link
                    href="/security-settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-body-md text-body-md"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary">shield</span>
                    <span>Security & Biometrics</span>
                  </Link>
                  <Link
                    href="/linked-wallets"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-body-md text-body-md"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">account_balance_wallet</span>
                    <span>Linked Wallets</span>
                  </Link>
                  <Link
                    href="/transactions"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-body-md text-body-md"
                  >
                    <span className="material-symbols-outlined text-[20px] text-tertiary-container">receipt_long</span>
                    <span>Activity History</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-2 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-error-container/20 transition-colors font-title-md text-title-md font-bold text-left"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
