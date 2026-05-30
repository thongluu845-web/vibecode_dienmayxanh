"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient, hasSupabaseClientConfig } from "@/lib/supabase/client";

function getSafeNext(value: string | null): string {
  if (!value || !value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => getSafeNext(searchParams.get("next")), [searchParams]);
  const denied = searchParams.get("error") === "not_admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(denied ? "Tài khoản không có quyền admin." : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!hasSupabaseClientConfig()) {
      setError("Thiếu cấu hình Supabase public env.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setLoading(false);
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }

    const { data: role, error: roleError } = await supabase.rpc("get_my_role");

    if (roleError || role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Đăng nhập thành công nhưng tài khoản chưa được cấp quyền admin.");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="mb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-950">Đăng nhập admin</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          Dùng tài khoản email/password đã được cấp role admin trong Supabase.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">Email admin</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="admin@domain.vn"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">Mật khẩu</span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Nhập mật khẩu"
            />
          </span>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-sky-600 text-sm font-black text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Đang kiểm tra quyền..." : "Vào trang quản trị"}
      </button>
    </form>
  );
}
