"use client";

import { createContext } from "react";
import type { AuthContextType } from "@/actions/types/auth";

export const AuthContext = createContext<AuthContextType | null>(null);
