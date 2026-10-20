"use client";

import { useEffect, useState } from "react";
import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { useAuth } from "@/lib/session";
import { apiRequest, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { Transaction } from "@/types";

export default function TransactionsHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "Inbound" | "Outbound">("All");

  useEffect(() => {
    if (!user?._id) return;
    let isMounted = true;

    apiRequest<Transaction[]>(`/api/transactions/${user._id}?_t=${Date.now()}`)
      .then((data) => {
        if (!isMounted) return;
        setTransactions(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof ApiError ? err.message : "Failed to load transactions.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleRetry = () => {
    if (!user?._id) return;
    setIsLoading(true);
    setError(null);
    apiRequest<Transaction[]>(`/api/transactions/${user._id}?_t=${Date.now()}`)
      .then((data) => {
        setTransactions(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Failed to load transactions.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const filteredTransactions = transactions.filter((tx) => {
    const isInbound = tx.recipientPhone === user?.phone;
    if (activeFilter === "Inbound") return isInbound;
    if (activeFilter === "Outbound") return !isInbound;
    return true;
  });

  const totalInboundVolume = transactions
    .filter((tx) => tx.recipientPhone === user?.phone)
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalOutboundVolume = transactions
    .filter((tx) => tx.recipientPhone !== user?.phone)
    .reduce((sum, tx) => sum + (tx.total || tx.amount || 0), 0);

  return (
    <>
      <TopAppBar subtitle="Activity History" />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-4 p-0 md:p-6 min-h-screen overflow-y-auto w-full pb-24 md:pb-8">
        <div className="max-w-4xl px-margin md:px-0 space-y-space-md pt-2">
          {/* Header & Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-md text-xs font-semibold uppercase mb-1">
                <span className="material-symbols-outlined text-[13px]">receipt_long</span>
                Audit Trail
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Activity History</h1>
              <p className="font-body-sm text-on-surface-variant">Cross-wallet audit trail & settlement logs</p>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              title="Refresh ledger"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shadow-xs active:scale-95"
            >
              <span className={`material-symbols-outlined text-[20px] ${isLoading ? "animate-spin" : ""}`}>
                sync
              </span>
            </button>
          </div>

          {/* Desktop/Tablet Volume Metric Highlights */}
          <div className="hidden md:grid md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-on-surface-variant font-medium">Filtered Records</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {filteredTransactions.length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-on-surface-variant font-medium">Total Inbound</span>
                <span className="font-headline-md text-headline-md font-bold text-tertiary">
                  +{formatMoney(totalInboundVolume)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">south_west</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-on-surface-variant font-medium">Total Outbound</span>
                <span className="font-headline-md text-headline-md font-bold text-error">
                  -{formatMoney(totalOutboundVolume)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">north_east</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex gap-2">
              {(["All", "Inbound", "Outbound"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-1.5 font-label-md text-label-md rounded-full transition-all font-semibold ${
                    activeFilter === tab
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-xs text-on-surface-variant font-label-sm hidden sm:inline">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={handleRetry} className="font-bold underline">
                Retry
              </button>
            </div>
          )}

          {/* Unified Card Feed */}
          <div className="flex flex-col gap-space-xs bg-surface-container-lowest rounded-2xl p-2 md:p-3 border border-outline-variant/30 shadow-sm">
            {isLoading ? (
              <div className="p-12 text-center text-on-surface-variant font-body-md animate-pulse">
                Loading activity history...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-16 text-center text-on-surface-variant font-body-md flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[28px]">receipt_long</span>
                </div>
                <span className="font-bold text-on-surface text-base">No transactions found</span>
                <span className="text-xs max-w-xs">
                  {activeFilter === "All"
                    ? "You have not completed any cross-wallet transactions yet."
                    : `No ${activeFilter.toLowerCase()} transactions match this filter.`}
                </span>
              </div>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const isInbound = tx.recipientPhone === user?.phone;
                return (
                  <div
                    key={tx._id || idx}
                    className="flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                            : `To ${tx.recipientName || tx.recipientPhone}`}
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
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-outline font-label-md">
                            Fee: ৳{tx.fee ? tx.fee.toFixed(2) : "0.00"}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-semibold">
                            {tx.status}
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
                        {isInbound ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.total)}`}
                      </span>
                      <span className="font-label-md text-body-sm text-on-surface-variant font-mono">
                        TxN #{tx._id ? tx._id.slice(-4) : 4900 + idx}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
