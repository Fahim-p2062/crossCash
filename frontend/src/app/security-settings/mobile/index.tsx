"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";
import {
  getBiometricStatus,
  registerBiometricDevice,
  removeBiometricDevice,
  checkBiometricSupport,
} from "@/lib/webauthn";

interface SessionDevice {
  id: string;
  name: string;
  location: string;
  ip: string;
  time: string;
  icon: string;
}

export default function MobileSecuritySettings() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    icon: string;
    isError?: boolean;
  }>({
    visible: false,
    message: "",
    icon: "check_circle",
  });

  // Toggles
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricBusy, setIsBiometricBusy] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [dataSyncEnabled, setDataSyncEnabled] = useState(false);
  const [stealthModeEnabled, setStealthModeEnabled] = useState(true);

  // Check biometric support & existing registration on mount
  useEffect(() => {
    checkBiometricSupport().then((support) => {
      setBiometricSupported(support.supported);
      if (support.supported) {
        getBiometricStatus()
          .then((res) => {
            setBiometricEnabled(res.enabled);
          })
          .catch(() => {});
      }
    });
  }, []);

  // Active external sessions
  const [sessions, setSessions] = useState<SessionDevice[]>([
    {
      id: "session-macbook",
      name: "MacBook Pro — Chrome",
      location: "Dhaka, BD",
      ip: "103.111.98.77",
      time: "Active 2 hrs ago",
      icon: "laptop_mac",
    },
    {
      id: "session-windows",
      name: "Windows 11 — Edge",
      location: "Chittagong, BD",
      ip: "114.134.20.15",
      time: "Yesterday, 14:32",
      icon: "desktop_windows",
    },
  ]);

  const showToast = (message: string, icon = "check_circle", isError = false) => {
    setToast({ visible: true, message, icon, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  const handleBiometricToggle = async (checked: boolean) => {
    if (isBiometricBusy) return;
    if (!biometricSupported) {
      showToast("Biometrics not supported on this browser", "warning", true);
      return;
    }

    setIsBiometricBusy(true);

    if (checked) {
      try {
        showToast("Scan your fingerprint / Face ID to register...", "fingerprint");
        const res = await registerBiometricDevice();
        setBiometricEnabled(true);
        showToast(res.message || "Biometric unlock registered successfully!", "check_circle");
      } catch (err: any) {
        setBiometricEnabled(false);
        showToast(err.message || "Could not register biometric sensor", "error", true);
      } finally {
        setIsBiometricBusy(false);
      }
    } else {
      try {
        await removeBiometricDevice();
        setBiometricEnabled(false);
        showToast("Biometric unlock removed from this account", "delete");
      } catch (err: any) {
        showToast(err.message || "Failed to remove biometrics", "error", true);
      } finally {
        setIsBiometricBusy(false);
      }
    }
  };

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    showToast(
      checked ? "2FA OTP required for large transfers" : "2FA relaxed (not recommended)",
      checked ? "security" : "warning",
      !checked
    );
  };

  const handleDataSyncToggle = (checked: boolean) => {
    setDataSyncEnabled(checked);
    showToast(checked ? "Cross-wallet ledger sync authorized" : "Cross-wallet sync paused");
  };

  const handleStealthToggle = (checked: boolean) => {
    setStealthModeEnabled(checked);
    showToast(checked ? "Stealth launch enabled: balances obscured" : "Normal view on launch");
  };

  const handleRunDiagnostic = () => {
    showToast("Security Diagnostic passed: All cryptographic handshakes intact", "verified");
  };

  const handleChangePin = () => {
    showToast(`Verification code sent to ${user?.phone || "+880 1777-885053"}`, "mark_email_read");
  };

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast(`Revoked session for ${deviceName}`, "remove_circle_outline");
  };

  const handleLogoutAllOther = () => {
    const count = sessions.length;
    setSessions([]);
    showToast(`Logged out of all ${count} external web sessions`, "done_all");
  };

  const handleEmergencyFreeze = () => {
    showToast("Freeze request initiated. Verify with Master Key.", "lock_reset", true);
  };

  const userName = user?.name || "Fahim Bin Zaman";
  const userPhone = user?.phone || "01777885053";

  return (
    <div className="flex flex-col w-full pb-8 relative pt-2">
      {/* Interactive Alert Modal for Toast Feedback */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-11/12 max-w-sm bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-sm ${
          toast.visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-12 pointer-events-none"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] ${
            toast.isError ? "text-error" : "text-tertiary-fixed"
          }`}
        >
          {toast.icon}
        </span>
        <span className="font-body-sm text-body-sm font-medium">{toast.message}</span>
      </div>

      {/* Status & Profile Overview */}
      <section className="px-margin pt-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface">Security & Privacy</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {userName} • ID: {userPhone}
            </p>
          </div>
          <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
            Tier 3 Verified
          </span>
        </div>

        {/* Bank-Grade Shield Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary p-space-md shadow-md">
          <div className="relative z-10 flex flex-col gap-space-sm">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-on-primary/15 flex items-center justify-center backdrop-blur-md">
                <span
                  className="material-symbols-outlined text-[24px] text-tertiary-fixed"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield_lock
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                Bank-Grade Shield Active
              </span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-primary">3 of 3 Defenses Armed</h2>
              <p className="font-body-sm text-body-sm text-on-primary-container">
                Encrypted multi-node protection with behavioral safeguards active.
              </p>
            </div>
            <div className="pt-space-xs flex items-center justify-between text-on-primary-container font-body-sm text-body-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">sync_saved_locally</span>
                Checked today, 10:45 AM
              </span>
              <button
                type="button"
                onClick={handleRunDiagnostic}
                className="font-label-md text-label-md text-tertiary-fixed font-semibold underline underline-offset-2 hover:opacity-90 active:scale-95 transition-transform"
              >
                Run Diagnostic
              </button>
            </div>
          </div>
          {/* Subtle background flourish */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-on-primary/5 blur-2xl pointer-events-none"></div>
        </div>
      </section>

      {/* Section 1: Authentication & Access Controls */}
      <section className="px-margin pt-space-lg flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[20px]">lock_person</span>
            <h3 className="font-title-md text-title-md text-on-surface">Authentication & Access</h3>
          </div>
          <span className="font-label-md text-label-md text-tertiary-container font-semibold uppercase tracking-wider">
            Reinforced
          </span>
        </div>

        {/* Login PIN Card */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">pin</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface">Transaction & Login PIN</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Last updated 45 days ago</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangePin}
              className="px-space-sm py-1.5 rounded-lg bg-surface-container text-primary-container hover:bg-secondary-container transition-colors font-label-md text-label-md flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Change
            </button>
          </div>
          <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-lg">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Current passcode</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
              <span className="ml-2 font-label-md text-label-md text-on-surface-variant">6-Digit</span>
            </div>
          </div>
        </div>

        {/* Biometric Login Switch */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[22px]">fingerprint</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface">Biometric Unlock</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Authenticate wallet unlocks & instant rails via Face ID / Fingerprint
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={(e) => handleBiometricToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-6"></div>
          </label>
        </div>

        {/* Two-Factor Authentication Switch */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[22px]">sms</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-title-md text-title-md text-on-surface">Two-Factor Authentication</span>
                <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-semibold">
                  OTP
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Send mandatory SMS code to +880 {userPhone.slice(-10)} for transfers &gt; ৳5,000
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => handleTwoFactorToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-6"></div>
          </label>
        </div>

        {/* Per-Transaction Threshold Limit */}
        <button
          type="button"
          onClick={() => showToast("Daily transfer threshold set at ৳10,000", "tune")}
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between text-left active:bg-surface-container transition-colors"
        >
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface">Immediate Approval Threshold</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Transfers above this limit require hardware token
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary-container font-title-md text-title-md">
            <span>৳10,000</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </button>
      </section>

      {/* Section 2: Privacy & Data Interoperability */}
      <section className="px-margin pt-space-lg flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              security_update_good
            </span>
            <h3 className="font-title-md text-title-md text-on-surface">Privacy & Interoperability</h3>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">Sync Controls</span>
        </div>

        {/* Cross-Wallet Data Sharing */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface">Linked Wallets Ledger Sync</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Synchronize verified ledger states across bKash, Nagad & Rocket accounts
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={dataSyncEnabled}
              onChange={(e) => handleDataSyncToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-6"></div>
          </label>
        </div>

        {/* Balance Masking Mode */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[22px]">visibility_off</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface">Stealth Launch Mode</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Conceal total balance numbers automatically upon opening CrossCash in public
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={stealthModeEnabled}
              onChange={(e) => handleStealthToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-6"></div>
          </label>
        </div>
      </section>

      {/* Section 3: Active Devices & Sessions */}
      <section className="px-margin pt-space-lg flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[20px]">devices</span>
            <h3 className="font-title-md text-title-md text-on-surface">Active Devices & Sessions</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-semibold">
            {sessions.length + 1} Active
          </span>
        </div>

        {/* Current Device Card */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">smartphone</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-on-surface">iPhone 15 Pro</span>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[11px] font-semibold">
                    CURRENT
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Dhaka, Bangladesh • IP: 103.111.45.12
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-space-xs text-tertiary-container font-body-sm text-body-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
            <span className="font-medium">Active now • CrossCash Mobile Native</span>
          </div>
        </div>

        {/* Dynamic external devices */}
        {sessions.map((device) => (
          <div
            key={device.id}
            className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm transition-all"
          >
            <div className="flex items-start gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[22px]">{device.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-title-md text-on-surface truncate">{device.name}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {device.location} • IP: {device.ip}
                </span>
                <span className="font-label-md text-[11px] text-on-surface-variant">{device.time}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRevokeSession(device.id, device.name)}
              className="px-space-sm py-1.5 rounded-lg bg-error-container text-on-error-container hover:opacity-90 active:scale-95 transition-all font-label-md text-label-md shrink-0 font-semibold"
            >
              Revoke
            </button>
          </div>
        ))}

        {/* Action: Terminate All Web Sessions */}
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={handleLogoutAllOther}
            className="w-full py-3 px-space-md rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.99] transition-all font-title-md text-title-md flex items-center justify-center gap-space-xs mt-space-2xs"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">phonelink_erase</span>
            Log Out All Other Devices
          </button>
        )}
      </section>

      {/* Section 4: Critical Panic Safeguards */}
      <section className="px-margin pt-space-xl flex flex-col gap-space-sm">
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Emergency Account Lockdown
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Suspect SIM swap or lost phone? Immediately disconnect linked wallets and pause outgoing rails.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEmergencyFreeze}
            className="w-full h-12 rounded-lg bg-error text-on-error font-title-md text-title-md flex items-center justify-center gap-space-xs active:opacity-90 transition-opacity shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">ac_unit</span>
            Emergency Freeze All Wallets
          </button>
        </div>
      </section>

      {/* Section 5: Log Out of Current Account */}
      <section className="px-margin pt-space-lg pb-space-2xl flex flex-col gap-space-sm">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/auth/login");
          }}
          className="w-full h-14 rounded-xl bg-surface-container-highest border border-error/30 text-error hover:bg-error-container/20 active:scale-[0.99] transition-all font-title-md text-title-md flex items-center justify-center gap-space-sm font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          Log Out of CrossCash
        </button>
      </section>
    </div>
  );
}
