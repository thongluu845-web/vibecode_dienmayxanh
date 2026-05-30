"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GoogleAuthButtonProps = {
  configured: boolean;
  userEmail?: string | null;
  displayName?: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể xử lý đăng nhập. Vui lòng thử lại.";
}

export default function GoogleAuthButton({
  configured,
  userEmail,
  displayName,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });

        if (error) {
          setErrorMessage(error.message);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    });
  };

  const handleSignOut = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        router.refresh();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    });
  };

  if (userEmail) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-900">Đã đăng nhập</p>
          <p className="mt-1 font-semibold text-gray-950">{displayName || userEmail}</p>
          {displayName && <p className="text-sm text-gray-600">{userEmail}</p>}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={18} />
          {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>

        {errorMessage && (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={!configured || isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a3d8f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0055b3] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:shadow-none"
      >
        <LogIn size={18} />
        {isPending ? "Đang chuyển hướng..." : "Đăng nhập bằng Google"}
      </button>

      {!configured && (
        <p className="text-sm text-amber-700" role="status">
          Chưa có cấu hình Supabase trong `.env.local`.
        </p>
      )}

      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
