"use client";

import { useEffect, useState } from "react";
import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { apiRequest, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/language";
import { BalanceResponse, Transaction, Wallet } from "@/types";
import MobileDashboard from "./dashboard-mobile";

interface AddFundsResponse {
  message: string;
  totalBalance: number;
  wallets: Wallet[];
  transaction: Transaction;
}

export default function Home() {
  const { user } = useAuth();
  const { language, setLanguage, t, formatNumber } = useLanguage();

  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Inbound" | "Outbound">("All");

  // Add Funds Modal State
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("1000");
  const [addFundsProvider, setAddFundsProvider] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addFundsError, setAddFundsError] = useState<string | null>(null);
  const [addFundsSuccess, setAddFundsSuccess] = useState<string | null>(null);

  const fetchDashboardData = (showLoading = false) => {
    if (!user?._id) return;
    if (showLoading) setIsLoading(true);

    Promise.all([
      apiRequest<BalanceResponse>(`/api/user/${user._id}/balance?_t=${Date.now()}`),
      apiRequest<Transaction[]>(`/api/transactions/${user._id}?_t=${Date.now()}`),
    ])
      .then(([balanceRes, txRes]) => {
        setBalanceData(balanceRes);
        setTransactions(txRes);
        if (balanceRes.wallets && balanceRes.wallets.length > 0) {
          const firstProv = balanceRes.wallets[0].provider;
          if (firstProv === "bKash" || firstProv === "Nagad" || firstProv === "Rocket") {
            setAddFundsProvider(firstProv);
          }
        }
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard data. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData(true);

    const onFocus = () => {
      fetchDashboardData(false);
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, [user]);

  const handleRetry = () => {
    if (!user?._id) return;
    setIsLoading(true);
    setError(null);
    Promise.all([
      apiRequest<BalanceResponse>(`/api/user/${user._id}/balance`),
      apiRequest<Transaction[]>(`/api/transactions/${user._id}`),
    ])
      .then(([balanceRes, txRes]) => {
        setBalanceData(balanceRes);
        setTransactions(txRes);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard data. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    const num = Number(addFundsAmount);
    if (!num || num <= 0) {
      setAddFundsError("Please enter a valid deposit amount.");
      return;
    }

    setIsAddingFunds(true);
    setAddFundsError(null);
    setAddFundsSuccess(null);

    try {
      const res = await apiRequest<AddFundsResponse>(`/api/user/${user._id}/add-funds`, {
        method: "POST",
        body: JSON.stringify({
          amount: num,
          provider: addFundsProvider,
        }),
      });

      // Update state immediately
      setBalanceData({
        totalBalance: res.totalBalance,
        wallets: res.wallets,
      });
      if (res.transaction) {
        setTransactions((prev) => [res.transaction, ...prev]);
      }
      setAddFundsSuccess(res.message);

      setTimeout(() => {
        setIsAddFundsOpen(false);
        setAddFundsSuccess(null);
        setIsAddingFunds(false);
      }, 1200);
    } catch (err: unknown) {
      setIsAddingFunds(false);
      setAddFundsError(err instanceof ApiError ? err.message : "Failed to add funds. Please try again.");
    }
  };

  const getProviderBrand = (provider: Wallet["provider"]) => {
    switch (provider) {
      case "bKash":
        return { bg: "bg-[#fce4ec]", text: "text-[#d81b60]", icon: "account_balance_wallet" };
      case "Nagad":
        return { bg: "bg-[#fff3e0]", text: "text-[#e65100]", icon: "account_balance_wallet" };
      case "Rocket":
        return { bg: "bg-[#f3e5f5]", text: "text-[#8C3494]", icon: "account_balance_wallet" };
      default:
        return { bg: "bg-surface-container", text: "text-primary", icon: "account_balance" };
    }
  };

  // Filter recent transactions (latest 5)
  const filteredTransactions = transactions
    .filter((tx) => {
      const isInbound = tx.recipientPhone === user?.phone;
      if (activeFilter === "Inbound") return isInbound;
      if (activeFilter === "Outbound") return !isInbound;
      return true;
    })
    .slice(0, 5);

  const displayFormattedMoney = (amount: number | undefined) => {
    if (amount === undefined) return "৳0";
    if (language === "bn") {
      return `৳${formatNumber(amount)}`;
    }
    return formatMoney(amount);
  };

  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-4 p-0 md:p-6 min-h-screen overflow-y-auto w-full pb-24 md:pb-8">
        <MobileDashboard
          balanceData={balanceData}
          transactions={transactions}
          isLoading={isLoading}
          onOpenAddFunds={() => {
            setAddFundsError(null);
            setAddFundsSuccess(null);
            setIsAddFundsOpen(true);
          }}
        />
      </main>
      <BottomNavBar />

      {/* Interactive Add Funds Modal */}
      {isAddFundsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-[1.5rem] border border-outline-variant/40 shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsAddFundsOpen(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined">add_card</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{t("addFundsTitle")}</h3>
                <p className="font-label-sm text-on-surface-variant text-xs">{t("addFundsSubtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleAddFundsSubmit} className="mt-5 space-y-4">
              {/* Wallet Provider Selector */}
              <div>
                <label className="font-label-sm font-bold text-on-surface block mb-2">{t("selectWallet")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["bKash", "Nagad", "Rocket"] as const).map((prov) => {
                    const isSelected = addFundsProvider === prov;
                    return (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setAddFundsProvider(prov)}
                        className={`py-2 px-3 rounded-xl border font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-outline-variant/40 bg-surface-container hover:bg-surface-variant text-on-surface"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {prov}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="font-label-sm font-bold text-on-surface block mb-2">{t("depositAmount")}</label>
                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">৳</span>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-transparent border-none font-headline-md font-bold text-on-surface focus:ring-0 p-0 outline-none"
                      placeholder="500"
                      value={addFundsAmount}
                      onChange={(e) => setAddFundsAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Quick amount pills */}
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddFundsAmount(String(amt))}
                      className="flex-1 py-1 px-2 rounded-lg bg-surface-container border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                      +৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Channel */}
              <div>
                <label className="font-label-sm font-bold text-on-surface block mb-2">{t("paymentMethod")}</label>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">credit_card</span>
                    <span className="font-label-sm text-on-surface font-medium">{t("cardDeposit")}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                    Instant
                  </span>
                </div>
              </div>

              {addFundsError && (
                <div className="p-3 bg-error-container/20 border border-error/30 text-error text-xs rounded-xl">
                  {addFundsError}
                </div>
              )}

              {addFundsSuccess && (
                <div className="p-3 bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs font-bold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {addFundsSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFundsOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/50 text-on-surface-variant font-label-md font-bold hover:bg-surface-container transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isAddingFunds}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isAddingFunds ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      {t("processing")}
                    </>
                  ) : (
                    t("confirmDeposit")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
