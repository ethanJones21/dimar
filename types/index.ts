export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  images: string[];
  stock: number;
  category_id: string;
  category?: Category;
  brand?: string | null;
  sale_format?: "unit" | "pack";
  pack_size?: number | null;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: Address | null;
  role: "customer" | "admin";
  created_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping_address: Address;
  items?: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string;
  bg_color: string;
  type: "hero" | "promo";
  order_index: number;
  active: boolean;
  created_at: string;
}
