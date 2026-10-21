"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { UserProfile } from "@/types";

export default function ProfileClient() {
  const { user, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Profile data states
  const [name, setName] = useState("Fahim Bin Zaman");
  const [phone, setPhone] = useState("01777885053");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [corporateId, setCorporateId] = useState("CC-CORP-885053");
  const [dob, setDob] = useState("14 Aug 1994");
  const [gender, setGender] = useState("Male");
  const [nid, setNid] = useState("1994 2692 8110 0041");
  const [tin, setTin] = useState("4821-9903-XXXX");

  // Corporate & MNC Employment
  const [employer, setEmployer] = useState("Standard Chartered GBS");
  const [employerShort, setEmployerShort] = useState("SCB");
  const [employerSubtitle, setEmployerSubtitle] = useState("Global Business Services Ltd.");
  const [corporateEmail, setCorporateEmail] = useState("fahim.zaman@scb.com");
  const [employeeId, setEmployeeId] = useState("SCB-EMP-90241");
  const [workstation, setWorkstation] = useState("Dhaka HQ");
  const [designation, setDesignation] = useState("Senior Financial Systems Architect");
  const [department, setDepartment] = useState("Fintech Operations & Real-time Settlements");
  const [officeAddress, setOfficeAddress] = useState("Gulshan 2, Dhaka 1212, Bangladesh");

  // Contact & Residence
  const [corporateDirectLine, setCorporateDirectLine] = useState("+880 2 988-1234 (Ext 402)");
  const [residentialAddress, setResidentialAddress] = useState("House 42, Road 11, Block D, Banani, Dhaka 1213");
  const [permanentAddressMatches, setPermanentAddressMatches] = useState(true);
  const [emergencyContactName, setEmergencyContactName] = useState("Dr. Anisur Zaman");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("Father");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("+880 1711-000000");

  // Corporate Payroll & Routing
  const [salaryBank, setSalaryBank] = useState("City Bank Corporate");
  const [salaryAccount, setSalaryAccount] = useState("•••• 4892 (Gulshan Br.)");
  const [allowanceWallet, setAllowanceWallet] = useState("bKash Corp Pocket");
  const [completionPercent, setCompletionPercent] = useState(85);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadedTaxDocName, setUploadedTaxDocName] = useState<string | null>(null);

  // Load existing profile from backend
  useEffect(() => {
    let isMounted = true;
    if (user?.name) {
      setName(user.name);
      setTempName(user.name);
    }
    if (user?.phone) {
      setPhone(user.phone);
      setCorporateId(`CC-CORP-${user.phone.slice(-6)}`);
    }

    apiRequest<{ _id: string; name: string; phone: string; profile: UserProfile }>(
      `/api/user/profile?_t=${Date.now()}`
    )
      .then((res) => {
        if (!isMounted || !res) return;
        if (res.name) {
          setName(res.name);
          setTempName(res.name);
        }
        if (res.phone) {
          setPhone(res.phone);
          setCorporateId(`CC-CORP-${res.phone.slice(-6)}`);
        }
        const p = res.profile;
        if (p) {
          if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
          if (p.corporateId) setCorporateId(p.corporateId);
          if (p.dob) setDob(p.dob);
          if (p.gender) setGender(p.gender);
          if (p.nid) setNid(p.nid);
          if (p.tin) setTin(p.tin);
          if (p.employer) setEmployer(p.employer);
          if (p.employerShort) setEmployerShort(p.employerShort);
          if (p.employerSubtitle) setEmployerSubtitle(p.employerSubtitle);
          if (p.corporateEmail) setCorporateEmail(p.corporateEmail);
          if (p.employeeId) setEmployeeId(p.employeeId);
          if (p.workstation) setWorkstation(p.workstation);
          if (p.designation) setDesignation(p.designation);
          if (p.department) setDepartment(p.department);
          if (p.officeAddress) setOfficeAddress(p.officeAddress);
          if (p.corporateDirectLine) setCorporateDirectLine(p.corporateDirectLine);
          if (p.residentialAddress) setResidentialAddress(p.residentialAddress);
          if (typeof p.permanentAddressMatches === "boolean") setPermanentAddressMatches(p.permanentAddressMatches);
          if (p.emergencyContactName) setEmergencyContactName(p.emergencyContactName);
          if (p.emergencyContactRelation) setEmergencyContactRelation(p.emergencyContactRelation);
          if (p.emergencyContactPhone) setEmergencyContactPhone(p.emergencyContactPhone);
          if (p.salaryBank) setSalaryBank(p.salaryBank);
          if (p.salaryAccount) setSalaryAccount(p.salaryAccount);
          if (p.allowanceWallet) setAllowanceWallet(p.allowanceWallet);
          if (typeof p.completionPercent === "number") setCompletionPercent(p.completionPercent);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend profile, using authenticated user defaults:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Show auto-dismissing toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Handle avatar upload via file reader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        showToast("Profile photo selected. Click 'Save & Update' to persist.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Tax / Return document upload
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedTaxDocName(file.name);
    setCompletionPercent(100);
    showToast(`Tax certificate "${file.name}" uploaded. Institutional limit unlocked!`);
  };

  // Save changes to backend
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedProfilePayload: UserProfile = {
        avatarUrl,
        corporateId,
        dob,
        gender,
        nid,
        tin,
        employer,
        employerShort,
        employerSubtitle,
        corporateEmail,
        employeeId,
        workstation,
        designation,
        department,
        officeAddress,
        corporateDirectLine,
        residentialAddress,
        permanentAddressMatches,
        emergencyContactName,
        emergencyContactRelation,
        emergencyContactPhone,
        salaryBank,
        salaryAccount,
        allowanceWallet,
        completionPercent,
      };

      const res = await apiRequest<{
        message: string;
        user: { _id: string; name: string; phone: string; profile: UserProfile };
      }>("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          profile: updatedProfilePayload,
        }),
      });

      if (res && res.user && user) {
        // Sync user in session state and localStorage
        const token = localStorage.getItem("crosscash_token") || "";
        login(token, {
          ...user,
          name: res.user.name,
          profile: res.user.profile,
        });
      }

      showToast("Corporate MNC profile updates saved successfully.");
      setIsEditingName(false);
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate MNC KYC Summary Report
  const handleExportPdf = () => {
    const summary = `
=====================================================
          CROSSCASH INTEROPERABLE FINANCIAL RAIL
        MNC CORPORATE CITIZEN KYC CERTIFICATION
=====================================================

Date of Issue: ${new Date().toLocaleDateString("en-GB")}
Digital Authentication Seal: Verified by Bangladesh Bank NPSB Rail
Certificate Reference: ${corporateId}-MNC-KYC

[1. IDENTITY & KYC DATA]
Full Legal Name: ${name}
National Smart Card ID: ${nid} (Encrypted & Govt. Linked)
Date of Birth: ${dob}
Gender: ${gender}
e-TIN Number: ${tin} (NBR Active Verified)

[2. CORPORATE & MNC EMPLOYMENT]
Employer: ${employer} (${employerShort})
Entity: ${employerSubtitle}
Department: ${department}
Designation: ${designation}
Employee ID: ${employeeId}
Corporate Email: ${corporateEmail} (Domain Authenticated)
Office Workstation: ${workstation} - ${officeAddress}

[3. RESIDENTIAL & CONTACT PROFILE]
Primary Phone (MFS Auth): ${phone}
Corporate Direct Line: ${corporateDirectLine}
Residential Address: ${residentialAddress}
Emergency Contact: ${emergencyContactName} (${emergencyContactRelation}) - ${emergencyContactPhone}

[4. CORPORATE PAYROLL & ROUTING]
Salary Account: ${salaryBank} - ${salaryAccount}
Allowance Pocket: ${allowanceWallet}

Status: TIER 3 MNC CITIZEN • VERIFIED
Regulatory Tier: Tier 3 Institutional Real-time Settlement
=====================================================
    `.trim();

    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CrossCash_Corporate_KYC_${name.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Corporate KYC Certificate downloaded successfully.");
  };

  const initial = name ? name.charAt(0).toUpperCase() : "F";

  return (
    <div className="flex flex-col w-full pb-12 pt-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100] bg-tertiary-container text-on-tertiary p-space-md rounded-xl shadow-2xl flex items-center justify-between transition-all animate-bounce">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>
            <span className="font-body-md text-body-md font-medium text-white">{toastMessage}</span>
          </div>
          <button
            className="text-white opacity-80 hover:opacity-100 p-1"
            onClick={() => setToastMessage(null)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleDocUpload}
      />

      <div className="px-margin md:px-0 flex flex-col gap-space-lg">
        {/* Top Identity Card & Photo Customization Section */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm relative overflow-hidden flex flex-col gap-space-md border border-outline-variant/30">
          {/* Decorative Trust Shield Backdrop Layer */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-surface-container-high/40 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-primary-container/10 text-[72px]">
              verified_user
            </span>
          </div>

          {/* Avatar & Core Identity Header */}
          <div className="flex items-center gap-space-md relative z-10">
            {/* Avatar Wrapper with Edit/Camera Button */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container-high ring-2 ring-primary-container/20 flex items-center justify-center shadow-md">
                {avatarUrl ? (
                  <img
                    alt={name}
                    className="w-full h-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-white font-bold text-2xl">
                    {initial}
                  </div>
                )}
              </div>
              <button
                aria-label="Update Profile Picture"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-primary"
                id="photoUploadBtn"
                type="button"
                title="Upload Photo"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </button>
            </div>

            {/* Name & Badges */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-space-xs">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="font-headline-md text-headline-md text-on-surface bg-surface-container px-2 py-1 rounded-lg border border-primary w-full outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempName.trim()) setName(tempName.trim());
                        setIsEditingName(false);
                      }}
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="font-headline-md text-headline-md text-on-surface font-bold truncate">
                      {name}
                    </h1>
                    <button
                      aria-label="Edit Profile Name"
                      onClick={() => {
                        setTempName(name);
                        setIsEditingName(true);
                      }}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary-container shrink-0 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-space-xs mt-1">
                <span className="inline-flex items-center gap-1 bg-tertiary-container/10 text-tertiary-container px-2 py-0.5 rounded-full font-label-md text-label-md font-semibold">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Tier 3 MNC Citizen
                </span>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1 font-mono">
                <span>ID:</span>{" "}
                <span className="font-semibold text-on-surface">{corporateId}</span>
              </p>
            </div>
          </div>

          {/* Verification Status Pills */}
          <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
            <div className="bg-surface-container-low px-space-sm py-2 rounded-xl flex items-center gap-2 border border-outline-variant/20">
              <span className="w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center text-[12px] shrink-0">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface-variant leading-none">Smart NID</span>
                <span className="font-label-md text-label-md text-tertiary-container font-semibold truncate">
                  Govt. Verified
                </span>
              </div>
            </div>
            <div className="bg-surface-container-low px-space-sm py-2 rounded-xl flex items-center gap-2 border border-outline-variant/20">
              <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[12px] shrink-0">
                <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface-variant leading-none">MNC Payroll</span>
                <span className="font-label-md text-label-md text-primary-container font-semibold truncate">
                  Active Channel
                </span>
              </div>
            </div>
          </div>

          {/* Profile Completion Tracker Progress */}
          <div className="bg-surface-container p-space-sm rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
                <span className="font-title-md text-title-md text-on-surface font-semibold">
                  Profile Completeness
                </span>
              </div>
              <span className="font-label-md text-label-md font-bold text-primary-container">
                {completionPercent}% Complete
              </span>
            </div>
            {/* Progress bar track */}
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Submit updated tax certificate to unlock institutional limit{" "}
              <span className="font-semibold text-primary-container">৳500,000/day</span>.
            </p>
          </div>
        </div>

        {/* Quick Navigation Hub */}
        <div className="grid grid-cols-2 gap-space-sm">
          <Link
            className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center gap-space-sm hover:bg-surface-container-low transition-colors border border-outline-variant/20"
            href="/security-settings"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface font-bold truncate">Security</span>
              <span className="font-label-md text-label-md text-on-surface-variant">2FA & PINs</span>
            </div>
          </Link>
          <Link
            className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center gap-space-sm hover:bg-surface-container-low transition-colors border border-outline-variant/20"
            href="/linked-wallets"
          >
            <div className="w-10 h-10 rounded-lg bg-tertiary-container/10 text-tertiary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface font-bold truncate">Wallets</span>
              <span className="font-label-md text-label-md text-on-surface-variant">NPSB & MFS</span>
            </div>
          </Link>
        </div>

        {/* Section 1: Personal & Identity Information (KYC / MNC Standard) */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">badge</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Identity & KYC Verification</h2>
            </div>
            <span className="bg-tertiary-container/10 text-tertiary-container text-[11px] font-bold px-2 py-0.5 rounded uppercase">
              Govt. Linked
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {/* Full Legal Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Full Legal Name (as per NID)
              </label>
              <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                <span className="font-body-md text-body-md text-on-surface font-semibold">{name}</span>
                <span className="material-symbols-outlined text-tertiary-container text-[18px]">verified</span>
              </div>
            </div>

            {/* Row: DOB & Gender */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">Date of Birth</label>
                <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                  <span className="font-body-md text-body-md text-on-surface font-mono">{dob}</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">calendar_today</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">Gender</label>
                <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                  <span className="font-body-md text-body-md text-on-surface">{gender}</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">male</span>
                </div>
              </div>
            </div>

            {/* National Smart Card ID */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                  National ID / Smart Card Number
                </label>
                <span className="text-tertiary-container font-label-md text-label-md flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">lock</span> Encrypted
                </span>
              </div>
              <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between font-mono border border-outline-variant/20">
                <span className="font-body-md text-body-md text-on-surface tracking-wider font-semibold">{nid}</span>
                <span className="material-symbols-outlined text-tertiary-container text-[18px]">check_circle</span>
              </div>
            </div>

            {/* Tax Identification Number (TIN) */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Tax Identification Number (e-TIN)
              </label>
              <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between font-mono border border-outline-variant/20">
                <span className="font-body-md text-body-md text-on-surface tracking-wider">{tin}</span>
                <span className="bg-surface-container px-2 py-0.5 rounded text-primary-container font-label-md text-label-md font-semibold">
                  NBR Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Corporate & Multinational Employment Profile */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">domain</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Corporate & MNC Employment</h2>
            </div>
            <span className="bg-primary-container/10 text-primary-container text-[11px] font-bold px-2 py-0.5 rounded uppercase">
              Payroll Auth
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {/* Employer */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Employer / Organization
              </label>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center gap-space-sm border border-outline-variant/20">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px] shadow-sm">
                  {employerShort}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-title-md text-title-md text-on-surface font-bold truncate">{employer}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{employerSubtitle}</span>
                </div>
              </div>
            </div>

            {/* Corporate Email */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Corporate Email Address
              </label>
              <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">mail</span>
                  <span className="font-body-md text-body-md text-on-surface truncate font-mono">{corporateEmail}</span>
                </div>
                <span className="bg-tertiary-container/15 text-tertiary-container text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[12px]">check</span> Domain Verified
                </span>
              </div>
            </div>

            {/* Row: Employee ID & Department */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">Employee ID</label>
                <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                  <span className="font-body-md text-body-md text-on-surface font-mono font-medium">{employeeId}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">Workstation</label>
                <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                  <span className="font-body-md text-body-md text-on-surface truncate">{workstation}</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">location_on</span>
                </div>
              </div>
            </div>

            {/* Role / Designation */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Department & Designation
              </label>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col border border-outline-variant/20">
                <span className="font-title-md text-title-md text-on-surface font-semibold">{designation}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{department}</span>
              </div>
            </div>

            {/* Work Office Address */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Registered Office Location
              </label>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">apartment</span>
                <span className="font-body-md text-body-md text-on-surface">{officeAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details & Residence */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">contacts</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Contact & Residential Info</h2>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="font-label-md text-label-md text-primary-container font-semibold hover:underline flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Edit Fields
            </button>
          </div>

          <div className="flex flex-col gap-space-sm">
            {/* Primary Phone */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Primary Contact / Linked MFS
                </label>
                <span className="font-label-md text-label-md text-tertiary-container font-semibold">Primary OTP</span>
              </div>
              <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">smartphone</span>
                  <span className="font-body-md text-body-md text-on-surface font-mono font-medium">
                    +880 {phone}
                  </span>
                </div>
                <span className="material-symbols-outlined text-tertiary-container text-[18px]">verified</span>
              </div>
            </div>

            {/* Work Phone */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Corporate Direct Line
              </label>
              <div className="h-12 bg-surface-container-low rounded-xl px-space-sm flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">deskphone</span>
                  <span className="font-body-md text-body-md text-on-surface font-mono">{corporateDirectLine}</span>
                </div>
              </div>
            </div>

            {/* Residential Address */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Current Residential Address
              </label>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-start gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 mt-0.5">home</span>
                <span className="font-body-md text-body-md text-on-surface leading-snug">{residentialAddress}</span>
              </div>
            </div>

            {/* Permanent Address Toggle */}
            <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">pin_drop</span>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Permanent Address matches Residential
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Banani, Dhaka 1213</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={permanentAddressMatches}
                  onChange={(e) => setPermanentAddressMatches(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-[18px]">contact_emergency</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Emergency Contact ({emergencyContactRelation})
                  </span>
                  <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                    {emergencyContactName}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    {emergencyContactPhone}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Linked Corporate Benefits & Payroll Routing */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">account_tree</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Corporate Payroll & Routing</h2>
            </div>
            <span className="font-label-md text-label-md text-tertiary-container font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span> BEFTN / NPSB
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {/* Default Salary Bank Account */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-on-surface font-bold">{salaryBank}</span>
                    <span className="bg-primary-container text-on-primary text-[10px] font-bold px-1.5 py-0.2 rounded">
                      SALARY
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    Acc: {salaryAccount}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary-container text-[20px]">check_circle</span>
            </div>

            {/* Corporate Allowance Pocket */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-lg bg-pink-600 text-white flex items-center justify-center shrink-0 font-bold text-[13px] shadow-sm">
                  bKash
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-on-surface font-bold">{allowanceWallet}</span>
                    <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-1.5 py-0.2 rounded">
                      PER DIEM
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    Linked: +880 {phone}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary-container text-[20px]">check_circle</span>
            </div>
          </div>
        </div>

        {/* Section 5: Verification Documents & Certificates */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">folder_shared</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Compliance Documents</h2>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              {uploadedTaxDocName ? "3 of 3 Verified" : "2 of 3 Verified"}
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {/* Document 1: Smart NID */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded bg-surface-container-high text-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    Smart NID Card (Front & Back)
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Verified on 18 Jan 2024</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary-container text-[18px]">verified</span>
            </div>

            {/* Document 2: MNC Employment Proof */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded bg-surface-container-high text-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {employerShort} Corporate Employment Letter
                  </span>
                  <span className="font-body-sm text-body-sm text-tertiary-container font-medium">
                    Valid until 31 Dec 2026
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary-container text-[18px]">verified</span>
            </div>

            {/* Document 3: Tax Certificate (if uploaded) */}
            {uploadedTaxDocName && (
              <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded bg-tertiary-container/10 text-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      {uploadedTaxDocName}
                    </span>
                    <span className="font-body-sm text-body-sm text-tertiary-container font-medium">
                      Verified & Active Institutional Limit
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary-container text-[18px]">check_circle</span>
              </div>
            )}

            {/* Upload Action Button */}
            <button
              onClick={() => docInputRef.current?.click()}
              className="w-full py-3 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-primary-container font-title-md text-title-md font-semibold flex items-center justify-center gap-2 transition-colors border border-outline-variant/20"
              id="uploadCertificateBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span>{uploadedTaxDocName ? "Replace Tax Certificate (PDF/Image)" : "Upload Updated Tax / Return Certificate"}</span>
            </button>
          </div>
        </div>

        {/* Section 6: Actions & CTAs */}
        <div className="flex flex-col gap-space-sm pt-space-xs">
          {/* Primary Save Button */}
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary rounded-xl font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
            id="saveChangesBtn"
            type="button"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[20px]">save</span>
            )}
            <span>Save & Update Corporate Profile</span>
          </button>

          {/* Secondary PDF Summary Export */}
          <button
            onClick={handleExportPdf}
            className="w-full h-12 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-xl font-title-md text-title-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors border border-outline-variant/30"
            id="exportPdfBtn"
            type="button"
          >
            <span className="material-symbols-outlined text-primary-container text-[20px]">download</span>
            <span>Download MNC Verification KYC Summary (PDF)</span>
          </button>

          {/* Institutional Protocol / Session note */}
          <p className="font-body-sm text-body-sm text-center text-on-surface-variant pt-space-xs">
            CrossCash Security Protocol v4.8 • Regulated by Bangladesh Bank
          </p>
        </div>
      </div>

      {/* Edit Profile Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-outline-variant/30 shadow-2xl w-full max-w-xl p-6 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[22px]">manage_accounts</span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Edit Profile Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 pr-1">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Current Residential Address</label>
                <input
                  type="text"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Employer / Organization</label>
                  <input
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Employer Acronym</label>
                  <input
                    type="text"
                    value={employerShort}
                    onChange={(e) => setEmployerShort(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Corporate Direct Line</label>
                  <input
                    type="text"
                    value={corporateDirectLine}
                    onChange={(e) => setCorporateDirectLine(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/30">
                <span className="font-title-md text-sm font-bold text-on-surface block mb-2">Emergency Contact</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm shadow hover:bg-primary transition-all flex items-center gap-1.5"
              >
                {isSaving ? "Saving..." : "Apply & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
