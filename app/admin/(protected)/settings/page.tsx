import { Database, KeyRound, ShieldCheck } from "lucide-react";
import { getAdminCounts } from "@/lib/admin/data";
import { hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  const counts = await getAdminCounts();
  const checks = [
    {
      label: "Supabase public env",
      ok: hasSupabaseEnv(),
      detail: "Dùng cho session, login và query có RLS.",
      Icon: Database,
    },
    {
      label: "Service role env",
      ok: hasSupabaseAdminConfig(),
      detail: "Cần cho endpoint bootstrap tạo admin account.",
      Icon: KeyRound,
    },
    {
      label: "Role guard",
      ok: true,
      detail: "Trang admin gọi get_my_role() trước khi render.",
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-950 md:text-3xl">Cấu hình</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Kiểm tra kết nối và số dòng theo bảng.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {checks.map(({ label, ok, detail, Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Icon size={21} />
            </div>
            <p className="text-base font-black text-slate-950">{label}</p>
            <p className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-black ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {ok ? "Sẵn sàng" : "Thiếu cấu hình"}
            </p>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-black text-slate-950">Số dòng dữ liệu</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(counts).map(([table, count]) => (
            <div key={table} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-black uppercase text-slate-400">{table}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
