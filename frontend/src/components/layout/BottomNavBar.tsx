"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: "Dashboard", href: "/", icon: "home" },
    { label: "Transfer", href: "/send-money", icon: "swap_horiz" },
    { label: "Wallets", href: "/linked-wallets", icon: "account_balance_wallet" },
    { label: "Activity", href: "/transactions", icon: "receipt_long" },
    { label: "Security", href: "/security-settings", icon: "verified_user" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(15,23,42,0.04)] border-t border-outline-variant/20">
      <div className="flex justify-around items-center h-16 px-space-2xs">
        {navItems.map((item) => {
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-space-2xs w-14 sm:w-16 h-12 transition-all ${
                active
                  ? "text-primary-container font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-[11px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
