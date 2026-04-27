import { useMemo, useState, useEffect } from "react";
import { AuthContext } from "./AuthContextObject";
import api from "../lib/api";
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("canteen_token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("canteen_token");
    return saved ? decodeToken(saved) : null;
  });
  const [dbUser, setDbUser] = useState(null);
  const syncProfile = async () => {
     if (!token) return;
     try {
         const { data } = await api.get('/auth/profile');
         if (data?.user) setDbUser(data.user);
     } catch (err) {
         console.error("Profile sync failed", err);
     }
  };
  useEffect(() => {
     syncProfile();
  }, [token]);
  const login = (nextToken) => {
    localStorage.setItem("canteen_token", nextToken);
    setToken(nextToken);
    setUser(decodeToken(nextToken));
  };
  const logout = () => {
    localStorage.removeItem("canteen_token");
    setToken("");
    setUser(null);
    setDbUser(null);
  };
  const activeUser = useMemo(() => {
      return dbUser ? { ...user, ...dbUser } : user;
  }, [user, dbUser]);
  const value = useMemo(
    () => ({
      token,
      user: activeUser,
      role: activeUser?.role || null,
      isAuthenticated: Boolean(token),
      isReady: true,
      login,
      logout,
      syncProfile
    }),
    [token, activeUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
