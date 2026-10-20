import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/session";
import { LanguageProvider } from "@/lib/language";
import AuthGuard from "@/components/auth/AuthGuard";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CrossCash - Interoperable Financial Portal",
  description: "CrossCash Interoperable MFS Transfer Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-on-background min-h-screen`}>
        <AuthProvider>
          <LanguageProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
