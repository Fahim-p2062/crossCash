"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";

const PUBLIC_ROUTES = ["/splash", "/auth/login", "/auth/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth/login");
    } else if (isAuthenticated && (pathname === "/auth/login" || pathname === "/auth/register")) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, isPublicRoute, router]);

  // If loading session for protected routes, render clean loading indicator
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label-md text-on-surface-variant">Loading CrossCash...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content before redirect
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
