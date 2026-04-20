"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getNextRouteFromWindow } from "@/lib/auth-next";

export function PublicAuthRedirect() {
  const router = useRouter();
  const { authStatus, bootstrapStatus } = useAuth();

  useEffect(() => {
    if (authStatus === "authenticated" && bootstrapStatus === "ready") {
      router.replace(getNextRouteFromWindow());
    }
  }, [authStatus, bootstrapStatus, router]);

  return null;
}
