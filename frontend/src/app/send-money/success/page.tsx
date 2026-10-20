"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "01998765432";
  const name = searchParams.get("name") || "Recipient";
  const fromProvider = searchParams.get("fromProvider") || "bKash";
  const toProvider = searchParams.get("toProvider") || "Nagad";
  const amount = searchParams.get("amount") || "0";
  const fee = searchParams.get("fee") || (Number(amount) * 0.01).toFixed(2);
  const total = searchParams.get("total") || (Number(amount) + Number(fee)).toFixed(2);
  const txId = searchParams.get("txId") || `TXN${Date.now().toString().slice(-8)}`;

  // Format current time
  const now = new Date();
  const timeString = now.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoHistory = () => {
    window.location.href = "/transactions";
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto bg-surface-container-low">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        <div className="w-20 h-20 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center mb-2 shadow-[0_0_0_12px_rgba(232,245,233,0.5)]">
          <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <div className="text-center">
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Transfer Successful</h1>
          <div className="font-label-md text-on-surface-variant mt-1">{timeString}</div>
        </div>

        <div className="w-full bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-outline-variant/30 relative">
          {/* Receipt cutouts */}
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-surface-container-low rounded-full -translate-y-1/2 border-r border-outline-variant/30"></div>
          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-surface-container-low rounded-full -translate-y-1/2 border-l border-outline-variant/30"></div>

          <div className="text-center mb-6 pb-6 border-b border-dashed border-outline-variant/50">
            <div className="font-label-sm text-on-surface-variant mb-1">Amount Sent</div>
            <div className="font-headline-xl text-primary font-bold text-[36px]">
              ৳{Number(amount).toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-on-surface-variant">To</span>
              <div className="text-right">
                <div className="font-label-md font-bold text-on-surface">{name}</div>
                <div className="font-label-sm text-on-surface-variant">{phone}</div>
                <div className="inline-flex items-center gap-1 text-[#2e7d32] font-label-sm mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#2e7d32]"></span> {toProvider}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start pt-4 border-t border-outline-variant/20">
              <span className="font-label-md text-on-surface-variant">From</span>
              <div className="text-right">
                <div className="font-label-md font-bold text-on-surface">Your {fromProvider}</div>
                <div className="inline-flex items-center gap-1 text-primary font-label-sm mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> CrossCash Interop
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <span className="font-label-sm text-on-surface-variant">Transaction ID</span>
              <span className="font-label-sm font-mono font-bold text-on-surface truncate max-w-[170px]" title={txId}>
                {txId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-label-sm text-on-surface-variant">Interoperability Fee</span>
              <span className="font-label-sm font-medium text-on-surface">৳{Number(fee).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
              <span className="font-label-md font-bold text-on-surface">Total Deducted</span>
              <span className="font-label-md font-bold text-primary">৳{Number(total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe flex flex-col gap-3">
        <button
          onClick={handleGoHistory}
          className="w-full bg-surface-container-high text-primary h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-surface-variant transition-colors shadow-sm flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          View in Transaction History
        </button>
        <button
          onClick={handleGoHome}
          className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-sm flex justify-center items-center"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function SendMoneySuccess() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
