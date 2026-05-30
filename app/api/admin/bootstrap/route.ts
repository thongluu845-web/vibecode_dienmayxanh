import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";

type BootstrapBody = {
  email?: string;
  password?: string;
  token?: string;
};

function jsonError(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, { status });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function findUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  const normalized = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === normalized);
    if (user) return user;
    if (data.users.length < 1000) return null;
  }

  return null;
}

export async function POST(request: Request) {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN?.trim();

  if (!expectedToken) {
    return jsonError("missing_bootstrap_token", 503);
  }

  if (!hasSupabaseAdminConfig()) {
    return jsonError("missing_supabase_service_role", 503);
  }

  let body: BootstrapBody;

  try {
    body = (await request.json()) as BootstrapBody;
  } catch {
    return jsonError("invalid_json", 400);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const token = body.token ?? "";

  if (token !== expectedToken) {
    return jsonError("unauthorized", 401);
  }

  if (!isValidEmail(email) || password.length < 12) {
    return jsonError("invalid_admin_credentials", 400);
  }

  const admin = createAdminClient();
  let user = await findUserByEmail(email);
  let created = false;

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        role: "admin",
      },
    });

    if (error || !data.user) {
      return jsonError("admin_create_failed", 500);
    }

    user = data.user;
    created = true;
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      app_metadata: {
        ...(user.app_metadata ?? {}),
        role: "admin",
      },
    });

    if (error) {
      return jsonError("admin_update_failed", 500);
    }
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .upsert(
      {
        user_id: user.id,
        role: "admin",
      },
      { onConflict: "user_id" },
    );

  if (roleError) {
    return jsonError("admin_role_update_failed", 500);
  }

  return NextResponse.json({
    ok: true,
    created,
    user_id: user.id,
    email,
    role: "admin",
  });
}
