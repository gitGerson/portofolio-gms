/** Domain types (camelCase) mapped from Supabase rows. */

export type Category = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string | null;
  categoryName: string | null;
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
