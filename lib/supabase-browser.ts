"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appConfig } from "@/lib/config";

let supabaseBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!appConfig.hasSupabaseBrowserAuth) {
    throw new Error(
      "Missing Supabase browser auth configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return supabaseBrowserClient;
}
