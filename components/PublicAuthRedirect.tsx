"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function PublicAuthRedirect() {
  const router = useRouter();
  const { authStatus, bootstrapStatus } = useAuth();

  useEffect(() => {
    if (authStatus === "authenticated" && bootstrapStatus === "ready") {
      router.replace("/dictionary");
    }
  }, [authStatus, bootstrapStatus, router]);

  return null;
}
