import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";

export default function TransactionsHistory() {
  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-4 md:p-8 h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)]">
        
        <h1 className="font-headline-xl text-headline-xl text-primary mb-8 hidden md:block">Transaction History</h1>
        
        <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-[0px_2px_12px_rgba(15,76,129,0.06)] overflow-hidden mb-24 md:mb-8">
          <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button className="px-4 py-2 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-full whitespace-nowrap shadow-sm">All</button>
              <button className="px-4 py-2 bg-surface-container border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full whitespace-nowrap hover:bg-surface-variant transition-colors">Inbound</button>
              <button className="px-4 py-2 bg-surface-container border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full whitespace-nowrap hover:bg-surface-variant transition-colors">Outbound</button>
              <button className="px-4 py-2 bg-surface-container border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">filter_list</span>
                More
              </button>
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
                <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30">
                          <span className="material-symbols-outlined text-[10px] text-primary">account_balance</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-bold">Grocery Store</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">Payment via bKash</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant">Oct 24, 10:30 AM</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                      Pending
                    </span>
                  </td>
                  <td className="p-4 font-label-md text-label-md text-on-surface font-bold text-right">
                    -৳1,240.80
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
