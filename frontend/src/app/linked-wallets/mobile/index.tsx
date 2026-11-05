"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Wallet } from "@/types";
import WalletLogo from "@/components/ui/WalletLogo";

export default function MobileLinkedWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allHidden, setAllHidden] = useState(false);
  const [hiddenCards, setHiddenCards] = useState<Record<string, boolean>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [defaultSendWallet, setDefaultSendWallet] = useState(true);

  // Link Wallet Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkProvider, setLinkProvider] = useState<"bKash" | "Nagad" | "Rocket" | "Bank">("Nagad");
  const [isLinking, setIsLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);

  const fetchWallets = () => {
    if (!user?._id) return;
    setIsLoading(true);
    apiRequest<BalanceResponse>(`/api/user/${user._id}/balance?_t=${Date.now()}`)
      .then((data) => {
        setWallets(data.wallets || []);
        setTotalBalance(data.totalBalance ?? 0);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchWallets();
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
    fetchWallets();
    setTimeout(() => {
      setSyncingId(null);
    }, 800);
  };

  const handleLinkNewWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    setIsLinking(true);
    setLinkMessage(null);
    try {
      // Calling add-funds with 0 or initial deposit to link the wallet
      const res = await apiRequest<{ totalBalance: number; wallets: Wallet[] }>(
        `/api/user/${user._id}/add-funds`,
        {
          method: "POST",
          body: JSON.stringify({
            amount: 0.01, // minimal activation deposit
            provider: linkProvider,
          }),
        }
      );
      setWallets(res.wallets || []);
      setTotalBalance(res.totalBalance);
      setLinkMessage(`Successfully linked ${linkProvider}!`);
      setTimeout(() => {
        setIsLinkModalOpen(false);
        setLinkMessage(null);
      }, 1200);
    } catch {
      setLinkMessage("Failed to link wallet. Please try again.");
    } finally {
      setIsLinking(false);
    }
  };

  const phone = user?.phone || "";

  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case "bKash":
        return {
          barColor: "bg-[#E2136E]",
          bgGlow: "bg-[#E2136E]/10",
          textColor: "text-[#E2136E]",
          borderAccent: "border-pink-200 hover:border-pink-400",
          cardGradient: "from-pink-500/5 via-white to-transparent",
          tag: "PRIMARY MFS",
        };
      case "Nagad":
        return {
          barColor: "bg-[#F7941D]",
          bgGlow: "bg-[#F7941D]/15",
          textColor: "text-[#D96B00]",
          borderAccent: "border-orange-200 hover:border-orange-400",
          cardGradient: "from-amber-500/5 via-white to-transparent",
          tag: "POSTAL MFS",
        };
      case "Rocket":
        return {
          barColor: "bg-[#8C3494]",
          bgGlow: "bg-[#8C3494]/15",
          textColor: "text-[#8C3494]",
          borderAccent: "border-purple-200 hover:border-purple-400",
          cardGradient: "from-purple-500/5 via-white to-transparent",
          tag: "DBBL MFS",
        };
      default:
        return {
          barColor: "bg-blue-600",
          bgGlow: "bg-blue-600/10",
          textColor: "text-blue-700",
          borderAccent: "border-blue-200 hover:border-blue-400",
          cardGradient: "from-blue-500/5 via-white to-transparent",
          tag: "COMMERCIAL BANK",
        };
    }
  };

  const unlinkedProviders = (["bKash", "Nagad", "Rocket", "Bank"] as const).filter(
    (prov) => !wallets.some((w) => w.provider.toLowerCase() === prov.toLowerCase())
  );

  const displayTotal = wallets.length > 0
    ? Math.round(wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0) * 100) / 100
    : totalBalance;

  return (
    <div className="flex flex-col w-full px-margin md:px-0 pb-space-2xl space-y-space-lg pt-2">
      {/* Header */}
      <div className="flex flex-col gap-space-2xs mt-space-sm">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Linked Wallets & Accounts</h1>
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
      </div>

      {/* Aggregated Liquidity Bar with Brand Gradient & Refined Aesthetics */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-5 shadow-sm border border-indigo-100/80">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Liquidity Pool
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {wallets.length} {wallets.length === 1 ? "Rail" : "Rails"} Active
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {allHidden ? "••••••••" : formatMoney(displayTotal)}
            </span>
            <span className="text-xs font-bold text-slate-500">BDT</span>
          </div>
          <p className="text-xs text-slate-500">
            Aggregated across <strong className="text-slate-800 font-semibold">{wallets.length} connected account{wallets.length === 1 ? "" : "s"}</strong>
          </p>

          {/* Breakdown bar */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {displayTotal > 0 ? (
                wallets.map((w, i) => {
                  const cfg = getProviderConfig(w.provider);
                  const pct = Math.max(8, (w.balance / displayTotal) * 100);
                  return (
                    <div
                      key={w._id || i}
                      className={`h-full ${cfg.barColor}`}
                      style={{ width: `${pct}%` }}
                      title={`${w.provider} (${formatMoney(w.balance)})`}
                    ></div>
                  );
                })
              ) : (
                <div className="h-full bg-slate-200 w-full" title="Zero Liquidity"></div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2 pt-0.5">
              {wallets.map((w, i) => {
                const cfg = getProviderConfig(w.provider);
                return (
                  <span key={w._id || i} className="flex items-center gap-1.5 font-medium">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.barColor} inline-block shadow-xs`}></span> {w.provider} {formatMoney(w.balance)}
                  </span>
                );
              })}
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
              Auto-routed via {wallets[0]?.provider || "bKash"} Personal
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

      {/* Connected Accounts List */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">Connected Accounts</h2>
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">Synced Just Now</span>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-surface-container-lowest p-space-lg text-center animate-pulse text-on-surface-variant">
            Loading your linked accounts...
          </div>
        ) : wallets.length > 0 ? (
          wallets.map((wallet, index) => {
            const config = getProviderConfig(wallet.provider);
            const isCardHidden = allHidden || hiddenCards[wallet._id || wallet.provider];
            return (
              <div
                key={wallet._id || `${wallet.provider}-${index}`}
                className={`rounded-2xl bg-gradient-to-b ${config.cardGradient} bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all border ${config.borderAccent} flex flex-col gap-space-md relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.barColor}`}></div>
                <div className="flex items-start justify-between pt-1">
                  <div className="flex items-center gap-space-sm">
                    <WalletLogo provider={wallet.provider} size="lg" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">{wallet.provider}</h3>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-primary-container text-white font-label-md text-[10px] font-bold uppercase tracking-wider">
                            PRIMARY WALLET
                          </span>
                        )}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                        Personal Account • {wallet.identifier || phone}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-md text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                </div>

                <div className="rounded-lg bg-surface-container-low p-space-sm flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">Available Balance</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                      {isCardHidden ? "••••••••" : formatMoney(wallet.balance)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCard(wallet._id || wallet.provider)}
                    type="button"
                    className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCardHidden ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-space-sm pt-1">
                  <Link
                    href={`/send-money?fromProvider=${wallet.provider}`}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    <span className="font-title-md text-title-md font-medium text-sm">Send / Swap</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleSync(wallet.provider)}
                    className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] text-secondary ${
                        syncingId === wallet.provider ? "animate-spin" : ""
                      }`}
                    >
                      sync
                    </span>
                    <span className="font-title-md text-title-md font-medium text-sm">Sync</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            <span className="font-semibold text-on-surface">No Wallets Connected</span>
            <p className="text-xs">Link an MFS or bank account to start transacting.</p>
          </div>
        )}
      </div>

      {/* Large Link New Account CTA Card */}
      {unlinkedProviders.length > 0 && (
        <div
          onClick={() => {
            setLinkProvider(unlinkedProviders[0]);
            setIsLinkModalOpen(true);
          }}
          className="relative group cursor-pointer"
        >
          <div className="w-full rounded-xl bg-surface-container-low p-space-lg flex flex-col items-center justify-center text-center gap-space-sm shadow-sm transition-all hover:bg-surface-container border border-dashed border-outline-variant/60">
            <div className="w-14 h-14 rounded-full bg-surface-container-lowest text-primary-container flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px]">add_link</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                + Link Another MFS or Bank Account
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">
                Available to link: {unlinkedProviders.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Reassurance Safe Note */}
      <div className="rounded-xl bg-surface-container p-space-md flex items-center gap-space-sm">
        <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">verified_user</span>
        </div>
        <div className="flex flex-col">
          <span className="font-title-md text-title-md text-on-surface text-sm">Institutional Grade Protection</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-tight">
            256-bit Bank Grade Encryption • Regulated Interoperable Protocol following Bangladesh Bank guidelines.
          </span>
        </div>
      </div>

      {/* Modal to Link New Account */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-2xl border border-outline-variant/40 shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
              Link New Payment Rail
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Select which financial service provider you want to attach to your CrossCash ID.
            </p>

            <form onSubmit={handleLinkNewWallet} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {unlinkedProviders.map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setLinkProvider(prov)}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      linkProvider === prov
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-outline-variant/40 bg-surface-container hover:bg-surface-variant text-on-surface"
                    }`}
                  >
                    <span>{prov}</span>
                  </button>
                ))}
              </div>

              {linkMessage && (
                <div className="p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-center text-sm font-semibold">
                  {linkMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLinking}
                className="w-full py-3 rounded-full bg-primary-container text-on-primary font-bold hover:bg-primary transition-all disabled:opacity-50"
              >
                {isLinking ? "Connecting..." : `Link ${linkProvider} to Vault`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
