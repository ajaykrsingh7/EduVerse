import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

// Get the storage key scoped to a specific user
const cartKey = (userId) => userId ? `eduvi_cart_${userId}` : 'eduvi_cart_guest';

export const CartProvider = ({ children }) => {
  // We start with a "pending" state — we don't know the user yet
  const [userId, setUserId] = useState(null);
  const [items,  setItems]  = useState([]);

  // When userId changes (login/logout), load the correct cart
  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartKey(userId));
      setItems(stored ? JSON.parse(stored) : []);
    } catch {
      setItems([]);
    }
  }, [userId]);

  // Persist whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(cartKey(userId), JSON.stringify(items));
    } catch {}
  }, [items, userId]);

  // Called by AuthContext / App when user logs in or out
  const setCartUser = (uid) => setUserId(uid || null);

  const addItem = (item) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id && i.type === item.type);
      if (exists) return prev;
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id, type) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.type === type)));

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(cartKey(userId));
  };

  const isInCart = (id, type) => items.some(i => i.id === id && i.type === type);
  const total    = items.reduce((sum, i) => sum + Number(i.price), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total, setCartUser }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);