"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectOnClick?: boolean;
}

/**
 * AuthGuard component that wraps interactive elements
 * If user is not authenticated and tries to interact, redirects to login
 */
export function AuthGuard({
  children,
  fallback,
  redirectOnClick = true
}: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoaded) return;

    if (!isSignedIn && redirectOnClick) {
      e.preventDefault();
      e.stopPropagation();
      router.push("/login");
    }
  };

  // If not signed in and has fallback, show fallback
  if (isLoaded && !isSignedIn && fallback) {
    return <>{fallback}</>;
  }

  // Wrap children with click handler if redirect is enabled
  if (redirectOnClick) {
    return (
      <div onClick={handleClick} className="inline-block">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
