"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { useLanguage } from "@/lib/language";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Transaction, Wallet } from "@/types";

interface MobileDashboardProps {
  balanceData: BalanceResponse | null;
  transactions: Transaction[];
  isLoading: boolean;
  onOpenAddFunds: () => void;
}

export default function MobileDashboard({
  balanceData,
  transactions,
  isLoading,
  onOpenAddFunds,
}: MobileDashboardProps) {
  const { user } = useAuth();
  const { language, setLanguage, formatNumber } = useLanguage();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const totalBalance = balanceData?.totalBalance ?? 13485;
  const userName = user?.name || "Fahim Bin Zaman";
  const userPhone = user?.phone || "01777885053";

  // Wallet balances
  const getWallet = (provider: string, fallback: number) => {
    const found = balanceData?.wallets?.find(
      (w) => w.provider.toLowerCase() === provider.toLowerCase()
    );
    return found ? found.balance : fallback;
  };

  const bkashBal = getWallet("bKash", 8485);
  const nagadBal = getWallet("Nagad", 1000);
  const rocketBal = getWallet("Rocket", 4000);

  const displayMoney = (val: number) => {
    if (language === "bn") return `৳${formatNumber(val)}`;
    return formatMoney(val);
  };

  return (
    <div className="flex flex-col w-full px-margin pb-space-lg gap-space-lg pt-2">
      {/* User Greeting & Profile Meta */}
      <section className="flex items-center justify-between pt-space-sm">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs">
            <h1 className="font-headline-md text-headline-md text-on-surface truncate font-semibold">
              {userName}
            </h1>
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary shadow-sm shrink-0"
              title="Verified Identity"
            >
              <span className="material-symbols-outlined text-[13px] font-bold">verified</span>
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm mt-0.5">
            <span className="font-medium tracking-wide">ID: {userPhone}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="text-tertiary font-medium">Tier 2 KYC</span>
          </div>
        </div>

        {/* Language Toggle Pill */}
        <button
          aria-label="Toggle language"
          className="flex items-center rounded-full bg-surface-container-high px-space-sm py-1 shadow-sm active:scale-95 transition-transform text-on-surface font-label-md text-label-md shrink-0"
          id="langToggle"
          type="button"
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
        >
          <span
            className={`px-1.5 py-0.5 rounded-full transition-all ${
              language === "en"
                ? "bg-surface text-primary-container font-bold shadow-xs"
                : "text-on-surface-variant font-medium"
            }`}
          >
            EN
          </span>
          <span className="text-outline mx-0.5">|</span>
          <span
            className={`px-1.5 py-0.5 rounded-full transition-all ${
              language === "bn"
                ? "bg-surface text-primary-container font-bold shadow-xs"
                : "text-on-surface-variant font-medium"
            }`}
          >
            BN
          </span>
        </button>
      </section>

      {/* Hero Aggregated Balance Card */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container via-[#271f85] to-inverse-surface text-on-primary p-space-lg shadow-xl">
        {/* Ambient organic glow circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-surface-tint/20 blur-2xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-12 w-40 h-40 rounded-full bg-tertiary-container/30 blur-2xl"></div>

        <div className="relative z-10 flex flex-col gap-space-md">
          {/* Balance Header & Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">
                account_balance
              </span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary-fixed-dim font-semibold">
                Total CrossCash Balance
              </span>
            </div>
            <button
              aria-label="Toggle balance visibility"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 transition-colors"
              id="balanceToggleBtn"
              type="button"
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            >
              <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim" id="balanceEyeIcon">
                {isBalanceHidden ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Balance Figures */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              {isLoading ? (
                <div className="h-10 w-44 bg-white/20 rounded-lg animate-pulse my-1"></div>
              ) : (
                <span
                  className="font-currency-display text-currency-display text-surface-container-lowest tracking-tight font-bold"
                  id="balanceValue"
                >
                  {isBalanceHidden ? "••••••••" : displayMoney(totalBalance)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-space-xs mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] uppercase font-bold tracking-wider">
                Reconciled
              </span>
              <span className="font-body-sm text-body-sm text-surface-container-high/80">
                Across 3 Linked Accounts
              </span>
            </div>
          </div>

          {/* Card Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
            <button
              className="flex items-center justify-center gap-space-xs h-11 px-space-md rounded-full bg-surface-container-lowest text-primary-container font-title-md text-body-md shadow-md active:scale-98 transition-transform font-bold"
              type="button"
              onClick={onOpenAddFunds}
            >
              <span className="material-symbols-outlined text-[20px] font-bold">add</span>
              <span>Add Money</span>
            </button>
            <Link
              href="/send-money"
              className="flex items-center justify-center gap-space-xs h-11 px-space-md rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-container-lowest hover:bg-surface-container-lowest/25 font-title-md text-body-md active:scale-98 transition-transform font-semibold"
            >
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              <span>Send / Swap</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Cross-Send Shortcut Banner */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <div className="flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary-container shadow-xs">
              <span className="material-symbols-outlined text-[24px]">sync_alt</span>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary ring-2 ring-surface-container-lowest text-[10px] font-bold">
                ⚡
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                  Instant Cross-Send
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-on-primary-fixed-variant font-label-md text-[10px] font-semibold uppercase">
                  1% Fee
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Interoperable settlement between bKash, Nagad & Rocket
              </p>
            </div>
          </div>
          <Link
            aria-label="Transfer now"
            href="/send-money"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Connected Wallets Carousel Header */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-title-md text-title-md text-on-surface font-semibold">Connected Wallets</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-md text-label-md font-semibold">
              3
            </span>
          </div>
          <Link href="/linked-wallets" className="font-label-md text-label-md text-primary font-semibold hover:underline">
            Manage Limits
          </Link>
        </div>

        {/* Horizontal Scrollable Cards */}
        <div className="flex items-stretch gap-space-md overflow-x-auto pb-space-xs -mx-margin px-margin no-scrollbar scroll-smooth">
          {/* bKash Card (Primary) */}
          <div className="flex-shrink-0 w-64 rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E2136E]"></div>
            <div className="flex items-start justify-between pt-1">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-[#E2136E]/10 flex items-center justify-center font-title-md text-body-lg font-bold text-[#E2136E]">
                  bK
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface leading-tight font-semibold">bKash</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{userPhone}</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-md text-[10px] font-bold tracking-wider uppercase">
                PRIMARY
              </span>
            </div>
            <div className="flex items-end justify-between pt-2">
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Available</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  {isBalanceHidden ? "••••••" : displayMoney(bkashBal)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                <span className="font-label-md text-[11px] text-tertiary font-semibold">Active</span>
              </div>
            </div>
          </div>

          {/* Nagad Card */}
          <div className="flex-shrink-0 w-64 rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F7941D]"></div>
            <div className="flex items-start justify-between pt-1">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-[#F7941D]/15 flex items-center justify-center font-title-md text-body-lg font-bold text-[#D96B00]">
                  NG
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface leading-tight font-semibold">Nagad</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{userPhone}</span>
                </div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-md text-[10px] font-semibold uppercase">
                MFS
              </span>
            </div>
            <div className="flex items-end justify-between pt-2">
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Available</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  {isBalanceHidden ? "••••••" : displayMoney(nagadBal)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                <span className="font-label-md text-[11px] text-tertiary font-semibold">Active</span>
              </div>
            </div>
          </div>

          {/* Rocket Card */}
          <div className="flex-shrink-0 w-64 rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8C3494]"></div>
            <div className="flex items-start justify-between pt-1">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-[#8C3494]/15 flex items-center justify-center font-title-md text-body-lg font-bold text-[#8C3494]">
                  RK
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface leading-tight font-semibold">Rocket</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{userPhone}</span>
                </div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-md text-[10px] font-semibold uppercase">
                DBBL
              </span>
            </div>
            <div className="flex items-end justify-between pt-2">
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Available</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  {isBalanceHidden ? "••••••" : displayMoney(rocketBal)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                <span className="font-label-md text-[11px] text-tertiary font-semibold">Active</span>
              </div>
            </div>
          </div>

          {/* Link New Card Button */}
          <Link
            href="/linked-wallets"
            className="flex-shrink-0 w-44 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors p-space-md shadow-sm flex flex-col items-center justify-center text-center gap-space-xs text-primary-container active:scale-98"
          >
            <div className="w-11 h-11 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary-container shadow-xs">
              <span className="material-symbols-outlined text-[24px]">add_link</span>
            </div>
            <span className="font-title-md text-title-md text-on-surface font-semibold">+ Link New</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Bank or MFS</span>
          </Link>
        </div>
      </section>

      {/* Recent Cross Transactions */}
      <section className="flex flex-col gap-space-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-title-md text-title-md text-on-surface font-semibold">
              Recent Cross Transactions
            </span>
          </div>
          <Link href="/transactions" className="font-label-md text-label-md text-primary font-semibold hover:underline">
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-space-xs bg-surface-container-lowest rounded-xl p-space-xs shadow-sm">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 4).map((tx, idx) => {
              const isInbound = tx.recipientPhone === user?.phone;
              return (
                <div
                  key={tx._id || idx}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isInbound
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] font-bold">
                        {isInbound ? "south_west" : "north_east"}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title-md text-body-lg text-on-surface truncate font-semibold">
                        {isInbound
                          ? `From ${tx.fromWalletProvider || "Bank"}`
                          : `To ${tx.recipientName || "Recipient"}`}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap text-on-surface-variant font-body-sm text-body-sm">
                        <span className="inline-flex items-center font-medium text-primary-container">
                          {tx.fromWalletProvider} → {tx.toWalletProvider}
                        </span>
                        <span className="text-outline-variant">•</span>
                        <span>
                          {new Date(tx.createdAt || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-outline font-label-md">
                          Fee: ৳{tx.fee ? tx.fee.toFixed(2) : "0.00"}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-semibold">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 pl-space-xs">
                    <span
                      className={`font-title-md text-title-md font-bold tracking-tight ${
                        isInbound ? "text-tertiary" : "text-error"
                      }`}
                    >
                      {isInbound ? `+${displayMoney(tx.amount)}` : `-${displayMoney(tx.total)}`}
                    </span>
                    <span className="font-label-md text-body-sm text-on-surface-variant font-mono">
                      TxN #{tx._id ? tx._id.slice(-4) : 4920 + idx}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            // Mock items matching design exactly when no transactions exist yet
            <>
              {/* Item 1: Outbound to Rakib */}
              <div className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px] font-bold">north_east</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-body-lg text-on-surface truncate font-semibold">
                      To Rakib Hasan
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap text-on-surface-variant font-body-sm text-body-sm">
                      <span className="inline-flex items-center font-medium text-primary-container">
                        bKash → Nagad
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span>Oct 15, 10:32 AM</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-outline font-label-md">Fee: ৳10.00</span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 pl-space-xs">
                  <span className="font-title-md text-title-md text-error font-bold tracking-tight">
                    -৳1,010.00
                  </span>
                  <span className="font-label-md text-body-sm text-on-surface-variant font-mono">
                    TxN #4921
                  </span>
                </div>
              </div>

              {/* Item 2: Inbound from City Bank */}
              <div className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px] font-bold">south_west</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-body-lg text-on-surface truncate font-semibold">
                      From City Bank
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap text-on-surface-variant font-body-sm text-body-sm">
                      <span className="inline-flex items-center font-medium text-primary-container">
                        Bank → Rocket
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span>Oct 15, 10:30 AM</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-outline font-label-md">Fee: ৳0.00</span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 pl-space-xs">
                  <span className="font-title-md text-title-md text-tertiary font-bold tracking-tight">
                    +৳4,000.00
                  </span>
                  <span className="font-label-md text-body-sm text-on-surface-variant font-mono">
                    BEFTN #8812
                  </span>
                </div>
              </div>

              {/* Item 3: Outbound to Rakib */}
              <div className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px] font-bold">north_east</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-body-lg text-on-surface truncate font-semibold">
                      To Rakib Hasan
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap text-on-surface-variant font-body-sm text-body-sm">
                      <span className="inline-flex items-center font-medium text-primary-container">
                        bKash → Nagad
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span>Oct 15, 10:25 AM</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-outline font-label-md">Fee: ৳5.00</span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 pl-space-xs">
                  <span className="font-title-md text-title-md text-error font-bold tracking-tight">
                    -৳505.00
                  </span>
                  <span className="font-label-md text-body-sm text-on-surface-variant font-mono">
                    TxN #4919
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
