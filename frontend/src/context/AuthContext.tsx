import { createContext, useContext, useState, type ReactNode } from "react";
import { type Role } from "../lib/roleConfig";


interface AuthContextType {
  token: string | null;
  role: Role | null;
  userName: string | null;
  login: (token: string, role: Role, userName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<Role | null>(localStorage.getItem("role") as Role | null);
  const [userName, setUserName] = useState<string | null>(localStorage.getItem("userName"));
  const isAuthenticated = !!token;

  const login = (newToken: string, newRole: Role, newUserName?: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    if(newUserName){ localStorage.setItem("userName", newUserName);
  }else {
  localStorage.removeItem("userName");}
    setToken(newToken);
    setRole(newRole);
    setUserName(newUserName ?? null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setToken(null);
    setRole(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}