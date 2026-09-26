import { useEffect, useState, useMemo } from "react";
import { useNavigate ,useSearchParams} from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";
import {
  BankOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DownOutlined,
  EnvironmentOutlined,
  PieChartOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  StarOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Alert, Button, Input, Spin, Tag } from "antd";
import {
  getPublicParkings,
  getTarifsParking,
  type Parking,
  type TarifParkingPublicResponse,
} from "../api/parkings";
export function PublicTarifsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlParkingId = searchParams.get("parkingId");

  // États pour les parkings et tarifs
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loadingParkings, setLoadingParkings] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ID du parking actuellement déplié
  const [expandedParkingId, setExpandedParkingId] = useState<number | null>(null);

  // Cache des tarifs par parkingId : { 8: [tarif1, tarif2, ...], 9: [...] }
  const [tarifsCache, setTarifsCache] = useState<Record<number, TarifParkingPublicResponse[]>>({});
  const [loadingTarifsId, setLoadingTarifsId] = useState<number | null>(null);

  // 1. Charger la liste des parkings au montage et déplier le parking ciblé
  useEffect(() => {
    async function chargerParkings() {
      try {
        setLoadingParkings(true);
        setLoadError(null);
        const data = await getPublicParkings();
        setParkings(data);

        // Si un parkingId est fourni (?parkingId=8), on ouvre celui-ci, sinon le 1er parking
        const targetId = urlParkingId ? Number(urlParkingId) : (data.length > 0 ? data[0].id : null);

        if (targetId) {
          void toggleParking(targetId);
          setTimeout(() => {
            const el = document.getElementById(`parking-tarif-card-${targetId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 350);
        }
      } catch (err) {
        console.error("Erreur de chargement des parkings:", err);
        setLoadError("Impossible de récupérer la liste des parkings.");
      } finally {
        setLoadingParkings(false);
      }
    }

    void chargerParkings();
  }, [urlParkingId]);


  // 2. Déplier/replier un parking et charger ses tarifs si nécessaire
  const toggleParking = async (parkingId: number) => {
    if (expandedParkingId === parkingId) {
      setExpandedParkingId(null);
      return;
    }

    setExpandedParkingId(parkingId);

    // Si les tarifs sont déjà en cache, pas besoin de réinterroger l'API
    if (tarifsCache[parkingId]) return;

    try {
      setLoadingTarifsId(parkingId);
      const tarifs = await getTarifsParking(parkingId);
      setTarifsCache((prev) => ({ ...prev, [parkingId]: tarifs }));
    } catch (err) {
      console.error(`Erreur chargement tarifs parking ${parkingId}:`, err);
    } finally {
      setLoadingTarifsId(null);
    }
  };

  // Filtrer les parkings selon la recherche
  const filteredParkings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return parkings;
    return parkings.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.adresse.toLowerCase().includes(q)
    );
  }, [parkings, searchQuery]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col justify-between relative overflow-x-hidden pt-20 lg:pt-24 pb-0">
      <PublicNavbar />
            {/* FLOATING VIEW SWITCHER PILL BAR */}
      <div className="fixed top-[92px] left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-2xl flex items-center gap-1.5">
          <button
            onClick={() => navigate("/parkings-public")}
            className="px-5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-white/60"
          >
            <EnvironmentOutlined />
            <span>Carte Interactive</span>
          </button>
          <button
            onClick={() => navigate("/tarifs-public")}
            className="px-5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 bg-secondary text-white shadow-md scale-105"
          >
            <DollarOutlined />
            <span>Tarifs par Parking</span>
          </button>
        </div>
      </div>


      <main className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-4 pb-16">
        {/* Titre & Description */}
        <div className="mb-8 max-w-3xl">
          <Tag color="gold" className="px-3.5 py-1 rounded-full font-semibold mb-3 border-none shadow-sm text-xs inline-flex items-center gap-1.5">
            <DollarOutlined /> Grille Tarifaire Officielle RRM
          </Tag>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#001E3D] mb-3 tracking-tight">
            Tarifs par Parking & Formules d'Abonnement
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Consultez les formules homologuées applicables à chaque ouvrage de Rabat. Choisissez un parking pour voir le détail des forfaits et souscrire en ligne.
          </p>
        </div>

        {/* Barre de Recherche rapide de parking */}
        <div className="mb-8 max-w-md">
          <Input
            placeholder="Rechercher un parking (ex: Bab Chellah, Agdal, Harhoura...)"
            prefix={<SearchOutlined style={{ color: "#0284c7" }} />}
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: 10, padding: "8px 12px", border: "1px solid #cbd5e1" }}
          />
        </div>

        {loadError && (
          <Alert type="error" showIcon message={loadError} className="mb-6 rounded-xl" />
        )}

        {/* Liste des Parkings Dépliables */}
        {loadingParkings ? (
          <div className="text-center py-16">
            <Spin size="large" tip="Chargement des parkings..." />
          </div>
        ) : (
          <div className="space-y-4 mb-16">
            {filteredParkings.map((parking, index) => {
              const isExpanded = expandedParkingId === parking.id;
              const tarifs = tarifsCache[parking.id] || [];
              const isLoadingThisTarif = loadingTarifsId === parking.id;

                            // Grouper les tarifs et identifier les offres Corporate (300 DH et 350 DH)
              const forfaitsUniques = Array.from(
                new Set(tarifs.map((t) => t.forfaitLibelle))
              ).map((libelle) => {
                const variants = tarifs.filter((t) => t.forfaitLibelle === libelle);
                const prixMin = Math.min(...variants.map((v) => Number(v.prixMensuelTTC)));
                const isCorporate = prixMin === 300 || prixMin === 350;

                return {
                  libelle,
                  description: isCorporate
                    ? "Formule réservée aux entreprises & flottes (Contrat Longue Durée 20 ans)"
                    : (variants[0]?.forfaitDescription || "Stationnement sécurisé & badge d'accès"),
                  prixMin,
                  durees: isCorporate ? ["Contrat 20 ans"] : variants.map((v) => `${v.dureeEnMois} mois`),
                  isCorporate,
                };
              });


              return (
                  <div
                  key={parking.id}
                  id={`parking-tarif-card-${parking.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${
                    isExpanded ? "border-[#0077B6] ring-2 ring-[#0077B6]/15" : "border-slate-200 hover:border-slate-300"
                  }`}
                >

                  {/* Entête du Parking (Cliquable) */}
                  <div
                    onClick={() => void toggleParking(parking.id)}
                    className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none bg-gradient-to-r from-white via-white to-slate-50/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#001E3D] text-white flex items-center justify-center font-black text-lg shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-[#001E3D] m-0">{parking.nom}</h3>
                          <Tag color={parking.statut === "ACTIF" ? "green" : "orange"}>
                            {parking.statut}
                          </Tag>
                          <Tag>{parking.code}</Tag>
                        </div>
                        <p className="text-xs text-slate-500 m-0 mt-1 flex items-center gap-1.5">
                          <EnvironmentOutlined className="text-[#0284c7]" /> {parking.adresse}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                          Places abonnés disponibles
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {parking.placesDisponiblesAbonnements} / {parking.capaciteReserveeAbonnements}
                        </span>
                      </div>

                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shrink-0">
                        {isExpanded ? <UpOutlined /> : <DownOutlined />}
                      </div>
                    </div>
                  </div>

                  {/* Contenu Déplié : Grille des Tarifs Réels du Backend */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-[#f8fafc]">
                      {isLoadingThisTarif ? (
                        <div className="text-center py-8">
                          <Spin tip="Chargement des tarifs en temps réel..." />
                        </div>
                      ) : forfaitsUniques.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-sm">
                          Aucun tarif actif n'est configuré pour ce parking.
                        </div>
                      ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {forfaitsUniques.map((forfait, fIdx) => (
                            <div
                              key={fIdx}
                              className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                                forfait.isCorporate
                                  ? "bg-purple-50/40 border-purple-200"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  {forfait.isCorporate ? (
                                    <BankOutlined style={{ color: "#7c3aed" }} />
                                  ) : (
                                    <StarOutlined style={{ color: "#0077B6" }} />
                                  )}
                                  <h4 className="font-bold text-[#001E3D] m-0 text-sm">
                                    {forfait.libelle}
                                  </h4>
                                </div>

                                <div className="mb-2">
                                  {forfait.isCorporate ? (
                                    <Tag color="purple" className="text-[11px] font-bold">
                                      🏢 Offre Corporate · Contrat 20 Ans
                                    </Tag>
                                  ) : (
                                    <Tag color="blue" className="text-[11px] font-bold">
                                      👤 Abonnement Particulier
                                    </Tag>
                                  )}
                                </div>

                                <p className="text-xs text-slate-500 mb-3">
                                  {forfait.description}
                                </p>
                                <div className="text-2xl font-black text-[#001E3D] mb-3">
                                  {forfait.prixMin}{" "}
                                  <span className="text-xs font-semibold text-slate-500">
                                    MAD / mois TTC
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {forfait.durees.map((d, dIdx) => (
                                    <Tag
                                      key={dIdx}
                                      color={forfait.isCorporate ? "purple" : "blue"}
                                      className="text-[10px]"
                                    >
                                      {d}
                                    </Tag>
                                  ))}
                                </div>
                              </div>

                              {forfait.isCorporate ? (
                                <Button
                                  type="primary"
                                  block
                                  icon={<RightOutlined />}
                                  onClick={() => navigate(`/demande-publique?typeClient=ENTREPRISE&parkingId=${parking.id}`)}
                                  style={{
                                    backgroundColor: "#7c3aed",
                                    borderColor: "#7c3aed",
                                    borderRadius: 8,
                                    fontWeight: 700,
                                  }}
                                >
                                  Devis Corporate (+20 ans) →
                                </Button>
                              ) : (
                                <Button
                                  type="primary"
                                  block
                                  icon={<RightOutlined />}
                                  onClick={() => navigate(`/demande-publique?parkingId=${parking.id}`)}
                                  disabled={!parking.souscriptionDisponible}
                                  style={{
                                    backgroundColor: parking.souscriptionDisponible ? "#001E3D" : undefined,
                                    borderRadius: 8,
                                    fontWeight: 600,
                                  }}
                                >
                                  {parking.souscriptionDisponible ? "Souscrire ce parking" : "Complet"}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Section B2B Entreprises & Flottes */}
        <section className="bg-white rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-slate-200 shadow-sm">
          <div className="md:w-1/2">
            <div className="flex items-center gap-2 mb-3">
              <BankOutlined style={{ fontSize: "18px", color: "#0077B6" }} />
              <span className="text-xs uppercase font-extrabold text-[#0077B6] tracking-wider">
                Offres Entreprises & Flottes
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#001E3D] mb-4">
              Contrats Longue Durée (20 Ans)
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Réservation d'emplacements dédiés pour les sociétés et institutions avec gestion centralisée multi-badges RFID.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/demande-publique?typeClient=ENTREPRISE")}
              style={{ backgroundColor: "#001E3D", borderRadius: 10, fontWeight: 700 }}
            >
              Demander un Devis Entreprise →
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
