import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login } from "../../api/auth";
import { mockLogin } from "./mockAuth";
import { type Role, roleConfig } from "../../lib/roleConfig";
import { message } from "antd";
import {
  LockOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const roleHomeRoute: Record<string, string> = {
  AGENT: "/agent",
  SUPERVISEUR: "/superviseur",
  RESPONSABLE: "/responsable",
  COMPTABLE: "/comptable",
  RESP_REPORTING: "/reporting",
  ADMIN_SI: "/admin",
};

export function LoginPage() {
  // Clean authentication handler without unused state variables
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const executeLogin = (token: string, role: Role, name?: string) => {
    setAuth(token, role, name ?? roleConfig[role].title);
    navigate(roleHomeRoute[role] ?? "/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      message.error("Veuillez saisir votre email et votre mot de passe");
      return;
    }
    try {
      const { token, role } = await login(email, password);
      executeLogin(token, role as Role);
    } catch (err) {
      message.error("Email ou mot de passe incorrect");
    }
  };

  const handleMockLogin = (role: Role) => {
    const { token } = mockLogin(role);
    executeLogin(token, role, roleConfig[role].title);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center p-md overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center absolute inset-0"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqkUieb3osT6hUEmGV8UUQqMHnBjHRvQC6tURZAKdEBB_e6sep2osBIOz9TNM6ZEMZKYwsiK-EhCqTR_Ah2UhGeOSgpvVyphixR2-HGxNZpaFaOHLUTZ_F3zwb9wdMymjXLu6CoOquAIVuXk0pCIJmnisUDOFzGE4dWu-6JHfpJq6ypMFZGNh64sBh2Rv-qNn-JQdsJKqTysoLqN2Q91xtjrN0vqKBx-_6rJfHOGnZNAAVqccaGRzM')",
          }}
        ></div>
        <div className="absolute inset-0 bg-background/70 backdrop-blur-md"></div>
      </div>

      {/* Floating Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 glass-panel px-4 py-2 rounded-full font-label-md text-label-md text-on-surface hover:bg-white/80 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
      >
        <ArrowLeftOutlined style={{ fontSize: "14px" }} />
        <span>Retour au Portail Public</span>
      </button>

      {/* Main Glass Login Container */}
      <div className="z-10 w-full max-w-[460px]">
        {/* Glass Form Panel */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          {/* Header with Logo */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
            <img
              src="/pictures/logo-rrm.png"
              alt="Rabat Région Mobilité"
              className="h-11 w-auto object-contain"
            />
            <div className="text-left">
              <h1 className="font-headline-md text-xl font-extrabold text-primary leading-tight m-0">
                RRM Parking
              </h1>
              <p className="font-label-sm text-xs text-on-surface-variant m-0 font-medium">
                Espace Personnel RRM
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email">
                Identifiant / Email Personnel
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline flex items-center">
                  <IdcardOutlined style={{ fontSize: "18px", color: "#76777d" }} />
                </span>
                <input
                  className="glass-input w-full h-[48px] rounded-xl pl-[48px] pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline-variant"
                  id="email"
                  placeholder="agent@rrm.ma"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline flex items-center">
                  <LockOutlined style={{ fontSize: "18px", color: "#76777d" }} />
                </span>
                <input
                  className="glass-input w-full h-[48px] rounded-xl pl-[48px] pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline-variant"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Authenticate Submit Button */}
            <button
              className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md h-[48px] rounded-xl w-full flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] mt-2 cursor-pointer"
              type="submit"
            >
              <span>Se Connecter</span>
              <LoginOutlined style={{ fontSize: "18px" }} />
            </button>

            {/* Demo Access Role Switcher */}
            <div className="mt-5 pt-5 border-t border-outline-variant/30 text-center">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-3 font-semibold">
                Accès Rapide Démo — Espace Personnel
              </p>
              <div className="grid grid-cols-2 gap-2 justify-center">
                {(Object.keys(roleConfig) as Role[]).map((role) => (
                  <button
                    key={role}
                    className="px-3 py-2 rounded-xl bg-secondary-container/20 text-on-secondary-container font-label-sm text-label-sm hover:bg-secondary-container/40 transition-colors border border-secondary-container/40 flex items-center justify-between cursor-pointer"
                    onClick={() => handleMockLogin(role)}
                    type="button"
                  >
                    <span className="font-medium">{roleConfig[role].title.replace("Espace ", "")}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 font-bold">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="text-center mt-6 font-label-sm text-label-sm text-on-surface-variant/70">
          © {new Date().getFullYear()} Rabat Région Mobilité (RRM). Tous droits réservés.
        </div>
      </div>
    </section>
  );
}