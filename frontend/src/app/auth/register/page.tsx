"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && pin.length >= 4) {
      // Typically register logic here
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <Link href="/auth/login" className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Create Account</h1>
      </header>

      <div className="flex-1 flex flex-col justify-center pb-12">
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="font-label-md text-on-surface-variant block mb-2">Full Name</label>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="text"
                className="w-full bg-transparent border-none font-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none"
                placeholder="Rakib Hasan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
            <label className="font-label-md text-on-surface-variant block mb-2">Set CrossCash PIN</label>
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
              disabled={!name || !phone || pin.length < 4}
              className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm"
            >
              Register
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <span className="font-body-md text-on-surface-variant">Already have an account? </span>
          <Link href="/auth/login" className="font-label-md font-bold text-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
