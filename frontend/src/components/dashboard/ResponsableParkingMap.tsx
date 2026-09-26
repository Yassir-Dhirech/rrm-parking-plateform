import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Segmented, Spin, Typography } from "antd";
import { EnvironmentOutlined, SettingOutlined } from "@ant-design/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPublicParkings, type Parking } from "../../api/parkings";

const { Text } = Typography;

type MapStyle = "satellite" | "standard";

const RABAT_CENTER: L.LatLngExpression = [34.0209, -6.8416];
const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY?.trim();

const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>';

function getTileLayers(): Record<MapStyle, { url: string; attribution: string; maxZoom: number }> {
  const key = encodeURIComponent(MAPTILER_API_KEY ?? "");

  return {
    satellite: {
      url: `https://api.maptiler.com/maps/hybrid-v4/256/{z}/{x}/{y}.png?key=${key}`,
      attribution: MAPTILER_ATTRIBUTION,
      maxZoom: 19,
    },
    standard: {
      url: `https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${key}`,
      attribution: MAPTILER_ATTRIBUTION,
      maxZoom: 19,
    },
  };
}

function createSubscriptionMarker(count: number) {
  const displayedCount = count > 999 ? "999+" : String(count);

  return L.divIcon({
    className: "responsable-parking-marker-host",
    html: `
      <div class="responsable-parking-marker" aria-label="${count} abonnements">
        <span class="responsable-parking-marker__pulse" aria-hidden="true"></span>
        <span class="responsable-parking-marker__ring" aria-hidden="true"></span>
        <span class="responsable-parking-marker__core" aria-hidden="true"></span>
        <span class="responsable-parking-marker__count">${displayedCount}</span>
      </div>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
}

function ParkingCapacityGauge({
  total,
  reserved,
}: {
  total: number;
  reserved: number;
}) {
  const safeTotal = Math.max(total, 0);
  const safeReserved = Math.min(Math.max(reserved, 0), safeTotal);
  const percentage = safeTotal > 0 ? (safeReserved / safeTotal) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 10) / 10;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 190,
      }}
    >
      <svg
        viewBox="0 0 220 120"
        role="img"
        aria-label={`${roundedPercentage}% des places sont réservées aux abonnements`}
        style={{ width: "100%", maxWidth: 220, height: 116 }}
      >
        <path
          d="M 20 108 A 90 90 0 0 1 200 108"
          fill="none"
          stroke="#e8e8e8"
          strokeWidth="18"
          strokeLinecap="round"
          pathLength="100"
        />
        <path
          d="M 20 108 A 90 90 0 0 1 200 108"
          fill="none"
          stroke="#0078d4"
          strokeWidth="18"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${roundedPercentage} ${100 - roundedPercentage}`}
        />
        <text
          x="110"
          y="83"
          textAnchor="middle"
          style={{
            fontFamily: '"Segoe UI", Inter, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            fill: "#242424",
          }}
        >
          {roundedPercentage}%
        </text>
        <text
          x="110"
          y="103"
          textAnchor="middle"
          style={{
            fontFamily: '"Segoe UI", Inter, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            fill: "#616161",
          }}
        >
          places abonnements
        </text>
      </svg>
    </div>
  );
}

export function ResponsableParkingMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>("satellite");
  const tileLayers = useMemo(() => getTileLayers(), []);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const geolocatedParkings = useMemo(
    () =>
      parkings.filter(
        (parking): parking is Parking & { latitude: number; longitude: number } =>
          Number.isFinite(parking.latitude) && Number.isFinite(parking.longitude),
      ),
    [parkings],
  );

  const selectedParking = useMemo(
    () =>
      parkings.find((parking) => parking.id === selectedParkingId) ??
      geolocatedParkings[0] ??
      parkings[0] ??
      null,
    [geolocatedParkings, parkings, selectedParkingId],
  );

  const selectedParkingPercentage =
    selectedParking && selectedParking.capaciteTotale > 0
      ? (selectedParking.capaciteReserveeAbonnements / selectedParking.capaciteTotale) * 100
      : 0;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getPublicParkings()
      .then((data) => {
        if (!cancelled) {
          setParkings(data);
          setSelectedParkingId((current) => current ?? data[0]?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger les parkings.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: RABAT_CENTER,
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    if (!MAPTILER_API_KEY) {
      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      return () => {
        map.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        markersLayerRef.current = null;
      };
    }

    const initialLayer = tileLayers.satellite;
    tileLayerRef.current = L.tileLayer(initialLayer.url, {
      attribution: initialLayer.attribution,
      maxZoom: initialLayer.maxZoom,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [tileLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !MAPTILER_API_KEY) {
      return;
    }

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layer = tileLayers[mapStyle];
    tileLayerRef.current = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom,
    }).addTo(map);

    tileLayerRef.current.bringToBack();
  }, [mapStyle, tileLayers]);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) {
      return;
    }

    markersLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    geolocatedParkings.forEach((parking) => {
      const position: L.LatLngExpression = [parking.latitude, parking.longitude];
      const marker = L.marker(position, {
        icon: createSubscriptionMarker(parking.placesOccupeesAbonnements),
        keyboard: true,
        title: parking.nom,
      });

      marker.bindTooltip(parking.nom, {
        direction: "top",
        offset: [0, -18],
        opacity: 0.95,
      });

      marker.on("click", () => {
        setSelectedParkingId(parking.id);
      });

      marker.addTo(markersLayer);
      bounds.extend(position);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [34, 34],
        maxZoom: 14,
      });
    }
  }, [geolocatedParkings]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card
      className="responsable-map-card"
      bordered={false}
      title={
        <div className="responsable-map-card__title">
          <EnvironmentOutlined className="responsable-map-card__title-icon" />
          <span className="responsable-map-card__title-text">Réseau des parkings</span>
        </div>
      }
      extra={
        <Segmented
          className="responsable-map-style-toggle"
          size="small"
          value={mapStyle}
          onChange={(value) => setMapStyle(value as MapStyle)}
          options={[
            { label: "Satellite", value: "satellite" },
            { label: "Standard", value: "standard" },
          ]}
        />
      }
      styles={{
        header: {
          minHeight: 62,
          borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
          paddingInline: 18,
          background: "transparent",
        },
        body: {
          padding: 12,
          background: "transparent",
        },
      }}
      style={{
        background: "rgba(0, 0, 0, 0.53)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        borderRadius: 18,
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.30)",
        overflow: "hidden",
        backdropFilter: "blur(50px)",
        WebkitBackdropFilter: "blur(50px)",
      }}
    >
      <style>{`
        .responsable-map-card__title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .responsable-map-card__title-icon {
          color: #57cfff;
          font-size: 18px;
        }

        .responsable-map-card__title-text {
          color: #e7f6ff;
          font-family: "Segoe UI", Inter, sans-serif;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: -0.02em;
        }

        .responsable-map-style-toggle.ant-segmented {
          background: rgba(0, 0, 0, 0.53);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 12px;
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.26),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          -webkit-backdrop-filter: blur(50px);
          backdrop-filter: blur(50px);
        }

        .responsable-map-style-toggle .ant-segmented-item {
          color: rgba(222, 241, 255, 0.82);
          font-weight: 500;
        }

        .responsable-map-style-toggle .ant-segmented-item-selected {
          background: rgba(255, 255, 255, 0.10);
          color: #ffffff;
          box-shadow: none;
        }

        .responsable-parking-marker-host {
          background: transparent;
          border: 0;
        }

        .responsable-parking-marker {
          position: relative;
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .responsable-parking-marker__pulse {
          position: absolute;
          inset: 11px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(96, 221, 255, 0.34) 0%, rgba(96, 221, 255, 0.04) 70%, rgba(96, 221, 255, 0) 100%);
          filter: blur(4px);
        }

        .responsable-parking-marker__ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          border: 1.5px solid rgba(127, 229, 255, 0.9);
          box-shadow:
            0 0 18px rgba(72, 191, 255, 0.68),
            inset 0 0 12px rgba(144, 232, 255, 0.22);
          background: rgba(8, 22, 44, 0.28);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }

        .responsable-parking-marker__core {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, #ecffff 0%, #7ce2ff 45%, #1ca8ff 100%);
          box-shadow:
            0 0 16px rgba(111, 231, 255, 0.95),
            0 0 28px rgba(64, 196, 255, 0.65);
        }

        .responsable-parking-marker__count {
          position: absolute;
          top: -2px;
          right: -4px;
          min-width: 24px;
          height: 24px;
          padding: 0 7px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(5, 13, 24, 0.82);
          color: #c9f5ff;
          border: 1px solid rgba(122, 223, 255, 0.62);
          font-family: "Segoe UI", Inter, sans-serif;
          font-size: 11px;
          font-weight: 700;
          line-height: 1;
          box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.28),
            0 0 14px rgba(53, 192, 255, 0.22);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
        }

        .responsable-dashboard-map .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 12px;
          box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.26),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          overflow: hidden;
          -webkit-backdrop-filter: blur(26px);
          backdrop-filter: blur(26px);
        }

        .responsable-dashboard-map .leaflet-control-zoom a {
          width: 34px;
          height: 34px;
          line-height: 32px;
          color: #e8f7ff;
          background: rgba(0, 0, 0, 0.53);
          font-family: "Segoe UI", Inter, sans-serif;
          font-weight: 500;
        }

        .responsable-dashboard-map .leaflet-control-zoom a:hover {
          color: #57cfff;
          background: rgba(255, 255, 255, 0.06);
        }
      `}</style>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 12 }}
        />
      )}

      {!MAPTILER_API_KEY && (
        <Alert
          type="warning"
          showIcon
          message="Clé MapTiler non configurée"
          description="Ajoutez RRM_MAPTILER_API_KEY dans votre fichier .env puis reconstruisez le frontend."
          style={{ marginBottom: 12 }}
        />
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(0, 0, 0, 0.30)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          ref={mapContainerRef}
          className="responsable-dashboard-map"
          style={{ width: "100%", height: "100%" }}
        />

        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.72)",
              backdropFilter: "blur(2px)",
            }}
          >
            <Spin size="large" />
          </div>
        )}

        {!loading && !error && geolocatedParkings.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.88)",
            }}
          >
            <Text type="secondary">Aucun parking géolocalisé disponible.</Text>
          </div>
        )}
      </div>
      </Card>

      <Card
      className="responsable-map-card"
      bordered={false}
        title={
          <span style={{ fontWeight: 700, color: "#242424" }}>Détails du parking</span>
        }
        styles={{
          header: {
            minHeight: 52,
            borderBottom: "1px solid #edebe9",
            paddingInline: 16,
          },
          body: {
            height: 268,
            padding: "16px 18px 14px",
          },
        }}
        style={{
          width: "100%",
          height: 320,
          background: "#ffffff",
          border: "1px solid #edebe9",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
        }}
      >
        {selectedParking ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(170px, 0.85fr)",
                gap: 16,
                alignItems: "center",
                minHeight: 184,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 16,
                    color: "#242424",
                    fontSize: 17,
                  }}
                >
                  {selectedParking.nom}
                </Text>

                {[
                  ["Places totales", selectedParking.capaciteTotale],
                  ["Places réservées aux abonnements", selectedParking.capaciteReserveeAbonnements],
                  ["Part réservée", `${Math.round(selectedParkingPercentage * 10) / 10}%`],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {label}
                    </Text>
                    <Text strong style={{ color: "#242424", whiteSpace: "nowrap" }}>
                      {value}
                    </Text>
                  </div>
                ))}
              </div>

              <ParkingCapacityGauge
                total={selectedParking.capaciteTotale}
                reserved={selectedParking.capaciteReserveeAbonnements}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="primary" icon={<SettingOutlined />}>
                Gérer parking
              </Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text type="secondary">Aucun parking disponible.</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
