import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import {
  DollarOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Tag, Button, Row, Col } from "antd";

export function PublicTarifsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden pt-20 lg:pt-24 pb-16">
      <PublicNavbar />

      {/* Hero Banner for Tarifs & Formules */}
      <div className="max-w-7xl mx-auto px-container-margin my-6">
        <div className="relative rounded-3xl overflow-hidden bg-surface-container shadow-xl p-8 md:p-12 border border-white/60">
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
            <Tag color="gold" className="px-3 py-1 rounded-full font-semibold mb-3 border-none shadow-sm text-xs">
              <DollarOutlined className="mr-1.5" /> Grille Tarifaire Officielle Rabat Région Mobilité
            </Tag>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl text-primary font-extrabold mb-3 leading-tight">
              Tarifs & Formules d'Abonnement
            </h1>
            <p className="font-body-md text-on-surface-variant text-base leading-relaxed">
              Découvrez l'ensemble de nos formules d'abonnement homologuées (Pass Permanent 24h/7j, Diurne, Nocturne et Deux-roues) adaptées à tous vos besoins de stationnement à Rabat.
            </p>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-container-margin space-y-12">
        {/* Main Formules Section */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Formules Particuliers & Commuters</h2>
            <p className="text-slate-600 text-sm">Tarification mensuelle sans engagement de longue durée. Règlement par Espèces ou Chèque au guichet.</p>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div className="glass-card p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 shadow-lg flex flex-col justify-between h-full">
                <div>
                  <Tag color="green" className="mb-3 font-semibold">Pass Permanent</Tag>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">24h / 7j</h3>
                  <p className="text-slate-600 text-xs mb-4">Accès illimité permanent jour et nuit, week-ends et jours fériés inclus.</p>
                  <div className="text-3xl font-black text-emerald-700 mb-1">600 DH <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                </div>
                <button
                  onClick={() => navigate("/demande-publique?plan=24H7J")}
                  className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow cursor-pointer transition-all"
                >
                  Souscrire 24h/7j →
                </button>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="glass-card p-6 rounded-3xl border border-blue-200 bg-blue-50/40 shadow-lg flex flex-col justify-between h-full">
                <div>
                  <Tag color="blue" className="mb-3 font-semibold">Pass Diurne</Tag>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">08:00 - 20:00</h3>
                  <p className="text-slate-600 text-xs mb-4">Idéal pour les personnes se déplaçant pendant les heures de bureau.</p>
                  <div className="text-3xl font-black text-blue-700 mb-1">420 DH <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                </div>
                <button
                  onClick={() => navigate("/demande-publique?plan=JOUR")}
                  className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow cursor-pointer transition-all"
                >
                  Souscrire Diurne →
                </button>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="glass-card p-6 rounded-3xl border border-purple-200 bg-purple-50/40 shadow-lg flex flex-col justify-between h-full">
                <div>
                  <Tag color="purple" className="mb-3 font-semibold">Pass Nocturne</Tag>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">19:00 - 08:00</h3>
                  <p className="text-slate-600 text-xs mb-4">Formule résidentielle pour stationner son véhicule la nuit en sécurité.</p>
                  <div className="text-3xl font-black text-purple-700 mb-1">350 DH <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                </div>
                <button
                  onClick={() => navigate("/demande-publique?plan=NUIT")}
                  className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow cursor-pointer transition-all"
                >
                  Souscrire Nocturne →
                </button>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="glass-card p-6 rounded-3xl border border-orange-200 bg-orange-50/40 shadow-lg flex flex-col justify-between h-full">
                <div>
                  <Tag color="orange" className="mb-3 font-semibold">Deux-roues</Tag>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">Motos & Scooters</h3>
                  <p className="text-slate-600 text-xs mb-4">Emplacements réservés et sécurisés pour motocycles.</p>
                  <div className="text-3xl font-black text-orange-700 mb-1">200 DH <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                </div>
                <button
                  onClick={() => navigate("/demande-publique?plan=MOTO")}
                  className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow cursor-pointer transition-all"
                >
                  Souscrire Moto →
                </button>
              </div>
            </Col>
          </Row>
        </section>

        {/* Corporate 20-Year Long Term Section */}
        <section className="glass-card p-8 md:p-12 rounded-3xl border border-white/80 shadow-xl bg-white/70">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <Tag color="geekblue" className="mb-3 font-semibold">Offre Entreprises & Flottes</Tag>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Contrats Longue Durée (20 Ans)</h2>
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                Formule Corporate dédiée aux entreprises pour la réservation d'emplacements attribués sur 20 ans avec gestion multi-badges RFID et facturation analytique HT/TVA/TTC.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<BankOutlined />}
              onClick={() => navigate("/demande-publique?typeClient=ENTREPRISE")}
              className="bg-secondary rounded-xl font-bold h-12 px-6"
            >
              Devis Corporate Entreprise →
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
