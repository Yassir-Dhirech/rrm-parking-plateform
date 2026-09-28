import { useEffect, useState, useMemo } from "react";
import { useNavigate ,useSearchParams} from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { PublicFooter } from "../components/ui/PublicFooter";
import {
  BankOutlined,
  DollarOutlined,
  DownOutlined,
  EnvironmentOutlined,
  RightOutlined,
  SearchOutlined,
  StarOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Alert, Button, Input, Spin, Tag, Tabs } from "antd";
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

              // 1. Extraire les tarifs réels de la Base de Données
              const tarifsReguliersDb = tarifs.filter((t) => !t.forfaitCode?.startsWith("CORP"));
              const tarifsCorporateDb = tarifs.filter((t) => t.forfaitCode?.startsWith("CORP"));

              // 2. Formater les forfaits réguliers venant de MySQL
              const forfaitsReguliersDb = Array.from(
                new Set(tarifsReguliersDb.map((t) => t.forfaitLibelle))
              ).map((libelle) => {
                const variants = tarifsReguliersDb.filter((t) => t.forfaitLibelle === libelle);
                const prixMin = Math.min(...variants.map((v) => Number(v.prixMensuelTTC)));
                const placeReservee = variants.some((v) => v.placeReservee);
                return {
                  libelle,
                  description: variants[0]?.forfaitDescription || "Accès sécurisé 7j/7 avec badge RFID et barrières automatiques",
                  prixMin,
                  placeReservee,
                  durees: Array.from(new Set(variants.map((v) => `${v.dureeEnMois} mois`))),
                  sourceDb: true,
                };
              });

              // 3. Données de secours (Fallback) : affichées UNIQUEMENT si la base de données est vide
              const fallbackReguliers = [
                {
                  libelle: "Abonnement Résident Nuit (20h - 08h)",
                  description: "Stationnement sécurisé en soirée et la nuit pour les riverains 7j/7.",
                  prixMin: 300,
                  placeReservee: false,
                  durees: ["3 mois", "6 mois", "9 mois", "12 mois"],
                  sourceDb: false,
                },
                {
                  libelle: "Abonnement Jour 7j/7 (08h - 20h)",
                  description: "Accès en journée pour professionnels et commerçants du quartier.",
                  prixMin: 500,
                  placeReservee: false,
                  durees: ["3 mois", "6 mois", "9 mois", "12 mois"],
                  sourceDb: false,
                },
                {
                  libelle: "Pass Permanent 24h/24 et 7j/7 (Non Réservée)",
                  description: "Accès illimité jour et nuit, barrières automatiques par badge RFID.",
                  prixMin: 650,
                  placeReservee: false,
                  durees: ["3 mois", "6 mois", "9 mois", "12 mois"],
                  sourceDb: false,
                },
                {
                  libelle: "Pass Permanent 24h/24 et 7j/7 (Place Réservée)",
                  description: "Emplacement nominatif numéroté garanti 24h/24 et 7j/7.",
                  prixMin: 1000,
                  placeReservee: true,
                  durees: ["3 mois", "6 mois", "9 mois", "12 mois"],
                  sourceDb: false,
                },
              ];

              // Utiliser en priorité la base de données, sinon le fallback
              const forfaitsAffiches = forfaitsReguliersDb.length > 0 ? forfaitsReguliersDb : fallbackReguliers;

              // Tarifs Corporate : priorité BD, sinon fallback 375 MAD / 325 MAD
              const corpStandardDb = tarifsCorporateDb.find((t) => t.forfaitCode === "CORP_STANDARD");
              const corpGrandCompteDb = tarifsCorporateDb.find((t) => t.forfaitCode === "CORP_GRAND_COMPTE");
              const prixCorpStandard = corpStandardDb ? Number(corpStandardDb.prixMensuelTTC) : 375;
              const prixCorpGrandCompte = corpGrandCompteDb ? Number(corpGrandCompteDb.prixMensuelTTC) : 325;
              const isCorpFromDb = tarifsCorporateDb.length > 0;



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
                  {/* Contenu Déplié : Défilement vertical naturel avec la page */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-[#f8fafc] space-y-6">
                      {isLoadingThisTarif ? (
                        <div className="text-center py-8">
                          <Spin tip="Chargement des tarifs en direct de la base de données..." />
                        </div>
                      ) : (
                        <>
                          {/* 1. Formules Régulières de la Base de Données */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-black text-[#001E3D] m-0 text-base flex items-center gap-2">
                                <StarOutlined style={{ color: "#0284c7" }} />
                                Formules d'Abonnement ({forfaitsAffiches.length} Tarifs)
                              </h4>
                              {forfaitsReguliersDb.length > 0 ? (
                                <Tag color="green" className="text-xs font-bold rounded-full border-none px-2.5 py-0.5">
                                  ● En direct de la Base MySQL
                                </Tag>
                              ) : (
                                <Tag color="default" className="text-xs text-slate-500 rounded-full border-none px-2.5 py-0.5">
                                  Tarifs indicatifs (Fallback)
                                </Tag>
                              )}
                            </div>

                            <div className="flex flex-col gap-3">
                              {forfaitsAffiches.map((forfait, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-400 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                      <h5 className="font-extrabold text-[#001E3D] m-0 text-base">
                                        {forfait.libelle}
                                      </h5>
                                      <Tag color={forfait.placeReservee ? "purple" : "blue"} className="font-bold text-[11px] m-0">
                                        {forfait.placeReservee ? "Place Réservée" : "Emplacement Libre"}
                                      </Tag>
                                    </div>
                                    <p className="text-xs text-slate-500 m-0 mb-2 leading-relaxed">
                                      {forfait.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                      <span className="text-[11px] text-slate-400 font-semibold mr-1">Durées :</span>
                                      {forfait.durees.map((d, dIdx) => (
                                        <Tag key={dIdx} color="default" className="text-[10px] font-semibold">
                                          {d}
                                        </Tag>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <div className="text-left md:text-right">
                                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                                        À partir de
                                      </span>
                                      <div className="text-2xl font-black text-[#001E3D]">
                                        {forfait.prixMin}{" "}
                                        <span className="text-xs font-semibold text-slate-500">
                                          MAD / mois
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      type="primary"
                                      icon={<RightOutlined />}
                                      onClick={() => navigate(`/demande-publique?parkingId=${parking.id}`)}
                                      disabled={!parking.souscriptionDisponible}
                                      className="bg-[#001E3D] hover:bg-[#002B5B] rounded-xl font-bold h-11 px-5 border-none shadow-xs text-sm"
                                    >
                                      {parking.souscriptionDisponible ? "Souscrire" : "Complet"}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. Formules Corporate (Directement en dessous, empilées verticalement) */}
                          <div className="pt-4 border-t border-slate-200">
                            <h4 className="font-black text-[#001E3D] m-0 text-base mb-3 flex items-center gap-2">
                              <BankOutlined style={{ color: "#d97706" }} />
                              Offres Professionnelles & Entreprises
                            </h4>

                            <div className="flex flex-col gap-3">
                              {/* Contrat Pro */}
                              <div className="bg-gradient-to-r from-amber-50/40 via-white to-white p-4 md:p-5 rounded-2xl border border-amber-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Tag color="gold" className="font-black text-[10px] uppercase">
                                      Contrat Pro (1 à 10 places)
                                    </Tag>
                                    <h5 className="font-extrabold text-slate-900 m-0 text-base">
                                      Flotte Standard — {parking.nom}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-slate-600 m-0">
                                    Attribution d'emplacements dédiés avec facturation mensuelle centralisée et gestion multi-véhicules.
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0">
                                  <div className="text-left md:text-right">
                                    <div className="text-2xl font-black text-amber-900">
                                      {prixCorpStandard} <span className="text-xs font-semibold text-slate-500">MAD / mois</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">+ 50 MAD / carte RFID</span>
                                  </div>
                                  <Button
                                    type="primary"
                                    onClick={() => navigate(`/demande-publique?typeClient=ENTREPRISE&parkingId=${parking.id}`)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl h-11 px-5 border-none"
                                  >
                                    Demander
                                  </Button>
                                </div>
                              </div>

                              {/* Grand Compte */}
                              <div className="bg-gradient-to-r from-blue-50/40 via-white to-white p-4 md:p-5 rounded-2xl border border-blue-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Tag color="blue" className="font-black text-[10px] uppercase">
                                      Grand Compte (11 places et +)
                                    </Tag>
                                    <Tag color="green" className="font-bold text-[10px]">
                                      Remise Volume -13%
                                    </Tag>
                                    <h5 className="font-extrabold text-slate-900 m-0 text-base">
                                      Grandes Flottes & Institutions — {parking.nom}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-slate-600 m-0">
                                    Tarif dégressif institutionnel pour sièges sociaux, ministères et banques.
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0">
                                  <div className="text-left md:text-right">
                                    <div className="text-2xl font-black text-[#001E3D]">
                                      {prixCorpGrandCompte} <span className="text-xs font-semibold text-slate-500">MAD / mois</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Contrat longue durée</span>
                                  </div>
                                  <Button
                                    type="primary"
                                    onClick={() => navigate(`/demande-publique?typeClient=ENTREPRISE&parkingId=${parking.id}`)}
                                    className="bg-[#001E3D] hover:bg-[#002B5B] text-white font-black rounded-xl h-11 px-5 border-none"
                                  >
                                    Demander
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
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
