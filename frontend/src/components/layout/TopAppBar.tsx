"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/session";

interface TopAppBarProps {
  subtitle?: string;
}

export default function TopAppBar({ subtitle }: TopAppBarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/send-money")) return "Transfer Hub";
    if (pathname.startsWith("/linked-wallets")) return "Wallets Vault";
    if (pathname.startsWith("/transactions")) return "Activity History";
    if (pathname.startsWith("/security-settings")) return "Crosscash Security Settings";
    return "Portal";
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "F";

  return (
    <header className="md:hidden fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between">
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
          <Link
            aria-label="Profile & Security Settings"
            className="relative flex items-center justify-center pl-space-xs"
            href="/security-settings"
          >
            <div className="relative p-0.5 rounded-full bg-surface-container-high">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-white font-bold text-xs">
                {initial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center ring-2 ring-surface">
                <span className="material-symbols-outlined text-[10px] font-bold">check</span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
