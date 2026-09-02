"use client";

import Link from "next/link";

export default function MobileLinkedWallets() {
  return (
    <div className="flex flex-col w-full bg-surface-bright min-h-screen relative pb-32">
      <div className="px-margin-mobile py-lg">
        <h1 className="font-headline text-headline-lg text-primary mb-xs font-bold">Linked Wallets</h1>
        <h2 className="font-headline text-body-lg text-on-surface-variant font-medium">সংযুক্ত ওয়ালেট</h2>
      </div>
      <div className="flex-1 px-margin-mobile flex flex-col gap-md">
        
        {/* Nagad (Primary) */}
        <div className="relative bg-surface-card rounded-xl p-md flex items-center justify-between shadow-[0px_2px_8px_rgba(15,76,129,0.08)] overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-success-green"></div>
          <div className="flex items-center gap-md relative z-10">
            <div className="w-12 h-12 rounded-full bg-nagad-orange/10 flex items-center justify-center shrink-0 relative">
              <div className="w-8 h-8 rounded-full bg-nagad-orange flex items-center justify-center text-white font-bold text-sm">N</div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-green rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[10px] text-white">check</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-headline-md text-on-surface truncate">Nagad</span>
              <span className="font-body text-label-md text-on-surface-variant font-mono mt-0.5">017****5678</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="bg-success-green/10 text-success-green px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Primary</span>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant active:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
        
        {/* bKash (Connected) */}
        <div className="bg-surface-card rounded-xl p-md flex items-center justify-between shadow-[0px_2px_8px_rgba(15,76,129,0.08)]">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-bkash-pink/10 flex items-center justify-center shrink-0 relative">
              <div className="w-8 h-8 rounded-full bg-bkash-pink flex items-center justify-center text-white font-bold text-sm">b</div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-headline-md text-on-surface truncate">bKash</span>
              <span className="font-body text-label-md text-on-surface-variant font-mono mt-0.5">019****1234</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant active:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        
        {/* Rocket (Connected) */}
        <div className="bg-surface-card rounded-xl p-md flex items-center justify-between shadow-[0px_2px_8px_rgba(15,76,129,0.08)]">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-rocket-purple/10 flex items-center justify-center shrink-0 relative">
              <div className="w-8 h-8 rounded-full bg-rocket-purple flex items-center justify-center text-white font-bold text-sm">R</div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-headline-md text-on-surface truncate">Rocket</span>
              <span className="font-body text-label-md text-on-surface-variant font-mono mt-0.5">015****9876</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant active:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        
        {/* Info Box */}
        <div className="mt-sm bg-surface-container-low rounded-xl p-md flex items-start gap-sm">
          <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">info</span>
          <p className="font-body text-label-md text-on-surface-variant leading-relaxed">
            Transactions from non-primary wallets may take up to 5 minutes longer to reflect in your overall balance.
          </p>
        </div>
      </div>
      
      {/* Fixed Bottom Action */}
      <div className="fixed bottom-24 inset-x-0 px-margin-mobile z-40 bg-gradient-to-t from-surface-bright via-surface-bright to-transparent pt-xl pb-sm">
        <button className="w-full h-16 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-sm shadow-md active:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined font-bold">add_circle</span>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-headline text-label-md font-bold">Add New Wallet</span>
            <span className="font-body text-[10px] opacity-80">নতুন ওয়ালেট যোগ করুন</span>
          </div>
        </button>
      </div>
    </div>
  );
}
