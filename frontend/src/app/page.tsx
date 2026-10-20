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
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-0 md:p-8 min-h-screen md:h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)] pb-24 md:pb-8">
        {/* Mobile View */}
        <div className="block lg:hidden">
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
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          {/* Desktop Header Area */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
                {t("welcome")}, {user?.name || t("account")}
              </h1>
              <p className="font-body-md text-on-surface-variant">{t("summarySub")}</p>
            </div>

          {/* Working BN / EN Language Switcher */}
          <div className="bg-surface-container rounded-full p-1 flex items-center shadow-sm border border-outline-variant/30">
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md font-bold transition-all duration-200 ${
                language === "en"
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md font-bold transition-all duration-200 ${
                language === "bn"
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              BN (বাংলা)
            </button>
          </div>
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="mb-8 p-5 rounded-2xl bg-error-container/20 border border-error/30 text-error flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">error</span>
              <span className="font-body-md text-sm">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-error text-white rounded-xl text-xs font-bold hover:bg-error/90 transition-colors shadow-sm flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {t("retry")}
            </button>
          </div>
        )}

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          {/* Left Column: Balance & Wallets */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Main Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary-container text-white p-6 md:p-8 rounded-[1.5rem] shadow-[0px_4px_16px_rgba(15,76,129,0.15)] relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary opacity-20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-body-lg text-body-lg text-primary-fixed-dim">{t("totalBalance")}</h3>
                  <button
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    aria-label="Toggle balance visibility"
                    className="text-primary-fixed hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {isBalanceVisible ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="h-14 w-48 bg-white/20 rounded-xl animate-pulse mb-6"></div>
                ) : (
                  <div className="font-headline-xl text-[44px] md:text-[48px] leading-[56px] font-bold mb-6 tracking-tight">
                    {isBalanceVisible ? displayFormattedMoney(balanceData?.totalBalance) : "৳••••••"}
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Working Add Funds Button */}
                  <button
                    onClick={() => {
                      setAddFundsError(null);
                      setAddFundsSuccess(null);
                      setIsAddFundsOpen(true);
                    }}
                    className="flex-1 bg-secondary text-white py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-md active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    {t("addFunds")}
                  </button>
                  <Link
                    href="/send-money"
                    className="flex-1 bg-white/10 border border-white/20 text-white py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {t("sendMoney")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Linked Wallets Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <>
                  <div className="h-28 bg-surface rounded-xl border border-outline-variant/30 animate-pulse"></div>
                  <div className="h-28 bg-surface rounded-xl border border-outline-variant/30 animate-pulse"></div>
                </>
              ) : balanceData?.wallets && balanceData.wallets.length > 0 ? (
                balanceData.wallets.map((wallet) => {
                  const brand = getProviderBrand(wallet.provider);
                  return (
                    <div
                      key={wallet._id || wallet.provider}
                      className="bg-surface p-5 rounded-xl border border-outline-variant/30 shadow-[0px_2px_8px_rgba(15,76,129,0.04)] hover:shadow-[0px_4px_12px_rgba(15,76,129,0.08)] transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full ${brand.bg} flex items-center justify-center ${brand.text}`}>
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {brand.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-label-md text-label-md text-on-surface font-bold">{wallet.provider}</h4>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{wallet.identifier}</span>
                        </div>
                      </div>
                      <div className="font-headline-md text-headline-md text-primary font-bold">
                        {isBalanceVisible ? displayFormattedMoney(wallet.balance) : "৳••••"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-6 bg-surface rounded-xl border border-outline-variant/30 text-center text-on-surface-variant text-sm">
                  {language === "bn" ? "কোনো সংযুক্ত ওয়ালেট পাওয়া যায়নি" : "No linked wallets discovered."}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Action */}
          <div className="lg:col-span-4 bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-[0px_2px_12px_rgba(15,76,129,0.06)] flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-4">
                {language === "bn" ? "দ্রুত লেনদেন" : "Quick Send"}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant mb-6">
                {language === "bn"
                  ? "বিকাশ, নগদ ও রকেটের মধ্যে প্রাপকের ফোন নম্বর ব্যবহার করে সরাসরি আন্তঃওয়ালেট টাকা পাঠান।"
                  : "Direct cross-wallet transfers across bKash, Nagad, and Rocket using a recipient's phone number."}
              </p>
              
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-[24px]">swap_horiz</span>
                <div className="text-xs font-body-md text-on-surface-variant">
                  <span className="font-bold text-on-surface block">
                    {language === "bn" ? "ইন্টারঅপারেবিলিটি সুইচ" : "Interoperability Switch"}
                  </span>
                  {language === "bn" ? "স্ট্যান্ডার্ড ১% আন্তঃওয়ালেট ট্রান্সফার ফি।" : "Standard 1% cross-wallet transfer fee."}
                </div>
              </div>
            </div>

            <Link
              href="/send-money"
              className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              {t("sendMoney")}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-[0px_2px_12px_rgba(15,76,129,0.06)] overflow-hidden mb-24 md:mb-8">
          <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-primary">{t("recentTransactions")}</h3>
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
                  {tab === "All" ? t("all") : tab === "Inbound" ? t("inbound") : t("outbound")}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium">{t("txHeader")}</th>
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium">{t("dateHeader")}</th>
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium">{t("statusHeader")}</th>
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium text-right">{t("amountHeader")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant font-body-md animate-pulse">
                      {t("loadingTransactions")}
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-on-surface-variant font-body-md">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-outline">receipt_long</span>
                        <span>{t("noTransactions")}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isInbound = tx.recipientPhone === user?.phone;
                    const dateFormatted = new Date(tx.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={tx._id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isInbound ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#EDE7F6] text-[#512DA8]"
                                }`}
                              >
                                <span className="material-symbols-outlined">
                                  {isInbound ? "south_west" : "north_east"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-label-md text-label-md text-on-surface font-bold">
                                {isInbound
                                  ? `${language === "bn" ? "প্রাপ্তি: " : "From "}${tx.fromWalletProvider}`
                                  : `${language === "bn" ? "প্রেরিত: " : "To "}${tx.recipientName || tx.recipientPhone}`}
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
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-label-sm text-label-sm ${
                              tx.status === "Completed"
                                ? "bg-[#E8F5E9] text-[#2E7D32]"
                                : tx.status === "Pending"
                                ? "bg-surface-container-highest text-on-surface-variant"
                                : "bg-error-container text-error"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                tx.status === "Completed" ? "bg-[#2E7D32]" : "bg-outline"
                              }`}
                            ></span>
                            {tx.status === "Completed"
                              ? t("completed")
                              : tx.status === "Pending"
                              ? t("pending")
                              : t("failed")}
                          </span>
                        </td>
                        <td
                          className={`p-4 font-label-md text-label-md font-bold text-right ${
                            isInbound ? "text-[#2E7D32]" : "text-on-surface"
                          }`}
                        >
                          {isInbound ? `+${displayFormattedMoney(tx.amount)}` : `-${displayFormattedMoney(tx.total)}`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant/30 text-center">
            <Link
              href="/transactions"
              className="font-label-md text-label-md text-primary font-bold hover:text-primary-container transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
        </div>
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
