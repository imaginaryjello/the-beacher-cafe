// src/pages/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // starts true — we're checking localStorage

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        // WHY: If JSON.parse fails (corrupted data), clear storage and start fresh
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    // FIX: setLoading(false) must run WHETHER OR NOT there's a saved user.
    // Previously it only ran inside the if block — so if no user was saved,
    // loading stayed true forever and the app hung on the loading screen.
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData.user));
    setToken(userData.token);
    setUser(userData.user);
    console.log("User logged in:", userData.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  // WHY updateUser: after the user edits their profile (name/phone), we need to
  // sync those changes into localStorage and state so the sidebar shows the new
  // name immediately without requiring a re-login.
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
