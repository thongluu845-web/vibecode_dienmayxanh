"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FolderTree,
  Home,
  Image,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AdminShellProps = {
  adminEmail: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Tổng quan", Icon: Home },
  { href: "/admin/products", label: "Sản phẩm", Icon: Package },
  { href: "/admin/categories", label: "Danh mục", Icon: FolderTree },
  { href: "/admin/banners", label: "Banner", Icon: Image },
  { href: "/admin/orders", label: "Đơn hàng", Icon: ReceiptText },
  { href: "/admin/order-items", label: "Chi tiết đơn", Icon: Boxes },
  { href: "/admin/customers", label: "Khách hàng", Icon: Users },
  { href: "/admin/cart", label: "Giỏ hàng", Icon: ShoppingCart },
  { href: "/admin/roles", label: "Phân quyền", Icon: ShieldCheck },
  { href: "/admin/settings", label: "Cấu hình", Icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ adminEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
          <BarChart3 size={21} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">Admin Console</p>
          <p className="truncate text-xs font-semibold text-slate-500">Điện Máy Lưu Thảo</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                  active
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase text-slate-400">Đang đăng nhập</p>
          <p className="mt-1 truncate text-sm font-bold text-slate-800">{adminEmail}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={17} />
          {signingOut ? "Đang thoát..." : "Đăng xuất"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[84vw]">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
              aria-label="Mở menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">Bảng điều khiển vận hành</p>
              <p className="truncate text-xs font-semibold text-slate-500">
                Dữ liệu trực tiếp từ Supabase
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 sm:flex">
            <BarChart3 size={17} className="text-sky-600" />
            Live admin
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 lg:py-7">{children}</div>
      </div>
    </div>
  );
}
