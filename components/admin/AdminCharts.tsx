import type { AdminCounts, CategorySegment, ChartPoint, StatusSegment } from "@/lib/admin/data";
import { formatCurrency } from "@/lib/admin/format";

type AdminChartsProps = {
  counts: AdminCounts;
  revenueSeries: ChartPoint[];
  statusSegments: StatusSegment[];
  categorySegments: CategorySegment[];
  stockSegments: StatusSegment[];
  roleSummary: StatusSegment[];
};

const palette = ["#0284c7", "#16a34a", "#f97316", "#64748b", "#dc2626", "#7c3aed"];
const stockPalette = ["#dc2626", "#f97316", "#16a34a"];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function barWidth(value: number, total: number): string {
  const raw = percent(value, total);
  if (value > 0 && raw < 6) return "6%";
  return `${raw}%`;
}

function getPath(points: ChartPoint[], width: number, height: number) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;

  return points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.value / max) * (height - 18) - 9;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">{children}</div>;
}

function SegmentRows({ segments }: { segments: StatusSegment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (segments.length === 0 || total === 0) {
    return <EmptyState>Chưa có dữ liệu.</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {segments.map((segment, index) => {
        const segmentPercent = percent(segment.value, total);

        return (
          <div key={segment.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
              <span className="min-w-0 truncate text-slate-700">{segment.label}</span>
              <span className="shrink-0 text-slate-500">
                {formatNumber(segment.value)} · {segmentPercent}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: barWidth(segment.value, total), backgroundColor: palette[index % palette.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminCharts({
  counts,
  revenueSeries,
  statusSegments,
  categorySegments,
  stockSegments,
  roleSummary,
}: AdminChartsProps) {
  const maxCategoryProducts = Math.max(...categorySegments.map((segment) => segment.value), 1);
  const totalStockSegments = stockSegments.reduce((sum, segment) => sum + segment.value, 0);
  const totalRoles = roleSummary.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-950">Doanh thu 6 tháng</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Tổng giá trị đơn theo tháng từ Supabase.</p>
            </div>
            <span className="w-fit rounded-lg bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">VND</span>
          </div>
          <div className="h-64">
            <svg viewBox="0 0 520 220" className="h-full w-full overflow-visible" role="img" aria-label="Biểu đồ doanh thu 6 tháng">
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1="0"
                  x2="520"
                  y1={28 + line * 52}
                  y2={28 + line * 52}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
              ))}
              <path d={getPath(revenueSeries, 520, 180)} fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
              {revenueSeries.map((point, index) => {
                const max = Math.max(...revenueSeries.map((item) => item.value), 1);
                const x = revenueSeries.length > 1 ? (520 / (revenueSeries.length - 1)) * index : 0;
                const y = 180 - (point.value / max) * 162 - 9;

                return (
                  <g key={point.label}>
                    <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                    <text x={x} y="214" textAnchor="middle" className="fill-slate-500 text-[12px] font-bold">
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 md:grid-cols-3">
            {revenueSeries.map((point) => (
              <div key={point.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="block text-slate-400">{point.label}</span>
                <span className="block truncate text-slate-800">{formatCurrency(point.value)}</span>
                <span className="block text-slate-400">{point.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950">Tình trạng kho</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Phân loại theo số lượng tồn của sản phẩm.</p>
          </div>
          <div className="mb-4 flex h-4 overflow-hidden rounded-full bg-slate-100">
            {stockSegments.map((segment, index) => (
              <div
                key={segment.label}
                className="h-full"
                style={{
                  width: barWidth(segment.value, totalStockSegments),
                  backgroundColor: stockPalette[index % stockPalette.length],
                }}
              />
            ))}
          </div>
          <div className="space-y-3">
            {stockSegments.map((segment, index) => (
              <div key={segment.label} className="flex items-center justify-between gap-3 text-sm font-bold">
                <span className="flex min-w-0 items-center gap-2 text-slate-700">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stockPalette[index % stockPalette.length] }} />
                  <span className="truncate">{segment.label}</span>
                </span>
                <span className="shrink-0 text-slate-500">{formatNumber(segment.value)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <div>
              <dt className="text-xs font-black uppercase text-slate-400">Tồn kho</dt>
              <dd className="mt-1 text-lg font-black text-slate-950">{formatNumber(counts.stockUnits)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-slate-400">Đã bán</dt>
              <dd className="mt-1 text-lg font-black text-slate-950">{formatNumber(counts.soldUnits)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-slate-400">Flash sale</dt>
              <dd className="mt-1 text-lg font-black text-slate-950">{formatNumber(counts.flashSaleProducts)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-slate-400">Nổi bật</dt>
              <dd className="mt-1 text-lg font-black text-slate-950">{formatNumber(counts.featuredProducts)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950">Danh mục sản phẩm</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Số sản phẩm, hàng đang bán và tồn kho theo danh mục.</p>
          </div>
          {categorySegments.length === 0 ? (
            <EmptyState>Chưa có danh mục.</EmptyState>
          ) : (
            <div className="space-y-4">
              {categorySegments.map((segment, index) => (
                <div key={segment.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="min-w-0 truncate text-slate-800">{segment.label}</span>
                    <span className="shrink-0 text-slate-500">{formatNumber(segment.value)} sản phẩm</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: barWidth(segment.value, maxCategoryProducts), backgroundColor: palette[index % palette.length] }}
                    />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
                    <span>{formatNumber(segment.activeProducts)} active</span>
                    <span>{formatNumber(segment.stockUnits)} tồn</span>
                    <span>{formatNumber(segment.soldUnits)} đã bán</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-black text-slate-950">Trạng thái đơn</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Tỷ trọng theo trạng thái hiện tại.</p>
            </div>
            <SegmentRows segments={statusSegments} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-black text-slate-950">Role người dùng</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Phân bổ quyền trong bảng user_roles.</p>
            </div>
            {totalRoles === 0 ? <EmptyState>Chưa có role.</EmptyState> : <SegmentRows segments={roleSummary} />}
          </section>
        </div>
      </div>
    </div>
  );
}
