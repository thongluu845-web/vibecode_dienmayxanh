export function formatCurrency(value: unknown): string {
  const amount = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function shortId(value: unknown): string {
  if (typeof value !== "string" || value.length <= 14) return String(value ?? "—");

  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export function formatCellValue(value: unknown, type?: string): string {
  if (value === null || value === undefined || value === "") return "—";

  if (type === "currency") return formatCurrency(value);
  if (type === "date") return formatDate(value);
  if (type === "uuid") return shortId(value);
  if (type === "boolean") return value ? "Bật" : "Tắt";
  if (type === "json") return JSON.stringify(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
}
