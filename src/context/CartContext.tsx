import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem, Product } from '../types';
import { add, getCart, remove, update } from '../services/cart';
import { AuthContext } from '../auth/AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const getUserCart = async () => {
      if (!user) {
        setCart([]);
        return;
      }
      const response = await getCart(user.public_id);
      if (response?.cart) {
        setCart(response.cart.items);
      }
    };

    getUserCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      console.error("User must be logged in to add to cart");
      return;
    }

    try {
      const response = await add(user.public_id, product.id, quantity);

      if (!response.error && response.cart_item) {
        setCart(prev => {
          const newItem = response.cart_item;

          const existingIndex = prev.findIndex(item => item.id === newItem.id);
          if (existingIndex >= 0) {
            const newCart = [...prev];
            newCart[existingIndex] = newItem;
            return newCart;
          }
          return [...prev, newItem];
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!user) {
      console.error("User must be logged in to remove from cart");
      return;
    }
    await remove(user.public_id, itemId.toString());
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!user) {
      console.error("User must be logged in to update quantity");
      return;
    }
    await update(user.public_id, itemId.toString(), quantity);
    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};