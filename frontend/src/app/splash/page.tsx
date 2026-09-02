"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-primary">
      <div className="text-center animate-pulse">
        <h1 className="font-headline-xl text-[48px] font-bold text-white mb-2">CrossCash</h1>
        <p className="font-body-lg text-primary-fixed-dim">Instant Transfers. Zero Friction.</p>
      </div>
      <div className="absolute bottom-10 w-full flex justify-center gap-4 opacity-70">
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="w-2 h-2 bg-[#d81b60] rounded-full"></span> bKash
        </div>
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="w-2 h-2 bg-[#e65100] rounded-full"></span> Nagad
        </div>
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="w-2 h-2 bg-[#4a148c] rounded-full"></span> Rocket
        </div>
      </div>
    </div>
  );
}
