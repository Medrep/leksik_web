const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const appConfig = {
  apiBaseUrl: rawApiBaseUrl ?? "",
  supabaseUrl: rawSupabaseUrl ?? "",
  supabaseAnonKey: rawSupabaseAnonKey ?? "",
  hasApiBaseUrl: Boolean(rawApiBaseUrl),
  hasSupabaseBrowserAuth: Boolean(rawSupabaseUrl && rawSupabaseAnonKey),
  hasAuthBootstrapConfig: Boolean(rawApiBaseUrl && rawSupabaseUrl && rawSupabaseAnonKey),
} as const;
