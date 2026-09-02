"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SendMoneyRecipient() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleNext = () => {
    if (phone.length >= 11) {
      router.push(`/send-money/amount?phone=${phone}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Send Money</h1>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Recipient Phone Number</label>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <input
              type="tel"
              className="w-full bg-transparent border-none font-body-lg text-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </div>
          {phone.length >= 11 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#fce4ec] text-[#d81b60] rounded-full font-label-sm">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              This number is on bKash
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-4">Recent Contacts</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-surface-container transition-colors text-left" onClick={() => setPhone("01712345678")}>
              <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-lg">S</div>
              <div className="flex-1">
                <div className="font-label-md font-bold text-on-surface">Sadia Rahman</div>
                <div className="font-label-sm text-on-surface-variant">01712345678</div>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-surface-container transition-colors text-left" onClick={() => setPhone("01998765432")}>
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">R</div>
              <div className="flex-1">
                <div className="font-label-md font-bold text-on-surface">Rakib Hasan</div>
                <div className="font-label-sm text-on-surface-variant">01998765432</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-safe">
        <button
          onClick={handleNext}
          disabled={phone.length < 11}
          className="w-full bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
