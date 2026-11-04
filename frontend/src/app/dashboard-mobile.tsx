"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { useLanguage } from "@/lib/language";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Transaction, Wallet } from "@/types";
import WalletLogo from "@/components/ui/WalletLogo";

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

  // Dynamically compute the exact sum across all connected wallets
  const computedTotal = balanceData?.wallets && balanceData.wallets.length > 0
    ? balanceData.wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0)
    : (balanceData?.totalBalance ?? 0);
  const totalBalance = Math.round(computedTotal * 100) / 100;
  const userName = user?.name || "User";
  const userPhone = user?.phone || "";
  const linkedCount = balanceData?.wallets?.length ?? 3;

  const getProviderStyle = (provider: string) => {
    switch (provider) {
      case "bKash":
        return {
          barColor: "bg-[#E2136E]",
          iconBg: "bg-[#E2136E]/10",
          iconColor: "text-[#E2136E]",
          initial: "bK",
          tag: "MFS",
        };
      case "Nagad":
        return {
          barColor: "bg-[#F7941D]",
          iconBg: "bg-[#F7941D]/15",
          iconColor: "text-[#D96B00]",
          initial: "NG",
          tag: "MFS",
        };
      case "Rocket":
        return {
          barColor: "bg-[#8C3494]",
          iconBg: "bg-[#8C3494]/15",
          iconColor: "text-[#8C3494]",
          initial: "RK",
          tag: "DBBL",
        };
      default:
        return {
          barColor: "bg-primary-container",
          iconBg: "bg-primary-container/10",
          iconColor: "text-primary-container",
          initial: "BK",
          tag: "BANK",
        };
    }
  };

  const displayMoney = (val: number) => {
    if (language === "bn") return `৳${formatNumber(val)}`;
    return formatMoney(val);
  };

  return (
    <div className="flex flex-col w-full px-margin md:px-0 pb-space-lg gap-space-lg pt-2 max-w-5xl">
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
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001254] via-[#0A2FB6] to-[#1D4ED8] text-on-primary p-space-lg shadow-xl border border-white/10">
        {/* Ambient organic glow circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full bg-[#38BDF8]/25 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-[#60A5FA]/20 blur-3xl"></div>

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
                Across {linkedCount} Linked {linkedCount === 1 ? "Account" : "Accounts"}
              </span>
            </div>
          </div>

          {/* Card Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-space-xs">
            <button
              className="flex items-center justify-center gap-1.5 h-11 px-2 rounded-xl bg-surface-container-lowest text-primary-container font-title-md text-xs sm:text-sm shadow-md active:scale-98 transition-transform font-bold"
              type="button"
              onClick={onOpenAddFunds}
            >
              <span className="material-symbols-outlined text-[18px] font-bold">add</span>
              <span>Add</span>
            </button>
            <Link
              href="/send-money"
              className="flex items-center justify-center gap-1.5 h-11 px-2 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md text-surface-container-lowest hover:bg-surface-container-lowest/25 font-title-md text-xs sm:text-sm active:scale-98 transition-transform font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Send</span>
            </Link>
            <Link
              href="/scan-pay"
              className="flex items-center justify-center gap-1.5 h-11 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-title-md text-xs sm:text-sm shadow-md active:scale-98 transition-transform font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Scan & Pay</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bangla QR Interoperable Payment Banner */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/10 via-surface-container-lowest to-surface-container-lowest p-space-md shadow-sm border border-emerald-500/20">
        <div className="flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-surface-container-lowest text-[9px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                  Bangla QR • Pay Merchant
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-label-md text-[10px] font-bold uppercase">
                  Zero Fee
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Scan any interoperable EMV merchant QR code
              </p>
            </div>
          </div>
          <Link
            aria-label="Scan QR now"
            href="/scan-pay"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-emerald-700"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
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
              {linkedCount}
            </span>
          </div>
          <Link href="/linked-wallets" className="font-label-md text-label-md text-primary font-semibold hover:underline">
            Manage Limits
          </Link>
        </div>

        {/* Horizontal Scrollable Cards on mobile, 4-col grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-4 items-stretch gap-space-md overflow-x-auto pb-space-xs -mx-margin px-margin lg:mx-0 lg:px-0 no-scrollbar scroll-smooth">
          {isLoading ? (
            <>
              <div className="flex-shrink-0 w-64 lg:w-auto h-36 rounded-xl bg-surface-container-low animate-pulse"></div>
              <div className="flex-shrink-0 w-64 lg:w-auto h-36 rounded-xl bg-surface-container-low animate-pulse"></div>
            </>
          ) : balanceData?.wallets && balanceData.wallets.length > 0 ? (
            balanceData.wallets.map((wallet, idx) => {
              const style = getProviderStyle(wallet.provider);
              const cardBorder =
                wallet.provider === "bKash"
                  ? "border-pink-200 hover:border-pink-400"
                  : wallet.provider === "Nagad"
                  ? "border-orange-200 hover:border-orange-400"
                  : wallet.provider === "Rocket"
                  ? "border-purple-200 hover:border-purple-400"
                  : "border-blue-200 hover:border-blue-400";

              const cardGlow =
                wallet.provider === "bKash"
                  ? "from-pink-500/5 to-transparent"
                  : wallet.provider === "Nagad"
                  ? "from-orange-500/5 to-transparent"
                  : wallet.provider === "Rocket"
                  ? "from-purple-500/5 to-transparent"
                  : "from-blue-500/5 to-transparent";

              return (
                <div
                  key={wallet._id || `${wallet.provider}-${idx}`}
                  className={`flex-shrink-0 w-64 lg:w-auto rounded-2xl bg-gradient-to-b ${cardGlow} bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all border ${cardBorder} flex flex-col justify-between gap-space-md relative overflow-hidden group`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.barColor}`}></div>
                  <div className="flex items-start justify-between pt-1">
                    <div className="flex items-center gap-space-sm">
                      <WalletLogo provider={wallet.provider} size="md" />
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface leading-tight font-bold">
                          {wallet.provider}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                          {wallet.identifier || userPhone}
                        </span>
                      </div>
                    </div>
                    {idx === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-md text-[10px] font-bold tracking-wider uppercase">
                        PRIMARY
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[10px] font-semibold uppercase">
                        {style.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between pt-2 border-t border-outline-variant/15">
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">Available</span>
                      <span className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
                        {isBalanceHidden ? "••••••" : displayMoney(wallet.balance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-label-md text-[11px] text-emerald-700 font-bold">Active</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-shrink-0 w-64 lg:w-auto rounded-xl bg-surface-container-lowest p-space-md border border-outline-variant/30 text-center flex flex-col items-center justify-center text-on-surface-variant text-sm">
              <span>No wallets linked yet.</span>
            </div>
          )}

          {/* Link New Card Button */}
          <Link
            href="/linked-wallets"
            className="flex-shrink-0 w-44 lg:w-auto rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors p-space-md shadow-sm flex flex-col items-center justify-center text-center gap-space-xs text-primary-container active:scale-98"
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
              const isQR = (tx as any).type === "qr_payment";
              const isSwap = (tx as any).type === "swap" || tx.recipientName?.includes("Self Swap");
              const isInbound = tx.recipientPhone === user?.phone && !isQR && !isSwap;

              // Sender details
              const senderName = tx.senderName || (typeof tx.sender === "object" ? (tx.sender as any)?.name : null) || "User";
              const senderPhone = tx.senderPhone || (typeof tx.sender === "object" ? (tx.sender as any)?.phone : null) || "";

              // Recipient details
              const recipientName = tx.recipientName || "Recipient";
              const recipientPhone = tx.recipientPhone || "";

              // Title label
              let title = "";
              if (isQR) {
                title = `Bangla QR • ${recipientName}`;
              } else if (isSwap) {
                title = `Self Swap (${tx.fromWalletProvider} → ${tx.toWalletProvider})`;
              } else if (isInbound) {
                title = `From ${senderName}${senderPhone ? ` (${senderPhone})` : ""}`;
              } else {
                title = `To ${recipientName}${recipientPhone ? ` (${recipientPhone})` : ""}`;
              }

              const iconBg = isQR
                ? "bg-emerald-100 text-emerald-800"
                : isSwap
                ? "bg-secondary-container text-primary-container"
                : isInbound
                ? "bg-tertiary-fixed text-on-tertiary-fixed"
                : "bg-error-container text-on-error-container";

              const iconName = isQR
                ? "qr_code_scanner"
                : isSwap
                ? "sync_alt"
                : isInbound
                ? "south_west"
                : "north_east";

              return (
                <div
                  key={tx._id || idx}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
                    >
                      <span className="material-symbols-outlined text-[20px] font-bold">
                        {iconName}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title-md text-body-lg text-on-surface truncate font-semibold" title={title}>
                        {title}
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
                        {isQR && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-label-md text-[10px] font-bold uppercase">
                            Bangla QR
                          </span>
                        )}
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
            <div className="flex flex-col items-center justify-center p-space-lg text-center rounded-xl bg-surface-container-lowest border border-outline-variant/20 gap-2 my-1">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <span className="font-title-md text-body-md font-semibold text-on-surface">No Transactions Yet</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                Your cross-wallet transfers and deposits will appear here once you start transacting.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
