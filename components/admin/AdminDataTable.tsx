"use client";

import { useMemo, useState } from "react";
import { Check, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AdminColumn, AdminTableConfig } from "@/lib/admin/config";
import type { AdminRow } from "@/lib/admin/data";
import { formatCellValue } from "@/lib/admin/format";

type AdminDataTableProps = {
  config: AdminTableConfig;
  rows: AdminRow[];
};

function getStatusClass(value: unknown) {
  const status = String(value ?? "").toLowerCase();

  if (["admin", "paid", "completed", "confirmed", "active", "true"].some((token) => status.includes(token))) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["pending", "processing", "shipping"].some((token) => status.includes(token))) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (["cancel", "failed", "inactive", "false"].some((token) => status.includes(token))) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getSearchText(row: AdminRow) {
  return Object.values(row)
    .map((value) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    })
    .join(" ")
    .toLowerCase();
}

function ReadonlyCell({ column, value }: { column: AdminColumn; value: unknown }) {
  if (column.type === "boolean") {
    return (
      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getStatusClass(String(Boolean(value)))}`}>
        {formatCellValue(value, column.type)}
      </span>
    );
  }

  if (column.type === "status") {
    return (
      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getStatusClass(value)}`}>
        {formatCellValue(value, column.type)}
      </span>
    );
  }

  return (
    <span className={`${column.compact ? "line-clamp-2 min-w-52 max-w-80" : "whitespace-nowrap"} text-sm font-semibold text-slate-700`}>
      {formatCellValue(value, column.type)}
    </span>
  );
}

export default function AdminDataTable({ config, rows }: AdminDataTableProps) {
  const [items, setItems] = useState(rows);
  const [query, setQuery] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((row) => getSearchText(row).includes(normalized));
  }, [items, query]);

  async function updateCell(row: AdminRow, column: AdminColumn, nextValue: unknown) {
    const id = row[config.primaryKey];
    if (typeof id !== "string") return;

    const saveId = `${id}:${column.key}`;
    setSavingKey(saveId);
    setNotice(null);

    const { error } = await createClient()
      .from(config.table)
      .update({ [column.key]: nextValue })
      .eq(config.primaryKey, id);

    setSavingKey(null);

    if (error) {
      setNotice(`Không lưu được ${column.label}.`);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item[config.primaryKey] === id
          ? {
              ...item,
              [column.key]: nextValue,
            }
          : item,
      ),
    );
    setNotice("Đã lưu thay đổi.");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{config.title}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{config.description}</p>
        </div>
        <label className="relative block w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Tìm trong bảng"
          />
        </label>
      </div>

      {notice && (
        <div className="mx-4 mt-4 inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700">
          <Check size={16} />
          {notice}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0">
          <thead>
            <tr>
              {config.columns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-black uppercase text-slate-400">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={String(row[config.primaryKey])} className="group">
                {config.columns.map((column) => {
                  const value = row[column.key];
                  const cellKey = `${String(row[config.primaryKey])}:${column.key}`;
                  const isSaving = savingKey === cellKey;

                  return (
                    <td key={column.key} className="border-b border-slate-100 px-4 py-3 align-middle group-hover:bg-slate-50">
                      {column.editable === "boolean" ? (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => updateCell(row, column, !Boolean(value))}
                          className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-black transition ${
                            value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {value ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          {isSaving ? "Lưu..." : value ? "Bật" : "Tắt"}
                        </button>
                      ) : column.editable === "select" ? (
                        <select
                          value={String(value ?? "")}
                          disabled={isSaving}
                          onChange={(event) => updateCell(row, column, event.target.value)}
                          className={`h-9 rounded-lg border px-2 text-xs font-black outline-none transition focus:ring-4 focus:ring-sky-100 ${getStatusClass(value)}`}
                        >
                          {(column.options ?? []).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <ReadonlyCell column={column} value={value} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRows.length === 0 && (
        <div className="p-8 text-center text-sm font-bold text-slate-500">Không có dữ liệu phù hợp.</div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs font-bold text-slate-500">
        <span>{filteredRows.length} dòng đang hiển thị</span>
        <span>Giới hạn tải 200 dòng gần nhất</span>
      </div>
    </section>
  );
}
