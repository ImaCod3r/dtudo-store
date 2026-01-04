export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
}

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

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface CartItem {
  id: number;
  cart_id?: number;
  quantity: number;
  product: Product;
}

export interface CreateOrder {
  items: CartItem[];
  address: Address;
  phone: string;
  total_price: number;
}

export interface Order {
  id: string;
  total_price: number;
  items: CartItem[];
  address: Address;
  createdAt: string;
  status: 'Pendente' | 'Confirmado' | 'Entregue' | 'Cancelado';
}

export interface Address {
  id: number;
  name: string;
  long: number;
  lat: number;
}