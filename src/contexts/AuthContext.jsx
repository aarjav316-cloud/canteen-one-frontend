import { useMemo, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContextObject";
import api from "../lib/api";

const decodeToken = (token) => {
  if (!token) return null;
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
  const [user, setUser] = useState(() => decodeToken(token));
  const [dbUser, setDbUser] = useState(null);

  const syncProfile = useCallback(async () => {
     if (!token) return;
     try {
         const { data } = await api.get('/auth/profile');
         if (data?.user) setDbUser(data.user);
     } catch (err) {
         console.error("Profile sync failed", err);
         if (err.response?.status === 401) {
             // Handle expired token
             setToken("");
             localStorage.removeItem("canteen_token");
         }
     }
  }, [token]);

  useEffect(() => {
     setUser(decodeToken(token));
     if (token) {
         syncProfile();
     } else {
         setDbUser(null);
     }
  }, [token, syncProfile]);

  const login = useCallback((nextToken) => {
    if (!nextToken) return;
    localStorage.setItem("canteen_token", nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("canteen_token");
    setToken("");
  }, []);

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
    [token, activeUser, login, logout, syncProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
