export type AdminTableKey =
  | "products"
  | "categories"
  | "banners"
  | "orders"
  | "order_items"
  | "profiles"
  | "cart_items"
  | "user_roles";

export type AdminColumn = {
  key: string;
  label: string;
  type?: "text" | "currency" | "number" | "boolean" | "date" | "status" | "uuid" | "json";
  compact?: boolean;
  editable?: "boolean" | "select";
  options?: string[];
};

export type AdminTableConfig = {
  key: AdminTableKey;
  title: string;
  description: string;
  table: AdminTableKey;
  href: string;
  primaryKey: string;
  orderBy?: string;
  orderAscending?: boolean;
  columns: AdminColumn[];
};

export const adminTableConfigs: Record<string, AdminTableConfig> = {
  products: {
    key: "products",
    title: "Sản phẩm",
    description: "Giá, tồn kho, trạng thái bán và nhãn nổi bật.",
    table: "products",
    href: "/admin/products",
    primaryKey: "id",
    orderBy: "updated_at",
    columns: [
      { key: "name", label: "Tên sản phẩm", compact: true },
      { key: "brand", label: "Hãng" },
      { key: "price", label: "Giá gốc", type: "currency" },
      { key: "sale_price", label: "Giá bán", type: "currency" },
      { key: "stock_quantity", label: "Tồn", type: "number" },
      { key: "sold", label: "Đã bán", type: "number" },
      { key: "is_active", label: "Đang bán", type: "boolean", editable: "boolean" },
      { key: "is_featured", label: "Nổi bật", type: "boolean", editable: "boolean" },
      { key: "is_flash_sale", label: "Flash", type: "boolean", editable: "boolean" },
      { key: "updated_at", label: "Cập nhật", type: "date" },
    ],
  },
  categories: {
    key: "categories",
    title: "Danh mục",
    description: "Nhóm ngành hàng, thứ tự hiển thị và trạng thái active.",
    table: "categories",
    href: "/admin/categories",
    primaryKey: "id",
    orderBy: "sort_order",
    orderAscending: true,
    columns: [
      { key: "name", label: "Tên danh mục" },
      { key: "slug", label: "Slug" },
      { key: "sort_order", label: "Thứ tự", type: "number" },
      { key: "is_active", label: "Active", type: "boolean", editable: "boolean" },
      { key: "updated_at", label: "Cập nhật", type: "date" },
    ],
  },
  banners: {
    key: "banners",
    title: "Banner",
    description: "Banner trang chủ, liên kết và trạng thái hiển thị.",
    table: "banners",
    href: "/admin/banners",
    primaryKey: "id",
    orderBy: "sort_order",
    orderAscending: true,
    columns: [
      { key: "title", label: "Tiêu đề", compact: true },
      { key: "link", label: "Link" },
      { key: "background_color", label: "Màu nền" },
      { key: "sort_order", label: "Thứ tự", type: "number" },
      { key: "is_active", label: "Active", type: "boolean", editable: "boolean" },
      { key: "updated_at", label: "Cập nhật", type: "date" },
    ],
  },
  orders: {
    key: "orders",
    title: "Đơn hàng",
    description: "Trạng thái đơn, thanh toán và thông tin giao hàng.",
    table: "orders",
    href: "/admin/orders",
    primaryKey: "id",
    orderBy: "created_at",
    columns: [
      { key: "order_number", label: "Mã đơn" },
      { key: "customer_name", label: "Khách hàng", compact: true },
      { key: "customer_phone", label: "Điện thoại" },
      {
        key: "status",
        label: "Trạng thái",
        type: "status",
        editable: "select",
        options: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      },
      { key: "payment_status", label: "Thanh toán", type: "status" },
      { key: "total_amount", label: "Tổng tiền", type: "currency" },
      { key: "created_at", label: "Ngày tạo", type: "date" },
    ],
  },
  order_items: {
    key: "order_items",
    title: "Chi tiết đơn",
    description: "Sản phẩm trong từng đơn hàng.",
    table: "order_items",
    href: "/admin/order-items",
    primaryKey: "id",
    orderBy: "created_at",
    columns: [
      { key: "product_name", label: "Sản phẩm", compact: true },
      { key: "product_slug", label: "Slug" },
      { key: "quantity", label: "SL", type: "number" },
      { key: "unit_price", label: "Đơn giá", type: "currency" },
      { key: "line_total", label: "Thành tiền", type: "currency" },
      { key: "created_at", label: "Ngày tạo", type: "date" },
    ],
  },
  profiles: {
    key: "profiles",
    title: "Khách hàng",
    description: "Hồ sơ người dùng đã đăng nhập.",
    table: "profiles",
    href: "/admin/customers",
    primaryKey: "id",
    orderBy: "created_at",
    columns: [
      { key: "full_name", label: "Họ tên", compact: true },
      { key: "phone", label: "Số điện thoại" },
      { key: "role", label: "Profile role", type: "status" },
      { key: "id", label: "User ID", type: "uuid" },
      { key: "created_at", label: "Ngày tạo", type: "date" },
    ],
  },
  cart_items: {
    key: "cart_items",
    title: "Giỏ hàng",
    description: "Các sản phẩm đang nằm trong giỏ của user.",
    table: "cart_items",
    href: "/admin/cart",
    primaryKey: "id",
    orderBy: "updated_at",
    columns: [
      { key: "user_id", label: "User ID", type: "uuid" },
      { key: "product_id", label: "Product ID", type: "uuid" },
      { key: "quantity", label: "Số lượng", type: "number" },
      { key: "updated_at", label: "Cập nhật", type: "date" },
    ],
  },
  user_roles: {
    key: "user_roles",
    title: "Phân quyền",
    description: "Quản lý role user/admin theo tài khoản Supabase Auth.",
    table: "user_roles",
    href: "/admin/roles",
    primaryKey: "user_id",
    orderBy: "updated_at",
    columns: [
      { key: "user_id", label: "User ID", type: "uuid", compact: true },
      { key: "role", label: "Role", type: "status", editable: "select", options: ["user", "admin"] },
      { key: "created_at", label: "Ngày tạo", type: "date" },
      { key: "updated_at", label: "Cập nhật", type: "date" },
    ],
  },
};

export const adminSectionAliases: Record<string, keyof typeof adminTableConfigs> = {
  products: "products",
  categories: "categories",
  banners: "banners",
  orders: "orders",
  "order-items": "order_items",
  customers: "profiles",
  cart: "cart_items",
  roles: "user_roles",
};

export function getAdminTableConfig(section: string): AdminTableConfig | null {
  const key = adminSectionAliases[section];

  return key ? adminTableConfigs[key] : null;
}
