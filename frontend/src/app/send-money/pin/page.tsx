"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { Transaction } from "@/types";
import { authorizeTransferWithBiometrics } from "@/lib/webauthn";

interface TransferResponse {
  message: string;
  transaction: Transaction;
  senderWalletBalance?: number;
}

function PinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "Recipient";
  const toProvider = searchParams.get("toProvider") || "Nagad";
  const fromProvider = searchParams.get("fromProvider") || "bKash";
  const amount = searchParams.get("amount") || "0";

  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyClick = (num: string) => {
    if (pin.length < 5) {
      setPin(pin + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (pin.length !== 5 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest<TransferResponse>("/api/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          recipientPhone: phone,
          recipientName: name,
          fromWalletProvider: fromProvider,
          toWalletProvider: toProvider,
          amount: Number(amount),
          pin,
        }),
      });

      const tx = res.transaction;
      const query = new URLSearchParams({
        phone,
        name: tx.recipientName || name,
        fromProvider: tx.fromWalletProvider || fromProvider,
        toProvider: tx.toWalletProvider || toProvider,
        amount: String(tx.amount || amount),
        fee: String(tx.fee || (Number(amount) * 0.01).toFixed(2)),
        total: String(tx.total || amount),
        txId: tx._id,
      });

      router.push(`/send-money/success?${query.toString()}`);
    } catch (err: unknown) {
      setIsLoading(false);
      setPin("");
      setError(err instanceof ApiError ? err.message : "Transfer failed. Please check your balance and try again.");
    }
  };

  const handleBiometricAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await authorizeTransferWithBiometrics();
      const res = await apiRequest<TransferResponse>("/api/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          recipientPhone: phone,
          recipientName: name,
          fromWalletProvider: fromProvider,
          toWalletProvider: toProvider,
          amount: Number(amount),
        }),
      });

      const tx = res.transaction;
      const query = new URLSearchParams({
        phone,
        name: tx.recipientName || name,
        fromProvider: tx.fromWalletProvider || fromProvider,
        toProvider: tx.toWalletProvider || toProvider,
        amount: String(tx.amount || amount),
        fee: String(tx.fee || (Number(amount) * 0.01).toFixed(2)),
        total: String(tx.total || amount),
        txId: tx._id,
      });

      router.push(`/send-money/success?${query.toString()}`);
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Biometric authorization failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto bg-primary text-white">
      <header className="flex items-center gap-4 mb-6 pt-4">
        <button
          onClick={() => router.back()}
          disabled={isLoading}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg font-bold text-white">Enter PIN</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-6">
        <div className="text-center w-full">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
            Transferring ৳{Number(amount).toLocaleString()} from {fromProvider} to {toProvider}
          </div>
          <div className="font-label-md text-white/90 mb-5">Enter your 5-digit CrossCash PIN</div>

          {/* PIN Dots */}
          <div className="flex justify-center gap-4 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  i < pin.length ? "bg-white scale-110 shadow-sm" : "bg-white/30"
                }`}
              ></div>
            ))}
          </div>

          {error && (
            <div className="mx-auto max-w-xs p-3 bg-red-600/80 text-white text-xs rounded-xl border border-white/20 mb-2 animate-shake">
              {error}
            </div>
          )}
        </div>

        {/* Custom Numpad */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-5 w-full max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLoading}
              onClick={() => handleKeyClick(num.toString())}
              className="w-16 h-16 rounded-full flex items-center justify-center font-headline-xl text-3xl font-medium text-white hover:bg-white/10 active:bg-white/25 transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleBiometricAuth}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/25 transition-colors"
            title="Authorize with Fingerprint / Face ID"
          >
            <span className="material-symbols-outlined text-3xl">fingerprint</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleKeyClick("0")}
            className="w-16 h-16 rounded-full flex items-center justify-center font-headline-xl text-3xl font-medium text-white hover:bg-white/10 active:bg-white/25 transition-colors"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/25 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">backspace</span>
          </button>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={pin.length !== 5 || isLoading}
          className="w-full bg-white text-primary h-14 rounded-xl font-headline-md text-headline-md font-bold hover:bg-surface-variant disabled:opacity-50 transition-colors shadow-sm flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
              Processing Transfer...
            </>
          ) : (
            "Verify & Send"
          )}
        </button>
      </div>
    </div>
  );
}

export default function SendMoneyPin() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
      <PinForm />
    </Suspense>
  );
}
