import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { CartItem, Product } from '../types';
import { add, getCart, remove, update, clear } from '../services/cart';
import { AuthContext } from '../auth/AuthContext';
import { useAlert } from './AlertContext';

interface CartContextType {
  cart: CartItem[];
  cartId: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useAlert();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [cart]);

  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      setCartId(null);
      return;
    }
    try {
      const response = await getCart();

      if (response?.cart) {
        setCart(response.cart.items || []);
        setCartId(response.cart.public_id);
      } else {
        setCart([]);
        setCartId(null);
      }
    } catch (error) {
      console.error("[CartContext] Failed to refresh cart:", error);
      setCart([]);
      setCartId(null);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      showError("Você precisa estar logado para adicionar ao carrinho");
      return;
    }

    try {
      const response = await add(product.id, quantity);
      await refreshCart();

      if (response?.error === false) {
        showSuccess(response.message);
      } else if (response?.error === true) {
        showError(response.message);
      }
    } catch (error) {
      await refreshCart();
      showError("Erro ao adicionar produto ao carrinho");
      console.error("Failed to add to cart:", error);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!user) {
      showError("Você precisa estar logado para remover do carrinho");
      return;
    }
    try {
      const response = await remove(itemId.toString());
      await refreshCart();

      if (response?.error === false) {
        showSuccess(response.message);
      } else if (response?.error === true) {
        showError(response.message);
      }
    } catch (error) {
      // Tenta atualizar mesmo em caso de erro
      await refreshCart();
      showError("Erro ao remover produto do carrinho");
      console.error("Failed to remove from cart:", error);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!user) {
      showError("Você precisa estar logado para atualizar a quantidade");
      return;
    }
    try {
      const response = await update(user.public_id, itemId.toString(), quantity);
      // Sempre atualiza o carrinho primeiro
      await refreshCart();

      // Depois mostra o alerta
      if (response?.error === false) {
        showSuccess(response.message);
      } else if (response?.error === true) {
        showError(response.message);
      }
    } catch (error) {
      // Tenta atualizar mesmo em caso de erro
      await refreshCart();
      showError("Erro ao atualizar quantidade");
      console.error("Failed to update quantity:", error);
    }
  };

  const clearCart = async () => {
    try {
      await clear();
      showSuccess("Carrinho limpo com sucesso");
      await refreshCart();
    } catch (error) {
      showError("Erro ao limpar carrinho");
      console.error("Failed to clear cart:", error);
    }
  }

  return (
    <CartContext.Provider value={{ cart, cartId, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};