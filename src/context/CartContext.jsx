import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CART_KEY = 'tgCart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1, color = null, size = null) => {
    setItems(prev => {
      const key = `${product._id}-${color}-${size}`;
      const existing = prev.find(i => `${i.productId}-${i.color}-${i.size}` === key);
      if (existing) {
        const updated = prev.map(i =>
          `${i.productId}-${i.color}-${i.size}` === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
        toast.success('Cart updated!');
        return updated;
      }
      toast.success(`${product.name} added to cart ✨`);
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images?.[0]?.url || '',
        quantity,
        color,
        size,
        stock: product.stock,
        slug: product.slug
      }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId, color, size) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.color === color && i.size === size)));
    toast.success('Item removed from cart');
  }, []);

  const updateQuantity = useCallback((productId, color, size, quantity) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i =>
      i.productId === productId && i.color === color && i.size === size
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : (subtotal > 0 ? 2500 : 0);
  const total = subtotal + shipping;

  const isInCart = (productId) => items.some(i => i.productId === productId);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQuantity, clearCart,
      subtotal, itemCount, shipping, total, isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
