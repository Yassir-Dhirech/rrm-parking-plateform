import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";
import { RabatParkingsMap } from "../components/map/RabatParkingsMap";
import { FORMULES_DATA } from "./PublicTarifsPage";
import {
  EnvironmentOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Tag, Button, Row, Col } from "antd";

export function PublicParkingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const PARKINGS_DATA = [
    { id: 1, nom: "Parking Agdal Gare", places: 450, libres: 150, ville: "Rabat Agdal", type: "Ouvrage 24/7", status: "OUVERT" },
    { id: 2, nom: "Parking Bab El Had", places: 200, libres: 80, ville: "Centre-Ville", type: "Souterrain", status: "OUVERT" },
    { id: 3, nom: "Parking Hassan II", places: 300, libres: 110, ville: "Gare Rabat Ville", type: "Souterrain 24/7", status: "OUVERT" },
    { id: 4, nom: "Parking Chellah", places: 250, libres: 65, ville: "Quartier Historique", type: "Surface Sécurisé", status: "OUVERT" },
    { id: 5, nom: "Parking Les Orangers", places: 180, libres: 40, ville: "Les Orangers", type: "Souterrain", status: "OUVERT" },
    { id: 6, nom: "Parking Tramway Hay Riad", places: 350, libres: 190, ville: "Hay Riad", type: "P+R Tramway", status: "OUVERT" },
  ];

  // Auto-scroll to #tarifs section if present in hash
  useEffect(() => {
    if (location.hash === "#tarifs") {
      setTimeout(() => {
        const el = document.getElementById("tarifs");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-0">
      <PublicNavbar />

      {/* Hero Section for Nos Parkings */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 my-6 w-full">
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
            <Tag color="cyan" className="px-3 py-1 rounded-full font-semibold mb-3 border-none shadow-sm text-xs">
              <EnvironmentOutlined className="mr-1.5" /> Réseau Officiel des 17 Parkings Régionaux
            </Tag>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl text-primary font-extrabold mb-3 leading-tight">
              Nos Parkings & Tarifs Officiels Rabat
            </h1>
            <p className="font-body-md text-on-surface-variant text-base leading-relaxed">
              Consultez la carte interactive, les emplacements et la grille tarifaire homologuée pour vos souscriptions d'abonnements à Rabat.
            </p>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 space-y-16">
        {/* Interactive Map Section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Carte Interactive en Temps Réel</h2>
              <p className="text-slate-600 text-sm">Survolez ou cliquez sur les marqueurs pour consulter les places disponibles.</p>
            </div>
            <Tag color="green" className="px-3 py-1 text-sm font-semibold rounded-full">
              ● 17 Parkings Interconnectés
            </Tag>
          </div>
          <div className="glass-card p-3 rounded-3xl shadow-xl border border-white/80">
            <RabatParkingsMap height={520} />
          </div>
        </section>

        {/* Regional Parking Facilities List */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Principaux Ouvrages de Stationnement</h2>
            <p className="text-slate-600 text-sm">Sélectionnez un parking pour y souscrire un abonnement mensuel ou annuel.</p>
          </div>

          <Row gutter={[20, 20]}>
            {PARKINGS_DATA.map((p) => (
              <Col xs={24} sm={12} md={8} key={p.id}>
                <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-md flex flex-col justify-between h-full hover:bg-white/90 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Tag color="blue" className="font-semibold">{p.type}</Tag>
                      <Tag color="green" className="font-semibold">{p.status}</Tag>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{p.nom}</h3>
                    <p className="text-slate-500 text-xs mb-4">{p.ville}</p>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Capacité Totale :</span>
                        <span className="text-slate-900">{p.places} places</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Places Libres Abonnés :</span>
                        <span className="text-emerald-600 font-bold">{p.libres} libres</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    block
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate(`/demande-publique?parkingId=${p.id}`)}
                    className="bg-secondary rounded-xl font-semibold h-10"
                  >
                    Souscrire sur ce Parking
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        {/* SECTION TARIFS & FORMULES 2026 AT THE END OF THE PAGE */}
        <section id="tarifs" className="pt-8 border-t border-slate-200/80 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Tag color="gold" className="px-3.5 py-1 rounded-full font-semibold mb-2 border-none shadow-sm text-xs inline-flex items-center gap-1.5">
                <DollarOutlined /> Grille Tarifaire Homologuée RRM 2026
              </Tag>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Tarifs & Formules d'Abonnement
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Des tarifs transparents et adaptés à vos besoins de mobilité résidentielle ou professionnelle.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/demande-publique")}
              className="bg-secondary rounded-xl font-bold px-6 shadow-md"
            >
              Déposer une Demande En Ligne
            </Button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FORMULES_DATA.map((plan) => (
              <div
                key={plan.id}
                className={`glass-card p-6 md:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative ${
                  plan.isPopular
                    ? "border-secondary shadow-xl ring-2 ring-secondary/20 bg-white/90"
                    : "border-white/80 shadow-md bg-white/70 hover:bg-white/90"
                }`}
              >
                {plan.popularBadge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3.5 py-1 rounded-full bg-secondary text-white font-extrabold text-xs shadow-md uppercase tracking-wider">
                      {plan.popularBadge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100/80 shadow-2xs">
                      {plan.icon}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 m-0">
                      {plan.title}
                    </h3>
                  </div>

                  <div className="my-4">
                    <span className="text-3xl font-black text-slate-900">{plan.priceDH}</span>
                    <span className="text-slate-500 font-semibold text-sm"> DH {plan.period}</span>
                  </div>

                  <ul className="space-y-3 my-6 p-0 list-none text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feat.active ? (
                          <CheckCircleOutlined className="text-emerald-500 text-sm mt-0.5 shrink-0" />
                        ) : (
                          <CloseCircleOutlined className="text-slate-300 text-sm mt-0.5 shrink-0" />
                        )}
                        <span className={feat.active ? "text-slate-800 font-medium" : "text-slate-400 line-through"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type={plan.isPopular ? "primary" : "default"}
                  block
                  size="large"
                  onClick={() => navigate(`/demande-publique?plan=${plan.planKey}`)}
                  className={`rounded-xl font-extrabold h-11 ${
                    plan.isPopular
                      ? "bg-secondary hover:bg-secondary-dark"
                      : "border-slate-300 text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {plan.buttonText} →
                </Button>
              </div>
            ))}
          </div>

          {/* Corporate Fleet Enterprise Offer Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-xl bg-gradient-to-br from-white/90 via-slate-50/80 to-amber-50/40 flex flex-col md:flex-row items-center justify-between gap-8 mt-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <Tag color="gold" className="font-extrabold px-3 py-1 rounded-full text-xs">
                  Contrats Longue Durée (20 Ans)
                </Tag>
                <span className="text-xs font-bold text-amber-900">Offre Entreprises & Flottes</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">
                Vous gérez une flotte de véhicules de société ?
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Garanti aux sociétés et institutions la réservation d'emplacements de stationnement dédiés à Rabat avec gestion multi-badges RFID pour vos collaborateurs et facturation centralisée.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 pt-2">
                <span className="flex items-center gap-1.5">
                  <BankOutlined className="text-amber-600" /> Service commercial dédié
                </span>
                <span className="flex items-center gap-1.5">
                  <PieChartOutlined className="text-amber-600" /> Facturation mensuelle groupée
                </span>
                <span className="flex items-center gap-1.5">
                  <SafetyCertificateOutlined className="text-amber-600" /> Emplacements réservés 20 Ans
                </span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/demande-publique?typeClient=ENTREPRISE")}
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white rounded-xl font-extrabold h-12 px-8 shadow-md shrink-0"
            >
              Formulaire Corporate Flottes →
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
