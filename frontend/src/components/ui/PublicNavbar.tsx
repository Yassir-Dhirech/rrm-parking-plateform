import { useState } from "react";
import { Dropdown, Drawer, Button, type MenuProps } from "antd";
import {
  DownOutlined,
  MenuOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  FormOutlined,
  SearchOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicSuiviDemandeModal } from "../../features/demandes/components/PublicSuiviDemandeModal";
import { PublicFeedbackModal } from "./PublicFeedbackModal";

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSuiviOpen, setIsSuiviOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isHome = location.pathname === "/";
  const isParkings = location.pathname === "/parkings-public" || location.pathname === "/tarifs-public";
  const isAbonnement = location.pathname === "/demande-publique";

  // Dropdown 2: Nos Parkings & Tarifs Menu
  const parkingsMenuItems: MenuProps["items"] = [
    {
      key: "page-parkings",
      label: "Carte des Parkings",
      onClick: () => navigate("/parkings-public"),
    },
    {
      key: "page-tarifs-section",
      label: "Grille Tarifaire",
      onClick: () => {
        if (location.pathname === "/parkings-public") {
          const el = document.getElementById("tarifs");
          el?.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/parkings-public#tarifs");
        }
      },
    },
  ];

  const getLinkClasses = (isActive: boolean) =>
    `group flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer border select-none ${
      isActive
        ? "bg-gradient-to-r from-secondary to-[#0077b6] text-white border-white/40 shadow-[0_4px_20px_rgba(0,99,152,0.35)] backdrop-blur-md scale-[1.02]"
        : "text-slate-700 bg-white/40 hover:bg-white/95 hover:text-secondary border-white/60 hover:border-white hover:shadow-[0_4px_20px_rgba(0,99,152,0.12)] hover:-translate-y-0.5 active:translate-y-0"
    }`;

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="relative flex items-center justify-between px-4 md:px-8 h-16 md:h-20 w-full max-w-[1500px] mx-auto gap-4">
          {/* Mobile Hamburger Button (Left on phone) */}
          <div className="flex items-center md:hidden w-10 shrink-0">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: "#003566" }} />}
              onClick={() => setMobileDrawerOpen(true)}
              className="flex items-center justify-center p-1"
            />
          </div>

          {/* Left: Brand Logo */}
          <div
            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <img src="/pictures/logo-rrm.png" alt="RRM" className="h-10 md:h-16 w-auto object-contain drop-shadow-xs" />
          </div>

          {/* Center: Desktop Navigation Links (True Frosted Glassmorphism Island) */}
          <nav className="hidden md:flex items-center justify-center gap-1.5 lg:gap-2.5 flex-nowrap bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,99,152,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] shrink-0">
            <button
              onClick={() => navigate("/")}
              className={getLinkClasses(isHome)}
            >
              <HomeOutlined className={`text-sm transition-colors ${isHome ? "text-white" : "text-slate-400 group-hover:text-secondary"}`} />
              <span className="whitespace-nowrap">Accueil</span>
            </button>

            <Dropdown menu={{ items: parkingsMenuItems }} trigger={["hover"]} placement="bottomLeft">
              <button
                onClick={() => navigate("/parkings-public")}
                className={getLinkClasses(isParkings)}
              >
                <EnvironmentOutlined className={`text-sm transition-colors ${isParkings ? "text-white" : "text-slate-400 group-hover:text-secondary"}`} />
                <span className="whitespace-nowrap">Parkings & Tarifs</span>
                <DownOutlined className={`text-[10px] transition-transform group-hover:translate-y-0.5 ${isParkings ? "text-white" : "text-slate-400 group-hover:text-secondary"}`} />
              </button>
            </Dropdown>

            <button
              onClick={() => navigate("/demande-publique")}
              className={getLinkClasses(isAbonnement)}
            >
              <FormOutlined className={`text-sm transition-colors ${isAbonnement ? "text-white" : "text-slate-400 group-hover:text-secondary"}`} />
              <span className="whitespace-nowrap">Abonnement & Démarches</span>
            </button>

            <button
              onClick={() => setIsSuiviOpen(true)}
              className={getLinkClasses(isSuiviOpen)}
            >
              <SearchOutlined className={`text-sm transition-colors ${isSuiviOpen ? "text-white" : "text-slate-400 group-hover:text-secondary"}`} />
              <span className="whitespace-nowrap">Suivi de Demande</span>
            </button>
          </nav>

          {/* Right: Feedback Action Button */}
          <div className="flex items-center justify-end shrink-0">
            {/* Desktop Pill Button */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-amber-500/95 to-amber-600/95 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-300/40 px-4 py-2.5 rounded-xl text-xs font-extrabold backdrop-blur-md shadow-[0_4px_16px_rgba(217,119,6,0.22)] hover:shadow-[0_6px_22px_rgba(217,119,6,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <CommentOutlined className="text-white text-sm" />
              <span className="whitespace-nowrap">Avis & Feedbacks</span>
            </button>

            {/* Mobile Icon Button */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-900/20 hover:scale-105 active:scale-95 cursor-pointer border-none transition-all"
              title="Donner votre avis"
            >
              <CommentOutlined style={{ fontSize: "16px" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <img src="/pictures/logo-rrm.png" alt="RRM" className="h-8 object-contain" />
            <span className="text-xs font-extrabold text-slate-900">Portail RRM</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={280}
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { navigate("/"); setMobileDrawerOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border-none cursor-pointer text-left w-full transition-all ${
              isHome ? "bg-secondary text-white shadow-sm" : "text-slate-700 bg-transparent hover:bg-slate-100"
            }`}
          >
            <HomeOutlined className={`text-base ${isHome ? "text-white" : "text-secondary"}`} />
            <span className="whitespace-nowrap">Accueil</span>
          </button>
          <button
            onClick={() => { navigate("/parkings-public"); setMobileDrawerOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border-none cursor-pointer text-left w-full transition-all ${
              isParkings ? "bg-secondary text-white shadow-sm" : "text-slate-700 bg-transparent hover:bg-slate-100"
            }`}
          >
            <EnvironmentOutlined className={`text-base ${isParkings ? "text-white" : "text-secondary"}`} />
            <span className="whitespace-nowrap">Carte & Grille des Parkings</span>
          </button>
          <button
            onClick={() => { navigate("/demande-publique"); setMobileDrawerOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border-none cursor-pointer text-left w-full transition-all ${
              isAbonnement ? "bg-secondary text-white shadow-sm" : "text-slate-700 bg-transparent hover:bg-slate-100"
            }`}
          >
            <FormOutlined className={`text-base ${isAbonnement ? "text-white" : "text-secondary"}`} />
            <span className="whitespace-nowrap">Souscription Abonnement</span>
          </button>
          <button
            onClick={() => { setIsSuiviOpen(true); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-secondary border-none bg-secondary/5 cursor-pointer text-left w-full transition-all"
          >
            <SearchOutlined className="text-base text-secondary" />
            <span className="whitespace-nowrap">Suivi & Modification Demande</span>
          </button>
          <button
            onClick={() => { setIsFeedbackOpen(true); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-50 text-xs font-bold text-amber-700 border-none bg-amber-50/50 cursor-pointer text-left w-full transition-all mt-2 border border-amber-200"
          >
            <CommentOutlined className="text-base text-amber-600" />
            <span className="whitespace-nowrap">Donner un Avis / Feedbacks</span>
          </button>
        </div>
      </Drawer>

      {/* Suivi et Gestion de Demande Modal */}
      <PublicSuiviDemandeModal open={isSuiviOpen} onClose={() => setIsSuiviOpen(false)} />

      {/* Avis & Feedbacks Modal */}
      <PublicFeedbackModal open={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}