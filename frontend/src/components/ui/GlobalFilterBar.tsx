import { Select, DatePicker, Button, Tag } from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getParkingsMock } from "../../api/adminMock";

const { RangePicker } = DatePicker;

export interface GlobalFilters {
  parkingId?: number;
  statut?: string;
  periode?: [string, string];
}

interface GlobalFilterBarProps {
  filters: GlobalFilters;
  onChange: (filters: GlobalFilters) => void;
}

export function GlobalFilterBar({ filters, onChange }: GlobalFilterBarProps) {
  const { data: parkings } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
  });

  const activeFiltersCount =
    (filters.parkingId ? 1 : 0) + (filters.periode ? 1 : 0) + (filters.statut ? 1 : 0);

  const handleReset = () => {
    onChange({});
  };

  const handleSetPreset = (preset: "month" | "last30" | "year2026") => {
    if (preset === "month") {
      onChange({
        ...filters,
        periode: [
          dayjs().startOf("month").format("YYYY-MM-DD"),
          dayjs().endOf("month").format("YYYY-MM-DD"),
        ],
      });
    } else if (preset === "last30") {
      onChange({
        ...filters,
        periode: [
          dayjs().subtract(30, "day").format("YYYY-MM-DD"),
          dayjs().format("YYYY-MM-DD"),
        ],
      });
    } else if (preset === "year2026") {
      onChange({
        ...filters,
        periode: ["2026-01-01", "2026-12-31"],
      });
    }
  };

  const isCurrentMonthActive =
    filters.periode &&
    filters.periode[0] === dayjs().startOf("month").format("YYYY-MM-DD") &&
    filters.periode[1] === dayjs().endOf("month").format("YYYY-MM-DD");

  const isLast30Active =
    filters.periode &&
    filters.periode[0] === dayjs().subtract(30, "day").format("YYYY-MM-DD") &&
    filters.periode[1] === dayjs().format("YYYY-MM-DD");

  const isYearActive =
    filters.periode &&
    filters.periode[0] === "2026-01-01" &&
    filters.periode[1] === "2026-12-31";

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 shadow-xs transition-all duration-200 hover:shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Filter label & active counter */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-base font-bold shadow-xs">
            <FilterOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Filtrage Analytique
              </span>
              {activeFiltersCount > 0 ? (
                <Tag color="blue" className="font-bold text-[10px] m-0 px-2 py-0.5 rounded-full border-none">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                </Tag>
              ) : (
                <Tag className="text-[10px] m-0 px-2 py-0.5 rounded-full border-slate-200 text-slate-400 bg-slate-50">
                  Vue globale
                </Tag>
              )}
            </div>
            
          </div>
        </div>

        {/* Right: Controls (Parking, Date Range, Presets & Reset) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Parking Selector */}
          <div className="min-w-[210px] sm:w-[230px]">
            <Select
              placeholder="Tous les Parkings du Réseau"
              allowClear
              value={filters.parkingId}
              onChange={(val) => onChange({ ...filters, parkingId: val })}
              className="w-full h-9"
              suffixIcon={<EnvironmentOutlined className="text-slate-400" />}
              options={parkings?.map((p) => ({
                value: p.id,
                label: p.nom,
              }))}
            />
          </div>

          {/* Date Range Picker with DD/MM/YYYY formatting */}
          <div className="min-w-[240px]">
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={["Date début", "Date fin"]}
              value={
                filters.periode
                  ? [dayjs(filters.periode[0]), dayjs(filters.periode[1])]
                  : null
              }
              className="w-full h-9 rounded-lg"
              suffixIcon={<CalendarOutlined className="text-slate-400" />}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  onChange({
                    ...filters,
                    periode: [
                      dates[0].format("YYYY-MM-DD"),
                      dates[1].format("YYYY-MM-DD"),
                    ],
                  });
                } else {
                  onChange({ ...filters, periode: undefined });
                }
              }}
            />
          </div>

          {/* Quick Presets for fast reporting */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100/70 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleSetPreset("month")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                isCurrentMonthActive
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ce Mois
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset("last30")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                isLast30Active
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Jours
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset("year2026")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                isYearActive
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2026
            </button>
          </div>

          {/* Reset Action */}
          {activeFiltersCount > 0 ? (
            <Button
              icon={<CloseCircleOutlined />}
              onClick={handleReset}
              className="h-9 px-3 rounded-lg border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 font-semibold text-xs"
            >
              Réinitialiser
            </Button>
          ) : (
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              type="text"
              disabled
              className="h-9 px-2 text-slate-400 text-xs"
            >
              Aucun filtre
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}