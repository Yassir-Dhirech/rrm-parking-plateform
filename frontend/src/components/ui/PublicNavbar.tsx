import { useState } from "react";
import { Dropdown, Drawer, Button, type MenuProps } from "antd";
import { DownOutlined, UserOutlined, MenuOutlined, HomeOutlined, InfoCircleOutlined, EnvironmentOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
        <div className="flex items-center justify-between px-4 md:px-8 h-16 md:h-20 w-full max-w-[1500px] mx-auto">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: "#003566" }} />}
              onClick={(e) => {
                e.stopPropagation();
                setMobileDrawerOpen(true);
              }}
              className="md:hidden flex items-center justify-center p-1"
            />
            <img src="/pictures/logo-rrm.png" alt="RRM" className="h-10 md:h-16 w-auto" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-md lg:gap-lg">
            <button
              onClick={() => navigate("/")}
              className={`font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                isHome ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              Accueil
            </button>

            <button
              onClick={() => navigate("/about")}
              className={`font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                location.pathname === "/about" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              À Propos
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
          </nav>

          {/* Action Button: Personnel RRM */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-3 md:px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-variant transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <UserOutlined style={{ fontSize: "14px" }} />
              <span className="hidden sm:inline">Personnel RRM</span>
              <span className="sm:hidden">Espace RRM</span>
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
            onClick={() => { navigate("/about"); setMobileDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 border-none bg-transparent cursor-pointer text-left w-full"
          >
            <InfoCircleOutlined className="text-base text-secondary" />
            <span>À Propos de RRM</span>
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
          <div className="pt-4 border-t border-slate-200 mt-2">
            <button
              onClick={() => { navigate("/login"); setMobileDrawerOpen(false); }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer border-none"
            >
              <UserOutlined />
              <span>Connexion Personnel RRM</span>
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}