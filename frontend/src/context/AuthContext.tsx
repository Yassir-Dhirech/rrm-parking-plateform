import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Role } from "../lib/roleConfig";
import { message } from "antd";
import { notifyBackendLogout } from "../api/adminUtilisateursApi";

function lireAuthorities(): string[] {
  try {
    const valeur = localStorage.getItem("authorities");
    return valeur ? JSON.parse(valeur) : [];
  } catch {
    return [];
  }
}

// 2 Heures d'inactivité en millisecondes (2 * 60 * 60 * 1000)
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<Role | null>(localStorage.getItem("role") as Role | null);
  const [userName, setUserName] = useState<string | null>(localStorage.getItem("userName"));
  const [authorities, setAuthorities] = useState<string[]>(lireAuthorities);
  const logout = () => {
    // Fire-and-forget : informe le backend sans bloquer la déconnexion locale
    notifyBackendLogout().catch(() => {});

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("authorities");
    localStorage.removeItem("lastActivityTime");

    setToken(null);
    setRole(null);
    setUserName(null);
    setAuthorities([]);
  };


  const login = (
    newToken: string,
    newRole: Role,
    newUserName?: string,
    newAuthorities: string[] = [],
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("authorities", JSON.stringify(newAuthorities));
    localStorage.setItem("lastActivityTime", Date.now().toString());

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

  // -------------------------------------------------------------
  // DÉTECTEUR D'INACTIVITÉ (DÉCONNEXION AUTOMATIQUE APRÈS 2 HEURES)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!token) return;

    const resetActivity = () => {
      localStorage.setItem("lastActivityTime", Date.now().toString());
    };

    // Événements surveillant la présence de l'utilisateur
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetActivity, { passive: true }));

    // Vérifier l'inactivité toutes les 30 secondes
    const interval = setInterval(() => {
      const lastActiveStr = localStorage.getItem("lastActivityTime");
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();
      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        logout();
        message.warning({
          content: "Votre session a été déconnectée après 2 heures d'inactivité.",
          duration: 6,
          key: "inactivity_logout",
        });
        window.location.href = "/login";
      }
    }, 30000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetActivity));
      clearInterval(interval);
    };
  }, [token]);

  const hasAuthority = (authority: string) => authorities.includes(authority);

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
