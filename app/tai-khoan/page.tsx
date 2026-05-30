import type { Metadata } from "next";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { createClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

type TaiKhoanPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Tài khoản khách hàng",
  description: "Đăng nhập tài khoản khách hàng bằng Google.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function getDisplayName(metadata: Record<string, unknown> | undefined): string | null {
  const name = metadata?.full_name ?? metadata?.name;

  return typeof name === "string" && name.trim() ? name : null;
}

export default async function TaiKhoanPage({ searchParams }: TaiKhoanPageProps) {
  const params = searchParams ? await searchParams : {};
  const configured = hasSupabaseServerConfig();
  const callbackError = getParam(params, "auth_error");
  let userEmail: string | null = null;
  let displayName: string | null = null;
  let serverError: string | null = null;

  if (configured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error && error.message !== "Auth session missing!") {
        serverError = error.message;
      }

      userEmail = user?.email ?? null;
      displayName = getDisplayName(user?.user_metadata);
    } catch (error) {
      serverError = error instanceof Error ? error.message : "Không thể đọc phiên đăng nhập.";
    }
  }

  return (
    <div className="bg-gray-50 py-10">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Tài khoản khách hàng
          </p>
          <h1 className="mt-3 text-3xl font-black text-gray-950 sm:text-4xl">
            Theo dõi đơn hàng và bảo hành thiết bị điện lạnh
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Đăng nhập để lưu thông tin giao lắp, xem lịch sử mua tủ lạnh, máy lạnh,
            máy giặt và nhận hỗ trợ sau bán hàng.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Đơn hàng", "Bảo hành", "Ưu đãi"].map((item) => (
              <div key={item} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-950">{item}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Đồng bộ theo tài khoản Google của khách hàng.
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-black text-gray-950">
            {userEmail ? "Tài khoản của bạn" : "Đăng nhập"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Sử dụng Google OAuth qua Supabase Auth.
          </p>

          <div className="mt-6">
            <GoogleAuthButton
              configured={configured}
              displayName={displayName}
              userEmail={userEmail}
            />
          </div>

          {(callbackError || serverError) && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {callbackError === "missing_supabase_env"
                ? "Thiếu biến môi trường Supabase. Hãy điền `.env.local` rồi khởi động lại dev server."
                : callbackError || serverError}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
