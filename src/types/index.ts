export interface User {
  name: string;
  email: string;
  avatar: string;
  public_id: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  public_id: string;
  image_url: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  children: Partial<Category>[];
}

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
  status: 'Delivered' | 'Processing' | 'Shipped';
}