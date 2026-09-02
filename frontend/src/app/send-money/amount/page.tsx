"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AmountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const [amount, setAmount] = useState("");

  const handleNext = () => {
    if (Number(amount) > 0) {
      router.push(`/send-money/confirm?phone=${phone}&amount=${amount}`);
    }
  };

  const fee = amount ? (Number(amount) * 0.01).toFixed(2) : "0.00";

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Enter Amount</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-20">
        <div className="text-center w-full">
          <div className="font-label-md text-on-surface-variant mb-2">Sending to {phone}</div>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="font-headline-xl text-[48px] text-primary font-bold">৳</span>
            <input
              type="number"
              className="bg-transparent border-none font-headline-xl text-[56px] leading-[64px] text-primary font-bold focus:ring-0 p-0 placeholder:text-outline-variant outline-none w-3/4 text-center"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-left max-w-xs mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-sm text-on-surface-variant">Interoperability Fee (1%)</span>
              <span className="font-label-sm font-bold text-on-surface">৳{fee}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
              <span className="font-label-sm text-on-surface-variant">Total Deduction</span>
              <span className="font-label-md font-bold text-primary">৳{amount ? (Number(amount) + Number(fee)).toFixed(2) : "0.00"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={handleNext}
          disabled={!amount || Number(amount) <= 0}
          className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm"
        >
          Review Transfer
        </button>
      </div>
    </div>
  );
}

export default function SendMoneyAmount() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AmountForm />
    </Suspense>
  );
}
