import { Dropdown, type MenuProps } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  // Dropdown 2: Nos Parkings & Tarifs Menu
  const parkingsMenuItems: MenuProps["items"] = [
    {
      key: "page-parkings",
      label: "Tous les 17 Parkings (Carte Interactive)",
      onClick: () => navigate("/parkings-public"),
    },
    {
      key: "page-tarifs-section",
      label: "Grille Tarifaire & Formules 2026",
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
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-white/40 shadow-sm hidden md:block">
      <div className="flex items-center justify-between px-4 md:px-8 h-20 w-full max-w-[1500px] mx-auto">
        {/* Brand Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/pictures/logo-rrm.png" alt="RRM" className="h-16 w-auto" />
        </div>

        {/* Navigation Links — 4 Main Links */}
        <nav className="flex items-center gap-md lg:gap-lg">
          {/* Link 1: Accueil -> / */}
          <button
            onClick={() => navigate("/")}
            className={`font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              isHome ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
            }`}
          >
            Accueil
          </button>

          {/* Link 2: À Propos RRM -> /about */}
          <button
            onClick={() => navigate("/about")}
            className={`font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              location.pathname === "/about" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
            }`}
          >
            À Propos
          </button>

          {/* Link 3: Parkings & Tarifs -> /parkings-public */}
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

          {/* Link 4: Abonnement & Démarches -> /demande-publique */}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="bg-primary-container text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-fixed-variant transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <UserOutlined style={{ fontSize: "14px" }} />
            <span>Personnel RRM</span>
          </button>
        </div>
      </div>
    </header>
  );
}