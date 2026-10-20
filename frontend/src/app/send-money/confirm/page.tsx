"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "Recipient";
  const toProvider = searchParams.get("toProvider") || "Nagad";
  const fromProvider = searchParams.get("fromProvider") || "bKash";
  const amount = searchParams.get("amount") || "0";

  const numAmount = Number(amount);
  const fee = Math.round(numAmount * 0.01 * 100) / 100;
  const total = Math.round((numAmount + fee) * 100) / 100;

  const handleNext = () => {
    const query = new URLSearchParams({
      phone,
      name,
      toProvider,
      fromProvider,
      amount: String(numAmount),
    });
    router.push(`/send-money/pin?${query.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-6 pt-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Confirm Transfer</h1>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-outline-variant/30 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md font-bold mx-auto mb-3">
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-headline-md font-bold text-on-surface">{name}</h2>
          <div className="font-label-md text-on-surface-variant mb-3">{phone}</div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container text-primary rounded-full font-label-sm mb-6">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
            Destination: {toProvider}
          </div>

          <div className="font-headline-xl text-[40px] text-primary font-bold mb-6">
            ৳{numAmount.toLocaleString()}
          </div>

          <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-left">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-on-surface-variant">From Wallet</span>
              <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                {fromProvider}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-on-surface-variant">Interoperability Fee (1%)</span>
              <span className="font-label-md font-bold text-on-surface">৳{fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
              <span className="font-label-md font-bold text-on-surface">Total Deduction</span>
              <span className="font-label-md font-bold text-primary">৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            info
          </span>
          <p className="font-label-sm text-on-surface-variant leading-relaxed">
            By confirming, CrossCash will instantly deduct ৳{total.toFixed(2)} from your {fromProvider} wallet and credit ৳{numAmount.toLocaleString()} to {name}&apos;s {toProvider} wallet.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-sm"
        >
          Confirm & Enter PIN
        </button>
      </div>
    </div>
  );
}

export default function SendMoneyConfirm() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading...</div>}>
      <ConfirmForm />
    </Suspense>
  );
}
