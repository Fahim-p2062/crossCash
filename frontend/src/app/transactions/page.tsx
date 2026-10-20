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

  return (
    <>
      <TopAppBar subtitle="Activity History" />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-0 md:p-8 min-h-screen md:h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)] pb-24 md:pb-8">
        {/* Mobile View */}
        <div className="block lg:hidden px-margin pt-space-sm space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Activity History</h1>
              <p className="font-body-sm text-on-surface-variant">Cross-wallet audit trail & settlement logs</p>
            </div>
            <button
              onClick={handleRetry}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className={`material-symbols-outlined text-[20px] ${isLoading ? "animate-spin" : ""}`}>
                sync
              </span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(["All", "Inbound", "Outbound"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 font-label-md text-label-md rounded-full transition-all font-semibold ${
                  activeFilter === tab
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={handleRetry} className="font-bold underline">
                Retry
              </button>
            </div>
          )}

          {/* Mobile Card List */}
          <div className="flex flex-col gap-space-xs bg-surface-container-lowest rounded-xl p-space-xs shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-on-surface-variant font-body-sm animate-pulse">
                Loading activity history...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-body-sm flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-outline">receipt_long</span>
                <span className="font-semibold text-on-surface">No transactions found</span>
                <span className="text-xs">No records matching the selected filter.</span>
              </div>
            ) : (
              filteredTransactions.map((tx, idx) => {
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

        {/* Desktop View: Full Audit Table */}
        <div className="hidden lg:block">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
                Transaction History
              </h1>
              <p className="font-body-md text-on-surface-variant">
                Audit log of all your cross-wallet transfers
              </p>
            </div>
            <button
              onClick={handleRetry}
              title="Refresh transactions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-center justify-between gap-4">
              <span className="text-sm font-body-md">{error}</span>
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          )}

          <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-[0px_2px_12px_rgba(15,76,129,0.06)] overflow-hidden mb-24 md:mb-8">
            <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {(["All", "Inbound", "Outbound"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-2 font-label-sm text-label-sm rounded-full whitespace-nowrap transition-colors ${
                      activeFilter === tab
                        ? "bg-secondary-container text-on-secondary-container font-bold shadow-sm"
                        : "bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="text-xs text-on-surface-variant font-label-sm">
                Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                    <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Transaction</th>
                    <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Date</th>
                    <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Fee (1%)</th>
                    <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Status</th>
                    <th className="p-4 font-label-sm text-label-sm text-outline font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-on-surface-variant font-body-md animate-pulse">
                        Loading your transaction records...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-on-surface-variant font-body-md">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined text-[32px]">receipt_long</span>
                          </div>
                          <span className="font-bold text-on-surface">No transactions found</span>
                          <span className="text-xs text-on-surface-variant max-w-xs">
                            {activeFilter === "All"
                              ? "You have not completed any cross-wallet transactions yet."
                              : `No ${activeFilter.toLowerCase()} transactions match this filter.`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isInbound = tx.recipientPhone === user?.phone;
                      const dateFormatted = new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={tx._id} className="hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isInbound ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#EDE7F6] text-[#512DA8]"
                                }`}>
                                  <span className="material-symbols-outlined">
                                    {isInbound ? "south_west" : "north_east"}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="font-label-md text-label-md text-on-surface font-bold">
                                  {isInbound
                                    ? `Received from ${tx.fromWalletProvider}`
                                    : `Sent to ${tx.recipientName || tx.recipientPhone}`}
                                </div>
                                <div className="font-label-sm text-label-sm text-on-surface-variant">
                                  {tx.fromWalletProvider} → {tx.toWalletProvider}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-body-md text-body-md text-on-surface-variant">
                            {dateFormatted}
                          </td>
                          <td className="p-4 font-body-md text-body-md text-on-surface-variant">
                            {isInbound ? "৳0.00" : formatMoney(tx.fee)}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-label-sm text-label-sm ${
                              tx.status === "Completed"
                                ? "bg-[#E8F5E9] text-[#2E7D32]"
                                : tx.status === "Pending"
                                ? "bg-surface-container-highest text-on-surface-variant"
                                : "bg-error-container text-error"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                tx.status === "Completed" ? "bg-[#2E7D32]" : "bg-outline"
                              }`}></span>
                              {tx.status}
                            </span>
                          </td>
                          <td className={`p-4 font-label-md text-label-md font-bold text-right ${
                            isInbound ? "text-[#2E7D32]" : "text-on-surface"
                          }`}>
                            {isInbound ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.total)}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
