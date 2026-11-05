"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import SmsNotificationToast from "@/components/ui/SmsNotificationToast";

interface OTPSendResponse {
  message: string;
  phone: string;
  expiresIn: number;
  demoOtp?: string;
}

interface OTPVerifyResponse {
  message: string;
  verified: boolean;
  otpToken: string;
}

function HighValueOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "Recipient";
  const toProvider = searchParams.get("toProvider") || "Nagad";
  const fromProvider = searchParams.get("fromProvider") || "bKash";
  const amount = searchParams.get("amount") || "0";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [maskedPhone, setMaskedPhone] = useState("+880 18••••••");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP on mount
  const sendOtpRequest = async () => {
    setIsSending(true);
    setError(null);
    try {
      const res = await apiRequest<OTPSendResponse>("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({
          purpose: "high_value_transfer",
          amount: Number(amount),
        }),
      });

      if (res.phone) setMaskedPhone(res.phone);
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
        setToastMessage(`CrossCash 2FA: Your OTP for transfer of ৳${Number(amount).toLocaleString()} is ${res.demoOtp}. Valid for 3 mins.`);
      }
      setCountdown(60);
      setCanResend(false);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to dispatch verification code.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    sendOtpRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!paste) return;
    const newOtp = [...otp];
    for (let i = 0; i < paste.length; i++) {
      newOtp[i] = paste[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(paste.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleAutoFill = (code: string) => {
    if (code.length === 6) {
      setOtp(code.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const fullCode = otp.join("");

  const handleVerify = async () => {
    if (fullCode.length !== 6 || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest<OTPVerifyResponse>("/api/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          otp: fullCode,
          purpose: "high_value_transfer",
        }),
      });

      // Pass verified otpToken to PIN authorization screen
      const query = new URLSearchParams({
        phone,
        name,
        toProvider,
        fromProvider,
        amount,
        otpToken: res.otpToken,
      });

      router.push(`/send-money/pin?${query.toString()}`);
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof ApiError ? err.message : "Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      {/* Interactive SMS Notification for Testing / Demos */}
      {toastMessage && (
        <SmsNotificationToast
          message={toastMessage}
          otpCode={demoOtp || undefined}
          onAutoFill={handleAutoFill}
          onClose={() => setToastMessage(null)}
        />
      )}

      <header className="flex items-center gap-4 mb-4 pt-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="font-bold text-xl text-on-surface">2FA Verification</h1>
          <p className="text-xs text-on-surface-variant">Bangladesh Bank High-Value Security</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-6">
        {/* Security Shield Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-bold text-lg text-on-surface">Large Transfer Authentication</h2>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Sending <strong>৳{Number(amount).toLocaleString()}</strong> exceeds the ৳5,000 threshold.
            A 6-digit verification code has been dispatched to:
          </p>
          <div className="inline-block px-3 py-1 bg-surface-container rounded-full text-xs font-mono font-bold text-primary">
            {maskedPhone}
          </div>
        </div>

        {/* 6-box OTP Input */}
        <div className="flex justify-center gap-2.5 my-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                digit
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-outline-variant/50 bg-surface-container-low text-on-surface focus:border-primary focus:bg-surface"
              } focus:outline-none`}
            />
          ))}
        </div>

        {error && (
          <div className="max-w-xs p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-center animate-shake">
            {error}
          </div>
        )}

        {/* Resend code */}
        <div className="text-center text-xs text-on-surface-variant">
          {canResend ? (
            <button
              type="button"
              disabled={isSending}
              onClick={sendOtpRequest}
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Resend OTP Code
            </button>
          ) : (
            <span>Resend code in <strong>{countdown}s</strong></span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={handleVerify}
          disabled={fullCode.length !== 6 || isLoading}
          className="w-full bg-primary text-white h-13 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm flex justify-center items-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              Verifying Code...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
              Verify & Enter PIN
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SendMoneyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading verification...</div>}>
      <HighValueOtpForm />
    </Suspense>
  );
}
