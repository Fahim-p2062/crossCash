"use client";

import { useState, useEffect, useRef } from "react";
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
  { id: "5", name: "Sakib Islam", phone: "01512345678", provider: "Rocket", accountType: "Rocket DBBL", avatarBg: "bg-[#f3e5f5] text-[#8C3494]" },
  { id: "6", name: "Ayon", phone: "01970399581", provider: "Nagad", accountType: "Nagad Personal", avatarBg: "bg-[#fff3e0] text-[#e65100]" },
  { id: "7", name: "City Bank Savings", phone: "2051104892", provider: "Bank", accountType: "A/C •••• 4892", avatarBg: "bg-surface-container-high text-primary-container" },
];

export default function MobileTransferHub() {
  const router = useRouter();
  const { user } = useAuth();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [sourceProvider, setSourceProvider] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [destinationProvider, setDestinationProvider] = useState<"bKash" | "Nagad" | "Rocket" | "Bank">("Nagad");
  
  // Recipient state
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactFilterProvider, setContactFilterProvider] = useState<string>("All");

  // Dynamic Suggestion Bar State
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; phone: string; wallets: string[] }>>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Recipient CrossCash verification state
  // null = typing/empty, "checking" = lookup in flight, "verified" = registered, "unregistered" = not on CrossCash
  const [verificationStatus, setVerificationStatus] = useState<"checking" | "verified" | "unregistered" | null>(null);

  const [amount, setAmount] = useState("2000");
  const [activeChip, setActiveChip] = useState<string>("2000");
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

  // Perform backend CrossCash lookup when an 11-digit number is entered
  const verifyRecipientOnCrossCash = async (phone: string) => {
    setVerificationStatus("checking");
    setShowSuggestionsDropdown(false);
    try {
      const res = await apiRequest<{
        exists: boolean;
        user: { name: string; phone: string; wallets: string[] };
      }>(`/api/user/lookup/${phone}`);

      if (res && res.exists && res.user) {
        setVerificationStatus("verified");
        setRecipientName(res.user.name);
        // If recipient has preferred wallets, align destination tab
        if (res.user.wallets && res.user.wallets.length > 0) {
          const firstWallet = res.user.wallets[0] as "bKash" | "Nagad" | "Rocket";
          if (firstWallet !== sourceProvider) {
            setDestinationProvider(firstWallet);
          }
        }
      } else {
        setVerificationStatus("unregistered");
        setRecipientName("");
      }
    } catch (err: any) {
      setVerificationStatus("unregistered");
      setRecipientName("");
    }
  };

  // Live suggestions query as user types
  const fetchSuggestions = (query: string) => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      return;
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await apiRequest<Array<{ id: string; name: string; phone: string; wallets: string[] }>>(
          `/api/user/suggestions?q=${encodeURIComponent(query)}`
        );
        if (results && results.length > 0) {
          setSuggestions(results);
          setShowSuggestionsDropdown(true);
        } else {
          // Check local contacts for matching suggestions as secondary
          const localMatched = PHONE_CONTACTS.filter(
            (c) => c.phone.includes(query) || c.name.toLowerCase().includes(query.toLowerCase())
          ).map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            wallets: [c.provider],
          }));
          setSuggestions(localMatched);
          setShowSuggestionsDropdown(localMatched.length > 0);
        }
      } catch (e) {
        // Fallback local suggestions
        const localMatched = PHONE_CONTACTS.filter(
          (c) => c.phone.includes(query) || c.name.toLowerCase().includes(query.toLowerCase())
        ).map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          wallets: [c.provider],
        }));
        setSuggestions(localMatched);
        setShowSuggestionsDropdown(localMatched.length > 0);
      }
    }, 200);
  };

  // Recipient input change handler
  const handlePhoneInputChange = (rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, "").slice(0, 11);
    setRecipientPhone(cleaned);

    if (cleaned.length === 11) {
      // 11 digits complete: verify CrossCash account
      verifyRecipientOnCrossCash(cleaned);
    } else {
      // Less than 11 digits: reset verification and fetch suggestion bar
      setVerificationStatus(null);
      setRecipientName("");
      fetchSuggestions(cleaned);
    }
  };

  const handleClearRecipient = () => {
    setRecipientPhone("");
    setRecipientName("");
    setVerificationStatus(null);
    setSuggestions([]);
    setShowSuggestionsDropdown(false);
  };

  const handleSelectSuggestion = (s: { name: string; phone: string; wallets: string[] }) => {
    setRecipientPhone(s.phone);
    setRecipientName(s.name);
    setVerificationStatus("verified");
    setShowSuggestionsDropdown(false);
    if (s.wallets && s.wallets.length > 0) {
      const preferred = s.wallets[0] as "bKash" | "Nagad" | "Rocket";
      if (preferred !== sourceProvider) {
        setDestinationProvider(preferred);
      }
    }
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
    setShowSuggestionsDropdown(false);
    // Verify on CrossCash
    verifyRecipientOnCrossCash(contact.phone);
  };

  // Native phone contacts access with fallback to in-app contact book
  const handleOpenContacts = async () => {
    // Check if the modern Native Web Contact Picker API is available
    if (typeof window !== "undefined" && "contacts" in navigator && "ContactsManager" in window) {
      try {
        const props = ["name", "tel"];
        const selected = await (navigator as any).contacts.select(props, { multiple: false });
        if (selected && selected.length > 0) {
          const contact = selected[0];
          const rawPhone = (contact.tel && contact.tel[0]) || "";
          const rawName = (contact.name && contact.name[0]) || "";
          const cleaned = rawPhone.replace(/[^0-9]/g, "").slice(0, 11);
          if (cleaned) {
            setRecipientPhone(cleaned);
            if (rawName) setRecipientName(rawName);
            if (cleaned.length === 11) {
              verifyRecipientOnCrossCash(cleaned);
            }
          }
          return;
        }
      } catch (err: any) {
        console.warn("Native Contact Picker dismissed or permission denied:", err);
      }
    }

    // Fallback: Open in-app verified CrossCash directory & saved contacts
    setIsContactsModalOpen(true);
  };

  const handleTransfer = () => {
    if (verificationStatus === "unregistered") {
      alert("Transfer Revoked: This recipient does not have a CrossCash account. Money can only be sent to registered CrossCash users.");
      return;
    }
    if (numericAmount <= 0) {
      alert("Please enter a transfer amount.");
      return;
    }
    if (!recipientPhone || recipientPhone.length < 11) {
      alert("Please enter a valid 11-digit recipient phone number.");
      return;
    }
    const destName = recipientName || `User ${recipientPhone.slice(-4)}`;
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
    if (verificationStatus === "unregistered") {
      alert("Transfer Revoked: This recipient does not have a CrossCash account. Money can only be sent to registered CrossCash users.");
      return;
    }
    if (numericAmount <= 0) {
      alert("Please enter a transfer amount first.");
      return;
    }
    if (!recipientPhone || recipientPhone.length < 11) {
      alert("Please enter a valid 11-digit recipient phone number.");
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

  const isTransferRevoked = verificationStatus === "unregistered";
  const canSubmit = numericAmount > 0 && recipientPhone.length === 11 && !isTransferRevoked && verificationStatus !== "checking";

  return (
    <div className="flex flex-col w-full pb-8 pt-2">
      {/* Container */}
      <div className="relative w-full px-margin md:px-0 pt-space-sm space-y-space-md">
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

          {/* Destination Wallet Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                To (Destination)
              </span>
            </div>

            {/* Destination Selector Tabs */}
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

            {/* Recipient Input Box with Real-time Suggestions Bar */}
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <label
                  className="font-label-md text-label-md text-on-surface-variant font-medium"
                  htmlFor="recipient-phone"
                >
                  Recipient Account / Mobile
                </label>
                <button
                  type="button"
                  onClick={handleOpenContacts}
                  className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">contacts</span>
                  Phone Contacts
                </button>
              </div>

              <div className={`relative flex items-center rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest transition-all px-3 h-14 border ${
                isTransferRevoked
                  ? "border-error focus-within:ring-2 focus-within:ring-error/30"
                  : verificationStatus === "verified"
                  ? "border-tertiary focus-within:ring-2 focus-within:ring-tertiary/30"
                  : "border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary/30"
              }`}>
                <div className="flex items-center gap-2 text-on-surface-variant pl-1 pr-2">
                  <span className={`material-symbols-outlined text-[20px] ${
                    isTransferRevoked ? "text-error" : verificationStatus === "verified" ? "text-tertiary" : "text-primary"
                  }`}>
                    {isTransferRevoked ? "person_off" : verificationStatus === "verified" ? "verified" : "person_search"}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <input
                    className="w-full bg-transparent font-title-md text-title-md text-on-surface font-semibold focus:outline-none placeholder:text-on-surface-variant/40"
                    id="recipient-phone"
                    placeholder="Enter 01XXXXXXXXX"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0 && recipientPhone.length < 11) {
                        setShowSuggestionsDropdown(true);
                      }
                    }}
                  />
                  {recipientName && (
                    <span className={`font-body-sm text-xs font-medium truncate leading-tight ${
                      isTransferRevoked ? "text-error" : "text-tertiary"
                    }`}>
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
                  onClick={handleOpenContacts}
                  title="Choose from Contacts"
                >
                  <span className="material-symbols-outlined text-[20px]">contacts</span>
                </button>
              </div>

              {/* Dynamic Suggestions Bar Dropdown */}
              {showSuggestionsDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl overflow-hidden divide-y divide-outline-variant/20 animate-fadeIn">
                  <div className="px-3 py-1.5 bg-surface-container-low text-[11px] font-bold text-outline uppercase tracking-wider flex items-center justify-between">
                    <span>Suggested CrossCash Users</span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestionsDropdown(false)}
                      className="text-xs hover:text-on-surface"
                    >
                      Close
                    </button>
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s.id || s.phone}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-surface-container transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-title-md text-sm font-semibold text-on-surface truncate">
                            {s.name}
                          </span>
                          <span className="font-body-sm text-xs text-on-surface-variant font-mono">
                            {s.phone}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        CrossCash
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Verification & Revoke Status Alerts */}
              {verificationStatus === "checking" && (
                <div className="flex items-center gap-1.5 py-1 px-1 text-xs text-on-surface-variant font-medium animate-pulse">
                  <span className="material-symbols-outlined text-[15px] animate-spin text-primary">sync</span>
                  Checking CrossCash directory for {recipientPhone}...
                </div>
              )}

              {verificationStatus === "verified" && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold shadow-xs animate-fadeIn">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <div className="flex flex-col">
                    <span className="font-bold">{recipientName}</span>
                    <span className="text-[11px] font-normal opacity-90">Verified CrossCash Citizen • Direct Rail Transfer Ready</span>
                  </div>
                </div>
              )}

              {isTransferRevoked && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-error-container text-on-error-container text-xs border border-error/30 shadow-xs animate-shake">
                  <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">block</span>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-error text-sm">User has no account on CrossCash</span>
                    <p className="mt-0.5 text-on-error-container/90 leading-relaxed">
                      Transfers are revoked. To prevent lost funds, CrossCash only allows sending money to registered users.
                    </p>
                  </div>
                </div>
              )}
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
              </div>
              <span className="font-headline-md text-headline-md text-primary font-bold font-mono">
                ৳{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Prominent CTA Action Station */}
        <div className="pt-space-xs space-y-space-sm">
          <div className="flex items-center gap-space-sm">
            <button
              onClick={handleTransfer}
              disabled={!canSubmit}
              className={`flex-1 h-14 rounded-xl font-title-md text-title-md font-semibold shadow-md transition-all flex items-center justify-center gap-space-sm active:scale-[0.99] disabled:opacity-50 ${
                isTransferRevoked
                  ? "bg-error-container text-error cursor-not-allowed border border-error/40"
                  : "bg-primary-container text-on-primary hover:bg-primary"
              }`}
              id="cta-transfer-button"
              type="button"
            >
              {isTransferRevoked ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">block</span>
                  <span>Recipient Not on CrossCash</span>
                </>
              ) : (
                <>
                  <span id="cta-text">
                    Review & Transfer ৳{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            <button
              aria-label="Biometric Express Transfer"
              onClick={handleBiometricExpressTransfer}
              disabled={!canSubmit || isBiometricTransferring}
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm disabled:opacity-50 ${
                isTransferRevoked
                  ? "bg-surface-container text-outline cursor-not-allowed"
                  : "bg-surface-container-highest text-primary-container hover:bg-surface-container-high"
              }`}
              type="button"
              title={isTransferRevoked ? "Transfer Revoked: Recipient not on CrossCash" : "Express Biometric Transfer"}
            >
              {isBiometricTransferring ? (
                <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[28px]">fingerprint</span>
              )}
            </button>
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
                  <p className="font-body-sm text-xs text-on-surface-variant">Choose from verified directory or enter custom number</p>
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
                      Verify & Send to "{contactSearchQuery}"
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Tap to check if this number has a CrossCash account
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
