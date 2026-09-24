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
        <span class="responsable-parking-marker__count">${displayedCount}</span>
        <span class="responsable-parking-marker__pointer" aria-hidden="true"></span>
      </div>
    `,
    iconSize: [42, 38],
    iconAnchor: [21, 38],
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
      bordered={false}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EnvironmentOutlined style={{ color: "#0078d4" }} />
          <span style={{ fontWeight: 700, color: "#242424" }}>Réseau des parkings</span>
        </div>
      }
      extra={
        <Segmented
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
          minHeight: 56,
          borderBottom: "1px solid #edebe9",
          paddingInline: 16,
        },
        body: {
          padding: 12,
        },
      }}
      style={{
        background: "#ffffff",
        border: "1px solid #edebe9",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
      }}
    >
      <style>{`
        .responsable-parking-marker-host {
          background: transparent;
          border: 0;
        }

        .responsable-parking-marker {
          position: relative;
          width: 42px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 120, 212, 0.28);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          color: #0f3a5d;
          font-family: "Segoe UI", Inter, sans-serif;
          font-size: 13px;
          font-weight: 700;
          line-height: 1;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(4px);
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
        }

        .responsable-parking-marker__count {
          position: relative;
          z-index: 2;
        }

        .responsable-parking-marker__pointer {
          position: absolute;
          left: 50%;
          bottom: -5px;
          width: 10px;
          height: 10px;
          transform: translateX(-50%) rotate(45deg);
          border-right: 1px solid rgba(0, 120, 212, 0.28);
          border-bottom: 1px solid rgba(0, 120, 212, 0.28);
          background: rgba(255, 255, 255, 0.96);
          border-radius: 0 0 2px 0;
        }

        .responsable-parking-marker::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 7px;
          bottom: 7px;
          width: 3px;
          border-radius: 999px;
          background: #0078d4;
        }

        .responsable-parking-marker:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 120, 212, 0.55);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
        }

        .responsable-dashboard-map .leaflet-control-zoom {
          border: 1px solid #d1d1d1;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        .responsable-dashboard-map .leaflet-control-zoom a {
          width: 32px;
          height: 32px;
          line-height: 30px;
          color: #242424;
          background: #ffffff;
          font-family: "Segoe UI", Inter, sans-serif;
          font-weight: 600;
        }

        .responsable-dashboard-map .leaflet-control-zoom a:hover {
          color: #0078d4;
          background: #f5f5f5;
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
          borderRadius: 6,
          overflow: "hidden",
          background: "#f5f5f5",
          border: "1px solid #e1dfdd",
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
