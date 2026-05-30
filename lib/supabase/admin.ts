import "server-only";

import { createClient } from "@supabase/supabase-js";

type SupabaseAdminEnv = {
  url: string | undefined;
  serviceRoleKey: string | undefined;
};

function getSupabaseAdminEnv(): SupabaseAdminEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  };
}

export function hasSupabaseAdminConfig(): boolean {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();

  return Boolean(url && serviceRoleKey);
}

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();
  const missing: string[] = [];

  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0 || !url || !serviceRoleKey) {
    throw new Error(`Missing Supabase admin environment variables: ${missing.join(", ")}`);
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
