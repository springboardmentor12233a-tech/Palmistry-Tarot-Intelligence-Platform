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
    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    const { access_token } = response.data;

    localStorage.setItem("token", access_token);

    const meResponse = await api.get("/auth/me");

    const newUser = {
      name: meResponse.data.name,
      email: meResponse.data.email,
      created_at: meResponse.data.created_at,
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { access_token } = response.data;

    localStorage.setItem("token", access_token);

    const meResponse = await api.get("/auth/me");

    const loggedInUser = {
      name: meResponse.data.name,
      email: meResponse.data.email,
      created_at: meResponse.data.created_at,
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  // Update user information after profile changes
  const updateUser = (updatedUser) => {
    const mergedUser = {
      ...user,
      ...updatedUser,
    };

    localStorage.setItem("user", JSON.stringify(mergedUser));
    setUser(mergedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        updateUser,
        logout,
      }}
    >
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