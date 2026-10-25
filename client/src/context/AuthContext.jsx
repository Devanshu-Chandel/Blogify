import { createContext, useState, useEffect, useCallback } from "react";
import API from "../api/api";

export const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  const payload = decodeToken(token);
  if (!payload) return false;
  return !payload.exp || payload.exp * 1000 > Date.now();
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("token");
    return saved && isTokenValid(saved) ? saved : null;
  });
  const [user, setUser] = useState(null); // { _id, name, email }

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // Load the user's profile whenever we have a token
useEffect(() => {
  if (!token) return;
  API.get("/auth/me")
    .then((res) => setUser(res.data))
    .catch((err) => {
      // only log out when the token is actually rejected
      if (err.response?.status === 401) logout();
      else console.error("Could not load profile:", err);
    });
}, [token, logout]);

  const userId = token ? decodeToken(token)?.id : null;

  return (
    <AuthContext.Provider
      value={{ token, user, userId, isLoggedIn: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};