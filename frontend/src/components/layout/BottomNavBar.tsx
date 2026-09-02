import Link from "next/link";

export default function BottomNavBar() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-4 bg-surface dark:bg-on-surface border-t border-outline-variant shadow-[0px_-2px_10px_rgba(0,0,0,0.05)]">
      <Link href="/" className="flex flex-col items-center justify-center flex-1 h-full">
        <div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 mb-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
        </div>
        <span className="font-label-sm text-[10px] font-bold text-on-surface">Home</span>
      </Link>
      <Link
        href="/transactions"
        className="flex flex-col items-center justify-center flex-1 h-full text-on-surface-variant hover:bg-surface-container transition-all duration-200 ease-in-out"
      >
        <span className="material-symbols-outlined mb-1">history</span>
        <span className="font-label-sm text-[10px] text-on-surface-variant">History</span>
      </Link>
      <Link
        href="/linked-wallets"
        className="flex flex-col items-center justify-center flex-1 h-full text-on-surface-variant hover:bg-surface-container transition-all duration-200 ease-in-out"
      >
        <span className="material-symbols-outlined mb-1">account_balance_wallet</span>
        <span className="font-label-sm text-[10px] text-on-surface-variant">Wallets</span>
      </Link>
      <Link
        href="/security-settings"
        className="flex flex-col items-center justify-center flex-1 h-full text-on-surface-variant hover:bg-surface-container transition-all duration-200 ease-in-out"
      >
        <span className="material-symbols-outlined mb-1">shield_person</span>
        <span className="font-label-sm text-[10px] text-on-surface-variant">Security</span>
      </Link>
    </nav>
  );
}
