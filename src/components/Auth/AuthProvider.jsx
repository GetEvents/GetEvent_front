"use client";

import { getUser } from "@/actions/auth/authAction";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import React from "react";
const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [loadingUser, setLoadingUser] = useState(false);

  const refreshUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const response = await getUser();
      const user = response?.user || null;
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Écouter les changements de token dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        refreshUser();
      } else {
        clearUser();
      }
    };

    // Écouter les changements de localStorage
    window.addEventListener("storage", handleStorageChange);

    // Écouter les changements locaux (même onglet)
    const handleLocalStorageChange = () => {
      handleStorageChange();
    };

    window.addEventListener("authTokenChanged", handleLocalStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authTokenChanged", handleLocalStorageChange);
    };
  }, [refreshUser, clearUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(
        currentUser && Object.keys(currentUser).length > 0,
      ),
      loadingUser,
      refreshUser,
      clearUser,
    }),
    [clearUser, currentUser, loadingUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
}
