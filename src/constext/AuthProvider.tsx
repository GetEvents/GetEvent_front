"use client";

import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@/actions/types/auth";
import { getUser } from "@/actions/auth/authAction";

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const logout = () => {
    setUser(null);
    setToken(null);
  };
  useEffect(() => {
    async function loadUser() {
      const res = await getUser();

      if (res) {
        setUser(res.user);
      }
    }

    loadUser();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading: false,
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
