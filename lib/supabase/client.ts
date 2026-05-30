import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvOrThrow, hasSupabaseEnv } from "./config";

export function createClient() {
  const { url, publishableKey } = getSupabaseEnvOrThrow();

  return createBrowserClient(url, publishableKey);
}

export function hasSupabaseClientConfig(): boolean {
  return hasSupabaseEnv();
}
