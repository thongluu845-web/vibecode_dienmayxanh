import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Đăng nhập admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <section className="order-2 lg:order-1">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-600">Admin Console</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              Quản trị dữ liệu bán hàng từ Supabase
            </h2>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600">
              Đường dẫn riêng cho admin dùng email/password, kiểm tra role trước khi mở dashboard.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {["Role guard", "RLS", "Live data"].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="order-1 flex justify-center lg:order-2">
          <Suspense fallback={<div className="h-96 w-full max-w-md rounded-xl bg-white" />}>
            <AdminLoginForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
