"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { AuthResponse } from "@/types";
import { loginWithBiometrics, checkBiometricSupport } from "@/lib/webauthn";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lockedError, setLockedError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkBiometricSupport().then((support) => {
      setBiometricSupported(support.supported);
    });
  }, []);

  const handleBiometricLogin = async () => {
    if (!phone || phone.trim().length < 10) {
      setGeneralError("Please enter your Phone Number first to authenticate with biometrics.");
      return;
    }
    setGeneralError(null);
    setLockedError(null);
    setIsBiometricLoading(true);

    try {
      const data = await loginWithBiometrics(phone.trim());
      login(data.token, data.user);
      router.push("/");
    } catch (err: any) {
      setGeneralError(err.message || "Biometric login failed. Please verify sensor or use PIN.");
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setGeneralError(null);
    setLockedError(null);
    setFieldErrors({});

    if (!phone || pin.length < 4) {
      setGeneralError("Please enter a valid phone number and at least a 4-digit PIN.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim(), pin: pin.trim() }),
        skipAuth: true,
      });

      login(data.token, data.user);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 423) {
          setLockedError(err.message || "Account is temporarily locked. Please try again after 15 minutes.");
        } else if (err.status === 400) {
          if (err.fieldErrors && err.fieldErrors.length > 0) {
            const mapped: Record<string, string> = {};
            err.fieldErrors.forEach((f) => {
              mapped[f.field] = f.message;
            });
            setFieldErrors(mapped);
          } else {
            setGeneralError(err.message || "Invalid phone or PIN");
          }
        } else {
          setGeneralError(err.message || "Login failed. Please check your credentials.");
        }
      } else {
        setGeneralError("An unexpected error occurred. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[448px] flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="font-headline-xl text-[36px] font-bold text-primary mb-2">CrossCash</h1>
          <p className="font-body-md text-on-surface-variant">Log in to your account</p>
        </div>

        {/* Account Locked Alert */}
        {lockedError && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error/30 text-error flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">lock</span>
            <div className="text-sm font-body-md">
              <span className="font-bold block mb-1">Account Locked</span>
              {lockedError}
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="text-sm font-body-md">{generalError}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="font-label-md text-on-surface-variant block mb-2">Phone Number</label>
            <div className={`bg-surface-container-lowest p-4 rounded-xl border ${
              fieldErrors.phone ? "border-error focus-within:border-error focus-within:ring-error" : "border-outline-variant/40 focus-within:border-primary focus-within:ring-primary"
            } focus-within:ring-1 transition-all`}>
              <input
                type="tel"
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-error font-body-md">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="font-label-md text-on-surface-variant block mb-2">CrossCash PIN</label>
            <div className={`bg-surface-container-lowest p-4 rounded-xl border ${
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
                  if (fieldErrors.pin) {
                    setFieldErrors((prev) => ({ ...prev, pin: "" }));
                  }
                }}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.pin && (
              <p className="mt-1 text-xs text-error font-body-md">{fieldErrors.pin}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isBiometricLoading || !phone || pin.length < 4}
              className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? "Logging In..." : "Log In with PIN"}
            </button>
          </div>

          {biometricSupported && (
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 text-xs font-label-md text-on-surface-variant font-medium">OR FAST UNLOCK</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isLoading || isBiometricLoading}
                className="w-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest h-12 rounded-xl font-label-md font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 border border-outline-variant/40"
              >
                {isBiometricLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[22px] text-primary">fingerprint</span>
                )}
                <span>{isBiometricLoading ? "Scanning Biometrics..." : "Sign in with Fingerprint / Face ID"}</span>
              </button>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <span className="font-body-md text-on-surface-variant">Don&apos;t have an account? </span>
          <Link href="/auth/register" className="font-label-md font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
