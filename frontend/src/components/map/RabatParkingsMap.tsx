import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Input, Row, Space, Spin, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
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

      const reliefLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
        maxZoom: 17,
      });

      const standardLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RRM Rabat',
        maxZoom: 19,
      });

      reliefLayer.addTo(mapInstanceRef.current);
      L.control.layers(
        {
          "Relief": reliefLayer,
          "Standard": standardLayer,
        },
        undefined,
        { position: "topright", collapsed: false }
      ).addTo(mapInstanceRef.current);
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
      <Row gutter={0}>
        <Col xs={24} lg={15}>
          <div ref={mapContainerRef} style={{ height, width: "100%", backgroundColor: "#e2e8f0", zIndex: 1 }} />
        </Col>
        <Col xs={24} lg={9}>
          <div style={{ padding: 20, height, overflowY: "auto", backgroundColor: "#f8fafc", borderLeft: "1px solid #e2e8f0" }}>
            <Input
              placeholder="Rechercher par nom, code ou adresse..."
              prefix={<SearchOutlined style={{ color: "#0284c7" }} />}
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: 8, marginBottom: 14 }}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: 32 }}><Spin /></div>
            ) : mapParkings.length === 0 ? (
              <Alert type="info" showIcon message="Aucun parking géolocalisé n'est disponible." />
            ) : (
              <>
                <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {mapParkings.map((parking) => (
                    <button
                      key={parking.id}
                      onClick={() => handleSelectParkingItem(parking)}
                      style={{
                        minWidth: 38,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: activeParking?.id === parking.id ? "2px solid #006398" : "1px solid #cbd5e1",
                        backgroundColor: activeParking?.id === parking.id ? "#001E3D" : "#fff",
                        color: activeParking?.id === parking.id ? "#fff" : "#1e293b",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {parking.numeroPin}
                    </button>
                  ))}
                </div>

                {searchQuery.trim() && (
                  <div style={{ marginBottom: 14, backgroundColor: "#fff", borderRadius: 8, border: "1px solid #bae6fd", padding: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", marginBottom: 6 }}>Résultats ({filteredParkings.length})</div>
                    {filteredParkings.map((parking) => (
                      <div key={parking.id} onClick={() => handleSelectParkingItem(parking)} style={{ padding: "6px 10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                        <strong>{parking.nom}</strong> · {parking.code}
                      </div>
                    ))}
                  </div>
                )}

                {activeParking && (
                  <div style={{ backgroundColor: "#fff", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ backgroundColor: "#001E3D", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{activeParking.numeroPin}</span>
                      <Tag color={activeParking.statut === "ACTIF" ? "green" : "orange"}>{activeParking.statut}</Tag>
                      <Tag>{activeParking.code}</Tag>
                    </div>
                    <Title level={4} style={{ color: "#003566", margin: "0 0 8px", fontSize: 16 }}>{activeParking.nom}</Title>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}><EnvironmentOutlined style={{ marginRight: 6, color: "#0284c7" }} />{activeParking.adresse}</div>
                    <div style={{ marginBottom: 14 }}>{getStatusTag(activeParking.statutSaturation)}</div>
                    <div style={{ backgroundColor: "#f0f9ff", padding: "12px 14px", borderRadius: 10, border: "1px solid #bae6fd", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 700 }}><BuildOutlined style={{ marginRight: 6 }} />Places abonnés disponibles</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a", marginTop: 4 }}>{activeParking.placesDisponiblesAbonnements} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>/ {activeParking.capaciteReserveeAbonnements}</span></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 12 }}>
                      <div><strong>Capacité totale :</strong><br />{activeParking.capaciteTotale}</div>
                      <div><strong>Places occupées :</strong><br />{activeParking.placesOccupeesAbonnements}</div>
                      <div><strong>Taux d'occupation :</strong><br />{activeParking.tauxOccupationAbonnements}%</div>
                      <div><strong>Souscription :</strong><br />{activeParking.souscriptionDisponible ? "Disponible" : "Indisponible"}</div>
                    </div>
                  </div>
                )}

                {activeParking && (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {role === "AGENT" && <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/agent/demandes?parkingId=${activeParking.id}`)}>Traitement Guichet pour ce Parking</Button>}
                    {role === "SUPERVISEUR" && <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/superviseur/recettes?parkingId=${activeParking.id}`)}>Superviser ce Parking</Button>}
                    {role === "COMPTABLE" && <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/comptable/recettes?parkingId=${activeParking.id}`)}>Consulter ce Parking</Button>}
                    {role === "RESPONSABLE" && <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/responsable/parkings`)}>Gérer les Parkings</Button>}
                    {role === "ADMIN_SI" && <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(`/admin/parkings`)}>Configurer les Parkings</Button>}
                    {(!role || role === "RESP_REPORTING") && <Button type="primary" block size="large" icon={<ArrowRightOutlined />} disabled={!activeParking.souscriptionDisponible} onClick={() => navigate(`/demande-publique?parkingId=${activeParking.id}`)}>Souscrire un Abonnement</Button>}
                    <Button block icon={<GlobalOutlined style={{ color: "#4285F4" }} />} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${activeParking.latitude},${activeParking.longitude}`, "_blank")}>Ouvrir l'itinéraire dans Google Maps</Button>
                  </Space>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}
