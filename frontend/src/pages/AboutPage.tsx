import { useNavigate } from "react-router-dom";
import { Tag, Button, Row, Col } from "antd";
import {
  BuildOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-0">
      {/* Shared Desktop & Mobile Glass Navbar */}
      <PublicNavbar />

      {/* Hero Section Banner */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 my-6 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-surface-container shadow-xl p-8 md:p-12 border border-white/60">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCQODW1HZ_NvXiKKSVVOX5SH4sgu1igMSmxOS0XoVaKgtYo2ucrDd6Ueetov0TP_AlBopE6PeMq_wZVHHV9oGO40DQjm3O_5yolQKuqZfxbX2km9XEgpI9tufvXXTc-43WjkPe0ybXaoCBh-MmAYGPm-m8W62T_GnnfYm7jj9o0-l-5y1LrB2N9SrI1hHsaZ4cPz660VvXRzfKVodhyW_gDO7berdjNLIBDxm0W5gLrOq-5H3q5atj')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/85 to-surface/50"></div>
          </div>

          <div className="relative z-10 max-w-3xl">
            <Tag color="cyan" className="px-3.5 py-1 rounded-full font-semibold mb-3 border-none shadow-sm text-xs inline-flex items-center gap-1.5">
              <SafetyCertificateOutlined /> Société de Développement Local (SDL) — Rabat
            </Tag>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-5xl text-primary font-extrabold mb-3 leading-tight">
              À Propos de Rabat Région Mobilité
            </h1>
            <p className="font-body-md text-on-surface-variant text-base md:text-lg leading-relaxed">
              Acteur majeur et opérateur public délégué de la mobilité urbaine moderne dans la métropole de Rabat-Salé-Kénitra.
            </p>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 space-y-16 my-6 mb-16">
        {/* Mission Institutionnelle Section */}
        <section className="glass-card p-8 md:p-12 rounded-3xl border border-white/80 shadow-xl bg-white/80">
          <Row gutter={[40, 32]} align="middle">
            <Col xs={24} lg={14}>
              <Tag color="blue" className="px-3 py-1 font-bold rounded-full mb-3 border-none">
                Mission & Engagements
              </Tag>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                Un Réseau de Stationnement Régional Connecté & Moderne
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                Créée sous forme de Société de Développement Local, <strong className="text-slate-900">Rabat Région Mobilité (RRM)</strong> a pour mission d’organiser, d'investir et d’exploiter les services de mobilité et de stationnement dans la capitale marocaine.
              </p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                En plus du réseau de tramway et d'autobus, RRM supervise un parc stratégique de <strong className="text-secondary font-bold">17 ouvrages de stationnement</strong> totalisant des milliers de places équipées de caméras LPR (Lecture Automatique des Plaques) et de badges RFID sécurisés.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <span>Gestion déléguée 100% informatisée</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <span>Lecture automatique LPR & Badges RFID</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <span>Guichets physiques et borne d'accueil 7j/7</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <span>Facturation centralisée pour les sociétés</span>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <div className="glass-panel p-8 rounded-3xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-white to-secondary/5 text-center shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                  <BuildOutlined />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">17 Parkings</h3>
                <p className="text-sm font-bold text-secondary mb-3">5 000+ Places Régionales</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Suivi en temps réel des capacités, contrôle d'accès intelligent et gestion centralisée des abonnements.
                </p>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate("/parkings-public")}
                  className="bg-secondary rounded-xl font-bold h-11"
                >
                  Découvrir les Parkings →
                </Button>
              </div>
            </Col>
          </Row>
        </section>

        {/* Pillars Cards Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <Tag color="cyan" className="px-3 py-1 rounded-full font-bold border-none text-xs">
              Piliers Stratégiques
            </Tag>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 mb-2">
              Nos Piliers de Mobilité Urbaine
            </h2>
            <p className="text-slate-600 text-sm">
              Découvrez les valeurs et technologies qui façonnent le stationnement de la région.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl mb-4">
                <RocketOutlined />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                Digitalisation 100%
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Souscription et renouvellement d'abonnements en ligne sans déplacement avec validation SMS OTP.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl mb-4">
                <SafetyCertificateOutlined />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                Sécurité & Badges RFID
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chaque abonné dispose d'un badge sécurisé associé aux caméras LPR de contrôle d'accès aux barrières.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-4">
                <TeamOutlined />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                Accompagnement 7j/7
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centre d'appel dédié au 0537 00 11 22 et guichets physiques présents dans chaque ouvrage majeur.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mb-4">
                <BankOutlined />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                Solutions Flottes Corporate
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contrats longue durée de 20 Ans pour les entreprises avec gestion multi-badges et facturation centralisée.
              </p>
            </div>
          </div>
        </section>

        {/* Directory Highlights */}
        <section className="glass-panel p-8 rounded-3xl border border-white/80 shadow-xl bg-white/70">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 m-0">
                Aperçu des Principaux Parkings RRM
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Implantations stratégiques au cœur de la capitale.
              </p>
            </div>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/parkings-public")}
              className="bg-primary rounded-xl font-bold px-6"
            >
              Consulter la Carte Complète
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { nom: "Parking Agdal Gare", cap: "450 places", badge: "Gare TGV" },
              { nom: "Parking Bab El Had", cap: "200 places", badge: "Centre-Ville" },
              { nom: "Parking Hassan II", cap: "300 places", badge: "Gare Ville" },
              { nom: "Parking Chellah", cap: "250 places", badge: "Site Historique" },
              { nom: "Parking Les Orangers", cap: "180 places", badge: "Quartier Résidentiel" },
              { nom: "Parking Tramway Hay Riad", cap: "350 places", badge: "P+R Tramway" },
            ].map((p, idx) => (
              <div
                key={idx}
                className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <EnvironmentOutlined className="text-secondary" />
                    {p.nom}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{p.cap}</div>
                </div>
                <Tag color="blue" className="font-bold border-none rounded-full text-xs">
                  {p.badge}
                </Tag>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Official Shared Public Footer */}
      <PublicFooter />
    </div>
  );
}
