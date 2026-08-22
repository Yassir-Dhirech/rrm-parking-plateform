import { Card, Select, DatePicker, Space, Button } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
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

  const handleReset = () => {
    onChange({});
  };

  return (
    <Card size="small" style={{ marginBottom: 20, background: "#fcfcfc" }}>
      <Space wrap size="middle">
        <span style={{ fontWeight: 600, color: "#006666" }}>
          <FilterOutlined /> Filtres Globaux :
        </span>

        {/* Filtre par Parking */}
        <Select
          placeholder="Tous les Parkings"
          style={{ width: 240 }}
          allowClear
          value={filters.parkingId}
          onChange={(val) => onChange({ ...filters, parkingId: val })}
          options={parkings?.map((p) => ({ value: p.id, label: p.nom }))}
        />

        {/* Filtre par Période / Plage de dates */}
        <RangePicker
          format="YYYY-MM-DD"
          placeholder={["Date début", "Date fin"]}
          onChange={(_, dateStrings) => {
            if (dateStrings[0] && dateStrings[1]) {
              onChange({ ...filters, periode: [dateStrings[0], dateStrings[1]] });
            } else {
              onChange({ ...filters, periode: undefined });
            }
          }}
        />

        {/* Réinitialisation */}
        <Button icon={<ReloadOutlined />} onClick={handleReset} type="text">
          Réinitialiser
        </Button>
      </Space>
    </Card>
  );
}