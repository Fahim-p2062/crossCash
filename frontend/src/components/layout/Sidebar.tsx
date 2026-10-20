"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/session";
import { useLanguage } from "@/lib/language";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const displayName = user?.name || "Account User";
  const displayPhone = user?.phone ? `ID: ${user.phone}` : "ID: Verified";

  const navItems = [
    { href: "/", label: t("dashboard"), icon: "dashboard" },
    { href: "/transactions", label: t("transactions"), icon: "receipt_long" },
    { href: "/linked-wallets", label: t("linkedWallets"), icon: "account_balance" },
    { href: "/security-settings", label: t("securitySettings"), icon: "shield" },
  ];

  return (
    <aside className="hidden md:flex h-full w-80 rounded-r-xl bg-surface-container-low shadow-xl flex-col p-md fixed inset-y-0 left-0 z-[60]">
      {/* Header / Profile Area */}
      <div className="flex items-center gap-4 mb-8 p-4">
        <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-lg shadow-sm border border-outline-variant">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <h2 className="font-headline-md text-headline-md text-primary font-bold truncate">
            {displayName}
          </h2>
          <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            {t("verified")}
          </div>
          <div className="font-label-sm text-label-sm text-outline mt-0.5">{displayPhone}</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/40 space-y-2">
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container/20 transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-body-md text-body-md flex-1 text-left font-bold">{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
