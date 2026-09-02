import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-4 md:p-8 h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)]">
        {/* Desktop Header Area (Language Toggle) */}
        <div className="hidden md:flex justify-end items-center mb-8 gap-4">
          <div className="bg-surface-container rounded-full p-1 flex items-center shadow-sm border border-outline-variant/30">
            <button className="px-4 py-1.5 rounded-full bg-white text-primary font-label-md text-label-md font-bold shadow-sm">
              EN
            </button>
            <button className="px-4 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md hover:bg-surface-variant transition-colors">
              BN
            </button>
          </div>
        </div>

        <h1 className="font-headline-xl text-headline-xl text-primary mb-8 hidden md:block">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          {/* Left Column: Balance & Wallets */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Main Balance Card (Bento style) */}
            <div className="bg-gradient-to-br from-primary to-primary-container text-white p-6 md:p-8 rounded-[1.5rem] shadow-[0px_4px_16px_rgba(15,76,129,0.15)] relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary opacity-20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-body-lg text-body-lg text-primary-fixed-dim">Total Balance</h3>
                  <button aria-label="Toggle balance visibility" className="text-primary-fixed hover:text-white transition-colors">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
                <div className="font-headline-xl text-[48px] leading-[56px] font-bold mb-6 tracking-tight">
                  ৳12,450.00
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 bg-secondary text-white py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-md">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Funds
                  </button>
                  <Link
                    href="/send-money"
                    className="flex-1 bg-white/10 border border-white/20 text-white py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Send Money
                  </Link>
                </div>
              </div>
            </div>

            {/* Linked Wallets Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface p-5 rounded-xl border border-outline-variant/30 shadow-[0px_2px_8px_rgba(15,76,129,0.04)] hover:shadow-[0px_4px_12px_rgba(15,76,129,0.08)] transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#fce4ec] flex items-center justify-center text-[#d81b60]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">bKash</h4>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">017XXXXXX</span>
                  </div>
                </div>
                <div className="font-headline-md text-headline-md text-primary">৳8,230.50</div>
              </div>
              <div className="bg-surface p-5 rounded-xl border border-outline-variant/30 shadow-[0px_2px_8px_rgba(15,76,129,0.04)] hover:shadow-[0px_4px_12px_rgba(15,76,129,0.08)] transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#fff3e0] flex items-center justify-center text-[#e65100]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">Nagad</h4>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">019XXXXXX</span>
                  </div>
                </div>
                <div className="font-headline-md text-headline-md text-primary">৳4,219.50</div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Send */}
          <div className="lg:col-span-4 bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-[0px_2px_12px_rgba(15,76,129,0.06)] flex flex-col">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Quick Send</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 mb-2 -mx-2 px-2 scrollbar-hide">
              <button className="flex flex-col items-center gap-2 min-w-[64px]">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Search</span>
              </button>
              <button className="flex flex-col items-center gap-2 min-w-[64px]">
                <img
                  alt="Contact Sarah"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb1-pQYs4WAqlsrpKXAtnetYDFtkvRJMSZx6VawM_WciTlXE3Q3ALRvAuqdbAJzQY7fLWE7wiXpW3omkw7RZ0FWclXBJs54jNHaitnfJBCWvfpyLcpUMh7VNTweI0WcP_1pE9kG5I48tV-exje3pL3WYTbEVVBonRqaVCpUY9BqZGjXmz5c-2Pfx_jL6_mpfXD61q3kWQ4Z8hdrY1bLKzpV5ze7ocJLX_aSra8kZQb_VHvO0rA_6xjQQ"
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Sadia</span>
              </button>
              <button className="flex flex-col items-center gap-2 min-w-[64px]">
                <img
                  alt="Contact Mike"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYPSv3IDA7i9iDC8Kw5ev9dHvbZELRe2kA67ZARVyOoO0EJY6VP1553zVRgXrIUgfcwDsGrlvi7gulw4on4qx0YR6W6xKkst3UFcHQbnZ6sQpONlwOFRSZNqWqOvWHgGTqA-w_PIsuv30sYX-b8WVqNhaXiRVStqaRsZ4roApZHP29iE0cs7-wWAGjm8f7tjVR8VpqY3MGXSBsBjByT31byJcz_YrWqDavVy65WUE32SM2dto3ca6JvQ"
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Rakib</span>
              </button>
            </div>
            
            <Link href="/send-money" className="w-full mt-auto bg-primary text-white h-12 rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-sm flex justify-center items-center gap-2">
              Start Transfer
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Expanded Transaction History Table */}
        <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-[0px_2px_12px_rgba(15,76,129,0.06)] overflow-hidden mb-24 md:mb-8">
          <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-primary">Recent Transactions</h3>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button className="px-4 py-2 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-full whitespace-nowrap shadow-sm">All</button>
              <button className="px-4 py-2 bg-surface-container border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full whitespace-nowrap hover:bg-surface-variant transition-colors">Inbound</button>
              <button className="px-4 py-2 bg-surface-container border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full whitespace-nowrap hover:bg-surface-variant transition-colors">Outbound</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Transaction</th>
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Date</th>
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium">Status</th>
                  <th className="p-4 font-label-sm text-label-sm text-outline font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                          <span className="material-symbols-outlined">south_west</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30">
                          <span className="material-symbols-outlined text-[10px] text-primary">account_balance_wallet</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-bold">Transfer from Nagad</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">Interoperable Transfer</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant">Today, 2:45 PM</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#E8F5E9] text-[#2E7D32] font-label-sm text-label-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                      Completed
                    </span>
                  </td>
                  <td className="p-4 font-label-md text-label-md text-on-surface font-bold text-right text-tertiary-container">
                    +৳500.00
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          alt="Sadia"
                          className="w-10 h-10 rounded-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5uqhmjsiDsjZum2sl0tiv2npEwLrU6rZ3GvEBaq_J89NnltlAJTj-E1WEtUUUmNQ-VK8VI0vFwJm1b8tYukzbSt50ybsNzvvaXzPXzB-o2RSA4piEKTS7OyD0gC-ZR50qSv3E1dM7oBp3sshWnZTf5H7Li6zQiLjnQTMcXhSiI5qVjByWQqWQ46o-9a2DidDgZz4V1VbUgDHsbHTvXN0tTfIFHHlm9M4eox0OBhOiZiwFaozxdMI7MA"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30">
                          <span className="material-symbols-outlined text-[10px] text-primary">send</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-bold">Sent to Sadia</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">bKash to Nagad</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant">Yesterday, 8:12 PM</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#E8F5E9] text-[#2E7D32] font-label-sm text-label-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                      Completed
                    </span>
                  </td>
                  <td className="p-4 font-label-md text-label-md text-on-surface font-bold text-right">
                    -৳450.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant/30 text-center">
            <Link href="/transactions" className="font-label-md text-label-md text-primary font-bold hover:text-primary-container transition-colors">
              View All Transactions
            </Link>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
