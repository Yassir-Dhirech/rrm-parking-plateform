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

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="relative flex items-center justify-between px-4 md:px-8 h-16 md:h-20 w-full max-w-[1500px] mx-auto">
          {/* Mobile Hamburger Button (Left on phone) */}
          <div className="flex items-center md:hidden w-10">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: "#003566" }} />}
              onClick={() => setMobileDrawerOpen(true)}
              className="flex items-center justify-center p-1"
            />
          </div>

          {/* Left: Brand Logo */}
          <div
            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center cursor-pointer md:w-56 shrink-0"
            onClick={() => navigate("/")}
          >
            <img src="/pictures/logo-rrm.png" alt="RRM" className="h-10 md:h-16 w-auto object-contain" />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center justify-center gap-2 lg:gap-6 flex-1">
            <button
              onClick={() => navigate("/")}
              className={`font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                isHome ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              Accueil
            </button>

            <Dropdown menu={{ items: parkingsMenuItems }} trigger={["hover"]} placement="bottomLeft">
              <button
                onClick={() => navigate("/parkings-public")}
                className={`flex items-center gap-1.5 font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  location.pathname === "/parkings-public" || location.pathname === "/tarifs-public" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
                }`}
              >
                <span>Parkings & Tarifs</span>
                <DownOutlined style={{ fontSize: "10px" }} />
              </button>
            </Dropdown>

            <button
              onClick={() => navigate("/demande-publique")}
              className={`flex items-center gap-1.5 font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                location.pathname === "/demande-publique" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              <span>Abonnement & Démarches</span>
            </button>

            <button
              onClick={() => setIsSuiviOpen(true)}
              className="flex items-center gap-1.5 font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors text-on-surface-variant hover:text-secondary hover:bg-white/40"
            >
              <SearchOutlined />
              <span>Suivi de Demande</span>
            </button>
          </nav>

          {/* Right: Feedback Action Button */}
          <div className="flex items-center justify-end md:w-56 shrink-0">
            {/* Desktop Pill Button */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-secondary border border-slate-300/80 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <CommentOutlined className="text-secondary text-sm" />
              <span>Avis & Feedbacks</span>
            </button>

            {/* Mobile Icon Button */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-secondary shadow-xs cursor-pointer border border-slate-200 transition-all"
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 border-none bg-transparent cursor-pointer text-left w-full"
          >
            <HomeOutlined className="text-base text-secondary" />
            <span>Accueil</span>
          </button>
          <button
            onClick={() => { navigate("/parkings-public"); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 border-none bg-transparent cursor-pointer text-left w-full"
          >
            <EnvironmentOutlined className="text-base text-secondary" />
            <span>Carte & Grille des Parkings</span>
          </button>
          <button
            onClick={() => { navigate("/demande-publique"); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 border-none bg-transparent cursor-pointer text-left w-full"
          >
            <FormOutlined className="text-base text-secondary" />
            <span>Souscription Abonnement</span>
          </button>
          <button
            onClick={() => { setIsSuiviOpen(true); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-secondary border-none bg-secondary/5 cursor-pointer text-left w-full"
          >
            <SearchOutlined className="text-base text-secondary" />
            <span>Suivi & Modification Demande</span>
          </button>
          <button
            onClick={() => { setIsFeedbackOpen(true); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 border-none bg-transparent cursor-pointer text-left w-full"
          >
            <CommentOutlined className="text-base text-secondary" />
            <span>Donner un Avis / Feedbacks</span>
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