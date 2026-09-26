import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Input, Row, Space, Spin, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPublicParkings, type Parking } from "../../api/parkings";
import {
  toParkingMapItems,
  type ParkingMapItem,
  type ParkingSaturation,
} from "../../features/parkings/data/parkingMapAdapters";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { Title } = Typography;

interface RabatParkingsMapProps {
  height?: number;
}

export function RabatParkingsMap({ height = 500 }: RabatParkingsMapProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  const [parkings, setParkings] = useState<Parking[]>([]);
  const [activeParking, setActiveParking] = useState<ParkingMapItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const mapParkings = useMemo(() => toParkingMapItems(parkings), [parkings]);

  const filteredParkings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mapParkings;
    return mapParkings.filter(
      (parking) =>
        parking.nom.toLowerCase().includes(q) ||
        parking.code.toLowerCase().includes(q) ||
        parking.adresse.toLowerCase().includes(q)
    );
  }, [mapParkings, searchQuery]);

    // Current active parking index in the filtered list
  const currentIndex = useMemo(() => {
    if (!activeParking) return 0;
    const idx = filteredParkings.findIndex((p) => p.id === activeParking.id);
    return idx >= 0 ? idx : 0;
  }, [filteredParkings, activeParking]);

  // Slider container ref to smoothly center the active pin
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sliderContainerRef.current) return;
    const activeEl = sliderContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeParking?.id]);

  

  useEffect(() => {
    let cancelled = false;

    async function chargerParkings() {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await getPublicParkings();
        if (cancelled) return;
        setParkings(data);
      } catch (error) {
        console.error("Impossible de charger les parkings:", error);
        if (!cancelled) {
          setLoadError("Impossible de charger les parkings depuis le serveur.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void chargerParkings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mapParkings.length === 0) {
      setActiveParking(null);
      return;
    }

    setActiveParking((current) => {
      if (current) {
        const refreshed = mapParkings.find((parking) => parking.id === current.id);
        if (refreshed) return refreshed;
      }
      return mapParkings[0];
    });
  }, [mapParkings]);

  const getPinColor = () => "#006398";

  const getStatusTag = (statut: ParkingSaturation) => {
    switch (statut) {
      case "FLUIDE":
        return <Tag color="green" icon={<CheckCircleOutlined />}>Places abonnés disponibles</Tag>;
      case "MODERE":
        return <Tag color="orange" icon={<InfoCircleOutlined />}>Occupation modérée</Tag>;
      case "PRESQUE_COMPLET":
        return <Tag color="volcano" icon={<ThunderboltOutlined />}>Quota presque atteint</Tag>;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [34.015, -6.838],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | RRM Rabat',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

    }

    const map = mapInstanceRef.current;
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredParkings.forEach((parking) => {
      const pinColor = getPinColor();
      const customIcon = L.divIcon({
        className: "custom-numbered-marker",
        html: `
          <div style="position:relative;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background-color:#001E3D;color:#fff;border:3px solid ${pinColor};box-shadow:0 4px 14px rgba(0,53,102,.4);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;cursor:pointer;font-family:system-ui,-apple-system,sans-serif;">
            ${parking.numeroPin}
            <div style="position:absolute;bottom:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background-color:${pinColor};border:2px solid #fff;"></div>
          </div>`,
        iconSize: [38, 38],
      });

      const marker = L.marker([parking.latitude, parking.longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;padding:6px;max-width:250px;">
          <strong style="font-size:13px;color:#003566;">${parking.nom}</strong>
          <div style="font-size:11px;color:#64748b;margin:5px 0;">${parking.code} · ${parking.statut}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${parking.adresse}</div>
          <div style="background:#f0f9ff;padding:8px 10px;border-radius:8px;border:1px solid #bae6fd;">
            <div style="font-size:11px;color:#0369a1;font-weight:600;">Places abonnés disponibles</div>
            <div style="font-size:16px;font-weight:800;color:#16a34a;margin-top:2px;">${parking.placesDisponiblesAbonnements} / ${parking.capaciteReserveeAbonnements}</div>
            <div style="font-size:10px;color:#64748b;margin-top:3px;">Occupation : ${parking.tauxOccupationAbonnements}%</div>
          </div>
        </div>`);

      marker.on("mouseover", () => marker.openPopup());
      marker.on("click", () => {
        setActiveParking(parking);
        map.flyTo([parking.latitude, parking.longitude], 15, { duration: 1.2 });
      });
      markersRef.current[parking.id] = marker;
    });

    if (filteredParkings.length > 0 && !searchQuery.trim()) {
      const bounds = L.latLngBounds(filteredParkings.map((p) => [p.latitude, p.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredParkings, searchQuery]);

  const handleSelectParkingItem = (parking: ParkingMapItem) => {
    setActiveParking(parking);
    mapInstanceRef.current?.flyTo([parking.latitude, parking.longitude], 15, { duration: 1.2 });
    markersRef.current[parking.id]?.openPopup();
  };

  return (
    <Card style={{ borderRadius: 16, overflow: "hidden", borderColor: "#cbd5e1", boxShadow: "0 10px 30px rgba(0,53,102,.08)", backgroundColor: "#fff" }} bodyStyle={{ padding: 0 }}>
      {loadError && <Alert type="error" showIcon message={loadError} style={{ borderRadius: 0 }} />}
      <Spin spinning={loading}>
        <Row gutter={0}>
          <Col xs={24} lg={15}>
            <div ref={mapContainerRef} style={{ height, width: "100%", backgroundColor: "#e2e8f0", zIndex: 1 }} />
          </Col>
          <Col xs={24} lg={9}>
            <div style={{ padding: 20, height, overflowY: "auto", backgroundColor: "#f8fafc", borderLeft: "1px solid #e2e8f0" }}>
              {/* Search Bar */}
              <div style={{ marginBottom: 14 }}>
                <Input
                  placeholder="Rechercher un parking (ex: Agdal, Hassan II, Bab El Had...)"
                  prefix={<SearchOutlined style={{ color: "#0284c7" }} />}
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: 8, borderColor: "#cbd5e1", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
                />
              </div>

                            {/* Enhanced Parking Pin Slider */}
              {filteredParkings.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {/* Micro-CSS for smooth animations & hidden scrollbars */}
                  <style>{`
                    .parking-slider-track::-webkit-scrollbar {
                      display: none;
                    }
                    .parking-slider-track {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                    .parking-pin-btn {
                      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .parking-pin-btn:hover:not([data-active="true"]) {
                      transform: translateY(-2px) scale(1.12);
                      border-color: #0284c7 !important;
                      color: #003566 !important;
                      box-shadow: 0 4px 10px rgba(0, 53, 102, 0.12) !important;
                    }
                    .parking-pin-btn[data-active="true"] {
                      animation: pulseGlow 2.4s infinite;
                    }
                    @keyframes pulseGlow {
                      0% {
                        box-shadow: 0 4px 14px rgba(0, 53, 102, 0.4), 0 0 0 0 rgba(2, 132, 199, 0.45);
                      }
                      70% {
                        box-shadow: 0 4px 14px rgba(0, 53, 102, 0.4), 0 0 0 6px rgba(2, 132, 199, 0);
                      }
                      100% {
                        box-shadow: 0 4px 14px rgba(0, 53, 102, 0.4), 0 0 0 0 rgba(2, 132, 199, 0);
                      }
                    }
                  `}</style>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                      Navigation des parkings :
                    </span>
                    <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>
                      {activeParking ? `N° ${activeParking.numeroPin} · ${activeParking.nom}` : ""}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      backgroundColor: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0, 53, 102, 0.04)",
                    }}
                  >
                    {/* Previous Button */}
                    <Button
                      size="small"
                      shape="circle"
                      icon={<LeftOutlined />}
                      disabled={currentIndex <= 0}
                      onClick={() => {
                        if (currentIndex > 0) {
                          handleSelectParkingItem(filteredParkings[currentIndex - 1]);
                        }
                      }}
                      style={{ flexShrink: 0 }}
                    />

                    {/* Horizontal Smooth Slider Track */}
                    <div
                      ref={sliderContainerRef}
                      className="parking-slider-track"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        overflowX: "auto",
                        padding: "6px 2px",
                        scrollBehavior: "smooth",
                        flex: 1,
                      }}
                    >
                      {filteredParkings.map((p) => {
                        const isSelected = activeParking?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            data-active={isSelected ? "true" : "false"}
                            className="parking-pin-btn"
                            onClick={() => handleSelectParkingItem(p)}
                            title={`Parking ${p.numeroPin} : ${p.nom}`}
                            style={{
                              width: isSelected ? 38 : 28,
                              height: isSelected ? 38 : 28,
                              minWidth: isSelected ? 38 : 28,
                              borderRadius: "50%",
                              border: isSelected ? "2.5px solid #0077b6" : "1.5px solid #cbd5e1",
                              background: isSelected
                                ? "linear-gradient(135deg, #001E3D 0%, #003566 100%)"
                                : "#ffffff",
                              color: isSelected ? "#ffffff" : "#475569",
                              fontWeight: isSelected ? 800 : 700,
                              fontSize: isSelected ? 15 : 12,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              flexShrink: 0,
                              boxShadow: isSelected
                                ? "0 4px 14px rgba(0, 53, 102, 0.4)"
                                : "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            {p.numeroPin}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      size="small"
                      shape="circle"
                      icon={<RightOutlined />}
                      disabled={currentIndex >= filteredParkings.length - 1}
                      onClick={() => {
                        if (currentIndex < filteredParkings.length - 1) {
                          handleSelectParkingItem(filteredParkings[currentIndex + 1]);
                        }
                      }}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                </div>
              )}


            {/* Filtered Search Results List (if searching) */}
            {searchQuery.trim() && (
              <div style={{ marginBottom: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #bae6fd", padding: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", marginBottom: 6 }}>
                  Résultats de recherche ({filteredParkings.length}) :
                </div>
                {filteredParkings.map((parking) => (
                  <div
                    key={parking.id}
                    onClick={() => handleSelectParkingItem(parking)}
                    style={{ padding: "6px 10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}
                  >
                    <strong>{parking.nom}</strong> · {parking.code}
                  </div>
                ))}
              </div>
            )}

            {/* Parking Details & Action Buttons */}
            {activeParking && (
              <>
                <div style={{ backgroundColor: "#fff", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ backgroundColor: "#001E3D", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                      {activeParking.numeroPin}
                    </span>
                    <Tag color={activeParking.statut === "ACTIF" ? "green" : "orange"}>{activeParking.statut}</Tag>
                    <Tag>{activeParking.code}</Tag>
                  </div>
                  <Title level={4} style={{ color: "#003566", margin: "0 0 8px", fontSize: 16 }}>
                    {activeParking.nom}
                  </Title>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    <EnvironmentOutlined style={{ marginRight: 6, color: "#0284c7" }} />
                    {activeParking.adresse}
                  </div>
                  <div style={{ marginBottom: 14 }}>{getStatusTag(activeParking.statutSaturation)}</div>
                  <div style={{ backgroundColor: "#f0f9ff", padding: "12px 14px", borderRadius: 10, border: "1px solid #bae6fd", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 700 }}>
                      <BuildOutlined style={{ marginRight: 6 }} />Places abonnés disponibles
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a", marginTop: 4 }}>
                      {activeParking.capaciteReserveeAbonnements - activeParking.placesOccupeesAbonnements}{" "}
                      <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
                        / {activeParking.capaciteReserveeAbonnements} places disponibles
                      </span>
                    </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 12 }}>
                      <div><strong>Quota abonnements :</strong><br />{activeParking.capaciteReserveeAbonnements}</div>
                      <div><strong>Abonnements actifs :</strong><br />{activeParking.placesOccupeesAbonnements}</div>
                      <div><strong>Taux d'occupation :</strong><br />{activeParking.tauxOccupationAbonnements}%</div>
                      <div><strong>Souscription :</strong><br />{activeParking.souscriptionDisponible ? "Disponible" : "Complète"}</div>
                    </div>

                </div>

                <Space direction="vertical" style={{ width: "100%" }}>
                  {role === "AGENT" && (
                    <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/agent/demandes?parkingId=${activeParking.id}`)}>
                      Traitement Guichet pour ce Parking
                    </Button>
                  )}
                  {role === "SUPERVISEUR" && (
                    <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/superviseur/recettes?parkingId=${activeParking.id}`)}>
                      Superviser ce Parking
                    </Button>
                  )}
                  {role === "COMPTABLE" && (
                    <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/comptable/recettes?parkingId=${activeParking.id}`)}>
                      Consulter ce Parking
                    </Button>
                  )}
                  {role === "RESPONSABLE" && (
                    <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/responsable/parkings`)}>
                      Gérer les Parkings
                    </Button>
                  )}
                  {role === "ADMIN_SI" && (
                    <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/admin/parkings`)}>
                      Configurer les Parkings
                    </Button>
                  )}
                  {(!role || role === "RESP_REPORTING") && (
                    <Button type="primary" block size="large" icon={<ArrowRightOutlined />} disabled={!activeParking.souscriptionDisponible} onClick={() => navigate(`/demande-publique?parkingId=${activeParking.id}`)}>
                      Souscrire un Abonnement
                    </Button>
                  )}
                  <Button
                    block
                    icon={<GlobalOutlined style={{ color: "#4285F4" }} />}
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${activeParking.latitude},${activeParking.longitude}`, "_blank")}
                  >
                    Ouvrir l'itinéraire dans Google Maps
                  </Button>
                </Space>
              </>
            )}
          </div>
        </Col>
      </Row>
      </Spin>
    </Card>
  );
}
