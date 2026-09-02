"use client";

import Link from "next/link";

export default function MobileSecuritySettings() {
  return (
    <div className="flex flex-col w-full bg-surface min-h-screen relative pb-32">
      <div className="px-margin-mobile py-lg pb-4">
        <h1 className="font-headline text-headline-xl text-primary font-bold tracking-tight">Security Settings</h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">নিরাপত্তা সেটিংস</p>
      </div>

      <div className="px-margin-mobile flex flex-col gap-md pb-lg">
        <div className="bg-surface-container rounded-xl p-md flex flex-col gap-md shadow-[0px_2px_8px_rgba(15,76,129,0.08)] relative overflow-hidden group transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-headline-md text-on-surface">Biometric Login</span>
                <span className="font-body text-label-md text-on-surface-variant">বায়োমেট্রিক লগইন</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input defaultChecked className="sr-only peer" type="checkbox" value=""/>
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green"></div>
            </label>
          </div>
          
          <div className="w-full h-[1px] bg-outline-variant/30 z-10"></div>
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-headline-md text-on-surface">PIN for transactions</span>
                <span className="font-body text-label-md text-on-surface-variant">প্রতিটি লেনদেনের জন্য পিন</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input defaultChecked className="sr-only peer" type="checkbox" value=""/>
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green"></div>
            </label>
          </div>
          
          <div className="w-full h-[1px] bg-outline-variant/30 z-10"></div>
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-headline-md text-on-surface">Login Alerts</span>
                <span className="font-body text-label-md text-on-surface-variant">লগইন অ্যালার্ট</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" value=""/>
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="px-margin-mobile flex flex-col gap-md pb-xl">
        <h2 className="font-headline text-headline-md text-on-surface font-semibold">Account Security</h2>
        <button className="w-full h-16 bg-surface-container-high rounded-xl flex items-center justify-between px-md active:scale-[0.98] transition-transform shadow-sm">
          <div className="flex items-center gap-sm text-on-surface">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">pin</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-body text-body-md font-medium">Change Transaction PIN</span>
              <span className="font-body text-label-sm text-on-surface-variant">লেনদেনের পিন পরিবর্তন করুন</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </button>
        <button className="w-full h-16 bg-surface-container-high rounded-xl flex items-center justify-between px-md active:scale-[0.98] transition-transform shadow-sm">
          <div className="flex items-center gap-sm text-on-surface">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">devices</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-body text-body-md font-medium">Active Devices</span>
              <span className="font-body text-label-sm text-on-surface-variant">সক্রিয় ডিভাইসসমূহ</span>
            </div>
          </div>
          <div className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-success-green"></span>
            <span className="font-body text-label-sm text-on-surface-variant">2</span>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>
        </button>
      </div>

      <div className="mt-auto px-margin-mobile py-lg flex justify-center pb-safe">
        <div className="flex items-center gap-xs text-on-surface-variant opacity-70">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span className="font-body text-label-sm">Secured by CrossCash Protocol</span>
        </div>
      </div>
    </div>
  );
}
