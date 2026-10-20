"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Wallet } from "@/types";

export default function MobileLinkedWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(13485);
  const [allHidden, setAllHidden] = useState(false);
  const [hiddenCards, setHiddenCards] = useState<Record<string, boolean>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [defaultSendWallet, setDefaultSendWallet] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    let isMounted = true;

    apiRequest<BalanceResponse>(`/api/user/${user._id}/balance?_t=${Date.now()}`)
      .then((data) => {
        if (!isMounted) return;
        if (data.wallets && data.wallets.length > 0) {
          setWallets(data.wallets);
          setTotalBalance(data.totalBalance);
        }
      })
      .catch(() => {})
      .finally(() => {});

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleAll = () => {
    setAllHidden((prev) => !prev);
  };

  const toggleCard = (id: string) => {
    setHiddenCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1000);
  };

  const getWalletBalance = (provider: string, fallback: number) => {
    const w = wallets.find((item) => item.provider.toLowerCase() === provider.toLowerCase());
    return w ? w.balance : fallback;
  };

  const bkashBalance = getWalletBalance("bKash", 8485);
  const nagadBalance = getWalletBalance("Nagad", 1000);
  const rocketBalance = getWalletBalance("Rocket", 4000);
  const phone = user?.phone || "01777885053";

  return (
    <div className="flex flex-col w-full px-margin md:px-0 pb-space-2xl space-y-space-lg pt-2">
      {/* Header Intro & Delight Micro-Badge */}
      <div className="flex flex-col gap-space-2xs mt-space-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            Vault Sync Active
          </span>
          <button
            onClick={toggleAll}
            className="flex items-center gap-1 text-primary-container font-label-md text-label-md px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
            id="toggle-all-balances"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {allHidden ? "visibility_off" : "visibility"}
            </span>
            <span>{allHidden ? "Show Figures" : "Hide Figures"}</span>
          </button>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Linked Wallets & Accounts</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage your connected Mobile Financial Services & Banks
        </p>
      </div>

      {/* Aggregated Liquidity Bar with Interactive Micro-meter */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-md">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col gap-space-sm relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
                Total Liquidity Pool
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-on-tertiary-container font-label-md text-label-md font-semibold">
              4 Rails Active
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-currency-display text-currency-display text-on-surface tracking-tight">
              {allHidden ? "••••••••" : formatMoney(totalBalance)}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">BDT</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Aggregated across <strong className="text-on-surface font-semibold">3 MFS wallets</strong> &{" "}
            <strong className="text-on-surface font-semibold">1 Commercial Bank</strong>
          </p>
          {/* Multi-rail Breakdown Segment Visualizer */}
          <div className="w-full flex flex-col gap-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
              <div className="h-full bg-primary-container" style={{ width: "63%" }} title="bKash (63%)"></div>
              <div className="h-full bg-secondary" style={{ width: "29%" }} title="Rocket (29%)"></div>
              <div className="h-full bg-tertiary-container" style={{ width: "8%" }} title="Nagad (8%)"></div>
            </div>
            <div className="flex items-center justify-between font-label-md text-label-md text-on-surface-variant text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-container inline-block"></span> bKash ৳8.4k
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> Rocket ৳4.0k
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary-container inline-block"></span> Nagad ৳1.0k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Routing Banner */}
      <div className="rounded-xl bg-surface-container-high p-space-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-title-md text-title-md text-on-surface truncate">Default Send Wallet</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Auto-routed via bKash Personal
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
          <input
            type="checkbox"
            checked={defaultSendWallet}
            onChange={(e) => setDefaultSendWallet(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
        </label>
      </div>

      {/* Linked Accounts List */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">Connected Accounts</h2>
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">Synced 2m ago</span>
        </div>

        {/* Card 1: bKash (Primary) */}
        <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-md flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-[#E2136E]/10 flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="font-headline-md text-headline-md font-black text-[#E2136E]">bK</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
                  <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <h3 className="font-title-md text-title-md text-on-surface">bKash</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-md text-[10px] font-bold uppercase tracking-wider">
                    PRIMARY WALLET
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Personal Account • {phone}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md font-semibold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
              Active
            </span>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Available Balance
              </span>
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {allHidden || hiddenCards["bkash"] ? "••••••••" : formatMoney(bkashBalance)}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCard("bkash")}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {allHidden || hiddenCards["bkash"] ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-md text-label-md text-primary-container font-semibold">
                Instant Interoperable
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">NPSB Rail Enabled</p>
            </div>
          </div>

          {/* Quick Actions bKash */}
          <div className="grid grid-cols-3 gap-space-xs pt-1">
            <button
              type="button"
              className="py-2.5 px-1 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col items-center justify-center gap-1 text-center"
            >
              <span className="material-symbols-outlined text-[18px] text-primary-container">star</span>
              <span className="font-label-md text-label-md text-on-surface leading-tight">Default</span>
            </button>
            <button
              type="button"
              className="py-2.5 px-1 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col items-center justify-center gap-1 text-center"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
              <span className="font-label-md text-label-md text-on-surface leading-tight">View Limits</span>
            </button>
            <button
              type="button"
              className="py-2.5 px-1 rounded-lg bg-error-container/40 hover:bg-error-container transition-colors flex flex-col items-center justify-center gap-1 text-center"
            >
              <span className="material-symbols-outlined text-[18px] text-error">link_off</span>
              <span className="font-label-md text-label-md text-error leading-tight font-semibold">Unlink</span>
            </button>
          </div>
        </div>

        {/* Card 2: Nagad */}
        <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-md flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F7941D]/15 flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="font-headline-md text-headline-md font-black text-[#D96B00]">NG</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
                  <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-title-md text-title-md text-on-surface">Nagad</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Personal Account • {phone}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md font-semibold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
              Active • Verified
            </span>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Available Balance
              </span>
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {allHidden || hiddenCards["nagad"] ? "••••••••" : formatMoney(nagadBalance)}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCard("nagad")}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {allHidden || hiddenCards["nagad"] ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-md text-label-md text-secondary font-semibold">Postal Rail Active</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Free Cross-Transfer</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-sm pt-1">
            <Link
              href="/send-money"
              className="py-2.5 px-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span className="font-title-md text-title-md font-medium text-sm">Send Money</span>
            </Link>
            <button
              type="button"
              onClick={() => handleSync("nagad")}
              className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center gap-2"
            >
              <span
                className={`material-symbols-outlined text-[18px] text-secondary ${
                  syncingId === "nagad" ? "animate-spin" : ""
                }`}
              >
                sync
              </span>
              <span className="font-title-md text-title-md font-medium text-sm">Sync Balance</span>
            </button>
          </div>
        </div>

        {/* Card 3: Rocket (DBBL) */}
        <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-md flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-[#8C3494]/15 flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="font-headline-md text-headline-md font-black text-[#8C3494]">RK</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
                  <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-title-md text-title-md text-on-surface">Rocket (DBBL)</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Personal Account • {phone}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md font-semibold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
              Active • Verified
            </span>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Available Balance
              </span>
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {allHidden || hiddenCards["rocket"] ? "••••••••" : formatMoney(rocketBalance)}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCard("rocket")}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {allHidden || hiddenCards["rocket"] ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-md text-label-md text-primary font-semibold">DBBL Core Linked</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Instant Bridge</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-sm pt-1">
            <Link
              href="/send-money"
              className="py-2.5 px-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span className="font-title-md text-title-md font-medium text-sm">Send Money</span>
            </Link>
            <button
              type="button"
              onClick={() => handleSync("rocket")}
              className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center gap-2"
            >
              <span
                className={`material-symbols-outlined text-[18px] text-secondary ${
                  syncingId === "rocket" ? "animate-spin" : ""
                }`}
              >
                sync
              </span>
              <span className="font-title-md text-title-md font-medium text-sm">Sync Balance</span>
            </button>
          </div>
        </div>

        {/* Card 4: City Bank Ltd (Bank Bridge) */}
        <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-md flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] text-primary-container">account_balance</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-title-md text-title-md text-on-surface">City Bank Ltd</h3>
                  <span className="px-1.5 py-0.2 bg-secondary-container text-on-secondary-container rounded font-label-md text-[10px] font-semibold">
                    NPSB/RTGS
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Savings Account • •••• 4892</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[14px]">link</span>
              Auto-Debit
            </span>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                <span className="material-symbols-outlined text-[18px]">add_task</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface text-sm">Direct Add Funds Enabled</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                  Instant settlement without daily MFS limits
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-sm pt-1">
            <Link
              href="/"
              className="flex-1 py-2.5 px-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span className="font-title-md text-title-md font-medium text-sm">Pull Funds to CrossCash</span>
            </Link>
            <button
              type="button"
              className="w-11 h-11 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center shrink-0"
              title="Account Details"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">more_vert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Large Dashed '+ Link New Account or Wallet' CTA Card */}
      <div className="relative group cursor-pointer">
        <div className="w-full rounded-xl bg-surface-container-low p-space-lg flex flex-col items-center justify-center text-center gap-space-sm shadow-sm transition-all hover:bg-surface-container">
          <div className="w-14 h-14 rounded-full bg-surface-container-lowest text-primary-container flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[28px]">add_link</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-title-md text-title-md text-on-surface font-semibold">
              + Link New Account or Wallet
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">
              Seamlessly connect <strong className="text-on-surface font-semibold">Upay, Cellfin, SureCash</strong>, or
              30+ Bangladeshi scheduled banks
            </p>
          </div>
          {/* Rail Mini Logos Ribbon */}
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-md text-[11px]">
              Upay
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-md text-[11px]">
              Cellfin
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-md text-[11px]">
              EBL Skybanking
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-md text-[11px]">
              +32 Banks
            </span>
          </div>
        </div>
      </div>

      {/* Security Reassurance Safe Note */}
      <div className="rounded-xl bg-surface-container p-space-md flex items-center gap-space-sm">
        <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">verified_user</span>
        </div>
        <div className="flex flex-col">
          <span className="font-title-md text-title-md text-on-surface text-sm">Institutional Grade Protection</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-tight">
            256-bit Bank Grade Encryption • Regulated Interoperable Protocol by Bangladesh Bank guidelines.
          </span>
        </div>
      </div>
    </div>
  );
}
