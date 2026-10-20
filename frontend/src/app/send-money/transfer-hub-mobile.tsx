"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { BalanceResponse, Wallet } from "@/types";

export default function MobileTransferHub() {
  const router = useRouter();
  const { user } = useAuth();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [sourceProvider, setSourceProvider] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [destinationProvider, setDestinationProvider] = useState<"Nagad" | "Rocket" | "Bank">("Nagad");
  const [recipientPhone, setRecipientPhone] = useState("01912345678");
  const [recipientName, setRecipientName] = useState("Rakib Hasan (Nagad Personal)");
  const [amount, setAmount] = useState("2000");
  const [activeChip, setActiveChip] = useState<string>("2000");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);

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
      setSourceProvider(destinationProvider as "bKash" | "Nagad" | "Rocket");
      setDestinationProvider(oldSource as "Nagad" | "Rocket");
    }
  };

  const handleTransfer = () => {
    if (numericAmount <= 0) return;
    const destName = recipientName || (recipientPhone ? `User ${recipientPhone.slice(-4)}` : "Recipient");
    const query = new URLSearchParams({
      phone: recipientPhone,
      name: destName,
      toProvider: destinationProvider,
      fromProvider: sourceProvider,
      amount: String(numericAmount),
    });
    router.push(`/send-money/confirm?${query.toString()}`);
  };

  const getSourceGradient = (prov: string) => {
    if (prov === "bKash") return "linear-gradient(135deg, #e2136e, #b80053)";
    if (prov === "Nagad") return "linear-gradient(135deg, #f7941d, #d03027)";
    return "linear-gradient(135deg, #8c3686, #5c246e)";
  };

  const getSourceInitial = (prov: string) => {
    if (prov === "bKash") return "bK";
    if (prov === "Nagad") return "NG";
    return "RK";
  };

  return (
    <div className="flex flex-col w-full pb-8 pt-2">
      {/* Subtle ambient decorative glow */}
      <div className="relative w-full px-margin pt-space-sm space-y-space-md">
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

        {/* Transfer Interactive Form Block */}
        <div className="flex flex-col space-y-space-xs relative">
          {/* Source Wallet Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm transition-all duration-200 focus-within:shadow-md">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                From (Source Wallet)
              </span>
              <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-tertiary-container font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                Direct Auth Active
              </span>
            </div>

            <button
              aria-label="Change Source Wallet"
              className="w-full flex items-center justify-between text-left p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
              type="button"
              onClick={() => setShowSourcePicker(!showSourcePicker)}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div
                  className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden text-white font-title-md text-title-md font-bold tracking-tight"
                  style={{ background: getSourceGradient(sourceProvider) }}
                >
                  {getSourceInitial(sourceProvider)}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-tertiary-container rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[10px]">check</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                      {sourceProvider} (Personal)
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-primary font-label-md text-label-md font-semibold">
                      MFS
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {user?.phone || "01777885053"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs pl-space-xs text-right shrink-0">
                <div className="flex flex-col items-end">
                  <span className="font-label-md text-label-md text-on-surface-variant">Available</span>
                  <span className="font-title-md text-title-md text-on-surface font-bold">
                    {formatMoney(currentSourceBalance)}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${
                    showSourcePicker ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>

            {/* Source Wallet Dropdown */}
            {showSourcePicker && (
              <div className="grid grid-cols-3 gap-2 pt-1 animate-fadeIn">
                {(["bKash", "Nagad", "Rocket"] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setSourceProvider(prov);
                      setShowSourcePicker(false);
                    }}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                      sourceProvider === prov
                        ? "border-primary bg-primary-container text-white"
                        : "border-outline-variant/30 bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <span>{prov}</span>
                    <span className="text-[10px] opacity-80">{formatMoney(getSourceBalance(prov))}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connector & Interoperability Bridge Switcher */}
          <div className="relative py-space-xs flex items-center justify-center z-10 -my-2.5">
            <div className="absolute inset-x-0 h-0.5 bg-surface-container-high"></div>
            <button
              type="button"
              onClick={handleSwitchRails}
              className={`relative flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary-container text-on-primary shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isFlipped ? "rotate-180" : ""
              }`}
              id="bridge-switch-btn"
              title="Tap to switch rails"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-lowest/15">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">swap_vert</span>
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

            {/* Destination Selector Tabs */}
            <div className="grid grid-cols-3 gap-space-xs p-1 bg-surface-container-low rounded-lg" role="tablist">
              {/* Nagad Tab */}
              <button
                aria-selected={destinationProvider === "Nagad"}
                onClick={() => setDestinationProvider("Nagad")}
                className={`destination-tab flex items-center justify-center gap-space-xs py-2 px-space-xs rounded-md transition-all ${
                  destinationProvider === "Nagad"
                    ? "bg-surface-container-lowest shadow-sm text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                role="tab"
                type="button"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: "linear-gradient(135deg, #f7941d, #d03027)" }}
                >
                  N
                </div>
                <span className="font-body-sm text-body-sm truncate">Nagad</span>
              </button>

              {/* Rocket Tab */}
              <button
                aria-selected={destinationProvider === "Rocket"}
                onClick={() => setDestinationProvider("Rocket")}
                className={`destination-tab flex items-center justify-center gap-space-xs py-2 px-space-xs rounded-md transition-all ${
                  destinationProvider === "Rocket"
                    ? "bg-surface-container-lowest shadow-sm text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                role="tab"
                type="button"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: "linear-gradient(135deg, #8c3686, #5c246e)" }}
                >
                  R
                </div>
                <span className="font-body-sm text-body-sm truncate">Rocket</span>
              </button>

              {/* Bank Account Tab */}
              <button
                aria-selected={destinationProvider === "Bank"}
                onClick={() => setDestinationProvider("Bank")}
                className={`destination-tab flex items-center justify-center gap-space-xs py-2 px-space-xs rounded-md transition-all ${
                  destinationProvider === "Bank"
                    ? "bg-surface-container-lowest shadow-sm text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                role="tab"
                type="button"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined text-[12px]">account_balance</span>
                </div>
                <span className="font-body-sm text-body-sm truncate">Bank</span>
              </button>
            </div>

            {/* Recipient Input Box */}
            <div className="space-y-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface-variant font-medium"
                htmlFor="recipient-phone"
              >
                Recipient Account / Mobile
              </label>
              <div className="relative flex items-center rounded-lg bg-surface-container-low focus-within:bg-surface-container-lowest transition-colors px-space-sm h-14">
                <div className="flex items-center gap-space-xs text-on-surface-variant pl-1 pr-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-primary">person_check</span>
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <input
                    className="w-full bg-transparent font-title-md text-title-md text-on-surface font-semibold focus:outline-none placeholder:text-on-surface-variant/40"
                    id="recipient-phone"
                    placeholder="01XXXXXXXXX"
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setRecipientPhone(val);
                      if (val.length === 11) {
                        setRecipientName(`Recipient (${val.slice(-4)})`);
                      }
                    }}
                  />
                  <span className="font-body-sm text-body-sm text-primary font-medium truncate leading-none">
                    {recipientName}
                  </span>
                </div>
                <button
                  aria-label="Open Contacts Picker"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary-container hover:bg-surface-container transition-colors shrink-0"
                  type="button"
                  onClick={() => {
                    setRecipientPhone("01912345678");
                    setRecipientName("Rakib Hasan (Nagad Personal)");
                  }}
                >
                  <span className="material-symbols-outlined text-[22px]">contacts</span>
                </button>
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
                className="w-48 text-center font-currency-display text-currency-display text-on-surface bg-transparent focus:outline-none font-bold"
                id="transfer-amount"
                inputMode="numeric"
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
            {/* Preset Chips */}
            <div className="flex items-center justify-between gap-space-xs pt-1">
              {["500", "1000", "2000", "5000", "Max"].map((chipVal) => {
                const isSelected = activeChip === chipVal;
                return (
                  <button
                    key={chipVal}
                    type="button"
                    onClick={() => handleChipClick(chipVal)}
                    className={`amount-chip flex-1 py-1.5 px-space-xs rounded-lg font-body-sm text-body-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-primary-container text-on-primary shadow-sm"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    {chipVal === "Max" ? "Max" : `৳${parseInt(chipVal).toLocaleString()}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Interoperability Fee & Cost Breakdown Card */}
          <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm">
            <div className="flex items-center justify-between pb-space-2xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-tertiary-container">
                  verified_user
                </span>
                <span className="font-title-md text-title-md text-on-surface font-semibold">
                  Live Cost Breakdown
                </span>
              </div>
              <span className="font-label-md text-label-md px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                Transparent Rail
              </span>
            </div>
            <div className="space-y-space-xs text-on-surface-variant font-body-md text-body-md">
              <div className="flex items-center justify-between">
                <span>Transfer Amount</span>
                <span className="font-title-md text-title-md text-on-surface font-medium" id="display-base-amount">
                  ৳{numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  Cross-Platform Fee (1%)
                  <span
                    className="material-symbols-outlined text-[14px] text-on-surface-variant"
                    title="Standard Inter-MFS Rail Fee"
                  >
                    info
                  </span>
                </span>
                <span className="text-on-surface font-medium" id="display-fee-amount">
                  ৳{fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-tertiary-container font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Recipient gets in {destinationProvider}
                </span>
                <span
                  className="font-title-md text-title-md text-tertiary-container font-bold"
                  id="display-recipient-amount"
                >
                  ৳{numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="h-0.5 bg-surface-container-highest my-space-xs"></div>
            <div className="flex items-center justify-between pt-space-2xs">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Total Deducted from {sourceProvider}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Includes regulatory interoperability surcharge
                </span>
              </div>
              <span
                className="font-headline-md text-headline-md text-primary font-bold"
                id="display-total-amount"
              >
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
              onClick={handleTransfer}
              className="w-14 h-14 rounded-xl bg-surface-container-highest text-primary-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[28px]">fingerprint</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary-container">shield</span>
            <span className="font-body-sm text-body-sm">256-bit encrypted inter-rail handshake</span>
          </div>
        </div>
      </div>
    </div>
  );
}
