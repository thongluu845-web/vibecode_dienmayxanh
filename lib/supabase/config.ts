type SupabaseEnv = {
  url: string | undefined;
  publishableKey: string | undefined;
};

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  };
}

export function hasSupabaseEnv(): boolean {
  const { url, publishableKey } = getSupabaseEnv();

  return Boolean(url && publishableKey);
}

export function getSupabaseEnvOrThrow(): { url: string; publishableKey: string } {
  const { url, publishableKey } = getSupabaseEnv();
  const missing: string[] = [];

  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
  }

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, publishableKey };
}
