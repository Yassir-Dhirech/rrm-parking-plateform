import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { RABAT_PARKINGS_MAP_DATA, type RabatParkingMapItem } from "../features/parkings/data/parkingsMapData";
import {
  EnvironmentOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  BankOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  SearchOutlined,
  CarOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
  StarOutlined,
  SunOutlined,
  MoonOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { Tag, Button, Input } from "antd";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function PublicParkingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active View Tab: 'MAP' or 'TARIFS'
  const [activeTab, setActiveTab] = useState<"MAP" | "TARIFS">("MAP");

  // Active Selected Parking for Map
  const [activeParking, setActiveParking] = useState<RabatParkingMapItem>(RABAT_PARKINGS_MAP_DATA[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Folded Cards Expansion State for Tarifs View
  const [expandedParkingIds, setExpandedParkingIds] = useState<Set<number>>(new Set([1]));

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  // Auto-switch view if URL has #tarifs or ?view=tarifs
  useEffect(() => {
    if (location.hash === "#tarifs" || location.search.includes("view=tarifs")) {
      setActiveTab("TARIFS");
    } else {
      setActiveTab("MAP");
    }
  }, [location]);

  // Memoize Filtered Parkings
  const filteredParkings = useMemo(() => {
    if (!searchQuery.trim()) return RABAT_PARKINGS_MAP_DATA;
    const q = searchQuery.toLowerCase();
    return RABAT_PARKINGS_MAP_DATA.filter(
      (p) =>
        p.nomComplet.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.quartier.toLowerCase().includes(q) ||
        p.adresse.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Toggle Accordion / Folded Card expansion in Tarifs View
  const toggleParkingExpand = (id: number) => {
    setExpandedParkingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Pin Color Helper — Strictly Brand RRM Blue (#006398)
  const getPinColor = (_statut?: any) => {
    return "#006398";
  };

  // Status Badge Helper
  const getStatusBadge = (statut: RabatParkingMapItem["statutSaturation"]) => {
    switch (statut) {
      case "FLUIDE":
        return (
          <Tag color="green" className="font-extrabold border-none px-2.5 py-0.5 rounded-full text-xs m-0 shrink-0">
            <CheckCircleOutlined /> Places Libres
          </Tag>
        );
      case "MODERE":
        return (
          <Tag color="orange" className="font-extrabold border-none px-2.5 py-0.5 rounded-full text-xs m-0 shrink-0">
            <InfoCircleOutlined /> Affluence Modérée
          </Tag>
        );
      case "PRESQUE_COMPLET":
        return (
          <Tag color="volcano" className="font-extrabold border-none px-2.5 py-0.5 rounded-full text-xs m-0 shrink-0">
            <ThunderboltOutlined /> Quota Presque Atteint
          </Tag>
        );
      default:
        return <Tag color="blue" className="m-0 font-bold shrink-0">Disponible</Tag>;
    }
  };

  // Initialize & Update Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (!mapInstanceRef.current) {
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }

      try {
        const map = L.map(container, {
          center: [34.015, -6.838],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RRM Rabat',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error("Leaflet initialization warning:", err);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Render Markers
    filteredParkings.forEach((parking) => {
      const pinColor = getPinColor(parking.statutSaturation);

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            background: linear-gradient(135deg, ${pinColor}, #003566);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(0,99,152,0.35), inset 0 2px 4px rgba(255,255,255,0.6);
            border: 2px solid white;
            cursor: pointer;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: 900;
              font-size: 14px;
              font-family: sans-serif;
              text-shadow: 0 1px 2px rgba(0,0,0,0.4);
            ">${parking.numeroPin}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([parking.lat, parking.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setActiveParking(parking);
        map.flyTo([parking.lat, parking.lng], 15, { animate: true, duration: 0.5 });
      });

      markersRef.current[parking.id] = marker;
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [filteredParkings]);

  // ResizeObserver to automatically notify Leaflet whenever container size changes
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Recalculate map size whenever switching back to MAP tab
  useEffect(() => {
    if (activeTab === "MAP" && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [activeTab]);

  // Select Parking Handler on Map Sidebar
  const handleSelectParking = (parking: RabatParkingMapItem) => {
    setActiveParking(parking);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([parking.lat, parking.lng], 15, { animate: true, duration: 0.5 });
    }
  };

  // Handler to switch to TARIFS tab and open/scroll to requested parking
  const handleViewParkingTarifs = (parkingId: number) => {
    setActiveTab("TARIFS");
    setExpandedParkingIds(new Set([parkingId]));
    window.history.replaceState(null, "", `/parkings-public#tarifs-parking-${parkingId}`);
    setTimeout(() => {
      const el = document.getElementById(`parking-tarif-card-${parkingId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 pb-0">
      {/* 1. SHARED FIXED TOP NAVBAR (Height 80px) */}
      <PublicNavbar />

      {/* 2. SINGLE FLOATING STICKY VIEW SWITCHER PILL BAR */}
      <div className="fixed top-[92px] left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-2xl flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTab("MAP");
              window.history.replaceState(null, "", "/parkings-public");
            }}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === "MAP"
                ? "bg-secondary text-white shadow-md scale-105"
                : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <EnvironmentOutlined />
            <span>Carte Interactive</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("TARIFS");
              window.history.replaceState(null, "", "/parkings-public#tarifs");
            }}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === "TARIFS"
                ? "bg-secondary text-white shadow-md scale-105"
                : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <DollarOutlined />
            <span>Tarifs par Parking</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FULL SCREEN INTERACTIVE MAP VIEW (100% PAGE HEIGHT) */}
      <div
        className={
          activeTab === "MAP"
            ? "relative w-full h-[calc(100vh-80px)] min-h-[600px] overflow-hidden bg-slate-200 flex-1 block"
            : "hidden"
        }
      >
        {/* Full Screen 100% Background Map Canvas */}
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 0 }}
        />

        {/* LEFT FLOATING GLASS SIDEBAR (DESKTOP ONLY — HIDDEN ON MOBILE TO FREE UP MAP) */}
        <aside className="hidden md:flex absolute top-6 left-6 z-20 w-full max-w-[320px] max-h-[calc(100vh-128px)] rounded-3xl border border-white/90 shadow-2xl p-5 backdrop-blur-md bg-white/90 flex-col custom-scrollbar">
          <div className="mb-3">
            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <CarOutlined className="text-secondary" /> Parkings Rabat
            </h2>
            <p className="text-xs text-slate-500 m-0 font-medium">
              Sélectionnez un ouvrage dans la liste
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-3">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-2xl py-2 px-3 border-slate-200 bg-white shadow-2xs text-xs font-semibold"
              allowClear
            />
          </div>

          {/* Streamlined Parking Names List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredParkings.map((p) => {
              const isSelected = activeParking?.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectParking(p)}
                  className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-secondary bg-secondary text-white shadow-md font-bold scale-[1.02]"
                      : "border-slate-200/90 bg-white/90 text-slate-800 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected ? "bg-white text-secondary shadow-xs" : "bg-slate-900 text-white"
                      }`}
                    >
                      {p.numeroPin}
                    </span>
                    <div className="truncate">
                      <h3
                        className={`text-xs font-extrabold m-0 truncate ${
                          isSelected ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {p.nomComplet.split("(")[0]}
                      </h3>
                      <span className={`text-[11px] block truncate ${isSelected ? "text-slate-200" : "text-slate-400"}`}>
                        {p.quartier}
                      </span>
                    </div>
                  </div>

                  <ArrowRightOutlined
                    className={`text-xs shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`}
                  />
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT FLOATING GLASS PANEL: COMPACT STREAMLINED PARKING INFO (BOTTOM SHEET ON MOBILE) */}
        {activeParking && (
          <aside className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-6 md:right-6 md:left-auto z-30 w-full md:max-w-[380px] max-h-[70vh] md:max-h-[calc(100vh-128px)] rounded-t-3xl md:rounded-3xl border-t md:border border-white/95 shadow-2xl p-4 md:p-6 glass-card bg-white/95 backdrop-blur-xl flex flex-col space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar">
            {/* Mobile Drag Indicator */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto md:hidden -mt-1 mb-1"></div>

            {/* Header & Controls */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
              <div className="pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag color="cyan" className="font-extrabold border-none px-2 py-0.5 rounded-full text-[11px] m-0">
                    Pin #{activeParking.numeroPin}
                  </Tag>
                  <span className="text-[11px] text-slate-500 font-semibold">{activeParking.quartier}</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-900 m-0 leading-tight">
                  {activeParking.nomComplet}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([activeParking.lat, activeParking.lng], 15, { animate: true, duration: 0.5 });
                    }
                  }}
                  className="text-slate-500 hover:text-secondary bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
                  title="Centrer le parking"
                >
                  <AimOutlined className="text-sm" />
                </button>
                <button
                  onClick={() => setActiveParking(null as any)}
                  className="text-slate-400 hover:text-slate-800 bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <CloseOutlined className="text-sm" />
                </button>
              </div>
            </div>

            {/* Compact Key Stats Grid (Clean & Sleek on Mobile) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Places Libres</span>
                <span className="text-sm md:text-base font-black text-emerald-700">
                  {activeParking.placesAbonnesLibres} <span className="text-xs font-semibold text-emerald-600">/ {activeParking.placesAbonnesTotal}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-secondary/5 border border-secondary/20">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Tarif Mensuel</span>
                <span className="text-xs md:text-sm font-black text-secondary truncate block">
                  {activeParking.tarifsAbonnementMensuel.split("/")[0]}
                </span>
              </div>
            </div>

            {/* Affluence Badge */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Affluence actuelle :</span>
              {getStatusBadge(activeParking.statutSaturation)}
            </div>

            {/* Detailed Address (Desktop Only to save mobile space) */}
            <div className="hidden md:block space-y-1">
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Emplacement
              </span>
              <p className="text-xs text-slate-600 font-medium m-0 flex items-center gap-1.5">
                <EnvironmentOutlined className="text-secondary text-sm" />
                {activeParking.adresse}
              </p>
            </div>

            {/* Capacity Progress Box (Desktop Only) */}
            <div className="hidden md:block p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <CarOutlined className="text-slate-500" /> Capacité Abonnés :
                </span>
                <span className="text-emerald-600 font-extrabold text-sm">
                  {activeParking.placesAbonnesLibres} / {activeParking.placesAbonnesTotal} places
                </span>
              </div>

              {(() => {
                const percentFull = Math.round(
                  ((activeParking.placesAbonnesTotal - activeParking.placesAbonnesLibres) /
                    activeParking.placesAbonnesTotal) *
                    100
                );
                return (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentFull > 80 ? "bg-rose-500" : percentFull > 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentFull}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>Taux d'occupation</span>
                      <span className="font-extrabold text-slate-800">{percentFull}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons: Direct Souscription & View Tarifs */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="primary"
                block
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate(`/demande-publique?parkingId=${activeParking.id}&tab=particulier`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs h-11 shadow-md border-none flex justify-center items-center gap-2"
              >
                Souscrire cet Ouvrage en Ligne →
              </Button>
              <Button
                block
                icon={<DollarOutlined />}
                onClick={() => handleViewParkingTarifs(activeParking.id)}
                className="rounded-xl font-bold text-xs h-10 border-slate-300 text-slate-700 hover:text-secondary hover:border-secondary"
              >
                Consulter les Tarifs & Formules
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* VIEW 2: TARIFS — LIST OF FOLDED ACCORDION CARDS PER PARKING */}
      {activeTab === "TARIFS" && (
        <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 pt-12 pb-16 space-y-10 min-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
            <div>
              <Tag color="gold" className="px-3.5 py-1 rounded-full font-semibold mb-2 border-none shadow-sm text-xs inline-flex items-center gap-1.5">
                <DollarOutlined /> Grille Tarifaire Homologuée RRM 2026
              </Tag>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900">
                Tarifs Mensuels Détaillés par Parking
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Cliquez sur une carte d'ouvrage pour déplier la grille tarifaire complète et souscrire avec la formule de votre choix.
              </p>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/demande-publique")}
              className="bg-secondary rounded-xl font-bold px-6 shadow-md"
            >
              Portail des Démarches En Ligne
            </Button>
          </div>

          {/* LIST OF FOLDED ACCORDION CARDS */}
          <div className="space-y-4">
            {RABAT_PARKINGS_MAP_DATA.map((parking) => {
              const isExpanded = expandedParkingIds.has(parking.id);

              return (
                <div
                  key={parking.id}
                  id={`parking-tarif-card-${parking.id}`}
                  className={`glass-card rounded-3xl border transition-all duration-300 overflow-hidden shadow-md ${
                    isExpanded
                      ? "border-secondary/60 bg-white/95 ring-2 ring-secondary/15"
                      : "border-white/80 bg-white/70 hover:bg-white/90"
                  }`}
                >
                  {/* FOLDED CARD HEADER (CLICK TO EXPAND / COLLAPSE) */}
                  <div
                    onClick={() => toggleParkingExpand(parking.id)}
                    className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-lg shadow-2xs">
                        #{parking.numeroPin}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-slate-900 m-0">
                            {parking.nomComplet}
                          </h3>
                          {getStatusBadge(parking.statutSaturation)}
                        </div>
                        <p className="text-xs text-slate-500 m-0 mt-1 flex items-center gap-1">
                          <EnvironmentOutlined className="text-secondary" /> {parking.adresse}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                          Formules à partir de
                        </span>
                        <span className="text-base font-black text-secondary">
                          {parking.tarifsAbonnementMensuel}
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shrink-0">
                        {isExpanded ? <UpOutlined /> : <DownOutlined />}
                      </div>
                    </div>
                  </div>

                  {/* UNFOLDED CARD CONTENT (EXPANDED PRICING FORMULAS GRID) */}
                  {isExpanded && (
                    <div className="p-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Formula 1: 24h/7j */}
                        <div className="bg-white p-5 rounded-2xl border border-secondary/40 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <StarOutlined className="text-secondary text-lg" />
                              <h4 className="font-extrabold text-slate-900 m-0 text-sm">Pass Permanent 24h/7j</h4>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">Accès illimité jour & nuit 7j/7</p>
                            <div className="text-2xl font-black text-slate-900 mb-3">
                              600 <span className="text-xs font-semibold text-slate-500">DH / mois</span>
                            </div>
                          </div>
                          <Button
                            type="primary"
                            block
                            size="small"
                            onClick={() => navigate(`/demande-publique?parkingId=${parking.id}&plan=24H7J`)}
                            className="bg-secondary rounded-xl font-bold text-xs h-9"
                          >
                            Souscrire 24h/7j →
                          </Button>
                        </div>

                        {/* Formula 2: Diurne */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <SunOutlined className="text-amber-500 text-lg" />
                              <h4 className="font-extrabold text-slate-900 m-0 text-sm">Pass Diurne (08h - 20h)</h4>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">Du lundi au samedi en journée</p>
                            <div className="text-2xl font-black text-slate-900 mb-3">
                              420 <span className="text-xs font-semibold text-slate-500">DH / mois</span>
                            </div>
                          </div>
                          <Button
                            type="default"
                            block
                            size="small"
                            onClick={() => navigate(`/demande-publique?parkingId=${parking.id}&plan=JOUR`)}
                            className="border-slate-300 text-slate-800 rounded-xl font-bold text-xs h-9 hover:bg-slate-50"
                          >
                            Souscrire Diurne →
                          </Button>
                        </div>

                        {/* Formula 3: Nocturne */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MoonOutlined className="text-purple-600 text-lg" />
                              <h4 className="font-extrabold text-slate-900 m-0 text-sm">Pass Nocturne (19h - 08h)</h4>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">Formule résidentielle spéciale nuit</p>
                            <div className="text-2xl font-black text-slate-900 mb-3">
                              350 <span className="text-xs font-semibold text-slate-500">DH / mois</span>
                            </div>
                          </div>
                          <Button
                            type="default"
                            block
                            size="small"
                            onClick={() => navigate(`/demande-publique?parkingId=${parking.id}&plan=NUIT`)}
                            className="border-slate-300 text-slate-800 rounded-xl font-bold text-xs h-9 hover:bg-slate-50"
                          >
                            Souscrire Nocturne →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Corporate Fleet Banner Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-xl bg-gradient-to-br from-white/90 via-slate-50/80 to-amber-50/40 flex flex-col md:flex-row items-center justify-between gap-8">
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
        </main>
      )}
    </div>
  );
}
