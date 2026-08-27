import { RabatParkingsMap } from "../../../components/map/RabatParkingsMap";
import { EnvironmentOutlined } from "@ant-design/icons";

export function InternalParkingsMapPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-900 m-0 flex items-center gap-2">
          <EnvironmentOutlined className="text-secondary" /> Carte des Parkings RRM
        </h2>
        <p className="text-xs text-slate-500 font-medium m-0 mt-1">
          Visualisation temps réel des parkings, géolocalisation, quotas et disponibilité des abonnements.
        </p>
      </div>

      <RabatParkingsMap height={620} />
    </div>
  );
}
