import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "../lib/roleConfig";

function lireAuthorities(): string[] {
  try {
    const valeur = localStorage.getItem("authorities");
    return valeur ? JSON.parse(valeur) : [];
  } catch {
    return [];
  }
}

interface AuthContextType {
  token: string | null;
  role: Role | null;
  userName: string | null;
  authorities: string[];
  hasAuthority: (authority: string) => boolean;
  login: (
    token: string,
    role: Role,
    userName?: string,
    authorities?: string[],
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [role, setRole] = useState<Role | null>(
    localStorage.getItem("role") as Role | null,
  );

  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName"),
  );

  const [authorities, setAuthorities] =
    useState<string[]>(lireAuthorities);

  const login = (
    newToken: string,
    newRole: Role,
    newUserName?: string,
    newAuthorities: string[] = [],
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem(
      "authorities",
      JSON.stringify(newAuthorities),
    );

    if (newUserName) {
      localStorage.setItem("userName", newUserName);
    } else {
      localStorage.removeItem("userName");
    }

    setToken(newToken);
    setRole(newRole);
    setUserName(newUserName ?? null);
    setAuthorities(newAuthorities);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("authorities");

    setToken(null);
    setRole(null);
    setUserName(null);
    setAuthorities([]);
  };

  const hasAuthority = (authority: string) =>
    authorities.includes(authority);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        userName,
        authorities,
        hasAuthority,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}