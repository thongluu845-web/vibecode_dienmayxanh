import { NextResponse } from "next/server";
import { createClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

function getRedirectBase(request: Request, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return fallbackOrigin;
}

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/tai-khoan";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const baseUrl = getRedirectBase(request, requestUrl.origin);

  if (!hasSupabaseServerConfig()) {
    const url = new URL("/tai-khoan", baseUrl);
    url.searchParams.set("auth_error", "missing_supabase_env");
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl));
    }
  }

  const url = new URL("/tai-khoan", baseUrl);
  url.searchParams.set(
    "auth_error",
    requestUrl.searchParams.get("error_description") ?? "oauth_callback_failed",
  );

  return NextResponse.redirect(url);
}
