# CrossCash: Presentation Slide Deck
## CSE 3208 — Software Development Project – I
**Project Title:** CrossCash — Interoperable Mobile Financial Services (MFS) Transfer Hub  
**Author / Presenter:** Fahim Bin Zaman  
**Stack:** Next.js 16 (Turbopack) • React 19 • Express 5 • MongoDB Atlas • WebAuthn (FIDO2)

---

## Slide 1: Title Slide (Cover)

### Visual Layout
- Clean dark blue gradient background (`#00355f` to `#0f4c81`)
- Prominent CrossCash logo and brand typography
- Badges for MFS Rails: bKash (Pink), Nagad (Orange), Rocket (Purple), Bank (Blue)

### Slide Content
- **CrossCash**  
  *Next-Generation Interoperable MFS Transfer Hub*
- **Course:** CSE 3208 — Software Development Project – I
- **Presenter:** Fahim Bin Zaman
- **Department:** Department of Computer Science & Engineering
- **Core Value Proposition:** *"Breaking the walled gardens of Bangladesh’s mobile financial services through unified liquidity, transparent fees, and biometric settlement."*

### Speaker Notes
> "Good morning/afternoon, honorable faculty and fellow peers. Today, I am excited to present **CrossCash**, a full-stack interoperability platform engineered to bridge Bangladesh’s fragmented Mobile Financial Services ecosystem. CrossCash transforms isolated digital wallets into a unified, secure, and seamless financial network."

---

## Slide 2: The Problem: Fragmented "Walled Gardens"

### Visual Layout
- 3 disconnected silos (bKash, Nagad, Rocket) with red lock icons between them
- Comparison callout: *Intra-network vs. Inter-network*

### Slide Content
- **100M+ MFS Accounts, Zero Direct Interoperability**
  - MFS in Bangladesh operates inside closed-loop "walled gardens."
  - A bKash customer cannot send money directly to a Nagad or Rocket user.
- **The Cost of Fragmentation:**
  - **The Dual Cash-Out Penalty:** Users must withdraw physical cash via an agent (paying 1.49%–1.85%) and physically redeposit it into another network.
  - **App & PIN Fatigue:** Consumers juggle 3 to 4 standalone apps with separate PINs and no unified accounting.
  - **Disjointed Financial Visibility:** No single pane of glass to view total liquid net worth across providers.

### Speaker Notes
> "Over 100 million digital wallets are active in Bangladesh today, yet each provider functions as a walled garden. If you want to pay a shopkeeper who only accepts Nagad, but your money is in bKash, you are forced to cash out at an agent, incur fees, and physically redeposit. There is no native, direct bridge. CrossCash was created to solve this foundational limitation."

---

## Slide 3: The Solution: CrossCash Interoperability Hub

### Visual Layout
- Flow diagram: User -> CrossCash Central Hub -> bKash / Nagad / Rocket / Bank
- Feature pill badges: *Instant Settlement*, *1% Transparent Fee*, *FIDO2 Biometrics*

### Slide Content
- **A Single Unified Financial Portal:**
  - **Cross-Network P2P Transfers:** Direct routing from any source wallet (e.g., bKash) to any destination wallet (e.g., Nagad).
  - **Aggregated Liquidity Vault:** Real-time consolidated balance calculated across all linked MFS and bank accounts.
  - **Deterministic 1% Fee Engine:** Eliminates hidden fees; live fee calculator shows exact debits before authorization.
  - **Adaptive Material 3 Interface:** Purpose-built responsive architecture for both desktop monitors and touch-first smartphones.
  - **Zero-Trust Security:** Hashed PIN verification backed by WebAuthn FIDO2 biometric passkeys (Touch ID / Face ID / Windows Hello).

### Speaker Notes
> "CrossCash acts as a universal financial switch. It links a customer's disparate accounts under one verified identity. Users get an instant overview of their total liquid capital and can send money cross-platform with a single authorization, paying a predictable 1% fee instead of costly cash-out commissions."

---

## Slide 4: Target Audience & Market Impact

### Visual Layout
- 3 Personas / Beneficiary Cards with vector avatars

### Slide Content
1. **Everyday Consumers & Students:**
   - Eliminate secondary wallet maintenance.
   - Split bills and send P2P allowances instantly, regardless of the recipient's provider.
2. **SMEs & Retail Merchants:**
   - Accept payments from any provider into a single primary settlement wallet.
   - Unified audit trail reduces bookkeeping overhead.
3. **Enterprise & Corporate Payroll:**
   - Disburse salaries and corporate allowances directly to employee wallets via interoperable rails.
- **Societal Impact:** Accelerates digital payment velocity and aligns with national initiatives like Bangladesh Bank's *Binimoy* and *Cashless Bangladesh*.

### Speaker Notes
> "CrossCash serves everyday consumers who want to send money to friends and family without asking 'Which app do you have?', small merchants who need one ledger for all incoming customer payments, and corporate systems disbursing allowances across multiple MFS providers."

---

## Slide 5: System Architecture (3-Tier Layered Design)

### Visual Layout
- Architecture diagram showing Presentation Tier, Application Tier, and Persistence Tier
- Technology icons: Next.js, Express, Node.js, MongoDB Atlas

### Slide Content
- **Presentation Layer (Frontend):**
  - **Next.js 16.3 (Turbopack)** + **React 19**
  - Material Design 3 token system + Tailwind CSS v4
  - Adaptive dual-view routing (`desktop/` and `mobile/` component rendering)
- **Application & API Layer (Backend):**
  - **Node.js v24** + **Express 5.2.1 REST Gateway**
  - Security Layer: Helmet headers, strict CORS, Zod schema sanitization, and IP rate-limiting
  - Controllers: Auth Engine, Biometric Passkeys, Wallet Aggregator, and Interoperable Transfer Engine
- **Persistence Layer (Data Tier):**
  - **MongoDB Atlas Document Store** managed via Mongoose 9.9
  - Collections: `Users` (with embedded `Wallets` and `BiometricCredentials`) & `Transactions` (Audit Ledger)

### Speaker Notes
> "Architecturally, CrossCash uses a clean 3-tier model. The presentation layer is built with Next.js 16 and React 19, utilizing Turbopack for high-speed compilation. The backend is an Express 5 API gateway hardened with security middleware, and MongoDB Atlas serves as our transactional ledger ensuring ACID compliance across double-entry balance deductions."

---

## Slide 6: End-to-End Transfer Flow (The 5-Step Wizard)

### Visual Layout
- Horizontal stepper: Step 1 -> Step 2 -> Step 3 -> Step 4 -> Step 5
- Visual highlights of the custom PIN keypad and voucher cutout receipt

### Slide Content
- **Step 1: Recipient Lookup & Verification**
  - Input recipient phone number; instant backend validation verifies whether the user exists on the switch.
- **Step 2: Amount & Real-Time Fee Calculation**
  - User enters transfer amount; dynamic computation displays the **1% interoperability fee** and net debit in real time.
- **Step 3: Transfer Summary & Provider Matching**
  - Visual review comparing source wallet (e.g., bKash) with target wallet (e.g., Nagad).
- **Step 4: Dual Authorization (PIN / Biometrics)**
  - Tactile scrambled on-screen PIN pad (resists shoulder surfing) or one-tap WebAuthn biometric sensor prompt.
- **Step 5: Atomic Settlement & Voucher Receipt**
  - Simultaneous source debit and target credit; generates an authentic digital receipt with unique transaction hash.

### Speaker Notes
> "The heart of CrossCash is its 5-step guided wizard. We eliminated ambiguity: users see the exact fee before sending, verify the recipient's name to avoid wrong-number transfers, authenticate via PIN or fingerprint, and receive a downloadable voucher receipt upon atomic settlement."

---

## Slide 7: Security Architecture & Biometric Authentication

### Visual Layout
- Security badges: *bcrypt PIN Hash*, *JWT Stateless Auth*, *WebAuthn FIDO2*, *Rate Limiter*
- Sequence diagram snippet of WebAuthn challenge/response

### Slide Content
- **Modern Authentication Standards:**
  - **Bcrypt Salting & Hashing:** PINs are never stored in plain text; excluded from database queries by default (`select: false`).
  - **Stateless JWT Tokens:** Cryptographically signed tokens with strict expiration and IDOR-safe token-bound identification.
  - **WebAuthn / FIDO2 Passkeys:** Hardware-backed biometric authentication (Touch ID, Windows Hello, Face ID) with cryptographic challenge-response verification.
- **Abuse Prevention & Defenses:**
  - **Brute-Force Mitigation:** Automated account lockout for 15 minutes after 5 consecutive failed PIN attempts.
  - **Rate Limiting:** Dedicated rate limiters on sensitive auth and transfer endpoints.
  - **Precision Rounding:** Strict financial arithmetic rounding eliminates IEEE-754 floating-point leakage.

### Speaker Notes
> "Fintech demands bank-grade security. CrossCash uses bcrypt with 10 salt rounds for PINs, automated account lockout after 5 failed attempts, and implements the FIDO2 WebAuthn standard. Users can authenticate transfers with their fingerprint or Face ID using public-key cryptography where the private key never leaves the device."

---

## Slide 8: Database & Data Modeling

### Visual Layout
- Entity-Relationship Diagram showing `User`, embedded `Wallet`, embedded `BiometricCredential`, and `Transaction`

### Slide Content
- **User Document Schema:**
  - `phone` (Unique index, primary identifier)
  - `name`, `pin` (Bcrypt hash with `select: false`)
  - `failedPinAttempts`, `lockUntil`
  - `wallets[]`: Subdocument array containing `{ provider, identifier, balance }`
  - `biometricCredentials[]`: Public keys, credential IDs, and counters
  - `profile`: KYC metadata (empty by default for newly registered users)
- **Transaction Ledger Document:**
  - Immutable record: `senderId`, `recipientPhone`, `fromWalletProvider`, `toWalletProvider`, `amount`, `fee`, `total`, `status`, and timestamps.
  - Double-entry tracking ensuring zero discrepancy during multi-wallet settlement.

### Speaker Notes
> "Our database model is designed around atomic integrity. Wallets are embedded subdocuments under the user, enabling fast single-query balance aggregation. The transaction collection is an immutable append-only ledger that preserves a complete audit trail of every fund transfer."

---

## Slide 9: User Experience & Adaptive UI Highlights

### Visual Layout
- Side-by-side comparison: Desktop Bento-Grid Dashboard vs. Mobile Bottom-Navigation View

### Slide Content
- **Adaptive Layout Engine:**
  - **Desktop Experience:** Multi-column bento grids, sticky sidebar navigation, detailed transaction data tables, and modal workflows.
  - **Mobile Experience:** Native-app feel with sticky Top App Bar, bottom navigation bar (`BottomNavBar`), touch-friendly horizontal card carousels, and full-screen bottom sheets.
- **Design System Tokens:**
  - Adheres strictly to **Material Design 3 (M3)** standards.
  - Palette inspired by national fintech brands: bKash Crimson (`#E2136E`), Nagad Orange (`#F7941D`), and Rocket Purple (`#8C3494`).
  - Dark mode capable, high-contrast typography using Inter.

### Speaker Notes
> "We rejected the 'one-size-fits-all' responsive trap. On desktop, users get an expansive bento-grid dashboard with extensive analytical tables. On smartphones, the layout adapts natively into bottom sheets, gesture-friendly cards, and bottom navigation, providing an experience indistinguishable from a native app."

---

## Slide 10: Testing, Bugs Identified & Engineering Fixes

### Visual Layout
- 2-column table: *Challenge Encountered* vs. *Implemented Resolution*

### Slide Content
| Challenge / Bug Found | Technical Solution |
| :--- | :--- |
| **SRV DNS Timeout:** MongoDB Atlas failed to resolve on local ISP networks. | Injected explicit Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) DNS resolvers via Node’s `dns.setServers()`. |
| **New User Balance Leak:** New accounts initially inherited demo balances and mock history. | Refactored models and auth to initialize wallets strictly at ৳0.00 and dynamic empty state rendering. |
| **WebAuthn Origin Discrepancy:** FIDO2 passkeys failed during cross-origin local requests. | Engineered dynamic Relying Party ID and origin resolution from request headers (`getWebAuthnContext`). |
| **Floating-Point Drift:** JavaScript arithmetic produced fractional cent errors (e.g., `500.01000004`). | Implemented standardized financial two-decimal rounding across all fee calculations. |

### Speaker Notes
> "Rigorous testing identified several real-world edge cases. We resolved local DNS SRV timeouts with explicit fallback resolvers, fixed floating-point math inaccuracies in fee computations, perfected WebAuthn origin handling for multi-device testing, and ensured newly registered users start with a clean zero balance and empty profile."

---

## Slide 11: Future Roadmap & Scalability

### Visual Layout
- 4 Milestone Cards along a horizontal timeline: Phase 1 -> Phase 2 -> Phase 3 -> Phase 4

### Slide Content
- **Phase 1: National Gateway Integration (NPSB & Binimoy)**
  - Direct API handshake with Bangladesh Bank's Interoperable Digital Transaction Platform.
- **Phase 2: Interoperable Bangla QR Scanner**
  - Camera-based Bangla QR payment standard for instant over-the-counter merchant checkout.
- **Phase 3: AI Anomaly & Fraud Detection**
  - Real-time transaction velocity checks and geographic anomaly flagging.
- **Phase 4: USSD Fallback Gateway**
  - Simulated USSD session bridge (`*247#` style) allowing non-smartphone users on feature phones to participate in the interoperability switch.

### Speaker Notes
> "Looking forward, CrossCash is architected to scale. The roadmap includes direct integration with Bangladesh Bank's Binimoy switch, standardized Bangla QR scanning for retail merchants, an AI fraud microservice to detect anomalous velocity, and a USSD gateway to ensure financial inclusion for feature-phone users."

---

## Slide 12: Conclusion & Q&A

### Visual Layout
- Summary recap checklist with green checkmarks
- Contact details, GitHub repo link, and live deployment URLs

### Slide Content
- **Key Project Takeaways:**
  - Successfully demonstrated frictionless cross-wallet P2P transfers.
  - Delivered real-time liquidity aggregation across bKash, Nagad, and Rocket.
  - Implemented modern security standards (FIDO2 WebAuthn + bcrypt + JWT).
  - Built with modern Next.js 16, React 19, and Express 5.
- **Live Local Demo:**
  - Frontend: [http://localhost:3000](http://localhost:3000)
  - Backend API: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Thank you for your time!**
- **Questions & Discussion**

### Speaker Notes
> "In conclusion, CrossCash provides a fully functional, secure, and user-centric proof of concept for payment interoperability in Bangladesh. It breaks down provider silos, guarantees fee transparency, and safeguards customer data using the latest web standards. Thank you for your time, and I am now ready to answer any questions or demonstrate the live system."

