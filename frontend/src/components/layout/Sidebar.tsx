import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex h-full w-80 rounded-r-xl bg-surface-container-low shadow-xl flex-col p-md fixed inset-y-0 left-0 z-[60]">
      {/* Header / Profile Area */}
      <div className="flex items-center gap-4 mb-8 p-4">
        <img
          alt="User profile picture"
          className="w-12 h-12 rounded-full object-cover shadow-sm border border-outline-variant"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5D1UMUQ3JG-Ntp1brppM6ASmjgbZTawCZ3StgOLAG-4daSlmJThdJatQaoZFRiu1oSh3l5BRdvTa1YHNR3iU18c4VkzesujV2hGylq2YI8XLEvl_uzg3W_H8uG4KloFE-1xEDmihNiOA1BlXC698EIsUj_lXeEvl07sey8sJJa2D0wlpfjEDNa4y_fVmucSlBNo7SVynx7MLgRvtI7WXvhmIJoVTqCUCcdOdKKVeR-88GOLMg5LQXrw"
        />
        <div>
          <h2 className="font-headline-md text-headline-md text-primary font-bold">User Name</h2>
          <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            Verified Account
          </div>
          <div className="font-label-sm text-label-sm text-outline mt-0.5">ID: 88017XXX</div>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-container text-on-secondary-container font-bold transition-colors duration-150"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
          <span className="font-body-md text-body-md">Dashboard</span>
        </Link>
        <Link
          href="/transactions"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150"
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-body-md text-body-md">Transaction History</span>
        </Link>
        <Link
          href="/linked-wallets"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150"
        >
          <span className="material-symbols-outlined">account_balance</span>
          <span className="font-body-md text-body-md">Linked Wallets</span>
        </Link>
        <Link
          href="/security-settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150"
        >
          <span className="material-symbols-outlined">shield</span>
          <span className="font-body-md text-body-md">Security Settings</span>
        </Link>
      </nav>
      <div className="mt-auto pt-4 border-t border-outline-variant">
        <button className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
          <span className="material-symbols-outlined">language</span>
          <span className="font-body-md text-body-md flex-1 text-left">Language</span>
          <span className="font-label-sm text-label-sm bg-surface-variant px-2 py-1 rounded">EN</span>
        </button>
      </div>
    </aside>
  );
}
