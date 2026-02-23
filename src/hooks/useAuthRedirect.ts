"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Hook to handle authentication redirects
 * Returns a function that checks auth and redirects to login if needed
 */
export function useAuthRedirect() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const requireAuth = (callback?: () => void) => {
    if (!isLoaded) return false;

    if (!isSignedIn) {
      router.push("/login");
      return false;
    }

    // User is authenticated, execute callback
    callback?.();
    return true;
  };

  return {
    isSignedIn,
    isLoaded,
    requireAuth,
  };
}
