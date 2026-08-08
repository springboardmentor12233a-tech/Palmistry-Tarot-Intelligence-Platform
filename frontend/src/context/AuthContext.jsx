import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!user;

  const signup = async (name, email, password) => {
    const response = await api.post("/auth/signup", { name, email, password });
    const { access_token, name: userName, email: userEmail } = response.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify({ name: userName, email: userEmail }));
    setUser({ name: userName, email: userEmail });
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, name: userName, email: userEmail } = response.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify({ name: userName, email: userEmail }));
    setUser({ name: userName, email: userEmail });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}