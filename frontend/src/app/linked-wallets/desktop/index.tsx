"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Wallet } from "@/types";

export default function DesktopLinkedWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleBalances, setVisibleBalances] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user?._id) return;
    let isMounted = true;

    apiRequest<BalanceResponse>(`/api/user/${user._id}/balance?_t=${Date.now()}`)
      .then((data) => {
        if (!isMounted) return;
        setWallets(data.wallets);
        const initialVisibility: Record<string, boolean> = {};
        data.wallets.forEach((w) => {
          initialVisibility[w.provider] = true;
        });
        setVisibleBalances(initialVisibility);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleVisibility = (provider: string) => {
    setVisibleBalances((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case "bKash":
        return {
          color: "#d12053",
          bgGlow: "bg-bkash-pink/10",
          initial: "b",
          svg: (
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" fill="#d12053" r="10"></circle>
              <path d="M8 12L12 8L16 12L12 16L8 12Z" fill="white"></path>
            </svg>
          ),
        };
      case "Nagad":
        return {
          color: "#F7931E",
          bgGlow: "bg-nagad-orange/10",
          initial: "N",
          svg: (
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" fill="#F7931E" r="10"></circle>
              <rect fill="white" height="8" width="8" x="8" y="8"></rect>
            </svg>
          ),
        };
      case "Rocket":
        return {
          color: "#8C3494",
          bgGlow: "bg-rocket-purple/10",
          initial: "R",
          svg: (
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" fill="#8C3494" r="10"></circle>
              <path d="M12 6L16 18H8L12 6Z" fill="white"></path>
            </svg>
          ),
        };
      default:
        return {
          color: "#00355f",
          bgGlow: "bg-primary/10",
          initial: "W",
          svg: (
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" fill="#00355f" r="10"></circle>
            </svg>
          ),
        };
    }
  };

  return (
    <div className="flex flex-col w-full relative h-full">
      {/* Decorative Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/30 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed/30 rounded-full blur-3xl opacity-50 -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
      
      <div className="flex items-end justify-between mb-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs tracking-tight">Linked Wallets</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Manage your connected Mobile Financial Services. Link new accounts to simplify your cross-platform transfers.
          </p>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-2xl">
        {isLoading ? (
          <>
            <div className="h-64 bg-surface-container-low rounded-2xl animate-pulse"></div>
            <div className="h-64 bg-surface-container-low rounded-2xl animate-pulse"></div>
          </>
        ) : wallets.length > 0 ? (
          wallets.map((wallet, index) => {
            const config = getProviderConfig(wallet.provider);
            const isVisible = visibleBalances[wallet.provider] ?? true;
            return (
              <div
                key={wallet._id || wallet.provider}
                className="bg-surface-container-low rounded-2xl p-lg relative overflow-hidden group shadow-[0px_2px_8px_rgba(15,76,129,0.08)] hover:shadow-lg transition-all duration-300"
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 ${config.bgGlow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="flex justify-between items-start mb-xl relative z-10">
                  <div className="flex items-center gap-md">
                    <div className="w-14 h-14 bg-surface-card rounded-full flex items-center justify-center shadow-sm relative">
                      {config.svg}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-success-green rounded-full shadow-sm ring-2 ring-surface-card"></div>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">{wallet.provider}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px] text-success-green">check_circle</span> Active
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="px-sm py-xs bg-surface-variant text-on-surface-variant rounded-md font-label-sm text-label-sm uppercase tracking-wider">
                      Primary
                    </div>
                  )}
                </div>
                <div className="mb-xl relative z-10">
                  <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Available Balance</p>
                  <div className="flex items-end gap-sm">
                    <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                      {isVisible ? formatMoney(wallet.balance) : "৳ ••••••"}
                    </span>
                    <button
                      className="text-on-surface-variant hover:text-primary transition-colors p-1"
                      onClick={() => toggleVisibility(wallet.provider)}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isVisible ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-md relative z-10">
                  <p className="font-label-sm text-label-sm text-outline flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">call</span> {wallet.identifier}
                  </p>
                  <span className="text-xs text-on-surface-variant font-label-sm">Connected</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 p-8 bg-surface-container-low rounded-2xl text-center text-on-surface-variant">
            No linked wallets found.
          </div>
        )}
      </div>
    </div>
  );
}
