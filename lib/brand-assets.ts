export type BrandAsset = {
  name: string;
  slug: string;
  logo: string;
  width: number;
  height: number;
};

export const applianceBrands: BrandAsset[] = [
  { name: "Daikin", slug: "daikin", logo: "/assets/brands/daikin.svg", width: 300, height: 65 },
  { name: "Panasonic", slug: "panasonic", logo: "/assets/brands/panasonic.svg", width: 640, height: 100 },
  { name: "LG", slug: "lg", logo: "/assets/brands/lg.svg", width: 600, height: 275 },
  { name: "Samsung", slug: "samsung", logo: "/assets/brands/samsung.svg", width: 705, height: 108 },
  { name: "Aqua", slug: "aqua", logo: "/assets/brands/aqua.png", width: 140, height: 61 },
  { name: "Electrolux", slug: "electrolux", logo: "/assets/brands/electrolux.svg", width: 1367, height: 177 },
  { name: "Toshiba", slug: "toshiba", logo: "/assets/brands/toshiba.svg", width: 1547, height: 606 },
  { name: "Ariston", slug: "ariston", logo: "/assets/brands/ariston.svg", width: 1000, height: 165 },
  { name: "Ferroli", slug: "ferroli", logo: "/assets/brands/ferroli.svg", width: 512, height: 251 },
  { name: "Midea", slug: "midea", logo: "/assets/brands/midea.svg", width: 114, height: 44 },
];

export function normalizeBrandName(brand: string): string {
  return brand
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const brandBySlug = new Map(applianceBrands.map((brand) => [brand.slug, brand]));
const brandByName = new Map(applianceBrands.map((brand) => [normalizeBrandName(brand.name), brand]));

export function getBrandAsset(brand: string): BrandAsset | undefined {
  const key = normalizeBrandName(brand);

  return brandByName.get(key) ?? brandBySlug.get(key);
}

export function getBrandSlug(brand: string): string {
  return getBrandAsset(brand)?.slug ?? normalizeBrandName(brand);
}
