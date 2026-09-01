import { useState, useEffect, useRef } from "react";
import { Card, Tag, Button, Row, Col, Space, Typography, Input } from "antd";
import {
  EnvironmentOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RABAT_PARKINGS_MAP_DATA, type RabatParkingMapItem } from "../../features/parkings/data/parkingsMapData";

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

  const [activeParking, setActiveParking] = useState<RabatParkingMapItem>(RABAT_PARKINGS_MAP_DATA[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredParkings = RABAT_PARKINGS_MAP_DATA.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nomComplet.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.quartier.toLowerCase().includes(q) ||
      p.adresse.toLowerCase().includes(q)
    );
  });

  // Pin Color Helper — Strictly Brand RRM Blue (#006398)
  const getPinColor = (_statut?: any) => {
    return "#006398";
  };

  const getStatusTag = (statut: RabatParkingMapItem["statutSaturation"]) => {
    switch (statut) {
      case "FLUIDE":
        return <Tag color="green" icon={<CheckCircleOutlined />}>Places Abonnés Disponibles</Tag>;
      case "MODERE":
        return <Tag color="orange" icon={<InfoCircleOutlined />}>Affluence Modérée</Tag>;
      case "PRESQUE_COMPLET":
        return <Tag color="volcano" icon={<ThunderboltOutlined />}>Quota Presque Atteint</Tag>;
      default:
        return <Tag color="blue">Disponible</Tag>;
    }
  };

  // Initialize Real Leaflet OpenStreetMap Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Rabat City (34.015, -6.838)
      const map = L.map(mapContainerRef.current, {
        center: [34.015, -6.838],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Real OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RRM Rabat',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Render Numbered Pin Markers (1, 2, 3, 4, 5) for each Rabat Parking
    filteredParkings.forEach((parking) => {
      const pinColor = getPinColor(parking.statutSaturation);

      // Custom Numbered Marker Badge HTML
      const customIcon = L.divIcon({
        className: "custom-numbered-marker",
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -50%);
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: #001E3D;
            color: #ffffff;
            border: 3px solid ${pinColor};
            box-shadow: 0 4px 14px rgba(0, 53, 102, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            font-family: system-ui, -apple-system, sans-serif;
            transition: all 0.2s ease;
          ">
            ${parking.numeroPin}
            <div style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: ${pinColor};
              border: 2px solid #ffffff;
            "></div>
          </div>
        `,
        iconSize: [38, 38],
      });

      const marker = L.marker([parking.lat, parking.lng], { icon: customIcon }).addTo(map);

      // Popup Content on Marker Hover / Click
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 230px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="background-color: #001E3D; color: #ffffff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;">${parking.numeroPin}</span>
            <strong style="font-size: 13px; color: #003566;">${parking.nomComplet}</strong>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${parking.adresse}</div>
          <div style="background-color: #f0f9ff; padding: 8px 10px; border-radius: 8px; border: 1px solid #bae6fd;">
            <div style="font-size: 11px; color: #0369a1; font-weight: 600;">Places Abonnés Libres :</div>
            <div style="font-size: 16px; font-weight: 800; color: #16a34a; margin-top: 2px;">
              ${parking.placesAbonnesLibres} / ${parking.placesAbonnesTotal} places
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        offset: L.point(-20, -20),
      });

      marker.on("mouseover", () => {
        marker.openPopup();
      });

      marker.on("click", () => {
        setActiveParking(parking);
        map.flyTo([parking.lat, parking.lng], 15, { duration: 1.2 });
      });

      markersRef.current[parking.id] = marker;
    });
  }, [searchQuery]);

  const handleSelectParkingItem = (parking: RabatParkingMapItem) => {
    setActiveParking(parking);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([parking.lat, parking.lng], 15, { duration: 1.2 });
      const m = markersRef.current[parking.id];
      if (m) m.openPopup();
    }
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        overflow: "hidden",
        borderColor: "#cbd5e1",
        boxShadow: "0 10px 30px rgba(0, 53, 102, 0.08)",
        backgroundColor: "#ffffff",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Sleek Header Bar */}
      

      


      <Row gutter={0}>
        {/* Real Leaflet OpenStreetMap Container */}
        <Col xs={24} lg={15}>
          <div
            ref={mapContainerRef}
            style={{
              height,
              width: "100%",
              backgroundColor: "#e2e8f0",
              zIndex: 1,
            }}
          />
        </Col>

        {/* Selected Parking Detailed Info Panel with Search Bar */}
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

            {/* Numbered Selector Buttons */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                Accès rapide (Parkings 1 à 5) :
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {RABAT_PARKINGS_MAP_DATA.map((p) => {
                  const isSelected = activeParking.id === p.id;
                  const color = getPinColor(p.statutSaturation);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectParkingItem(p)}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        borderRadius: 8,
                        border: isSelected ? `2px solid ${color}` : "1px solid #cbd5e1",
                        backgroundColor: isSelected ? "#001E3D" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#1e293b",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {p.numeroPin}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtered Search Results List (if searching) */}
            {searchQuery.trim() && (
              <div style={{ marginBottom: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #bae6fd", padding: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", marginBottom: 6 }}>
                  Résultats de recherche ({filteredParkings.length}) :
                </div>
                {filteredParkings.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {filteredParkings.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectParkingItem(p)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          backgroundColor: activeParking.id === p.id ? "#f0f9ff" : "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 12,
                          border: activeParking.id === p.id ? "1px solid #0284c7" : "1px solid #f1f5f9",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#003566" }}>
                          #{p.numeroPin} {p.nomComplet}
                        </span>
                        <Tag color="green" style={{ margin: 0, fontSize: 10 }}>{p.placesAbonnesLibres} libres</Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 6 }}>
                    Aucun parking ne correspond à la recherche.
                  </div>
                )}
              </div>
            )}

            {/* Main Direct Parking Information Card */}
            <div style={{ backgroundColor: "#ffffff", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span
                  style={{
                    backgroundColor: "#001E3D",
                    color: "#ffffff",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {activeParking.numeroPin}
                </span>
                <Tag color="blue" style={{ fontWeight: 600, margin: 0 }}>
                  Quartier : {activeParking.quartier}
                </Tag>
              </div>

              <Title level={4} style={{ color: "#003566", margin: "0 0 8px", fontSize: 16 }}>
                {activeParking.nomComplet}
              </Title>

              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                <EnvironmentOutlined style={{ marginRight: 6, color: "#0284c7" }} />
                {activeParking.adresse}
              </div>

              <div style={{ marginBottom: 14 }}>{getStatusTag(activeParking.statutSaturation)}</div>

              {/* Direct Abonnements Info Box */}
              <div style={{ backgroundColor: "#f0f9ff", padding: "12px 14px", borderRadius: 10, border: "1px solid #bae6fd", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 700 }}>
                  <BuildOutlined style={{ marginRight: 6 }} /> Places Abonnés Libres :
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a", marginTop: 4 }}>
                  {activeParking.placesAbonnesLibres} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>/ {activeParking.placesAbonnesTotal} places</span>
                </div>
              </div>

              {/* Role-Tailored Custom Details Box */}
              {role === "SUPERVISEUR" && (
                <div style={{ backgroundColor: "#faf5ff", padding: 12, borderRadius: 10, border: "1px solid #e9d5ff", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7e22ce", marginBottom: 4 }}>
                    Répartition Quotas & Capacité (Supervision) :
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#3b0764", fontWeight: 600 }}>
                    <span>Particuliers: 40% (180/450)</span>
                    <span>Corporate: 60% (270/450)</span>
                  </div>
                </div>
              )}

              {role === "COMPTABLE" && (
                <div style={{ backgroundColor: "#fffbeb", padding: 12, borderRadius: 10, border: "1px solid #fde68a", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 4 }}>
                    Suivi Financier & Recettes (Comptabilité) :
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>
                    CA Hebdo Collecté: 34 500 MAD (Espèces + Chèques)
                  </div>
                </div>
              )}

              {role === "ADMIN_SI" && (
                <div style={{ backgroundColor: "#f0fdf4", padding: 12, borderRadius: 10, border: "1px solid #bbf7d0", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>
                    Configuration Matérielle & Scanners RFID :
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                    Terminal RFID: 192.168.1.52 (ONLINE <CheckCircleOutlined style={{ color: "#16a34a" }} />) | Barrière d'Accès: OK
                  </div>
                </div>
              )}

              <div style={{ fontSize: 12, color: "#334155" }}>
                <strong>Tarif Mensuel :</strong> {activeParking.tarifsAbonnementMensuel}
              </div>
            </div>

            {/* Role-Specific Action Buttons */}
            <Space direction="vertical" style={{ width: "100%" }}>
              {role === "AGENT" && (
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/agent/demandes?parkingId=${activeParking.id}`)}
                  style={{ backgroundColor: "#003566", borderColor: "#003566", fontWeight: 700, borderRadius: 8, height: 44 }}
                >
                  Traitement Guichet pour ce Parking
                </Button>
              )}

              {role === "SUPERVISEUR" && (
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/superviseur/recettes?parkingId=${activeParking.id}`)}
                  style={{ backgroundColor: "#9333ea", borderColor: "#9333ea", fontWeight: 700, borderRadius: 8, height: 44 }}
                >
                  Superviser Recettes & Quotas
                </Button>
              )}

              {role === "COMPTABLE" && (
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/comptable/recettes?parkingId=${activeParking.id}`)}
                  style={{ backgroundColor: "#d97706", borderColor: "#d97706", fontWeight: 700, borderRadius: 8, height: 44 }}
                >
                  Rapprocher Recettes de ce Parking
                </Button>
              )}

              {role === "RESPONSABLE" && (
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/responsable/parkings`)}
                  style={{ backgroundColor: "#003566", borderColor: "#003566", fontWeight: 700, borderRadius: 8, height: 44 }}
                >
                  Gérer Tarifs & Contrats
                </Button>
              )}

              {role === "ADMIN_SI" && (
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/admin/parkings`)}
                  style={{ backgroundColor: "#0284c7", borderColor: "#0284c7", fontWeight: 700, borderRadius: 8, height: 44 }}
                >
                  Configurer Endpoints Matériel
                </Button>
              )}

              {(!role || role === "RESP_REPORTING") && (
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/demande-publique?parkingId=${activeParking.id}`)}
                  style={{ backgroundColor: "#003566", borderColor: "#003566", fontWeight: 600, borderRadius: 8, height: 44 }}
                >
                  Souscrire un Abonnement pour ce Parking
                </Button>
              )}

              <Button
                block
                size="middle"
                icon={<GlobalOutlined style={{ color: "#4285F4" }} />}
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${activeParking.lat},${activeParking.lng}`, "_blank")}
                style={{ borderRadius: 8 }}
              >
                Ouvrir l'Itinéraire dans Google Maps
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
