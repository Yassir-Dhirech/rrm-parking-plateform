import { useNavigate, Link } from "react-router-dom";
import { Tag } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

export function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden border-t border-slate-800/80 mt-28 pt-16 pb-8 w-full">
      {/* Decorative Luminous Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: Operator Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-24 h-14 rounded-2xl bg-transparent p-2 flex items-center justify-center ">
                <img
                  src="/pictures/logo-rrm.png"
                  alt="Rabat Région Mobilité"
                  className="h-full w-auto object-contain drop-shadow-sm"
                />
        
              </div>
              
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Opérateur délégué et gestionnaire du réseau des parkings en ouvrage et relais de la métropole de Rabat-Salé-Kénitra.
            </p>

            <div className="pt-2">
              <Tag
                color="cyan"
                className="px-3 py-1 rounded-full font-bold border-none bg-cyan-950 text-cyan-300 text-xs inline-flex items-center gap-1.5"
              >
                <SafetyCertificateOutlined /> Opérateur Régional Certifié
              </Tag>
            </div>
          </div>

          {/* Column 2: Navigation & Quick Links */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <CarOutlined className="text-cyan-400" /> Navigation Publique
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold p-0 m-0 list-none">
              <li>
                <Link to="/" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>•</span> Accueil Général
                </Link>
              </li>
              <li>
                <Link to="/parkings-public" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>•</span> Nos Parkings en Ouvrage
                </Link>
              </li>
              <li>
                <Link to="/tarifs-public" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>•</span> Tarifs & Formules 2026
                </Link>
              </li>
              <li>
                <Link to="/demande-publique" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>•</span> Demande d'Abonnement En Ligne
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800/60">
                <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-bold flex items-center gap-1.5">
                  <LockOutlined /> Espace personnel RRM →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Guichets RRM */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <EnvironmentOutlined className="text-cyan-400" /> Contact & Guichets RRM
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <EnvironmentOutlined className="text-cyan-400 text-sm shrink-0 mt-0.5" />
                <span>Avenue Annakhil, Espace Affaires, Hay Riad, Rabat</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneOutlined className="text-cyan-400 text-sm shrink-0" />
                <span className="font-mono font-bold text-slate-200">+212 537 00 11 22</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MailOutlined className="text-cyan-400 text-sm shrink-0" />
                <span className="text-slate-300">contact@rabatmobilite.ma</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <ClockCircleOutlined className="text-emerald-400 text-sm shrink-0" />
                <span>Guichets : Lun - Sam | 08h00 - 19h00</span>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Action CTA */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">
              Souscription Rapide
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Souscrivez en 4 étapes simples et récupérez votre badge RFID au guichet de votre parking d'affectation.
            </p>

            <button
              onClick={() => navigate("/demande-publique")}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl py-3 px-4 text-xs shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
            >
              <span>Faire une Demande En Ligne</span>
              <ArrowRightOutlined />
            </button>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <Tag className="bg-slate-900 border-slate-800 text-slate-400 text-[11px] m-0">Pass 24h/7j</Tag>
              <Tag className="bg-slate-900 border-slate-800 text-slate-400 text-[11px] m-0">Diurne</Tag>
              <Tag className="bg-slate-900 border-slate-800 text-slate-400 text-[11px] m-0">Nocturne</Tag>
              <Tag className="bg-slate-900 border-slate-800 text-slate-400 text-[11px] m-0">Flottes Corporate</Tag>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p className="m-0 text-center md:text-left">
            © 2026 Rabat Région Mobilité (RRM) — Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">
              Mentions Légales
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">
              Conditions Générales (CGU)
            </a>
            <a href="#data" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">
              Protection Données (Loi 09-08)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
