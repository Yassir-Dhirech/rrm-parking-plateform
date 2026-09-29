import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SuperviseurParking } from "../../api/superviseurDashboard";

interface Props {
  parkings: SuperviseurParking[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function SuperviseurMap({ parkings, selectedId, onSelect }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!element.current) return;
    const instance = L.map(element.current, { scrollWheelZoom: false }).setView([34.015, -6.838], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(instance);
    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(element.current);
    return () => {
      resize.disconnect();
      instance.remove();
      map.current = null;
      markers.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !markers.current) return;
    markers.current.clearLayers();
    const points: L.LatLngExpression[] = [];
    for (const parking of parkings) {
      const latitude = Number(parking.latitude);
      const longitude = Number(parking.longitude);
      if (!parking.latitude || !parking.longitude || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
      points.push([latitude, longitude]);
      const selected = selectedId === parking.id;
      const icon = L.divIcon({
        className: "superviseur-map-pin",
        html: `<span class="superviseur-map-pin__inner${selected ? " is-selected" : ""}"></span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([latitude, longitude], { icon }).addTo(markers.current);
      const tooltip = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = parking.nom;
      const places = document.createElement("div");
      places.textContent = `${parking.placesLibres} places d'abonnement libres`;
      tooltip.append(title, places);
      marker.bindTooltip(tooltip);
      marker.on("click", () => onSelectRef.current(selectedId === parking.id ? null : parking.id));
    }
    if (points.length) map.current.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 14 });
  }, [parkings, selectedId]);

  return <div className="superviseur-map" ref={element} role="img" aria-label="Carte des parkings affectés" />;
}
