---
name: CrossCash Interoperability System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#42474f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2d6197'
  primary: '#00355f'
  on-primary: '#ffffff'
  primary-container: '#0f4c81'
  on-primary-container: '#8ebdf9'
  inverse-primary: '#a0c9ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#003c27'
  on-tertiary: '#ffffff'
  tertiary-container: '#005539'
  on-tertiary-container: '#3dd197'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#07497d'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: auto
  max-width-desktop: 1200px
---

## Brand & Style

The design system is engineered for a fintech interoperability platform where trust and efficiency are paramount. The brand personality is **authoritative yet accessible**, bridging the gap between traditional banking stability and modern digital speed. 

The visual style follows a **Corporate Modern** approach. It prioritizes functional clarity and high-contrast accessibility to ensure users can navigate complex financial transactions with absolute confidence. The interface utilizes a systematic layout, generous white space, and a refined color application that avoids the saturated palettes of local competitors, positioning this design system as a premium, secure alternative.

## Colors

The palette is anchored by a deep navy primary color (`#0F4C81`), chosen to evoke a sense of "Safe Banking" and reliability. This is contrasted against a functional secondary indigo and a success-oriented green.

- **Primary:** Used for key brand moments, headers, and primary actions.
- **Secondary:** Used for interactive accents and secondary information clusters.
- **Status Colors:** High-visibility semantic colors (Success Green and Error Red) are used strictly for transaction feedback and system alerts.
- **Surface & Background:** A clean, light-mode foundation using cool grays (`#F8FAFC`) to reduce visual noise and highlight actionable cards.

All color combinations must maintain a minimum contrast ratio of 4.5:1 for standard text and 3:1 for large text to ensure accessibility for all users.

## Typography

This design system utilizes **Inter** for all typographic roles. Inter’s tall x-height and clear apertures ensure exceptional legibility for both English and Bangla characters, which is critical for financial data and transaction IDs.

- **Scale:** The system starts at a minimum body size of 16px to accommodate users with varying visual needs.
- **Hierarchy:** Bold weights are reserved for headlines and transaction amounts to draw immediate attention.
- **Localization:** When rendering Bangla text, line heights are increased by 10% automatically to accommodate the script's ascenders and descenders without crowding.
- **Numerics:** Tabular figures are used for transaction lists and PIN pads to ensure vertical alignment of currency values.

## Layout & Spacing

The layout philosophy is **Mobile-First Responsive**, moving from a single-column stack on mobile to a multi-column grid on desktop.

- **Grid:** A 12-column fluid grid is used for desktop, while mobile uses a standard 4-column layout with 16px side margins.
- **Rhythm:** An 8px spacing system governs all spatial relationships. 
- **Tap Targets:** All interactive elements (buttons, list items, inputs) adhere to a minimum height of 48px to ensure ease of use on mobile devices while on the move.
- **Safe Areas:** On mobile, bottom-fixed buttons account for OS-level navigation bars (e.g., iPhone Home Indicator).

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Shadows**. 

1. **Level 0 (Background):** Solid `#FFFFFF` or `#F8FAFC`.
2. **Level 1 (Cards):** Use a white surface with a very soft, diffused shadow (`0px 2px 8px rgba(15, 76, 129, 0.08)`). This separates content blocks from the background without creating visual clutter.
3. **Level 2 (Modals/Overlays):** Elevated with a more pronounced shadow to indicate temporary interaction.

Outlines are preferred over heavy shadows for input fields and non-elevated cards to maintain a clean, institutional feel.

## Shapes

The design system employs a **Soft** shape language (Level 1). This provides a professional balance—less aggressive than sharp corners, but more structured and "bank-like" than fully rounded pill shapes.

- **Standard Elements:** 0.25rem (4px) corner radius for small buttons and input fields.
- **Large Components:** 0.5rem (8px) for cards, balance modules, and transaction modals.
- **Avatars/Badges:** Icons within transaction lists may use circular masks to distinguish them from structural UI elements.

## Components

### Buttons & CTAs
- **Primary Action:** High-visibility `#0F4C81` background with white text. 48px minimum height. Full-width on mobile.
- **Secondary Action:** Ghost style with a 1px border of the primary color.
- **Status Indicators:** Success/Failure labels use a small dot icon + text in the respective semantic color.

### Finance-Specific Modules
- **Balance Card:** A distinct container at the top of the dashboard. Uses a subtle gradient of the primary color with high-contrast white typography for the balance amount. Includes a "Hide/Show" toggle for privacy.
- **PIN Pad:** Large, circular buttons (64px) with clear spacing. Tactile haptic feedback should be triggered on each press.
- **Transaction List Items:** 72px height. Left-aligned icon/logo, centered title/subtitle, and right-aligned amount (bolded). Includes a small "Wallet Badge" overlay on the icon to indicate the source of funds (e.g., Bank, MFS).

### Inputs & Selection
- **Input Fields:** Floating labels to maintain context. Active states are indicated by a 2px primary color border.
- **Transaction Badges:** Small, rounded-sm chips used within list items to categorize "Inbound," "Outbound," or "Interoperable" transfers.