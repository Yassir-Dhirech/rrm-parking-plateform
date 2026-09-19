import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";
import {
  StarOutlined,
  SunOutlined,
  MoonOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

// Editable Formules Array — Easily modify prices, features, titles and badges here
export const FORMULES_DATA = [
  {
    id: "permanent",
    planKey: "24H7J",
    title: "Pass Permanent",
    priceDH: 600,
    period: "/ mois",
    popularBadge: "Le Plus Populaire",
    isPopular: true,
    icon: <StarOutlined style={{ fontSize: "20px", color: "#006398" }} />,
    colorTheme: "border-secondary-container/60 bg-white/70",
    features: [
      { text: "Accès permanent 24/7 à tous les ouvrages RRM", active: true },
      { text: "Entrées & sorties illimitées par badge RFID & LPR", active: true },
      { text: "Service assistance & support client prioritaire", active: true },
    ],
    buttonText: "Sélectionner 24h/7j",
    buttonStyle: "bg-primary text-white hover:bg-slate-800 shadow-lg shadow-primary/20",
  },
  {
    id: "diurne",
    planKey: "JOUR",
    title: "Pass Diurne",
    priceDH: 420,
    period: "/ mois",
    popularBadge: null,
    isPopular: false,
    icon: <SunOutlined style={{ fontSize: "20px", color: "#d97706" }} />,
    colorTheme: "bg-white/60",
    features: [
      { text: "Accès de jour du lundi au samedi (08:00 - 20:00)", active: true },
      { text: "Idéal pour trajets actifs & domicile-travail", active: true },
      { text: "Hors créneaux de stationnement nocturne", active: false },
    ],
    buttonText: "Sélectionner Diurne",
    buttonStyle: "bg-white/80 text-primary hover:bg-white border border-white/80 shadow-sm",
  },
  {
    id: "nocturne",
    planKey: "NUIT",
    title: "Pass Nocturne",
    priceDH: 350,
    period: "/ mois",
    popularBadge: null,
    isPopular: false,
    icon: <MoonOutlined style={{ fontSize: "20px", color: "#7c3aed" }} />,
    colorTheme: "bg-white/60",
    features: [
      { text: "Accès nocturne sécurisé (19:00 - 08:00)", active: true },
      { text: "Formule résidentielle spéciale nuit", active: true },
      { text: "Tarification horaire standard en journée", active: false },
    ],
    buttonText: "Sélectionner Nocturne",
    buttonStyle: "bg-white/80 text-primary hover:bg-white border border-white/80 shadow-sm",
  },
];

export function PublicTarifsPage() {
  const navigate = useNavigate();
  const [formules] = useState(FORMULES_DATA);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col justify-between relative overflow-x-hidden pt-20 lg:pt-24 pb-0">
      {/* Shared Unified Glass Header Navigation */}
      <PublicNavbar />

      {/* Atmospheric Background Mesh Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-mesh opacity-70"></div>

      {/* Main Content Canvas */}
      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 pt-4 pb-lg">
        {/* Header Title Section */}
        <div className="mb-12 text-center md:text-left max-w-3xl">
          <Tag color="gold" className="px-3.5 py-1 rounded-full font-semibold mb-3 border-none shadow-sm text-xs inline-flex items-center gap-1.5">
            <DollarOutlined /> Grille Tarifaire Homologuée RRM
          </Tag>
          <h1 className="font-headline-lg-mobile text-3xl md:text-[40px] font-bold text-primary mb-3 tracking-tight leading-tight">
            Tarifs & Formules d'Abonnement
          </h1>
          <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed">
            Découvrez nos formules d'abonnement de stationnement adaptées à tous vos besoins. Tarification transparente et homologuée pour une mobilité fluide à Rabat.
          </p>
        </div>

        {/* B2C Grid (Premium Rate Cards) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-primary tracking-tight m-0">
              Formules Individuelles Particuliers & Commuters
            </h2>
            <Tag color="blue" className="px-3 py-1 rounded-full font-semibold text-xs border-none">
              Paiement Espèces & Chèques sur Reçu
            </Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {formules.map((f) => (
              <div
                key={f.id}
                className={`glass-card rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 ${
                  f.isPopular ? "border-2 border-secondary-container/60 shadow-xl" : "border border-white/80 shadow-md"
                }`}
              >
                {f.popularBadge && (
                  <div className="absolute top-0 right-0 bg-secondary-container/90 backdrop-blur-md text-on-secondary-container font-label-sm text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-bl-xl font-extrabold shadow-sm">
                    {f.popularBadge}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/60 p-2 rounded-xl shadow-sm flex items-center justify-center">
                      {f.icon}
                    </div>
                    <h3 className="font-label-md text-xs uppercase tracking-wider font-extrabold text-secondary m-0">
                      {f.title}
                    </h3>
                  </div>

                  <div className="mb-6">
                    <span className="font-headline-lg-mobile text-3xl font-extrabold text-primary tracking-tight">
                      {f.priceDH} DH
                    </span>
                    <span className="font-body-md text-xs text-on-surface-variant/70 font-medium ml-1">
                      {f.period}
                    </span>
                  </div>

                  <ul className="font-label-sm text-xs text-on-surface-variant space-y-3 mb-8 p-0 list-none">
                    {f.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-snug">
                        {feat.active ? (
                          <CheckCircleOutlined className="text-emerald-600 text-sm mt-0.5 shrink-0" />
                        ) : (
                          <CloseCircleOutlined className="text-slate-400 text-sm mt-0.5 shrink-0 opacity-70" />
                        )}
                        <span className={feat.active ? "text-slate-800 font-medium" : "text-slate-400 line-through opacity-70"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate(`/demande-publique?plan=${f.planKey}`)}
                  className={`w-full font-label-md text-sm py-3 rounded-xl transition-all font-bold active:scale-95 duration-200 cursor-pointer ${f.buttonStyle}`}
                >
                  {f.buttonText} →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* B2B Section (Corporate Fleet & 20-Year Long Term Agreements) */}
        <section className="mb-8">
          <div className="glass-card rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="md:w-1/2">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/60 p-2 rounded-xl shadow-sm text-secondary flex items-center">
                  <BankOutlined style={{ fontSize: "18px" }} />
                </div>
                <span className="font-label-sm text-xs uppercase tracking-[0.15em] font-extrabold text-secondary">
                  Offres Entreprises & Flottes
                </span>
              </div>

              <h2 className="font-headline-md text-2xl md:text-3xl font-extrabold leading-tight text-primary mb-4 tracking-tight">
                Contrats Longue Durée (20 Ans)
              </h2>

              <p className="font-body-md text-sm md:text-base leading-relaxed text-on-surface-variant mb-6">
                Garanti aux sociétés et institutions la réservation d'emplacements de stationnement dédiés à Rabat. Bénéficiez d'une formule sur mesure avec gestion multi-badges RFID pour vos collaborateurs et facturation centralisée.
              </p>

              <ul className="font-label-md text-sm text-primary space-y-3 mb-8 p-0 list-none">
                <li className="flex items-center gap-3 bg-white/40 p-3 rounded-xl border border-white/60 shadow-sm">
                  <BankOutlined className="text-secondary bg-white p-1.5 rounded-lg shadow-xs" />
                  <span className="font-semibold text-slate-800">Accompagnement et service commercial dédié aux entreprises</span>
                </li>
                <li className="flex items-center gap-3 bg-white/40 p-3 rounded-xl border border-white/60 shadow-sm">
                  <PieChartOutlined className="text-secondary bg-white p-1.5 rounded-lg shadow-xs" />
                  <span className="font-semibold text-slate-800">Gestion simplifiée des cartes d'accès RFID collaborateurs</span>
                </li>
                <li className="flex items-center gap-3 bg-white/40 p-3 rounded-xl border border-white/60 shadow-sm">
                  <SafetyCertificateOutlined className="text-secondary bg-white p-1.5 rounded-lg shadow-xs" />
                  <span className="font-semibold text-slate-800">Garantie d'emplacements réservés et sérénité sur 20 ans</span>
                </li>
              </ul>

              <button
                onClick={() => navigate("/demande-publique?typeClient=ENTREPRISE")}
                className="bg-primary hover:bg-slate-900 text-white font-label-md text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 duration-200 w-full md:w-auto cursor-pointer font-bold flex items-center justify-center gap-2"
              >
                <span>Demander un Devis Entreprise</span>
                <ArrowRightOutlined />
              </button>
            </div>

            <div className="md:w-1/2 w-full h-72 md:h-[440px] rounded-2xl overflow-hidden relative shadow-md">
              <div
                className="bg-cover bg-center w-full h-full absolute inset-0 transition-transform duration-700 hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCQODW1HZ_NvXiKKSVVOX5SH4sgu1igMSmxOS0XoVaKgtYo2ucrDd6Ueetov0TP_AlBopE6PeMq_wZVHHV9oGO40DQjm3O_5yolQKuqZfxbX2km9XEgpI9tufvXXTc-43WjkPe0ybXaoCBh-MmAYGPm-m8W62T_GnnfYm7jj9o0-l-5y1LrB2N9SrI1hHsaZ4cPz660VvXRzfKVodhyW_gDO7berdjNLIBDxm0W5gLrOq-5H3q5atj')",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
