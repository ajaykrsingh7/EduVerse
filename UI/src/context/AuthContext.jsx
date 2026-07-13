import { useCart } from "./CartContext";
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setCartUser } = useCart();

  // Re-hydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("EduVerse_token");
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data);
          setCartUser(res.data.id);
        })
        .catch(() => localStorage.removeItem("EduVerse_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem("EduVerse_token", res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem("EduVerse_token", res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("EduVerse_token");
    setUser(null);
    setCartUser(null);
  };

  // Call after any profile update to refresh user in context
  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  };

  // Update user locally without a round-trip (optimistic update)
  const updateUserLocally = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUserLocally,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
