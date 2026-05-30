import { notFound } from "next/navigation";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { getAdminTableConfig } from "@/lib/admin/config";
import { getAdminTableRows } from "@/lib/admin/data";

type Props = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  const config = getAdminTableConfig(section);

  if (!config) {
    notFound();
  }

  const rows = await getAdminTableRows(config);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{config.title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{config.description}</p>
      </div>

      <AdminDataTable config={config} rows={rows} />
    </div>
  );
}
