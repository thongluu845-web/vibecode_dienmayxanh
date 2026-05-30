import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminTableConfigs, type AdminTableConfig } from "@/lib/admin/config";

export type AdminRow = Record<string, unknown>;

export type AdminMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "orange" | "slate";
};

export type ChartPoint = {
  label: string;
  value: number;
  detail?: string;
};

export type StatusSegment = {
  label: string;
  value: number;
  amount?: number;
};

export type CategorySegment = {
  label: string;
  value: number;
  activeProducts: number;
  stockUnits: number;
  soldUnits: number;
};

export type AdminCounts = {
  orders: number;
  pendingOrders: number;
  totalRevenue: number;
  products: number;
  activeProducts: number;
  featuredProducts: number;
  flashSaleProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  healthyStockProducts: number;
  stockUnits: number;
  soldUnits: number;
  categories: number;
  activeCategories: number;
  banners: number;
  activeBanners: number;
  profiles: number;
  roles: number;
  cartItems: number;
  cartQuantity: number;
};

export type AdminOverview = {
  counts: AdminCounts;
  metrics: AdminMetric[];
  revenueSeries: ChartPoint[];
  statusSegments: StatusSegment[];
  categorySegments: CategorySegment[];
  stockSegments: StatusSegment[];
  recentOrders: AdminRow[];
  lowStockProducts: AdminRow[];
  roleSummary: StatusSegment[];
};

type AdminSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type DashboardSummary = {
  counts: AdminCounts;
  revenueSeries: ChartPoint[];
  statusSegments: StatusSegment[];
  categorySegments: CategorySegment[];
  stockSegments: StatusSegment[];
  roleSummary: StatusSegment[];
};

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const EMPTY_COUNTS: AdminCounts = {
  orders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  products: 0,
  activeProducts: 0,
  featuredProducts: 0,
  flashSaleProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  healthyStockProducts: 0,
  stockUnits: 0,
  soldUnits: 0,
  categories: 0,
  activeCategories: 0,
  banners: 0,
  activeBanners: 0,
  profiles: 0,
  roles: 0,
  cartItems: 0,
  cartQuantity: 0,
};

function asNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" && value ? value : "unknown";
}

function monthLabel(date: Date): string {
  return `${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
}

function getLastSixMonths() {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabel(date),
      value: 0,
    };
  });
}

function parseCounts(value: unknown): AdminCounts {
  const row = asRecord(value);

  return {
    orders: asNumber(row.orders),
    pendingOrders: asNumber(row.pendingOrders),
    totalRevenue: asNumber(row.totalRevenue),
    products: asNumber(row.products),
    activeProducts: asNumber(row.activeProducts),
    featuredProducts: asNumber(row.featuredProducts),
    flashSaleProducts: asNumber(row.flashSaleProducts),
    lowStockProducts: asNumber(row.lowStockProducts),
    outOfStockProducts: asNumber(row.outOfStockProducts),
    healthyStockProducts: asNumber(row.healthyStockProducts),
    stockUnits: asNumber(row.stockUnits),
    soldUnits: asNumber(row.soldUnits),
    categories: asNumber(row.categories),
    activeCategories: asNumber(row.activeCategories),
    banners: asNumber(row.banners),
    activeBanners: asNumber(row.activeBanners),
    profiles: asNumber(row.profiles),
    roles: asNumber(row.roles),
    cartItems: asNumber(row.cartItems),
    cartQuantity: asNumber(row.cartQuantity),
  };
}

function parseRevenueSeries(value: unknown): ChartPoint[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const row = asRecord(item);
    const orders = asNumber(row.orders);

    return {
      label: asString(row.label),
      value: asNumber(row.value),
      detail: `${orders} đơn`,
    };
  });
}

function parseStatusSegments(value: unknown): StatusSegment[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const row = asRecord(item);

      return {
        label: asString(row.label),
        value: asNumber(row.value),
        amount: asNumber(row.amount),
      };
    })
    .filter((segment) => segment.value > 0 || Boolean(segment.amount));
}

function parseCategorySegments(value: unknown): CategorySegment[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const row = asRecord(item);

      return {
        label: asString(row.label),
        value: asNumber(row.value),
        activeProducts: asNumber(row.activeProducts),
        stockUnits: asNumber(row.stockUnits),
        soldUnits: asNumber(row.soldUnits),
      };
    })
    .sort((a, b) => b.value - a.value);
}

function parseDashboardSummary(value: unknown): DashboardSummary {
  const summary = asRecord(value);

  return {
    counts: parseCounts(summary.counts),
    revenueSeries: parseRevenueSeries(summary.revenueSeries),
    statusSegments: parseStatusSegments(summary.statusSegments),
    categorySegments: parseCategorySegments(summary.categorySegments),
    stockSegments: parseStatusSegments(summary.stockSegments),
    roleSummary: parseStatusSegments(summary.roleSummary),
  };
}

function emptyDashboardSummary(): DashboardSummary {
  return {
    counts: EMPTY_COUNTS,
    revenueSeries: getLastSixMonths().map(({ label, value }) => ({ label, value, detail: "0 đơn" })),
    statusSegments: [],
    categorySegments: [],
    stockSegments: [],
    roleSummary: [],
  };
}

async function countRows(supabase: AdminSupabaseClient, table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (error) {
    console.error(`Admin count failed for ${table}:`, error);
    return 0;
  }

  return count ?? 0;
}

async function getAdminTableRowsWithClient(
  supabase: AdminSupabaseClient,
  config: AdminTableConfig,
  limit = 200,
): Promise<AdminRow[]> {
  let query = supabase.from(config.table).select("*").limit(limit);

  if (config.orderBy) {
    query = query.order(config.orderBy, {
      ascending: config.orderAscending ?? false,
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Admin table fetch failed for ${config.table}:`, error);
    return [];
  }

  return (data ?? []) as AdminRow[];
}

async function getLowStockProducts(supabase: AdminSupabaseClient): Promise<AdminRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .lte("stock_quantity", 10)
    .order("stock_quantity", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Admin low stock fetch failed:", error);
    return [];
  }

  return (data ?? []) as AdminRow[];
}

async function getDashboardSummary(supabase: AdminSupabaseClient): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc("get_admin_dashboard_summary");

  if (error) {
    console.error("Admin dashboard summary RPC failed:", error);
    return emptyDashboardSummary();
  }

  return parseDashboardSummary(data);
}

export async function getAdminTableRows(config: AdminTableConfig, limit = 200): Promise<AdminRow[]> {
  const { supabase } = await requireAdmin();

  return getAdminTableRowsWithClient(supabase, config, limit);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { supabase } = await requireAdmin();
  const [summary, recentOrders, lowStockProducts] = await Promise.all([
    getDashboardSummary(supabase),
    getAdminTableRowsWithClient(supabase, adminTableConfigs.orders, 8),
    getLowStockProducts(supabase),
  ]);
  const { counts } = summary;

  return {
    counts,
    metrics: [
      {
        label: "Doanh thu",
        value: VND_FORMATTER.format(counts.totalRevenue),
        detail: `${counts.orders} đơn tổng, ${counts.pendingOrders} đơn cần xử lý`,
        tone: "blue",
      },
      {
        label: "Đơn cần xử lý",
        value: String(counts.pendingOrders),
        detail: `${counts.orders} đơn hàng trong hệ thống`,
        tone: "orange",
      },
      {
        label: "Sản phẩm active",
        value: `${counts.activeProducts}/${counts.products}`,
        detail: `${counts.lowStockProducts} sắp hết, ${counts.outOfStockProducts} hết hàng`,
        tone: "green",
      },
      {
        label: "Người dùng",
        value: String(counts.profiles),
        detail: `${counts.roles} role, ${counts.cartItems} item giỏ`,
        tone: "slate",
      },
    ],
    revenueSeries: summary.revenueSeries,
    statusSegments: summary.statusSegments,
    categorySegments: summary.categorySegments,
    stockSegments: summary.stockSegments,
    recentOrders,
    lowStockProducts,
    roleSummary: summary.roleSummary,
  };
}

export async function getAdminCounts() {
  const { supabase } = await requireAdmin();
  const entries = await Promise.all(
    Object.values(adminTableConfigs).map(async (config) => [config.key, await countRows(supabase, config.table)] as const),
  );

  return {
    ...Object.fromEntries(entries),
    cart_items: entries.find(([key]) => key === "cart_items")?.[1] ?? 0,
  };
}
