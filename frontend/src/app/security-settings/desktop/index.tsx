"use client";

export default function DesktopSecuritySettings() {
  return (
    <div className="flex flex-col w-full relative h-full">
      {/* Header / Top Context */}
      <div 
        className="mb-lg relative w-full h-32 rounded-xl overflow-hidden shadow-sm flex items-end p-lg bg-primary container" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4x8JWWhvUvv4zu9LF1fYL962Z8Y6gh8DJ8wfo1m1DZ_MSSQE5jtACUj-DE_0c_KggxsrrctinsDYGkabXOZkEuOSCfqjs0rzAt87-qnTwot3xAwflMCTu5jwO7iJe9z_sBhmd01vhGmXkO8RPAb6KB7sQyxLroLvejbnFarewZRPGPFAOniEjAljxlOGeMfRRTOycv9aHGtOXmFuNsTid6kdnDXfMTl2SG_P3vU9j2k-L2hUo1TZUGA')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent"></div>
        <div className="relative z-10 w-full flex items-center justify-between">
          <div>
            <h2 className="text-headline-xl font-headline-xl text-on-primary">Security Settings</h2>
            <p className="text-body-lg font-body-lg text-on-primary/80 mt-xs">Manage your account protection and privacy</p>
          </div>
          <div className="flex items-center gap-sm bg-surface-card/10 backdrop-blur-md px-md py-sm rounded-lg">
            <span className="material-symbols-outlined text-success-green">verified_user</span>
            <span className="text-label-md font-label-md text-on-primary">Account Secure</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg w-full">
        {/* Left Column: Core Settings */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-lg">
          {/* Authentication */}
          <section className="bg-surface-card rounded-xl p-lg shadow-sm flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">lock</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">Authentication</h3>
            </div>
            
            <div className="flex items-center justify-between p-md bg-surface rounded-lg hover:bg-surface-container transition-colors">
              <div className="flex flex-col gap-xs">
                <span className="text-body-lg font-body-lg text-on-surface">Login PIN</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Last changed 45 days ago</span>
              </div>
              <button className="px-md py-sm rounded-lg bg-surface-container-high text-on-surface text-label-md font-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">edit</span> Change PIN
              </button>
            </div>
            
            <div className="flex items-center justify-between p-md bg-surface rounded-lg hover:bg-surface-container transition-colors">
              <div className="flex flex-col gap-xs">
                <span className="text-body-lg font-body-lg text-on-surface">Biometric Login</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Use Fingerprint or Face ID for faster access</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" value=""/>
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-md bg-surface rounded-lg hover:bg-surface-container transition-colors">
              <div className="flex flex-col gap-xs">
                <span className="text-body-lg font-body-lg text-on-surface">Two-Factor Authentication (2FA)</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Require an OTP sent to your registered mobile number</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" value=""/>
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green"></div>
              </label>
            </div>
          </section>
          
          {/* Privacy */}
          <section className="bg-surface-card rounded-xl p-lg shadow-sm flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">visibility_off</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">Privacy Controls</h3>
            </div>
            <div className="flex items-center justify-between p-md bg-surface rounded-lg hover:bg-surface-container transition-colors">
              <div className="flex flex-col gap-xs">
                <span className="text-body-lg font-body-lg text-on-surface">Data Sharing with Linked Wallets</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Allow automatic sync of balance data across services</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" value=""/>
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green"></div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Account Activity */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-lg">
          <section className="bg-surface-card rounded-xl p-lg shadow-sm flex flex-col gap-md h-full">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">devices</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">Recent Activity</h3>
            </div>
            
            {/* Map visualization placeholder */}
            <div className="w-full h-48 rounded-lg overflow-hidden bg-surface-container-low mb-sm relative">
              <div className="absolute inset-0 flex items-center justify-center text-outline-variant">
                <span className="material-symbols-outlined text-4xl">map</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-sm overflow-y-auto pr-sm max-h-[400px]">
              {/* Device 1 (Current) */}
              <div className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-[20px]">computer</span>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-label-md font-label-md text-on-surface">MacBook Pro - Chrome</span>
                    <span className="text-[10px] font-label-sm text-success-green bg-success-green/10 px-2 py-1 rounded-full uppercase tracking-wider">Current</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant mt-xs">Dhaka, Bangladesh • IP: 103.111.xxx.xx</span>
                  <span className="text-label-sm font-label-sm text-outline mt-xs">Active now</span>
                </div>
              </div>
              
              {/* Device 2 */}
              <div className="flex items-start gap-md p-md hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">smartphone</span>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-label-md font-label-md text-on-surface">iPhone 13 - Safari</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant mt-xs">Chittagong, BD • IP: 114.134.xxx.xx</span>
                  <span className="text-label-sm font-label-sm text-outline mt-xs">Yesterday, 14:32</span>
                </div>
                <button className="absolute top-md right-md opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error/80" title="Revoke Access">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
              
              {/* Device 3 */}
              <div className="flex items-start gap-md p-md hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">computer</span>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-label-md font-label-md text-on-surface">Windows PC - Edge</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant mt-xs">Dhaka, Bangladesh • IP: 203.202.xxx.xx</span>
                  <span className="text-label-sm font-label-sm text-outline mt-xs">Oct 12, 09:15</span>
                </div>
                <button className="absolute top-md right-md opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error/80" title="Revoke Access">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
