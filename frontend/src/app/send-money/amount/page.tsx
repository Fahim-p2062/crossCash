"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Wallet } from "@/types";

function AmountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";
  const toProvider = searchParams.get("toProvider") || "bKash";

  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [fromProvider, setFromProvider] = useState<string>("bKash");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;
    apiRequest<BalanceResponse>(`/api/user/${user._id}/balance`)
      .then((data) => {
        setWallets(data.wallets);
        if (data.wallets.length > 0) {
          setFromProvider(data.wallets[0].provider);
        }
      })
      .catch(() => {});
  }, [user]);

  const activeWallet = wallets.find((w) => w.provider === fromProvider) || wallets[0];
  const numAmount = Number(amount) || 0;
  const fee = Math.round(numAmount * 0.01 * 100) / 100;
  const totalDeduction = Math.round((numAmount + fee) * 100) / 100;
  const currentBalance = activeWallet?.balance ?? 0;
  const isInsufficient = numAmount > 0 && totalDeduction > currentBalance;

  const handleNext = () => {
    if (numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (isInsufficient) {
      setError(`Insufficient balance in ${fromProvider}. You need ৳${totalDeduction.toFixed(2)}.`);
      return;
    }

    const query = new URLSearchParams({
      phone,
      name,
      toProvider,
      fromProvider: activeWallet?.provider || fromProvider,
      amount: String(numAmount),
    });
    router.push(`/send-money/confirm?${query.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-6 pt-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Enter Amount</h1>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {/* Recipient summary pill */}
        <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between border border-outline-variant/30">
          <div>
            <div className="font-label-sm text-on-surface-variant">Sending to</div>
            <div className="font-headline-md font-bold text-on-surface">{name || phone}</div>
            <div className="font-label-sm text-outline">{phone}</div>
          </div>
          <div className="px-3 py-1 bg-surface-container rounded-full font-label-sm font-bold text-primary">
            {toProvider}
          </div>
        </div>

        {/* Source Wallet Selector */}
        <div>
          <label className="font-label-md text-label-md text-on-surface-variant block mb-2">
            Send From Your Wallet
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {wallets.length > 0 ? (
              wallets.map((w) => {
                const isSelected = (activeWallet?.provider || fromProvider) === w.provider;
                return (
                  <button
                    key={w.provider}
                    type="button"
                    onClick={() => {
                      setFromProvider(w.provider);
                      setError(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-fixed/20 shadow-sm ring-1 ring-primary"
                        : "border-outline-variant/30 bg-surface-container hover:bg-surface-variant"
                    }`}
                  >
                    <div className="font-label-md font-bold text-on-surface">{w.provider}</div>
                    <div className="font-label-sm text-on-surface-variant text-xs mt-0.5">
                      {formatMoney(w.balance)}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 bg-surface-container rounded-xl text-xs text-on-surface-variant col-span-3">
                Loading linked wallets...
              </div>
            )}
          </div>
        </div>

        {/* Amount Input */}
        <div className="text-center w-full py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-headline-xl text-[44px] text-primary font-bold">৳</span>
            <input
              type="number"
              min="1"
              step="any"
              className="bg-transparent border-none font-headline-xl text-[48px] leading-[56px] text-primary font-bold focus:ring-0 p-0 placeholder:text-outline-variant outline-none w-3/4 text-center"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex justify-center gap-2 mb-6">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmount(String(amt));
                  setError(null);
                }}
                className="px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                +৳{amt}
              </button>
            ))}
          </div>

          {/* Breakdown Card */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-sm text-on-surface-variant">Interoperability Fee (1%)</span>
              <span className="font-label-sm font-bold text-on-surface">৳{fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
              <span className="font-label-sm text-on-surface-variant">Total Deduction</span>
              <span className={`font-label-md font-bold ${isInsufficient ? "text-error" : "text-primary"}`}>
                ৳{totalDeduction.toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-xs text-error font-medium bg-error-container/20 p-2.5 rounded-lg border border-error/20">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={handleNext}
          disabled={!amount || numAmount <= 0 || isInsufficient}
          className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-40 transition-colors shadow-sm"
        >
          Review Transfer
        </button>
      </div>
    </div>
  );
}

export default function SendMoneyAmount() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading...</div>}>
      <AmountForm />
    </Suspense>
  );
}
