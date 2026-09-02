"use client";

import { useState } from "react";

export default function DesktopLinkedWallets() {
  const [showBkashBal, setShowBkashBal] = useState(true);
  const [showNagadBal, setShowNagadBal] = useState(true);

  return (
    <div className="flex flex-col w-full relative h-full">
      {/* Decorative Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/30 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed/30 rounded-full blur-3xl opacity-50 -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
      
      <div className="flex items-end justify-between mb-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs tracking-tight">Linked Wallets</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Manage your connected Mobile Financial Services. Link new accounts to simplify your cross-platform transfers.</p>
        </div>
        <button className="h-16 px-xl bg-primary text-on-primary rounded-xl font-headline-md text-headline-md flex items-center gap-sm shadow-md hover:scale-[0.98] transition-transform active:bg-primary-container group">
          <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform duration-300">add_circle</span>
          Connect New Wallet
        </button>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-2xl">
        {/* bKash Card */}
        <div className="bg-surface-container-low rounded-2xl p-lg relative overflow-hidden group shadow-[0px_2px_8px_rgba(15,76,129,0.08)] hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-bkash-pink/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-xl relative z-10">
            <div className="flex items-center gap-md">
              <div className="w-14 h-14 bg-surface-card rounded-full flex items-center justify-center shadow-sm relative">
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" fill="#d12053" r="10"></circle>
                  <path d="M8 12L12 8L16 12L12 16L8 12Z" fill="white"></path>
                </svg>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-success-green rounded-full shadow-sm ring-2 ring-surface-card"></div>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">bKash</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Active
                </p>
              </div>
            </div>
            <div className="px-sm py-xs bg-surface-variant text-on-surface-variant rounded-md font-label-sm text-label-sm uppercase tracking-wider">
              Primary
            </div>
          </div>
          <div className="mb-xl relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Available Balance</p>
            <div className="flex items-end gap-sm">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                {showBkashBal ? "৳ 45,250.00" : "৳ ••••••"}
              </span>
              <button className="text-on-surface-variant hover:text-primary transition-colors p-1" onClick={() => setShowBkashBal(!showBkashBal)}>
                <span className="material-symbols-outlined text-[20px]">{showBkashBal ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-md relative z-10">
            <p className="font-label-sm text-label-sm text-outline flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">sync</span> Last synced: 2m ago
            </p>
            <button className="font-label-md text-label-md text-error hover:bg-error-container/50 px-sm py-xs rounded transition-colors">Disconnect</button>
          </div>
        </div>

        {/* Nagad Card */}
        <div className="bg-surface-container-low rounded-2xl p-lg relative overflow-hidden group shadow-[0px_2px_8px_rgba(15,76,129,0.08)] hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-nagad-orange/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-xl relative z-10">
            <div className="flex items-center gap-md">
              <div className="w-14 h-14 bg-surface-card rounded-full flex items-center justify-center shadow-sm relative">
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" fill="#F7931E" r="10"></circle>
                  <rect fill="white" height="8" width="8" x="8" y="8"></rect>
                </svg>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-success-green rounded-full shadow-sm ring-2 ring-surface-card"></div>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Nagad</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Active
                </p>
              </div>
            </div>
            <button className="px-sm py-xs bg-surface text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-colors">
              Make Primary
            </button>
          </div>
          <div className="mb-xl relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Available Balance</p>
            <div className="flex items-end gap-sm">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                {showNagadBal ? "৳ 12,800.50" : "৳ ••••••"}
              </span>
              <button className="text-on-surface-variant hover:text-primary transition-colors p-1" onClick={() => setShowNagadBal(!showNagadBal)}>
                <span className="material-symbols-outlined text-[20px]">{showNagadBal ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-md relative z-10">
            <p className="font-label-sm text-label-sm text-outline flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">sync</span> Last synced: 15m ago
            </p>
            <button className="font-label-md text-label-md text-error hover:bg-error-container/50 px-sm py-xs rounded transition-colors">Disconnect</button>
          </div>
        </div>

        {/* Rocket Card */}
        <div className="bg-surface-container-low rounded-2xl p-lg relative overflow-hidden group shadow-[0px_2px_8px_rgba(15,76,129,0.08)] hover:shadow-lg transition-all duration-300 opacity-80">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-rocket-purple/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-xl relative z-10">
            <div className="flex items-center gap-md">
              <div className="w-14 h-14 bg-surface-card rounded-full flex items-center justify-center shadow-sm relative grayscale">
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" fill="#8C3494" r="10"></circle>
                  <path d="M12 6L16 18H8L12 6Z" fill="white"></path>
                </svg>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-outline rounded-full shadow-sm ring-2 ring-surface-card"></div>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Rocket</h3>
                <p className="font-label-sm text-label-sm text-error flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">error</span> Sync Required
                </p>
              </div>
            </div>
          </div>
          <div className="mb-xl relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Available Balance</p>
            <div className="flex items-end gap-sm">
              <span className="font-headline-xl text-headline-xl text-outline tracking-tight">৳ --.--</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-md relative z-10">
            <p className="font-label-sm text-label-sm text-outline flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">sync_problem</span> Last synced: 2d ago
            </p>
            <button className="font-label-md text-label-md text-primary hover:bg-primary-container/50 px-sm py-xs rounded transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* Analytics / Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface-card rounded-3xl p-xl shadow-[0px_2px_8px_rgba(15,76,129,0.08)] flex flex-col justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Fund Distribution</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">A visual breakdown of your assets across linked platforms.</p>
          </div>
          <div className="flex items-center justify-center py-xl relative">
            <svg className="transform -rotate-90" height="240" viewBox="0 0 240 240" width="240">
              <circle cx="120" cy="120" fill="none" r="100" stroke="#e5eeff" strokeWidth="24"></circle>
              <circle className="transition-all duration-1000" cx="120" cy="120" fill="none" r="100" stroke="#d12053" strokeDasharray="628" strokeDashoffset="180" strokeWidth="24"></circle>
              <circle className="origin-center rotate-[255deg] transition-all duration-1000" cx="120" cy="120" fill="none" r="100" stroke="#F7931E" strokeDasharray="628" strokeDashoffset="500" strokeWidth="24"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Total</span>
              <span className="font-headline-xl text-headline-xl text-on-surface">৳ 58K</span>
            </div>
          </div>
          <div className="flex justify-center gap-lg mt-md">
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-bkash-pink"></div>
              <span className="font-label-md text-label-md text-on-surface-variant">bKash (78%)</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-nagad-orange"></div>
              <span className="font-label-md text-label-md text-on-surface-variant">Nagad (22%)</span>
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-3xl p-xl shadow-md text-on-primary relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwIDBMMzAgNjBNMCAzMEw2MCAzMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-repeat"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-md bg-white/20 rounded-xl backdrop-blur-sm mb-lg">
              <span className="material-symbols-outlined text-[32px]">security</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg mb-sm">Secure Cross-Platform Sync</h2>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim/90 mb-xl">Your MFS credentials are never stored. We use bank-grade encryption and secure tokens to sync balances and process transfers instantly.</p>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-md mb-md">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
              </div>
              <span className="font-label-md text-label-md text-primary-fixed">End-to-end encrypted</span>
            </div>
            <button className="h-14 px-lg bg-surface text-primary rounded-xl font-headline-md text-headline-md w-full hover:bg-surface-container transition-colors shadow-sm">
              Manage Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
