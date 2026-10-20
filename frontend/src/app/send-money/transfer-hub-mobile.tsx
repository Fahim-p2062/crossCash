"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Wallet } from "@/types";
import { authorizeTransferWithBiometrics } from "@/lib/webauthn";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  provider: "bKash" | "Nagad" | "Rocket" | "Bank";
  accountType?: string;
  avatarBg?: string;
}

export const PHONE_CONTACTS: Contact[] = [
  { id: "1", name: "Sadia Rahman", phone: "01712345678", provider: "bKash", accountType: "bKash Personal", avatarBg: "bg-[#fce4ec] text-[#d81b60]" },
  { id: "2", name: "Rakib Hasan", phone: "01912345678", provider: "Nagad", accountType: "Nagad Personal", avatarBg: "bg-[#fff3e0] text-[#e65100]" },
  { id: "3", name: "Tanvir Ahmed", phone: "01811223344", provider: "Rocket", accountType: "Rocket DBBL", avatarBg: "bg-[#f3e5f5] text-[#8C3494]" },
  { id: "4", name: "Mom (আম্মু)", phone: "01711002233", provider: "bKash", accountType: "Family Primary", avatarBg: "bg-tertiary-fixed text-on-tertiary-fixed" },
  { id: "5", name: "Nusrat Jahan", phone: "01301987654", provider: "bKash", accountType: "bKash Personal", avatarBg: "bg-[#fce4ec] text-[#d81b60]" },
  { id: "6", name: "Brother (ভাইয়া)", phone: "01911445566", provider: "Nagad", accountType: "Personal", avatarBg: "bg-secondary-container text-on-secondary-container" },
  { id: "7", name: "Arif Hossain", phone: "01678554433", provider: "Rocket", accountType: "Rocket DBBL", avatarBg: "bg-[#f3e5f5] text-[#8C3494]" },
  { id: "8", name: "Fahad Karim", phone: "01552334455", provider: "Nagad", accountType: "Nagad Personal", avatarBg: "bg-[#fff3e0] text-[#e65100]" },
  { id: "9", name: "City Bank Savings", phone: "2051104892", provider: "Bank", accountType: "A/C •••• 4892", avatarBg: "bg-surface-container-high text-primary-container" },
];

export default function MobileTransferHub() {
  const router = useRouter();
  const { user } = useAuth();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [sourceProvider, setSourceProvider] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [destinationProvider, setDestinationProvider] = useState<"bKash" | "Nagad" | "Rocket" | "Bank">("Nagad");
  
  // Recipient state - user can enter any custom number or pick contact
  const [recipientPhone, setRecipientPhone] = useState("01912345678");
  const [recipientName, setRecipientName] = useState("Rakib Hasan (Nagad Personal)");
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactFilterProvider, setContactFilterProvider] = useState<string>("All");

  const [amount, setAmount] = useState("2000");
  const [activeChip, setActiveChip] = useState<string>("2000");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [isBiometricTransferring, setIsBiometricTransferring] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    apiRequest<BalanceResponse>(`/api/user/${user._id}/balance?_t=${Date.now()}`)
      .then((data) => {
        if (data.wallets && data.wallets.length > 0) {
          setWallets(data.wallets);
        }
      })
      .catch(() => {});
  }, [user]);

  // Dynamic destination options excluding current source provider
  const destinationOptions = (["bKash", "Nagad", "Rocket", "Bank"] as const).filter(
    (prov) => prov !== sourceProvider
  );

  // Auto-adjust destination provider if it clashes with source provider
  useEffect(() => {
    if (destinationProvider === (sourceProvider as any)) {
      setDestinationProvider(destinationOptions[0]);
    }
  }, [sourceProvider, destinationProvider, destinationOptions]);

  const getSourceBalance = (provider: string) => {
    const w = wallets.find((item) => item.provider.toLowerCase() === provider.toLowerCase());
    if (w) return w.balance;
    if (provider === "bKash") return 8485;
    if (provider === "Nagad") return 1000;
    if (provider === "Rocket") return 4000;
    return 8485;
  };

  const currentSourceBalance = getSourceBalance(sourceProvider);

  // Calculation
  const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  const fee = Math.round(numericAmount * 0.01 * 100) / 100;
  const total = Math.round((numericAmount + fee) * 100) / 100;

  const handleChipClick = (val: string) => {
    setActiveChip(val);
    if (val === "Max") {
      const maxVal = Math.floor(currentSourceBalance * 0.99);
      setAmount(String(maxVal));
    } else {
      setAmount(val);
    }
  };

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setAmount(cleaned);
    setActiveChip("");
  };

  const handleSwitchRails = () => {
    setIsFlipped(!isFlipped);
    if (destinationProvider !== "Bank") {
      const oldSource = sourceProvider;
      const oldDest = destinationProvider;
      setSourceProvider(oldDest as "bKash" | "Nagad" | "Rocket");
      setDestinationProvider(oldSource as any);
    }
  };

  // Recipient input & contacts handlers
  const handlePhoneInputChange = (rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, "");
    setRecipientPhone(cleaned);

    const matched = PHONE_CONTACTS.find((c) => c.phone === cleaned);
    if (matched) {
      setRecipientName(matched.name);
      if (matched.provider !== "Bank" && matched.provider !== sourceProvider) {
        setDestinationProvider(matched.provider);
      }
    } else if (cleaned.length >= 11) {
      setRecipientName(`New Number (${cleaned.slice(-4)})`);
      // Auto-detect provider prefix
      if ((cleaned.startsWith("017") || cleaned.startsWith("013")) && sourceProvider !== "bKash") {
        setDestinationProvider("bKash");
      } else if ((cleaned.startsWith("019") || cleaned.startsWith("014")) && sourceProvider !== "Nagad") {
        setDestinationProvider("Nagad");
      } else if ((cleaned.startsWith("018") || cleaned.startsWith("016") || cleaned.startsWith("015")) && sourceProvider !== "Rocket") {
        setDestinationProvider("Rocket");
      }
    } else if (cleaned.length === 0) {
      setRecipientName("");
    } else {
      setRecipientName("Custom Recipient");
    }
  };

  const handleClearRecipient = () => {
    setRecipientPhone("");
    setRecipientName("");
  };

  const handleSelectContact = (contact: Contact) => {
    setRecipientPhone(contact.phone);
    setRecipientName(contact.name);
    if (contact.provider === "Bank") {
      setDestinationProvider("Bank");
    } else if (contact.provider !== sourceProvider) {
      setDestinationProvider(contact.provider);
    }
    setIsContactsModalOpen(false);
  };

  const handleTransfer = () => {
    if (numericAmount <= 0) {
      alert("Please enter a transfer amount.");
      return;
    }
    if (!recipientPhone || recipientPhone.length < 11) {
      alert("Please enter a valid 11-digit recipient phone number or select a contact.");
      return;
    }
    const destName = recipientName || `Recipient (${recipientPhone.slice(-4)})`;
    const query = new URLSearchParams({
      phone: recipientPhone,
      name: destName,
      toProvider: destinationProvider,
      fromProvider: sourceProvider,
      amount: String(numericAmount),
    });
    router.push(`/send-money/confirm?${query.toString()}`);
  };

  const handleBiometricExpressTransfer = async () => {
    if (numericAmount <= 0) {
      alert("Please enter a transfer amount first.");
      return;
    }
    if (!recipientPhone || recipientPhone.length < 11) {
      alert("Please enter a valid 11-digit recipient phone number or pick a contact.");
      return;
    }

    setIsBiometricTransferring(true);
    try {
      // 1. Trigger hardware sensor prompt
      await authorizeTransferWithBiometrics();

      // 2. Hardware biometric matched! Execute transfer immediately
      const res = await apiRequest<any>("/api/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          recipientPhone,
          recipientName: recipientName || `User ${recipientPhone.slice(-4)}`,
          fromWalletProvider: sourceProvider,
          toWalletProvider: destinationProvider,
          amount: numericAmount,
        }),
      });

      const tx = res.transaction;
      const query = new URLSearchParams({
        phone: recipientPhone,
        name: tx.recipientName || recipientName || "Recipient",
        fromProvider: tx.fromWalletProvider || sourceProvider,
        toProvider: tx.toWalletProvider || destinationProvider,
        amount: String(tx.amount || numericAmount),
        fee: String(tx.fee || fee),
        total: String(tx.total || total),
        txId: tx._id,
      });

      router.push(`/send-money/success?${query.toString()}`);
    } catch (err: any) {
      alert(err.message || "Biometric transfer authorization failed.");
    } finally {
      setIsBiometricTransferring(false);
    }
  };

  const getSourceGradient = (prov: string) => {
    if (prov === "bKash") return "linear-gradient(135deg, #e2136e, #b80053)";
    if (prov === "Nagad") return "linear-gradient(135deg, #f7941d, #d03027)";
    return "linear-gradient(135deg, #8c3686, #5c246e)";
  };

  const getSourceInitials = (prov: string) => {
    if (prov === "bKash") return "bK";
    if (prov === "Nagad") return "NG";
    return "RK";
  };

  // Contacts filter in modal
  const filteredContactsList = PHONE_CONTACTS.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.phone.includes(contactSearchQuery);
    const matchesProvider =
      contactFilterProvider === "All" || c.provider === contactFilterProvider;
    return matchesQuery && matchesProvider;
  });

  return (
    <div className="flex flex-col w-full pb-8 pt-2">
      {/* Container */}
      <div className="relative w-full px-margin md:px-0 pt-space-sm space-y-space-md">
        {/* Context Banner */}
        <div className="flex flex-col space-y-space-2xs">
          <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant">
            <span className="material-symbols-outlined text-[14px]">sync_alt</span>
            <span className="font-label-md text-label-md tracking-wider uppercase font-semibold">
              Unified Payment Rail
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            Interoperable Transfer Hub
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Send money seamlessly across any mobile financial service or bank.
          </p>
        </div>

        {/* Unified Payment Card */}
        <div className="flex flex-col space-y-space-md">
          {/* Source Wallet Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm relative">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                From (Source Wallet)
              </span>
              <span className="font-body-sm text-body-sm text-tertiary font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span> Direct Auth Active
              </span>
            </div>

            <button
              onClick={() => setShowSourcePicker(!showSourcePicker)}
              className="w-full flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-left"
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-title-md text-title-md font-bold shadow-xs"
                  style={{ background: getSourceGradient(sourceProvider) }}
                >
                  {getSourceInitials(sourceProvider)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">
                      {sourceProvider} (Personal)
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-label-md text-[10px] font-semibold uppercase">
                      MFS
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {user?.phone || "01777885053"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs text-right">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant">Available</span>
                  <span className="font-title-md text-title-md text-on-surface font-bold">
                    ৳{currentSourceBalance.toLocaleString()}
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {showSourcePicker ? "expand_less" : "expand_more"}
                </span>
              </div>
            </button>

            {/* Source Wallet Picker Dropdown */}
            {showSourcePicker && (
              <div className="mt-2 p-2 bg-surface rounded-xl border border-outline-variant/30 shadow-md space-y-1 animate-fadeIn">
                {(["bKash", "Nagad", "Rocket"] as const).map((prov) => {
                  const bal = getSourceBalance(prov);
                  const isSel = sourceProvider === prov;
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => {
                        setSourceProvider(prov);
                        setShowSourcePicker(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                        isSel ? "bg-primary-container/10 border border-primary/20" : "hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: getSourceGradient(prov) }}
                        >
                          {getSourceInitials(prov)}
                        </div>
                        <span className="font-title-md text-body-md text-on-surface font-semibold">{prov}</span>
                      </div>
                      <span className="font-title-md text-body-md font-bold text-on-surface">৳{bal.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Central Interoperability Switch Button */}
          <div className="relative flex justify-center -my-3 z-10">
            <button
              aria-label="Switch transfer direction"
              onClick={handleSwitchRails}
              className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary-container text-on-primary shadow-md active:scale-95 transition-transform border-2 border-surface-container-lowest"
              id="interop-switch-btn"
              type="button"
            >
              <div className={`transition-transform duration-300 ${isFlipped ? "rotate-180" : ""}`}>
                <span className="material-symbols-outlined text-[18px]">swap_vert</span>
              </div>
              <span className="font-label-md text-label-md font-semibold tracking-wide text-surface-container-lowest">
                Instant Interoperability Switch
              </span>
              <span className="inline-flex w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
            </button>
          </div>

          {/* Destination Wallet Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                To (Destination)
              </span>
              <span className="font-body-sm text-body-sm text-primary font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">bolt</span> NPSB Direct Rail
              </span>
            </div>

            {/* Destination Selector Tabs (Dynamic based on source provider) */}
            <div className={`grid grid-cols-${destinationOptions.length} gap-space-xs p-1 bg-surface-container-low rounded-lg`} role="tablist">
              {destinationOptions.map((prov) => {
                const isSelected = destinationProvider === prov;
                return (
                  <button
                    key={prov}
                    aria-selected={isSelected}
                    onClick={() => setDestinationProvider(prov)}
                    className={`destination-tab flex items-center justify-center gap-space-xs py-2 px-space-xs rounded-md transition-all ${
                      isSelected
                        ? "bg-surface-container-lowest shadow-sm text-on-surface font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    role="tab"
                    type="button"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{
                        background:
                          prov === "bKash"
                            ? "linear-gradient(135deg, #e2136e, #b80053)"
                            : prov === "Nagad"
                            ? "linear-gradient(135deg, #f7941d, #d03027)"
                            : prov === "Rocket"
                            ? "linear-gradient(135deg, #8c3686, #5c246e)"
                            : "#2a14b4",
                      }}
                    >
                      {prov === "Bank" ? (
                        <span className="material-symbols-outlined text-[12px]">account_balance</span>
                      ) : (
                        prov.charAt(0)
                      )}
                    </div>
                    <span className="font-body-sm text-body-sm truncate">{prov}</span>
                  </button>
                );
              })}
            </div>

            {/* Recipient Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="font-label-md text-label-md text-on-surface-variant font-medium"
                  htmlFor="recipient-phone"
                >
                  Recipient Account / Mobile
                </label>
                <button
                  type="button"
                  onClick={() => setIsContactsModalOpen(true)}
                  className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">contacts</span>
                  Phone Contacts ({PHONE_CONTACTS.length})
                </button>
              </div>

              <div className="relative flex items-center rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/30 transition-all px-3 h-14 border border-outline-variant/30">
                <div className="flex items-center gap-2 text-on-surface-variant pl-1 pr-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">person_search</span>
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <input
                    className="w-full bg-transparent font-title-md text-title-md text-on-surface font-semibold focus:outline-none placeholder:text-on-surface-variant/40"
                    id="recipient-phone"
                    placeholder="Enter 01XXXXXXXXX or pick contact"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                  />
                  {recipientName && (
                    <span className="font-body-sm text-xs text-primary font-medium truncate leading-tight">
                      {recipientName}
                    </span>
                  )}
                </div>

                {/* Clear Button */}
                {recipientPhone && (
                  <button
                    type="button"
                    onClick={handleClearRecipient}
                    title="Clear number"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0 mr-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}

                {/* Open Contacts Picker Button */}
                <button
                  aria-label="Open Contacts Picker"
                  className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary hover:bg-primary-container/20 active:scale-95 transition-all shrink-0"
                  type="button"
                  onClick={() => setIsContactsModalOpen(true)}
                  title="Choose from Contacts"
                >
                  <span className="material-symbols-outlined text-[20px]">contacts</span>
                </button>
              </div>

              {/* Quick Contact Chips (bKash style) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setIsContactsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-white text-xs font-bold shrink-0 shadow-xs hover:opacity-90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  All Contacts
                </button>
                {PHONE_CONTACTS.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectContact(c)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                      recipientPhone === c.phone
                        ? "bg-secondary-container text-on-secondary-container border-primary font-bold shadow-xs"
                        : "bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${c.avatarBg}`}>
                      {c.name.charAt(0)}
                    </span>
                    <span>{c.name.split(" ")[0]}</span>
                    <span className="text-[10px] text-outline">({c.provider})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount Input Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <label
                className="font-label-md text-label-md uppercase tracking-wider font-semibold text-on-surface-variant"
                htmlFor="transfer-amount"
              >
                Transfer Amount
              </label>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Limit: ৳25,000 / day</span>
            </div>
            <div className="flex items-baseline justify-center py-space-xs">
              <span className="font-currency-display text-currency-display text-primary mr-2 font-bold select-none">
                ৳
              </span>
              <input
                className="font-currency-display text-currency-display text-on-surface font-bold text-center w-full max-w-[280px] bg-transparent focus:outline-none"
                id="transfer-amount"
                inputMode="numeric"
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="grid grid-cols-5 gap-space-xs">
              {["500", "1,000", "2,000", "5,000", "Max"].map((chip) => {
                const rawVal = chip.replace(/,/g, "");
                const isSelected = activeChip === rawVal || activeChip === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className={`h-9 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                      isSelected
                        ? "bg-primary-container text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                    type="button"
                  >
                    {chip === "Max" ? "Max" : `৳${chip}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Cost Breakdown */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm text-on-surface">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                <span className="font-title-md text-title-md font-semibold">Live Cost Breakdown</span>
              </div>
              <span className="font-label-md text-label-md text-tertiary font-medium">Transparent Rail</span>
            </div>

            <div className="space-y-space-xs pt-space-2xs text-body-sm">
              <div className="flex justify-between text-on-surface-variant font-body-sm">
                <span>Transfer Amount</span>
                <span className="font-medium text-on-surface font-mono">৳{numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-body-sm">
                <span className="flex items-center gap-1">
                  Cross-Platform Fee (1%)
                  <span className="material-symbols-outlined text-[14px] text-outline">info</span>
                </span>
                <span className="font-medium text-on-surface font-mono">৳{fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-tertiary font-body-sm font-semibold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Recipient gets in{" "}
                  {destinationProvider}
                </span>
                <span className="font-mono">৳{numericAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Deducted Hero */}
            <div className="mt-space-sm pt-space-sm border-t border-dashed border-outline-variant flex items-baseline justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider font-semibold text-on-surface-variant block">
                  Total Deducted from {sourceProvider}
                </span>
                <span className="text-[11px] text-outline">Includes regulatory interoperability surcharge</span>
              </div>
              <span className="font-headline-md text-headline-md text-primary font-bold font-mono">
                ৳{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Compliance & Security Badge */}
            <div className="mt-space-sm p-space-sm rounded-lg bg-surface-container flex items-center gap-space-sm text-on-surface">
              <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">lock</span>
              <p className="font-body-sm text-body-sm leading-tight text-on-surface-variant">
                <strong className="text-on-surface font-medium">Instant Settlement:</strong> Fully backed by Bangladesh
                Bank National Payment Switch (NPSB) guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Prominent CTA Action Station */}
        <div className="pt-space-xs space-y-space-sm">
          <div className="flex items-center gap-space-sm">
            <button
              onClick={handleTransfer}
              disabled={numericAmount <= 0}
              className="flex-1 h-14 bg-primary-container text-on-primary rounded-xl font-title-md text-title-md font-semibold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-space-sm active:scale-[0.99] disabled:opacity-50"
              id="cta-transfer-button"
              type="button"
            >
              <span id="cta-text">
                Review & Transfer ৳{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <button
              aria-label="Biometric Express Transfer"
              onClick={handleBiometricExpressTransfer}
              disabled={numericAmount <= 0 || isBiometricTransferring}
              className="w-14 h-14 rounded-xl bg-surface-container-highest text-primary-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0 shadow-sm disabled:opacity-50"
              type="button"
              title="Express Biometric Transfer"
            >
              {isBiometricTransferring ? (
                <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[28px]">fingerprint</span>
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary-container">shield</span>
            <span className="font-body-sm text-body-sm">256-bit encrypted inter-rail handshake</span>
          </div>
        </div>
      </div>

      {/* Phone Contacts Picker Modal (bKash-style full contact book) */}
      {isContactsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-[1.75rem] border border-outline-variant/40 shadow-2xl w-full max-w-lg p-5 sm:p-6 relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">contacts</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Select Recipient</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Choose from saved contacts or enter custom number</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContactsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="pt-4 pb-2">
              <div className="relative flex items-center rounded-xl bg-surface-container-lowest border border-outline-variant/40 px-3.5 h-12 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span className="material-symbols-outlined text-[20px] text-outline mr-2">search</span>
                <input
                  type="text"
                  placeholder="Search name or mobile number (e.g. 017...)"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none placeholder:text-outline"
                  autoFocus
                />
                {contactSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setContactSearchQuery("")}
                    className="text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
              {(["All", "bKash", "Nagad", "Rocket", "Bank"] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setContactFilterProvider(prov)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    contactFilterProvider === prov
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>

            {/* Contacts Scrollable List */}
            <div className="overflow-y-auto flex-1 divide-y divide-outline-variant/20 -mx-1 pr-1">
              {/* Option to send to typed query if digits entered */}
              {contactSearchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handlePhoneInputChange(contactSearchQuery);
                    setIsContactsModalOpen(false);
                  }}
                  className="w-full p-3 my-1 rounded-xl bg-primary-container/10 border border-primary/30 flex items-center gap-3 text-left hover:bg-primary-container/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[20px]">add_call</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-title-md text-title-md font-bold text-primary truncate">
                      Send to "{contactSearchQuery}"
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Tap to send money to this custom number
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
                </button>
              )}

              {filteredContactsList.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
                  <span className="font-semibold text-on-surface">No contacts found</span>
                  <span className="text-xs">Try searching by name or enter a mobile number directly above.</span>
                </div>
              ) : (
                filteredContactsList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectContact(c)}
                    className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-surface-container-low transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${c.avatarBg}`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-body-lg text-on-surface font-semibold truncate">
                          {c.name}
                        </span>
                        <span className="font-body-sm text-xs text-on-surface-variant font-mono">
                          {c.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface">
                        {c.provider}
                      </span>
                      <span className="text-[10px] text-outline mt-0.5">{c.accountType}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
