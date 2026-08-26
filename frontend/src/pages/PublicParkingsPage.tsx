import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";
import { RabatParkingsMap } from "../components/map/RabatParkingsMap";
import {
  EnvironmentOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Tag, Button, Row, Col } from "antd";

export function PublicParkingsPage() {
  const navigate = useNavigate();

  const PARKINGS_DATA = [
    { id: 1, nom: "Parking Agdal Gare", places: 450, libres: 150, ville: "Rabat Agdal", type: "Ouvrage 24/7", status: "OUVERT" },
    { id: 2, nom: "Parking Bab El Had", places: 200, libres: 80, ville: "Centre-Ville", type: "Souterrain", status: "OUVERT" },
    { id: 3, nom: "Parking Hassan II", places: 300, libres: 110, ville: "Gare Rabat Ville", type: "Souterrain 24/7", status: "OUVERT" },
    { id: 4, nom: "Parking Chellah", places: 250, libres: 65, ville: "Quartier Historique", type: "Surface Sécurisé", status: "OUVERT" },
    { id: 5, nom: "Parking Les Orangers", places: 180, libres: 40, ville: "Les Orangers", type: "Souterrain", status: "OUVERT" },
    { id: 6, nom: "Parking Tramway Hay Riad", places: 350, libres: 190, ville: "Hay Riad", type: "P+R Tramway", status: "OUVERT" },
  ];

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-0">
      <PublicNavbar />

      {/* Hero Section for Nos Parkings */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 my-6">
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
              Nos Parkings & Emplacements Rabat
            </h1>
            <p className="font-body-md text-on-surface-variant text-base leading-relaxed">
              Consultez la localisation, la capacité d'accueil et le nombre de places disponibles en temps réel pour l'ensemble des ouvrages de stationnement de Rabat Région Mobilité.
            </p>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 space-y-12">
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
      </main>

      <PublicFooter />
    </div>
  );
}
