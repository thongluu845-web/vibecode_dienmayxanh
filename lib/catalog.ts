import { cache } from "react";
import { banners as fallbackBanners, categories as fallbackCategories, products as fallbackProducts } from "@/lib/data";
import type { Banner, Category, Product } from "@/types";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number | null;
  specs: Record<string, unknown> | null;
  rating: number | string | null;
  review_count: number | null;
  is_featured: boolean | null;
  sold: number | null;
  tags: string[] | null;
  is_new: boolean | null;
  is_flash_sale: boolean | null;
  flash_sale_end: string | null;
  installment_available: boolean | null;
  categories: CategoryRow | CategoryRow[] | null;
};

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string;
  background_color: string;
};

const DEFAULT_PRODUCT_IMAGE = "/assets/dien-lanh/hero-dien-lanh.png";
const USE_LOCAL_DIEN_LANH_CATALOG = false;
const PRODUCT_ASSET_ROOT = "/assets/dien-lanh";
const PRODUCT_ASSET_BY_SLUG: Record<string, string> = {
  "may-giat-aqua-inverter-10kg-aqw-dr100jt": `${PRODUCT_ASSET_ROOT}/product-may-giat-aqua-aqw-dr100jt.png`,
  "may-giat-electrolux-inverter-10kg-ewf1024d3wb": `${PRODUCT_ASSET_ROOT}/product-may-giat-electrolux-ewf1024d3wb.png`,
  "may-giat-lg-ai-dd-inverter-10kg-fv1410s4p": `${PRODUCT_ASSET_ROOT}/product-may-giat-lg-fv1410s4p.png`,
  "may-giat-samsung-ai-ecobubble-9kg-ww90t3040ww": `${PRODUCT_ASSET_ROOT}/product-may-giat-samsung-ww90t3040ww.png`,
  "may-lanh-daikin-inverter-1hp-ftkb25xvmv": `${PRODUCT_ASSET_ROOT}/product-may-lanh-daikin-ftkb25xvmv.png`,
  "may-lanh-lg-dualcool-inverter-15hp-v13api1": `${PRODUCT_ASSET_ROOT}/product-may-lanh-lg-v13api1.png`,
  "may-lanh-midea-xtreme-save-inverter-1hp-msafa-10crdn8": `${PRODUCT_ASSET_ROOT}/product-may-lanh-midea-xtreme-save-1hp.png`,
  "may-lanh-panasonic-inverter-1hp-cu-cs-xu9bkh-8": `${PRODUCT_ASSET_ROOT}/product-may-lanh-panasonic-xu9bkh-8.png`,
  "may-nuoc-nong-ariston-andris2-20l-an2-20rs-25fe": `${PRODUCT_ASSET_ROOT}/product-may-nuoc-nong-ariston-an2-20rs.png`,
  "may-nuoc-nong-ferroli-divo-ssn-20l": `${PRODUCT_ASSET_ROOT}/product-may-nuoc-nong-ferroli-divo-ssn-20l.png`,
  "may-nuoc-nong-centon-wh8338e": `${PRODUCT_ASSET_ROOT}/product-may-nuoc-nong-centon-wh8338e.png`,
  "may-nuoc-nong-panasonic-dh-3rl1vw": `${PRODUCT_ASSET_ROOT}/product-may-nuoc-nong-panasonic-dh-3rl1vw.png`,
  "tu-lanh-aqua-inverter-312l-aqr-t359ma": `${PRODUCT_ASSET_ROOT}/product-tu-lanh-aqua-aqr-t359ma.png`,
  "tu-lanh-lg-inverter-506l-gr-b506bl": `${PRODUCT_ASSET_ROOT}/product-tu-lanh-lg-gr-b506bl.png`,
  "tu-lanh-panasonic-inverter-322l-nr-bv361gkvn": `${PRODUCT_ASSET_ROOT}/product-tu-lanh-panasonic-nr-bv361gkvn.png`,
  "tu-lanh-samsung-inverter-488l-rf48a4010b4-sv": `${PRODUCT_ASSET_ROOT}/product-tu-lanh-samsung-rf48a4010b4-sv.png`,
};
const PLACEHOLDER_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "source.unsplash.com",
  "picsum.photos",
  "placehold.co",
  "via.placeholder.com",
]);
export const PRODUCT_SELECT_COLUMNS = [
  "id",
  "slug",
  "name",
  "brand",
  "short_description",
  "description",
  "image_url",
  "gallery_urls",
  "price",
  "sale_price",
  "stock_quantity",
  "specs",
  "rating",
  "review_count",
  "is_featured",
  "sold",
  "tags",
  "is_new",
  "is_flash_sale",
  "flash_sale_end",
  "installment_available",
  "categories!inner(id,name,slug,description,icon,image)",
] as const;
export const PRODUCT_SELECT = PRODUCT_SELECT_COLUMNS.join(",");

function asNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getJoinedCategory(row: ProductRow): CategoryRow | null {
  if (Array.isArray(row.categories)) {
    return row.categories[0] ?? null;
  }

  return row.categories;
}

function uniqueImages(primary: string | null, gallery: string[] | null): string[] {
  const images = [primary, ...(gallery ?? [])].filter(Boolean) as string[];
  return Array.from(new Set(images));
}

function isPlaceholderProductImage(src: string): boolean {
  if (!src || src.startsWith("/")) return false;

  try {
    const url = new URL(src);
    return PLACEHOLDER_IMAGE_HOSTS.has(url.hostname) || url.pathname.toLowerCase().includes("placeholder");
  } catch {
    return src.toLowerCase().includes("placeholder");
  }
}

function inferProductAsset(row: ProductRow, categorySlug: string | undefined): string | null {
  const slug = row.slug.toLowerCase();
  const exactAsset = PRODUCT_ASSET_BY_SLUG[slug];

  if (exactAsset) return exactAsset;

  if (categorySlug === "may-lanh") {
    return slug.includes("15hp") || slug.includes("1-5hp")
      ? `${PRODUCT_ASSET_ROOT}/product-may-lanh-15hp.png`
      : `${PRODUCT_ASSET_ROOT}/product-may-lanh-1hp.png`;
  }

  if (categorySlug === "may-giat") {
    return slug.includes("11kg") || slug.includes("9kg")
      ? `${PRODUCT_ASSET_ROOT}/product-may-giat-11kg.png`
      : `${PRODUCT_ASSET_ROOT}/product-may-giat-10kg.png`;
  }

  if (categorySlug === "tu-lanh") {
    const capacity = Number(slug.match(/(\d{3})l/)?.[1] ?? 0);
    return capacity >= 450
      ? `${PRODUCT_ASSET_ROOT}/product-tu-lanh-506l.png`
      : `${PRODUCT_ASSET_ROOT}/product-tu-lanh-320l.png`;
  }

  if (categorySlug === "may-nuoc-nong") {
    return slug.includes("truc-tiep") || slug.includes("dh-") || slug.includes("wh")
      ? `${PRODUCT_ASSET_ROOT}/product-may-nuoc-nong-truc-tiep.png`
      : `${PRODUCT_ASSET_ROOT}/product-may-nuoc-nong-30l.png`;
  }

  return null;
}

function resolveProductImages(row: ProductRow, categorySlug: string | undefined): string[] {
  const localAsset = inferProductAsset(row, categorySlug);
  const dbImages = uniqueImages(row.image_url, row.gallery_urls);
  const hasOnlyPlaceholderImages = dbImages.length > 0 && dbImages.every(isPlaceholderProductImage);

  if (localAsset && (dbImages.length === 0 || hasOnlyPlaceholderImages)) {
    return [localAsset];
  }

  return dbImages.length > 0 ? dbImages : [localAsset ?? DEFAULT_PRODUCT_IMAGE];
}

export function mapProduct(row: ProductRow): Product {
  const category = getJoinedCategory(row);
  const originalPrice = asNumber(row.price);
  const salePrice = row.sale_price === null ? originalPrice : asNumber(row.sale_price);
  const currentPrice = salePrice > 0 ? salePrice : originalPrice;
  const discount =
    originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const images = resolveProductImages(row, category?.slug);
  const specs = Object.fromEntries(
    Object.entries(row.specs ?? {}).map(([key, value]) => [key, String(value)])
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? "Điện lạnh",
    category: category?.name ?? "Điện lạnh",
    categorySlug: category?.slug ?? "dien-lanh",
    price: currentPrice,
    originalPrice,
    discount,
    images,
    thumbnail: images[0],
    rating: asNumber(row.rating),
    reviewCount: row.review_count ?? 0,
    sold: row.sold ?? 0,
    stock: row.stock_quantity ?? 0,
    description: row.description ?? "",
    shortDescription: row.short_description ?? "",
    specs,
    tags: row.tags ?? [],
    isNew: row.is_new ?? false,
    isFeatured: row.is_featured ?? false,
    isFlashSale: row.is_flash_sale ?? false,
    flashSaleEnd: row.flash_sale_end ?? undefined,
    installmentAvailable: row.installment_available ?? false,
  };
}

async function withFallback<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  if (USE_LOCAL_DIEN_LANH_CATALOG || !hasSupabaseEnv()) {
    return fallback;
  }

  try {
    return await read();
  } catch (error) {
    console.error("Supabase catalog fallback:", error);
    return fallback;
  }
}

async function fetchProductsFromSupabase(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapProduct(row as unknown as ProductRow));
}

async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  const supabase = createPublicClient();
  const [{ data, error }, products] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,description,icon,image")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    fetchProductsFromSupabase(),
  ]);

  if (error) {
    throw error;
  }

  const counts = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.categorySlug] = (acc[product.categorySlug] ?? 0) + 1;
    return acc;
  }, {});

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? "❄️",
    description: category.description ?? "",
    productCount: counts[category.slug] ?? 0,
    image: category.image ?? undefined,
  }));
}

async function fetchBannersFromSupabase(): Promise<Banner[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id,title,subtitle,image,link,background_color")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((banner: BannerRow) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    image: banner.image,
    link: banner.link,
    backgroundColor: banner.background_color,
  }));
}

export const getProducts = cache(async () =>
  withFallback(fetchProductsFromSupabase, fallbackProducts)
);

export const getCategories = cache(async () =>
  withFallback(fetchCategoriesFromSupabase, fallbackCategories)
);

export const getBanners = cache(async () => withFallback(fetchBannersFromSupabase, fallbackBanners));

export const getFeaturedProducts = cache(async () => {
  const products = await getProducts();
  return products.filter((product) => product.isFeatured);
});

export const getFlashSaleProducts = cache(async () => {
  const products = await getProducts();
  return products.filter((product) => product.isFlashSale);
});

export const getProductsByCategory = cache(async (categorySlug: string) => {
  const products = await getProducts();
  return products.filter((product) => product.categorySlug === categorySlug);
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
});
