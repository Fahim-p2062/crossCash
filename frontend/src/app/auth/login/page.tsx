"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && pin.length >= 4) {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="font-headline-xl text-[36px] font-bold text-primary mb-2">CrossCash</h1>
          <p className="font-body-md text-on-surface-variant">Log in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="font-label-md text-on-surface-variant block mb-2">Phone Number</label>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="tel"
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-label-md text-on-surface-variant block mb-2">CrossCash PIN</label>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="password"
                maxLength={6}
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none tracking-[0.3em]"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!phone || pin.length < 4}
              className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm"
            >
              Log In
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <span className="font-body-md text-on-surface-variant">Don't have an account? </span>
          <Link href="/auth/register" className="font-label-md font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
