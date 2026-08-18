import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("lucem_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("lucem_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("lucem_user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("lucem_token");
        localStorage.removeItem("lucem_user");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  function persist(data) {
    localStorage.setItem("lucem_token", data.access_token);
    localStorage.setItem("lucem_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    persist(res.data);
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    persist(res.data);
  }

  function logout() {
    localStorage.removeItem("lucem_token");
    localStorage.removeItem("lucem_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
