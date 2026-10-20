"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { AuthResponse } from "@/types";

type ProviderType = "bKash" | "Nagad" | "Rocket";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [provider, setProvider] = useState<ProviderType>("bKash");

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setGeneralError(null);
    setFieldErrors({});

    // Client-side validations mirroring backend Zod schema
    const newFieldErrors: Record<string, string> = {};

    if (!name.trim()) {
      newFieldErrors.name = "Full name is required";
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      newFieldErrors.phone = "Must be a valid 11-digit Bangladeshi number (e.g. 017XXXXXXXX)";
    }

    const pinRegex = /^\d{4,6}$/;
    if (!pinRegex.test(pin)) {
      newFieldErrors.pin = "PIN must be between 4 and 6 digits";
    }

    if (pin !== confirmPin) {
      newFieldErrors.confirmPin = "PINs do not match";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          pin: pin.trim(),
          provider,
        }),
        skipAuth: true,
      });

      login(data.token, data.user);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          if (err.fieldErrors && err.fieldErrors.length > 0) {
            const mapped: Record<string, string> = {};
            err.fieldErrors.forEach((f) => {
              mapped[f.field] = f.message;
            });
            setFieldErrors(mapped);
          } else {
            setGeneralError(err.message || "Registration failed. Please check your information.");
          }
        } else {
          setGeneralError(err.message || "Server error occurred during registration.");
        }
      } else {
        setGeneralError("An unexpected error occurred. Please check your network connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[448px] flex flex-col justify-center py-6">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/auth/login" className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Create Account</h1>
        </header>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="text-sm font-body-md">{generalError}</div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="font-label-md text-on-surface-variant block mb-1.5">Full Name</label>
            <div className={`bg-surface-container-lowest p-3.5 rounded-xl border ${
              fieldErrors.name ? "border-error focus-within:border-error focus-within:ring-error" : "border-outline-variant/40 focus-within:border-primary focus-within:ring-primary"
            } focus-within:ring-1 transition-all`}>
              <input
                type="text"
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none"
                placeholder="e.g. Sadia Rahman"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-error font-body-md">{fieldErrors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="font-label-md text-on-surface-variant block mb-1.5">Phone Number</label>
            <div className={`bg-surface-container-lowest p-3.5 rounded-xl border ${
              fieldErrors.phone ? "border-error focus-within:border-error focus-within:ring-error" : "border-outline-variant/40 focus-within:border-primary focus-within:ring-primary"
            } focus-within:ring-1 transition-all`}>
              <input
                type="tel"
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
                }}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-error font-body-md">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Primary Wallet Provider Selector */}
          <div>
            <label className="font-label-md text-on-surface-variant block mb-1.5">Primary Wallet Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {(["bKash", "Nagad", "Rocket"] as ProviderType[]).map((p) => {
                const isSelected = provider === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? p === "bKash"
                          ? "bg-[#fce4ec] text-[#d81b60] border-[#d81b60] shadow-sm"
                          : p === "Nagad"
                          ? "bg-[#fff3e0] text-[#e65100] border-[#e65100] shadow-sm"
                          : "bg-[#f3e5f5] text-[#8C3494] border-[#8C3494] shadow-sm"
                        : "bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: p === "bKash" ? "#d81b60" : p === "Nagad" ? "#e65100" : "#8C3494"
                    }}></span>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="font-label-md text-on-surface-variant block mb-1.5">Set CrossCash PIN (4-6 digits)</label>
            <div className={`bg-surface-container-lowest p-3.5 rounded-xl border ${
              fieldErrors.pin ? "border-error focus-within:border-error focus-within:ring-error" : "border-outline-variant/40 focus-within:border-primary focus-within:ring-primary"
            } focus-within:ring-1 transition-all`}>
              <input
                type="password"
                maxLength={6}
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none tracking-[0.3em]"
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (fieldErrors.pin) setFieldErrors((prev) => ({ ...prev, pin: "" }));
                }}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.pin && (
              <p className="mt-1 text-xs text-error font-body-md">{fieldErrors.pin}</p>
            )}
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="font-label-md text-on-surface-variant block mb-1.5">Confirm PIN</label>
            <div className={`bg-surface-container-lowest p-3.5 rounded-xl border ${
              fieldErrors.confirmPin ? "border-error focus-within:border-error focus-within:ring-error" : "border-outline-variant/40 focus-within:border-primary focus-within:ring-primary"
            } focus-within:ring-1 transition-all`}>
              <input
                type="password"
                maxLength={6}
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none tracking-[0.3em]"
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  if (fieldErrors.confirmPin) setFieldErrors((prev) => ({ ...prev, confirmPin: "" }));
                }}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.confirmPin && (
              <p className="mt-1 text-xs text-error font-body-md">{fieldErrors.confirmPin}</p>
            )}
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading || !name || !phone || pin.length < 4 || confirmPin.length < 4}
              className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <span className="font-body-md text-on-surface-variant">Already have an account? </span>
          <Link href="/auth/login" className="font-label-md font-bold text-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
