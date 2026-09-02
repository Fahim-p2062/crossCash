"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const amount = searchParams.get("amount") || "0";
  const fee = (Number(amount) * 0.01).toFixed(2);
  const total = (Number(amount) + Number(fee)).toFixed(2);

  const handleNext = () => {
    router.push(`/send-money/pin?phone=${phone}&amount=${amount}`);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Confirm Transfer</h1>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-outline-variant/30 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md font-bold mx-auto mb-4">
            R
          </div>
          <h2 className="font-headline-md font-bold text-on-surface">Rakib Hasan</h2>
          <div className="font-label-md text-on-surface-variant mb-4">{phone}</div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f5e9] text-[#2e7d32] rounded-full font-label-sm mb-6">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            Nagad
          </div>

          <div className="font-headline-xl text-primary font-bold mb-6">
            ৳{amount}
          </div>

          <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-left">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-on-surface-variant">From Wallet</span>
              <span className="font-label-md font-bold text-on-surface flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#d81b60]"></span>
                bKash
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-on-surface-variant">Interoperability Fee</span>
              <span className="font-label-md font-bold text-on-surface">৳{fee}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-label-md font-bold text-on-surface">Total Deduction</span>
              <span className="font-label-md font-bold text-primary">৳{total}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="font-label-sm text-on-surface-variant leading-relaxed">
            By confirming, you authorize CrossCash to deduct the total amount from your bKash wallet and instantly transfer it to the recipient's Nagad wallet.
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
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmForm />
    </Suspense>
  );
}
