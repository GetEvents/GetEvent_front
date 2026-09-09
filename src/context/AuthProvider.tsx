"use client";

import { getUser } from "@/actions/auth/authActions";
import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@/actions/types/auth";

interface Props {
  children: React.ReactNode;
  initialUser?: User | null;
}

export default function AuthProvider({ children, initialUser = null }: Props) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialUser);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getUser();
      const nextUser = response?.error ? null : response?.user || null;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUser) return;

    const restoreSession = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => window.clearTimeout(restoreSession);
  }, [initialUser, refreshUser]);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error: null,
        setUser,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
