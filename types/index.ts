export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  sold: number;
  stock: number;
  description: string;
  shortDescription: string;
  specs: Record<string, string>;
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEnd?: string;
  installmentAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
  image?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  backgroundColor: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface FilterOptions {
  brands: string[];
  priceRange: [number, number];
  rating?: number;
  inStock?: boolean;
}
