"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import WalletLogo from "@/components/ui/WalletLogo";

function QRSuccessContent() {
  const searchParams = useSearchParams();
  const merchantName = searchParams.get("merchantName") || "Merchant";
  const merchantCity = searchParams.get("merchantCity") || "Bangladesh";
  const provider = searchParams.get("provider") || "Merchant";
  const fromWallet = searchParams.get("fromWallet") || "bKash";
  const amount = searchParams.get("amount") || "0";
  const fee = searchParams.get("fee") || "0";
  const total = searchParams.get("total") || amount;
  const txId = searchParams.get("txId") || `QR${Date.now().toString().slice(-8)}`;

  const now = new Date();
  const timeString = now.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto bg-surface-container-low">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center mb-2 shadow-[0_0_0_12px_rgba(232,245,233,0.5)]">
          <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <div className="text-center">
          <h1 className="font-bold text-2xl text-on-surface">Payment Successful!</h1>
          <div className="text-on-surface-variant text-sm mt-1">{timeString}</div>
        </div>

        {/* Receipt card */}
        <div className="w-full bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-outline-variant/30 relative">
          {/* Receipt cutouts */}
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-surface-container-low rounded-full -translate-y-1/2 border-r border-outline-variant/30" />
          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-surface-container-low rounded-full -translate-y-1/2 border-l border-outline-variant/30" />

          {/* QR Badge */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code
              </span>
              Bangla QR Payment
            </div>
          </div>

          <div className="text-center mb-6 pb-6 border-b border-dashed border-outline-variant/50">
            <div className="text-on-surface-variant text-sm mb-1">Amount Paid</div>
            <div className="text-primary font-bold text-[36px]">৳{Number(amount).toLocaleString()}</div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-sm">To (Merchant)</span>
              <div className="text-right">
                <div className="font-bold text-on-surface text-sm">{merchantName}</div>
                <div className="text-on-surface-variant text-xs">{merchantCity}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">{provider}</div>
              </div>
            </div>

            <div className="flex justify-between items-start pt-4 border-t border-outline-variant/20">
              <span className="text-on-surface-variant text-sm">From</span>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 text-on-surface text-sm font-bold">
                  <WalletLogo provider={fromWallet} size="xs" />
                  <span>Your {fromWallet}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-primary text-xs mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  CrossCash Interop
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <span className="text-on-surface-variant text-xs">Transaction ID</span>
              <span className="font-mono font-bold text-on-surface text-xs truncate max-w-[170px]" title={txId}>
                {txId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-xs">P2M Fee</span>
              <span className="text-[#2e7d32] font-medium text-xs">Free (৳0.00)</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
              <span className="font-bold text-on-surface text-sm">Total Deducted</span>
              <span className="font-bold text-primary text-sm">৳{Number(total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe flex flex-col gap-3">
        <Link
          href="/transactions"
          className="w-full bg-surface-container-high text-primary h-12 rounded-xl font-bold hover:bg-surface-variant transition-colors shadow-sm flex justify-center items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          View in Transaction History
        </Link>
        <Link
          href="/scan-pay"
          className="w-full bg-surface-container text-on-surface h-12 rounded-xl font-bold hover:bg-surface-variant transition-colors shadow-sm flex justify-center items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          Scan Another QR
        </Link>
        <button
          onClick={() => { window.location.href = "/"; }}
          className="w-full bg-primary text-white h-12 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm flex justify-center items-center text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function QRPaySuccess() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading...</div>}>
      <QRSuccessContent />
    </Suspense>
  );
}

