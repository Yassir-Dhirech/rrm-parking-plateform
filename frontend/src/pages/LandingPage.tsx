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
} from "@ant-design/icons";
import { Tag, Button, Row, Col, Card } from "antd";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-0">
      {/* Shared Desktop & Mobile Unified Navigation Bar */}
      <PublicNavbar />

      {/* Hero Section — General Operator Overview */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 my-6">
        <div className="relative rounded-3xl overflow-hidden bg-surface-container shadow-xl p-8 md:p-14 border border-white/60">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAokY5-A7_HtQT0hHWLoOTKNAgY6SMjA1KnsLqHmE2s0LwmQ4_WUA-DMS6SKfQKu7Mt8OcNAxl9A0CpSiNhPm9k-IUAp9u2lLK2xzH_RINNLM1NmdwOwVfE9L35RbqCbHWtMsRo5PkcL0og675GwhC4BeCkd0_FGGJbwybr67fXGhjVNscvb7QfA2jVcxWCx42lFEvNqVMXpfJJiYaSGyy6tzjenTHhfCwAv9brzvEfnpNVB31sHBh')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/85 to-surface/40"></div>
          </div>

          <div className="relative z-10 max-w-3xl">
            <Tag color="gold" className="px-3.5 py-1 rounded-full font-semibold mb-4 border-none shadow-sm text-xs">
              <SafetyCertificateOutlined className="mr-1.5" /> Opérateur Public Officiel — Rabat Région Mobilité
            </Tag>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-5xl text-primary font-extrabold mb-4 leading-tight">
              Plateforme Régionale du Stationnement à Rabat
            </h1>
            <p className="font-body-lg text-on-surface-variant text-base md:text-lg mb-6 leading-relaxed">
              Bienvenue sur le portail d'information et de démarches en ligne de Rabat Région Mobilité. Gérez votre mobilité, découvrez le réseau des 17 parkings et souscrivez votre abonnement en toute sérénité.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/demande-publique")}
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Accéder au Portail des Démarches →
              </button>
              <button
                onClick={() => navigate("/parkings-public")}
                className="bg-white/80 text-on-secondary-container px-6 py-3 rounded-xl font-bold text-sm glass-card transition-all active:scale-95 cursor-pointer"
              >
                Explorer la Carte des Parkings
              </button>
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
                <Button block onClick={() => navigate("/about")} className="rounded-xl font-bold">
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