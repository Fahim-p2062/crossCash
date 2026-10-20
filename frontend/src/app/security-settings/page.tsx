import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import MobileSecuritySettings from "./mobile";
import DesktopSecuritySettings from "./desktop";

export default function SecuritySettingsPage() {
  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-0 p-0 md:p-8 min-h-screen md:h-screen overflow-y-auto w-full max-w-[var(--spacing-max-width-desktop)] pb-24 md:pb-8">
        <div className="block lg:hidden">
          <MobileSecuritySettings />
        </div>
        <div className="hidden lg:block">
          <DesktopSecuritySettings />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
