import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnvOrThrow } from "./config";

export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnvOrThrow();

  return createSupabaseClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
