"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseBanglaQR, SAMPLE_BANGLA_QR } from "@/lib/qr-parser";

export default function ScanPayPage() {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  const [status, setStatus] = useState<"scanning" | "processing" | "error">("scanning");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const stopScanner = async () => {
    try {
      const scanner = html5QrCodeRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (scanner?.stop) await scanner.stop();
      if (scanner?.clear) scanner.clear();
    } catch {}
  };

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!isMounted || !scannerRef.current) return;

        const scanner = new Html5Qrcode("qr-scanner-container");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText: string) => {
            if (!isMounted || status === "processing") return;
            setStatus("processing");
            await stopScanner();

            const data = parseBanglaQR(decodedText);
            if (!data.isValid) {
              setErrorMsg(data.error || "Invalid or unrecognised QR code. Please scan a valid Bangla QR.");
              setStatus("error");
              return;
            }

            const params = new URLSearchParams({
              rawQR: decodedText,
              merchantName: data.merchantName,
              merchantCity: data.merchantCity || "",
              provider: data.provider || "",
              currency: data.currency || "BDT",
              isDynamic: String(data.isDynamic),
              ...(data.amount !== null ? { amount: String(data.amount) } : {}),
            });
            router.push(`/scan-pay/confirm?${params.toString()}`);
          },
          () => {} // ignore parse frame errors
        );
        setHasPermission(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = String((err as Error)?.message || err);
        if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")) {
          setHasPermission(false);
          setErrorMsg("Camera permission denied. Please allow camera access and try again.");
        } else {
          setHasPermission(false);
          setErrorMsg("Could not start camera. Please check your device settings.");
        }
        setStatus("error");
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = async () => {
    setErrorMsg(null);
    setStatus("scanning");
    // Re-mount by going back and forward
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white max-w-md mx-auto relative">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 pt-safe z-10">
        <button
          onClick={() => { stopScanner(); router.back(); }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Scan & Pay</h1>
          <p className="text-xs text-white/60">Bangla QR — EMVCo Standard</p>
        </div>
      </header>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-10">
        {/* QR Viewfinder */}
        <div className="relative w-full max-w-[320px] aspect-square">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#00C853] rounded-tl-lg z-10" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#00C853] rounded-tr-lg z-10" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#00C853] rounded-bl-lg z-10" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#00C853] rounded-br-lg z-10" />

          {/* Scanner container */}
          <div
            id="qr-scanner-container"
            ref={scannerRef}
            className="w-full h-full rounded-2xl overflow-hidden bg-black"
          />

          {/* Processing overlay */}
          {status === "processing" && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl z-20">
              <span className="material-symbols-outlined text-[#00C853] text-5xl animate-spin">sync</span>
              <p className="text-white text-sm mt-3">Reading QR code...</p>
            </div>
          )}

          {/* Error overlay */}
          {status === "error" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl z-20 p-4 text-center">
              <span className="material-symbols-outlined text-red-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code_scanner
              </span>
              <p className="text-white text-sm mt-3 leading-relaxed">{errorMsg}</p>
              <button
                onClick={handleRetry}
                className="mt-4 px-6 py-2 bg-[#00C853] text-black rounded-full font-bold text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Permission denied */}
          {hasPermission === false && status !== "error" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl z-20 p-4 text-center">
              <span className="material-symbols-outlined text-yellow-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                no_photography
              </span>
              <p className="text-white text-sm mt-3">Camera access required.<br />Please enable it in your browser settings.</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {status === "scanning" && (
          <div className="text-center space-y-1">
            <p className="text-white/80 text-sm">Point your camera at a <strong>Bangla QR</strong> code</p>
            <p className="text-white/40 text-xs">Static or Dynamic QR — both supported</p>
          </div>
        )}

        {/* Bangla QR badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
          <span className="material-symbols-outlined text-[#00C853] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          <span className="text-xs text-white/80 font-medium">Bangladesh Bank Interoperable QR</span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-[300px]">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/40 text-xs">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Demo test button */}
        <button
          onClick={async () => {
            setStatus("processing");
            await stopScanner();
            const data = parseBanglaQR(SAMPLE_BANGLA_QR.dynamic);
            const params = new URLSearchParams({
              rawQR: SAMPLE_BANGLA_QR.dynamic,
              merchantName: data.merchantName,
              merchantCity: data.merchantCity || "",
              provider: data.provider || "",
              currency: data.currency || "BDT",
              isDynamic: String(data.isDynamic),
              amount: String(data.amount || 850),
            });
            router.push(`/scan-pay/confirm?${params.toString()}`);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-sm text-white/80 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">science</span>
          Use Demo QR (for testing)
        </button>
      </div>
    </div>
  );
}

