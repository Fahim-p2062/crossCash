import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import MobileLinkedWallets from "./mobile";
import DesktopLinkedWallets from "./desktop";

export default function LinkedWalletsPage() {
  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-4 md:p-8 h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)]">
        <div className="block lg:hidden">
          <MobileLinkedWallets />
        </div>
        <div className="hidden lg:block">
          <DesktopLinkedWallets />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
