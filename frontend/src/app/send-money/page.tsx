"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import MobileTransferHub from "./transfer-hub-mobile";

export default function SendMoneyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [toProvider, setToProvider] = useState<"bKash" | "Nagad" | "Rocket">("bKash");

  const recentContacts = [
    { name: "Sadia Rahman", phone: "01712345678", provider: "bKash" as const, initial: "S", color: "bg-tertiary-container text-on-tertiary-container" },
    { name: "Rakib Hasan", phone: "01998765432", provider: "Nagad" as const, initial: "R", color: "bg-secondary-container text-on-secondary-container" },
    { name: "Tanvir Ahmed", phone: "01811223344", provider: "Rocket" as const, initial: "T", color: "bg-[#f3e5f5] text-[#8C3494]" },
  ];

  const handleSelectContact = (contact: typeof recentContacts[0]) => {
    setPhone(contact.phone);
    setRecipientName(contact.name);
    setToProvider(contact.provider);
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setPhone(cleaned);
    if (cleaned.startsWith("017") || cleaned.startsWith("013")) {
      setToProvider("bKash");
    } else if (cleaned.startsWith("019") || cleaned.startsWith("014")) {
      setToProvider("Nagad");
    } else if (cleaned.startsWith("018") || cleaned.startsWith("016") || cleaned.startsWith("015")) {
      setToProvider("Rocket");
    }
  };

  const handleNext = () => {
    if (phone.length >= 11) {
      const query = new URLSearchParams({
        phone,
        name: recipientName || `User ${phone.slice(-4)}`,
        toProvider,
      });
      router.push(`/send-money/amount?${query.toString()}`);
    }
  };

  return (
    <>
      <TopAppBar subtitle="Transfer Hub" />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-0 md:p-8 min-h-screen md:h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)] pb-24 md:pb-8">
        {/* Mobile View: Interoperable Transfer Hub */}
        <div className="block lg:hidden">
          <MobileTransferHub />
        </div>

        {/* Desktop View: Multi-step Recipient Form */}
        <div className="hidden lg:block max-w-xl">
          <header className="flex items-center gap-4 mb-6 pt-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Interoperable Transfer Hub</h1>
              <p className="font-body-sm text-on-surface-variant">Send money across Bangladeshi MFS and Bank rails</p>
            </div>
          </header>

          <div className="flex-1 flex flex-col gap-6 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2 font-semibold">
                Recipient Phone Number
              </label>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
                <input
                  type="tel"
                  maxLength={11}
                  className="w-full bg-transparent border-none font-body-lg text-body-lg text-on-surface focus:ring-0 p-0 placeholder:text-outline-variant outline-none font-semibold"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Destination Provider Selector */}
              <div className="mt-4">
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2 font-semibold">
                  Recipient Wallet Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["bKash", "Nagad", "Rocket"] as const).map((prov) => {
                    const isSelected = toProvider === prov;
                    return (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setToProvider(prov)}
                        className={`py-2.5 px-3 rounded-xl border font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-outline-variant/40 bg-surface-container hover:bg-surface-variant text-on-surface"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {prov}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 font-semibold">Recent Contacts</h3>
              <div className="space-y-3">
                {recentContacts.map((c) => (
                  <button
                    key={c.phone}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low border border-outline-variant/20 transition-all text-left group"
                    onClick={() => handleSelectContact(c)}
                  >
                    <div className={`w-11 h-11 rounded-full ${c.color} flex items-center justify-center font-bold text-md shadow-sm`}>
                      {c.initial}
                    </div>
                    <div className="flex-1">
                      <div className="font-label-md font-bold text-on-surface group-hover:text-primary transition-colors">
                        {c.name}
                      </div>
                      <div className="font-label-sm text-on-surface-variant">{c.phone}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-on-surface-variant font-semibold">
                      {c.provider}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNext}
                disabled={phone.length < 11}
                className="w-full bg-primary-container text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary disabled:opacity-40 transition-colors shadow-sm"
              >
                Continue to Amount
              </button>
            </div>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
