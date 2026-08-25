import { Dropdown, type MenuProps } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  // Dropdown 2: Nos Parkings Menu (Discovery -> Dedicated Page /parkings-public)
  const parkingsMenuItems: MenuProps["items"] = [
    {
      key: "page-parkings",
      label: "Voir Tous les 17 Parkings (Page Dédiée)",
      onClick: () => navigate("/parkings-public"),
    },
    {
      key: "map-live",
      label: "Carte Interactive (Temps Réel)",
      onClick: () => {
        if (isHome) {
          const el = document.getElementById("map");
          el?.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/parkings-public");
        }
      },
    },
    {
      key: "rfid-lpr",
      label: "Infrastructures & Contrôle LPR/RFID",
      onClick: () => navigate("/parkings-public"),
    },
  ];

  // Dropdown 3: Tarifs & Formules Menu (Evaluation -> Dedicated Page /tarifs-public)
  const tarifsMenuItems: MenuProps["items"] = [
    {
      key: "page-tarifs",
      label: "Grille Tarifaire Complète (Page Dédiée)",
      onClick: () => navigate("/tarifs-public"),
    },
    {
      key: "tarif-24h7j",
      label: "Pass Permanent 24h / 7j (600 DH/mois)",
      onClick: () => navigate("/demande-publique?plan=24H7J"),
    },
    {
      key: "tarif-jour",
      label: "Pass Diurne 08h00 - 20h00 (420 DH/mois)",
      onClick: () => navigate("/demande-publique?plan=JOUR"),
    },
    {
      key: "tarif-nuit",
      label: "Pass Nocturne 19h00 - 08h00 (350 DH/mois)",
      onClick: () => navigate("/demande-publique?plan=NUIT"),
    },
    {
      key: "tarif-moto",
      label: "Tarif Spécial Deux-roues (200 DH/mois)",
      onClick: () => navigate("/demande-publique?plan=MOTO"),
    },
  ];

  // Dropdown 4: Abonnement & Démarches Menu (Conversion -> Dedicated Page /demande-publique)
  const demarchesMenuItems: MenuProps["items"] = [
    {
      key: "page-demandes",
      label: "Portail des Démarches en Ligne (Page Dédiée)",
      onClick: () => navigate("/demande-publique"),
    },
    {
      key: "demande-new",
      label: "Nouvel Abonnement (Première Souscription)",
      onClick: () => navigate("/demande-publique?tab=NEW"),
    },
    {
      key: "demande-renew",
      label: "Renouvellement d'Abonnement",
      onClick: () => navigate("/demande-publique?tab=RENEW"),
    },
    {
      key: "demande-transfer",
      label: "Transfert d'Affectation Parking",
      onClick: () => navigate("/demande-publique?tab=TRANSFER"),
    },
    {
      key: "demande-duplicate",
      label: "Duplicata Carte RFID (Perte/Vol)",
      onClick: () => navigate("/demande-publique?tab=DUPLICATE"),
    },
    {
      type: "divider",
    },
    {
      key: "demande-corporate",
      label: "Souscription Corporate (Sociétés & Flottes)",
      onClick: () => navigate("/demande-publique?typeClient=ENTREPRISE"),
    },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-white/40 shadow-sm hidden md:block">
      <div className="flex items-center justify-between px-md lg:px-lg h-20 w-full max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/pictures/logo-rrm.png" alt="RRM" className="h-16 w-auto" />
        </div>

        {/* Navigation Links — 4 Main Links with Dedicated Standalone Pages */}
        <nav className="flex items-center gap-md lg:gap-lg">
          {/* Link 1: Accueil -> Dedicated Page / */}
          <button
            onClick={() => navigate("/")}
            className={`font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              isHome ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
            }`}
          >
            Accueil
          </button>

          {/* Link 2: Nos Parkings -> Dedicated Page /parkings-public */}
          <Dropdown menu={{ items: parkingsMenuItems }} trigger={["hover"]} placement="bottomLeft">
            <button
              onClick={() => navigate("/parkings-public")}
              className={`flex items-center gap-1.5 font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                location.pathname === "/parkings-public" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              <span>Nos Parkings</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </button>
          </Dropdown>

          {/* Link 3: Tarifs & Formules -> Dedicated Page /tarifs-public */}
          <Dropdown menu={{ items: tarifsMenuItems }} trigger={["hover"]} placement="bottomLeft">
            <button
              onClick={() => navigate("/tarifs-public")}
              className={`flex items-center gap-1.5 font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                location.pathname === "/tarifs-public" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              <span>Tarifs & Formules</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </button>
          </Dropdown>

          {/* Link 4: Abonnement & Démarches -> Dedicated Page /demande-publique */}
          <Dropdown menu={{ items: demarchesMenuItems }} trigger={["hover"]} placement="bottomLeft">
            <button
              onClick={() => navigate("/demande-publique")}
              className={`flex items-center gap-1.5 font-label-md text-label-md px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                location.pathname === "/demande-publique" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary hover:bg-white/40"
              }`}
            >
              <span>Abonnement & Démarches</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </button>
          </Dropdown>
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