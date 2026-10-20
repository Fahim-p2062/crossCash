"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "bn";

const translations = {
  en: {
    // Nav & Common
    dashboard: "Dashboard",
    transactions: "Transaction History",
    linkedWallets: "Linked Wallets",
    securitySettings: "Security Settings",
    logout: "Logout",
    verified: "Verified Account",
    account: "Account",
    refresh: "Refresh",
    retry: "Retry",
    viewAll: "View All Transactions",

    // Dashboard Header & Balance
    welcome: "Welcome",
    summarySub: "Interoperable cross-wallet summary",
    totalBalance: "Total CrossCash Balance",
    addFunds: "Add Funds",
    sendMoney: "Send Money",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions recorded yet",
    loadingTransactions: "Loading transactions...",

    // Filters
    all: "All",
    inbound: "Inbound",
    outbound: "Outbound",

    // Table Headers
    txHeader: "Transaction",
    dateHeader: "Date",
    statusHeader: "Status",
    amountHeader: "Amount",

    // Add Funds Modal
    addFundsTitle: "Add Funds to Wallet",
    addFundsSubtitle: "Instantly top up simulated funds to your linked MFS wallet",
    selectWallet: "Select Target Wallet",
    depositAmount: "Enter Deposit Amount (৳)",
    quickSelect: "Quick Select",
    paymentMethod: "Payment Method",
    cardDeposit: "Debit / Credit Card",
    bankDeposit: "Internet Banking",
    agentDeposit: "MFS Agent Point",
    confirmDeposit: "Confirm & Add Funds",
    cancel: "Cancel",
    processing: "Processing...",
    fundsAddedSuccess: "Funds added successfully!",

    // Statuses
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
  },
  bn: {
    // Nav & Common
    dashboard: "ড্যাশবোর্ড",
    transactions: "লেনদেনের ইতিহাস",
    linkedWallets: "সংযুক্ত ওয়ালেটসমূহ",
    securitySettings: "নিরাপত্তা সেটিংস",
    logout: "লগআউট",
    verified: "ভেরিফাইড অ্যাকাউন্ট",
    account: "অ্যাকাউন্ট",
    refresh: "রিফ্রেশ",
    retry: "পুনরায় চেষ্টা",
    viewAll: "সব লেনদেন দেখুন",

    // Dashboard Header & Balance
    welcome: "স্বাগতম",
    summarySub: "আন্তঃওয়ালেট লেনদেন সংক্ষিপ্ত বিবরণ",
    totalBalance: "সর্বমোট ক্রস-ক্যাশ ব্যালেন্স",
    addFunds: "টাকা যোগ করুন",
    sendMoney: "টাকা পাঠান",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    noTransactions: "কোনো লেনদেন রেকর্ড করা হয়নি",
    loadingTransactions: "লেনদেন লোড হচ্ছে...",

    // Filters
    all: "সব",
    inbound: "গৃহীত",
    outbound: "প্রেরিত",

    // Table Headers
    txHeader: "লেনদেন",
    dateHeader: "তারিখ",
    statusHeader: "স্ট্যাটাস",
    amountHeader: "পরিমাণ",

    // Add Funds Modal
    addFundsTitle: "ওয়ালেটে টাকা যোগ করুন",
    addFundsSubtitle: "আপনার সংযুক্ত এমএফএস ওয়ালেটে সহজে ব্যালেন্স যোগ করুন",
    selectWallet: "গন্তব্য ওয়ালেট নির্বাচন করুন",
    depositAmount: "জমার পরিমাণ লিখুন (৳)",
    quickSelect: "দ্রুত নির্বাচন",
    paymentMethod: "পেমেন্ট মাধ্যম",
    cardDeposit: "ডেবিট / ক্রেডিট কার্ড",
    bankDeposit: "ইন্টারনেট ব্যাংকিং",
    agentDeposit: "এমএফএস এজেন্ট পয়েন্ট",
    confirmDeposit: "নিশ্চিত করুন ও টাকা যোগ করুন",
    cancel: "বাতিল",
    processing: "প্রক্রিয়াকরণ হচ্ছে...",
    fundsAddedSuccess: "সফলভাবে টাকা যোগ হয়েছে!",

    // Statuses
    completed: "সম্পন্ন",
    pending: "অপেক্ষমান",
    failed: "ব্যর্থ",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  formatNumber: (num: number | string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
  formatNumber: (n) => String(n ?? 0),
});

const enToBnDigits: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crosscash_language");
      if (saved === "en" || saved === "bn") {
        setLanguageState(saved);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("crosscash_language", lang);
    } catch {
      // LocalStorage unavailable
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const formatNumber = (num: number | string | undefined | null): string => {
    if (num === undefined || num === null) return "0";
    const formatted = typeof num === "number" ? num.toLocaleString("en-US") : String(num);
    if (language === "bn") {
      return formatted.replace(/[0-9]/g, (digit) => enToBnDigits[digit] || digit);
    }
    return formatted;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
