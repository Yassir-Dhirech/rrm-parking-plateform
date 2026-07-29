import { createContext, useContext, useState, type ReactNode } from "react";

type Role = "AGENT" | "SUPERVISEUR" | "RESPONSABLE" | "COMPTABLE" | "RESP_REPORTING" | "ADMIN_SI";

interface AuthContextType {
  token: string | null;
  role: Role | null;
  login: (token: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<Role | null>(localStorage.getItem("role") as Role | null);

  const login = (newToken: string, newRole: Role) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
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