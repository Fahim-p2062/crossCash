import TopAppBar from "@/components/layout/TopAppBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import MobileSecuritySettings from "./mobile";

export default function SecuritySettingsPage() {
  return (
    <>
      <TopAppBar subtitle="Security & Access" />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-80 pt-16 md:pt-4 p-0 md:p-6 min-h-screen overflow-y-auto w-full pb-24 md:pb-8">
        <div className="max-w-4xl">
          <MobileSecuritySettings />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
