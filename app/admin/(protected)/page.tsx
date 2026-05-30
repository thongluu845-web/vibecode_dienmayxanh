import { AlertTriangle, Package, ReceiptText, Users } from "lucide-react";
import AdminCharts from "@/components/admin/AdminCharts";
import { getAdminOverview } from "@/lib/admin/data";
import { formatCellValue, formatCurrency } from "@/lib/admin/format";

const metricIcons = {
  blue: ReceiptText,
  green: Package,
  orange: AlertTriangle,
  slate: Users,
};

const metricClasses = {
  blue: "bg-sky-50 text-sky-700 border-sky-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-3xl">Tổng quan</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Theo dõi doanh thu, đơn hàng, tồn kho và quyền truy cập.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => {
          const Icon = metricIcons[metric.tone];

          return (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${metricClasses[metric.tone]}`}>
                  <Icon size={21} />
                </div>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-400">{metric.detail}</p>
            </div>
          );
        })}
      </section>

      <AdminCharts
        counts={overview.counts}
        revenueSeries={overview.revenueSeries}
        statusSegments={overview.statusSegments}
        categorySegments={overview.categorySegments}
        stockSegments={overview.stockSegments}
        roleSummary={overview.roleSummary}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-black text-slate-950">Đơn hàng gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-400">
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-slate-500">
                      Chưa có đơn hàng.
                    </td>
                  </tr>
                ) : (
                  overview.recentOrders.map((order) => (
                    <tr key={String(order.id)} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-sm font-black text-slate-900">{formatCellValue(order.order_number)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatCellValue(order.customer_name)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatCellValue(order.status)}</td>
                      <td className="px-4 py-3 text-sm font-black text-slate-900">{formatCurrency(order.total_amount)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-500">{formatCellValue(order.created_at, "date")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-black text-slate-950">Tồn kho thấp</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {overview.lowStockProducts.length === 0 ? (
              <p className="p-4 text-sm font-bold text-slate-500">Không có sản phẩm tồn thấp.</p>
            ) : (
              overview.lowStockProducts.map((product) => (
                <div key={String(product.id)} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-black text-slate-900">{formatCellValue(product.name)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{formatCellValue(product.brand)}</p>
                  </div>
                  <span className="rounded-lg bg-orange-50 px-3 py-1 text-sm font-black text-orange-700">
                    {formatCellValue(product.stock_quantity, "number")}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
