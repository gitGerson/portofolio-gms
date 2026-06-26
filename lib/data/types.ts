/** Domain types (camelCase) mapped from Supabase rows. */

export type Category = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  imagePath: string | null;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logoImage: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  inStock: boolean;
  rating: number | null;
  sold: number;
  description: string | null;
  highlights: string[];
  imagePath: string | null;
  imageTag: string | null;
  /** Title of the active promotion, when the product is on a scheduled promo. */
  promoTitle: string | null;
};

export type Promotion = {
  id: string;
  slug: string | null;
  title: string;
  discountPct: number | null;
  discountAmount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  createdAt: string;
  productIds: string[];
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "done"
  | "cancelled";

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  orderNo: string;
  customerName: string;
  whatsapp: string;
  address: string;
  note: string | null;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  proofPath: string | null;
  createdAt: string;
  items: OrderItem[];
};
