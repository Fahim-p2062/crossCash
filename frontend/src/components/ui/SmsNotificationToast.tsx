"use client";

import React, { useEffect, useState } from "react";

interface SmsNotificationToastProps {
  message: string;
  sender?: string;
  otpCode?: string;
  onAutoFill?: (code: string) => void;
  onClose?: () => void;
  duration?: number;
}

export default function SmsNotificationToast({
  message,
  sender = "CrossCash Security",
  otpCode,
  onAutoFill,
  onClose,
  duration = 8000,
}: SmsNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[150] w-[92%] max-w-sm animate-bounce-in">
      <div className="bg-[#1c1c1e]/95 backdrop-blur-xl text-white rounded-2xl p-3.5 shadow-2xl border border-white/20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">chat</span>
            <span>MESSAGES • {sender}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>now</span>
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="text-white/50 hover:text-white"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-white/95 leading-relaxed font-sans">{message}</p>

        {otpCode && onAutoFill && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                onAutoFill(otpCode);
                setIsVisible(false);
                onClose?.();
              }}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Auto-fill ({otpCode})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
