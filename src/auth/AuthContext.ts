import { createContext } from "react";
import type { User } from "../types";

export interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser(): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);
