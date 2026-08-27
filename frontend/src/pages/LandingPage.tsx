import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  BuildOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Tag, Button, Row, Col, Card } from "antd";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-0">
      {/* Shared Desktop & Mobile Unified Navigation Bar */}
      <PublicNavbar />

      {/* Hero Section — General Operator Overview */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 my-6 w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl p-8 md:p-14 border border-white/60 group">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAokY5-A7_HtQT0hHWLoOTKNAgY6SMjA1KnsLqHmE2s0LwmQ4_WUA-DMS6SKfQKu7Mt8OcNAxl9A0CpSiNhPm9k-IUAp9u2lLK2xzH_RINNLM1NmdwOwVfE9L35RbqCbHWtMsRo5PkcL0og675GwhC4BeCkd0_FGGJbwybr67fXGhjVNscvb7QfA2jVcxWCx42lFEvNqVMXpfJJiYaSGyy6tzjenTHhfCwAv9brzvEfnpNVB31sHBh')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-900/40"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-3xl">
              <Tag color="gold" className="px-3.5 py-1 rounded-full font-extrabold mb-4 border-none shadow-md text-xs inline-flex items-center gap-1.5">
                <SafetyCertificateOutlined /> Opérateur Public Officiel — Rabat Région Mobilité
              </Tag>
              <h1 className="text-3xl md:text-5xl text-white font-black mb-4 leading-tight tracking-tight">
                Plateforme Régionale du Stationnement à Rabat
              </h1>
              <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-2xl font-normal">
                Bienvenue sur le portail officiel de souscription et d'information de Rabat Région Mobilité. Gérez vos abonnements, consultez la carte des 17 ouvrages et facilitez votre stationnement quotidien.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/demande-publique")}
                  className="bg-secondary hover:bg-secondary-dark text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-secondary/30 transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  <span>Souscrire un Abonnement En Ligne</span>
                  <ArrowRightOutlined />
                </button>
                <button
                  onClick={() => navigate("/parkings-public")}
                  className="bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-xl font-bold text-sm backdrop-blur-md border border-white/30 transition-all cursor-pointer"
                >
                  Explorer les 17 Parkings & Tarifs
                </button>
              </div>
            </div>

            {/* Right side floating glass highlights card */}
            <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-white space-y-4 shadow-xl shrink-0">
              <div className="flex items-center gap-3 border-b border-white/15 pb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xl font-bold">
                  <CheckCircleOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white m-0">Infrastructures Certifiées</h4>
                  <span className="text-[11px] text-cyan-300 font-medium">Capitale Rabat-Salé</span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Ouvrages Ouverts :</span>
                  <span className="font-bold text-emerald-400">17 Parkings 24/7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Capacité Totale :</span>
                  <span className="font-bold text-cyan-300">5 000+ Places</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Contrôle Accès :</span>
                  <span className="font-bold text-amber-300">LPR & RFID</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 space-y-16">
        {/* Quick General Statistics Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-md text-center">
            <div className="text-3xl md:text-4xl font-black text-secondary mb-1">17</div>
            <p className="text-slate-600 text-xs md:text-sm font-semibold m-0">Parkings Régionaux</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-md text-center">
            <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">5 000+</div>
            <p className="text-slate-600 text-xs md:text-sm font-semibold m-0">Places de Stationnement</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-md text-center">
            <div className="text-3xl md:text-4xl font-black text-purple-600 mb-1">24h / 7j</div>
            <p className="text-slate-600 text-xs md:text-sm font-semibold m-0">Accès Sécurisé RFID</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-md text-center">
            <div className="text-3xl md:text-4xl font-black text-amber-600 mb-1">100%</div>
            <p className="text-slate-600 text-xs md:text-sm font-semibold m-0">Services en Ligne</p>
          </div>
        </section>

        {/* Shortcuts to Dedicated Pages */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm text-xs border border-secondary-container/30 font-semibold">
              Ressources & Accès Directs
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
              Explorez nos Espaces Dédiés
            </h2>
            <p className="text-slate-600 text-sm">
              Accédez directement aux pages d'information et de souscription de la plateforme RRM.
            </p>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div
                className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col justify-between h-full hover:bg-white/90 transition-all cursor-pointer"
                onClick={() => navigate("/parkings-public")}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-6 text-cyan-600 shadow-sm">
                    <EnvironmentOutlined className="text-3xl" />
                  </div>
                  <Tag color="cyan" className="mb-3 font-semibold">Réseau des 17 Parkings</Tag>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Nos Parkings & Carte</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Carte interactive en temps réel des 17 ouvrages de stationnement, capacités et taux d'occupation.
                  </p>
                </div>
                <Button type="primary" block className="bg-cyan-600 border-cyan-600 rounded-xl h-11 font-bold">
                  Voir Nos Parkings →
                </Button>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div
                className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col justify-between h-full hover:bg-white/90 transition-all cursor-pointer"
                onClick={() => navigate("/tarifs-public")}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
                    <ClockCircleOutlined className="text-3xl" />
                  </div>
                  <Tag color="green" className="mb-3 font-semibold">Grille Tarifaire RRM</Tag>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Tarifs & Formules</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Consultez l'ensemble des formules homologuées (Permanent 24h/7j, Diurne, Nocturne et Deux-roues).
                  </p>
                </div>
                <Button type="primary" block className="bg-emerald-600 border-emerald-600 rounded-xl h-11 font-bold">
                  Consulter les Tarifs →
                </Button>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div
                className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col justify-between h-full hover:bg-white/90 transition-all cursor-pointer"
                onClick={() => navigate("/demande-publique")}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                    <FileTextOutlined className="text-3xl" />
                  </div>
                  <Tag color="blue" className="mb-3 font-semibold">Formulaire en Ligne</Tag>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Abonnement & Démarches</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Effectuez votre souscription, renouvellement, transfert ou demande de duplicata RFID sans compte.
                  </p>
                </div>
                <Button type="primary" block className="bg-secondary rounded-xl h-11 font-bold">
                  Faire une Démarche →
                </Button>
              </div>
            </Col>
          </Row>
        </section>

        {/* General Information about Operator RRM */}
        <section className="glass-card p-8 lg:p-12 rounded-3xl border border-white/80 shadow-xl bg-white/80">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <Tag color="geekblue" className="mb-3 font-semibold">Société de Développement Local (SDL)</Tag>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-4">
                Rabat Région Mobilité
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                Acteur public majeur de la mobilité urbaine dans la conurbation Rabat-Salé-Témara, Rabat Région Mobilité assure l'aménagement, l'exploitation et la modernisation des infrastructures de transport et des parkings publics.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircleOutlined className="text-xl text-emerald-500" />
                  <span className="font-semibold text-slate-800">Contrôle d'Accès Sécurisé par Badge RFID & Caméras LPR</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleOutlined className="text-xl text-emerald-500" />
                  <span className="font-semibold text-slate-800">Paiement Homologué en Espèces et Chèques avec Édition de Reçu</span>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Card className="rounded-2xl border-slate-200 shadow-md bg-slate-50">
                <div className="flex items-center gap-3 mb-4">
                  <BuildOutlined className="text-2xl text-blue-600" />
                  <h4 className="m-0 text-slate-900 text-lg font-bold">Infrastructures Régionales</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Nos ouvrages sont implantés à proximité immédiate des gares et centres névralgiques de la capitale pour garantir une intermodalité fluide avec le réseau de tramway et de train.
                </p>
                <Button block onClick={() => navigate("/public-about")} className="rounded-xl font-bold">
                  En savoir plus sur l'Opérateur RRM →
                </Button>
              </Card>
            </Col>
          </Row>
        </section>
      </main>

      {/* Official Unified Public Footer */}
      <PublicFooter />
    </div>
  );
}