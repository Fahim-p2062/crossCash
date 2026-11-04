"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { BalanceResponse } from "@/types";

interface QRPayResponse {
  message: string;
  transaction: { _id: string; amount: number; fee: number; total: number };
  senderWalletBalance: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  bKash: "#E2136E",
  Nagad: "#F7941D",
  Rocket: "#8C3494",
};

function ConfirmQRForm() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const rawQR = searchParams.get("rawQR") || "";
  const merchantName = searchParams.get("merchantName") || "Unknown Merchant";
  const merchantCity = searchParams.get("merchantCity") || "Bangladesh";
  const provider = searchParams.get("provider") || "";
  const currency = searchParams.get("currency") || "BDT";
  const isDynamic = searchParams.get("isDynamic") === "true";
  const qrAmount = searchParams.get("amount") ? Number(searchParams.get("amount")) : null;

  const [amount, setAmount] = useState(qrAmount !== null ? String(qrAmount) : "");
  const [fromWallet, setFromWallet] = useState("bKash");
  const [wallets, setWallets] = useState<{ provider: string; balance: number }[]>([]);
  const [pin, setPin] = useState("");
  const [pinLength, setPinLength] = useState(4);
  const [step, setStep] = useState<"details" | "pin">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallets and pinLength
  useEffect(() => {
    // Read synchronously from localStorage first to avoid async flash
    try {
      const raw = localStorage.getItem("crosscash_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.wallets && u.wallets.length > 0) {
          setWallets(u.wallets.map((w: any) => ({ provider: w.provider, balance: w.balance })));
          setFromWallet(u.wallets[0].provider || "bKash");
        }
        if (u.pinLength && u.pinLength >= 4 && u.pinLength <= 6) {
          setPinLength(u.pinLength);
        }
      }
    } catch {}

    if (!user?._id) return;

    apiRequest<BalanceResponse>(`/api/user/${user._id}/balance`)
      .then((data) => {
        if (data.wallets?.length) {
          setWallets(data.wallets.map((w) => ({ provider: w.provider, balance: w.balance })));
          setFromWallet(data.wallets[0]?.provider || "bKash");
        }
      })
      .catch(() => {});

    // Get sender pinLength
    const senderPhone =
      user?.phone ||
      (() => {
        try {
          const raw = localStorage.getItem("crosscash_user");
          return raw ? JSON.parse(raw)?.phone : null;
        } catch { return null; }
      })();
    if (senderPhone) {
      apiRequest<{ pinLength: number }>(`/api/auth/pin-length/${senderPhone}`, { skipAuth: true })
        .then((d) => { if (d?.pinLength >= 4) setPinLength(d.pinLength); })
        .catch(() => {});
    }
  }, [user]);

  const numAmount = Number(amount) || 0;
  const selectedWallet = wallets.find((w) => w.provider === fromWallet);
  const canAfford = (selectedWallet?.balance ?? Infinity) >= numAmount;

  const handlePay = async () => {
    if (pin.length !== pinLength || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest<QRPayResponse>("/api/qr/pay", {
        method: "POST",
        body: JSON.stringify({ rawQR, amount: numAmount, fromWalletProvider: fromWallet, pin }),
      });

      const params = new URLSearchParams({
        merchantName,
        merchantCity,
        provider: provider || fromWallet,
        fromWallet,
        amount: String(res.transaction.amount),
        fee: String(res.transaction.fee),
        total: String(res.transaction.total),
        txId: res.transaction._id,
      });
      router.push(`/scan-pay/success?${params.toString()}`);
    } catch (err: unknown) {
      setIsLoading(false);
      setPin("");
      setError(err instanceof ApiError ? err.message : "Payment failed. Please try again.");
    }
  };

  const providerColor = PROVIDER_COLORS[provider] || "#6750A4";

  if (step === "pin") {
    return (
      <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto bg-primary text-white">
        <header className="flex items-center gap-4 mb-6 pt-4">
          <button
            onClick={() => { setStep("details"); setPin(""); setError(null); }}
            disabled={isLoading}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="font-bold text-xl text-white">Enter PIN</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-6">
          <div className="text-center w-full">
            <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
              Paying ৳{numAmount.toLocaleString()} to {merchantName}
            </div>
            <div className="text-white/90 text-sm mb-5">
              Enter your {pinLength}-digit CrossCash PIN
            </div>

            <div className="flex justify-center gap-4 mb-4">
              {[...Array(pinLength)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    i < pin.length ? "bg-white scale-110 shadow-sm" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mx-auto max-w-xs p-3 bg-red-600/80 text-white text-xs rounded-xl border border-white/20 mb-2">
                {error}
              </div>
            )}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-5 w-full max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                disabled={isLoading}
                onClick={() => { if (pin.length < pinLength) { setPin(pin + num); setError(null); } }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-medium text-white hover:bg-white/10 active:bg-white/25 transition-colors"
              >
                {num}
              </button>
            ))}
            <div className="w-16 h-16" />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => { if (pin.length < pinLength) { setPin(pin + "0"); setError(null); } }}
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-medium text-white hover:bg-white/10 active:bg-white/25 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => { setPin(pin.slice(0, -1)); setError(null); }}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/25 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">backspace</span>
            </button>
          </div>
        </div>

        <div className="mt-auto pt-4 pb-safe">
          <button
            onClick={handlePay}
            disabled={pin.length !== pinLength || isLoading}
            className="w-full bg-white text-primary h-14 rounded-xl font-bold hover:bg-surface-variant disabled:opacity-50 transition-colors shadow-sm flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
                Processing Payment...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-6 pt-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold text-xl text-on-surface">Payment Details</h1>
      </header>

      <div className="flex-1 flex flex-col gap-5">
        {/* Merchant Card */}
        <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: providerColor }}
            >
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-on-surface text-base">{merchantName}</h2>
              <p className="text-on-surface-variant text-sm">{merchantCity}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="px-2 py-0.5 text-white rounded-full text-xs font-bold"
                  style={{ backgroundColor: providerColor }}
                >
                  {provider || "Merchant"}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {isDynamic ? "Dynamic QR" : "Static QR"}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-1 block">
              {isDynamic && qrAmount !== null ? "Amount (from QR)" : "Enter Amount (BDT)"}
            </label>
            {isDynamic && qrAmount !== null ? (
              <div className="text-4xl font-bold text-primary">৳{qrAmount.toLocaleString()}</div>
            ) : (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  placeholder="0.00"
                  className="w-full h-14 pl-10 pr-4 text-2xl font-bold text-on-surface bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* From wallet selector */}
          <div>
            <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-1 block">Pay From</label>
            <div className="flex gap-2 flex-wrap">
              {wallets.map((w) => (
                <button
                  key={w.provider}
                  onClick={() => setFromWallet(w.provider)}
                  className={`flex-1 min-w-[90px] px-3 py-2 rounded-xl border-2 transition-colors text-sm font-medium ${
                    fromWallet === w.provider
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/40 text-on-surface-variant"
                  }`}
                >
                  <div>{w.provider}</div>
                  <div className="text-xs opacity-70">৳{w.balance.toFixed(0)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-surface-container-low p-4 rounded-2xl space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Merchant</span>
            <span className="font-bold text-on-surface">{merchantName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Interop Fee (P2M)</span>
            <span className="font-medium text-[#2e7d32]">Free ৳0.00</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-outline-variant/30">
            <span className="font-bold text-on-surface">Total</span>
            <span className="font-bold text-primary">৳{numAmount.toLocaleString()}</span>
          </div>
        </div>

        {!canAfford && numAmount > 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            Insufficient balance in {fromWallet}. Available: ৳{(selectedWallet?.balance ?? 0).toFixed(2)}
          </div>
        )}

        {/* Info note */}
        <div className="bg-surface-container-low p-3 rounded-xl flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Bangla QR merchant payments have <strong>no CrossCash interoperability fee</strong>. This follows Bangladesh Bank&apos;s P2M payment guidelines.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={() => { setError(null); setStep("pin"); }}
          disabled={!numAmount || numAmount <= 0 || !canAfford}
          className="w-full bg-primary text-white h-14 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
          Continue to Authorize
        </button>
      </div>
    </div>
  );
}

export default function ScanPayConfirm() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading...</div>}>
      <ConfirmQRForm />
    </Suspense>
  );
}

