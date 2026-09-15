import { useState } from "react";
import { Table, Card, Typography, Button, Tag, Space, Tooltip } from "antd";
import {
  ScanOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContratsMock, enregistrerScanContratMock } from "../../../api/contratsMock";
import { type ContratListItem, type ContratScanInfo } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { ScannerContratModal } from "../components/ScannerContratModal";
import { VisualiserScanContratModal } from "../components/VisualiserScanContratModal";

const { Title } = Typography;

export function ContratsList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";
  const queryClient = useQueryClient();

  const [selectedContratToScan, setSelectedContratToScan] = useState<ContratListItem | null>(null);
  const [selectedContratToView, setSelectedContratToView] = useState<ContratListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contrats"],
    queryFn: getContratsMock,
  });

  const scanMutation = useMutation({
    mutationFn: ({ id, scanInfo }: { id: number; scanInfo: ContratScanInfo }) =>
      enregistrerScanContratMock(id, scanInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrats"] });
      setSelectedContratToScan(null);
    },
  });

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      sorter: (a: ContratListItem, b: ContratListItem) => a.reference.localeCompare(b.reference),
    },
    {
      title: "Entreprise",
      dataIndex: "entrepriseNom",
      key: "entrepriseNom",
      sorter: (a: ContratListItem, b: ContratListItem) => a.entrepriseNom.localeCompare(b.entrepriseNom),
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
      filters: [
        { text: "Parking Agdal Gare", value: "Parking Agdal Gare" },
        { text: "Parking Bab El Had", value: "Parking Bab El Had" },
        { text: "Parking Hassan II", value: "Parking Hassan II" },
        { text: "Parking Chellah", value: "Parking Chellah" },
      ],
      onFilter: (value: any, record: ContratListItem) => record.parkingNom.includes(value as string),
      filterSearch: true,
      sorter: (a: ContratListItem, b: ContratListItem) => a.parkingNom.localeCompare(b.parkingNom),
    },
    {
      title: "Places",
      dataIndex: "nombrePlaces",
      key: "nombrePlaces",
      sorter: (a: ContratListItem, b: ContratListItem) => a.nombrePlaces - b.nombrePlaces,
    },
    {
      title: "Montant TTC / mois",
      dataIndex: "montantMensuelTTC",
      key: "montantMensuelTTC",
      sorter: (a: ContratListItem, b: ContratListItem) => a.montantMensuelTTC - b.montantMensuelTTC,
      render: (value: number) => `${value.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      filters: [
        { text: "Signé", value: "SIGNE" },
        { text: "En attente de signature", value: "EN_ATTENTE_SIGNATURE" },
        { text: "Résilié", value: "RESILIE" },
        { text: "Expiré", value: "EXPIRE" },
      ],
      onFilter: (value: any, record: ContratListItem) => record.statut === value,
      render: (statut: ContratListItem["statut"]) => (
        <StatusBadge statut={statut} />
      ),
    },
    {
      title: "Scan Contrat",
      key: "scanInfo",
      render: (_: any, record: ContratListItem) => {
        if (record.scanInfo?.scanne) {
          return (
            <Tooltip title={`Numérisé le ${record.scanInfo.dateScan} par ${record.scanInfo.scannePar}`}>
              <Tag
                color="success"
                icon={<CheckCircleOutlined />}
                style={{ cursor: "pointer", fontWeight: 600 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContratToView(record);
                }}
              >
                Numérisé ({record.scanInfo.nombrePages}p)
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontWeight: 600 }}>
            À scanner
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_: any, record: ContratListItem) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`${basePath}/contrats/${record.id}`)}
            style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700, borderRadius: 6 }}
          >
            Détails
          </Button>

          {record.scanInfo?.scanne ? (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedContratToView(record)}
              style={{ borderColor: "#006398", color: "#006398", fontWeight: 600, borderRadius: 6 }}
            >
              Scan
            </Button>
          ) : role === "RESPONSABLE" ? (
            <Button
              size="small"
              icon={<ScanOutlined />}
              onClick={() => setSelectedContratToScan(record)}
              style={{
                backgroundColor: "#0284c7",
                borderColor: "#0284c7",
                color: "#ffffff",
                fontWeight: 700,
                borderRadius: 6,
              }}
            >
              Scanner
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4} style={{ color: "#003566", margin: 0, marginBottom: 16 }}>
        Gestion de la Situation des Contrats Corporate
      </Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        scroll={{ x: 1200 }}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/contrats/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      {/* Modal Scanner Contrat */}
      {selectedContratToScan && (
        <ScannerContratModal
          open={!!selectedContratToScan}
          onClose={() => setSelectedContratToScan(null)}
          contratReference={selectedContratToScan.reference}
          entrepriseNom={selectedContratToScan.entrepriseNom}
          onScanSuccess={(scanInfo: ContratScanInfo) =>
            scanMutation.mutate({ id: selectedContratToScan.id, scanInfo })
          }
        />
      )}

      {/* Modal Visualiser Scan */}
      {selectedContratToView && (
        <VisualiserScanContratModal
          open={!!selectedContratToView}
          onClose={() => setSelectedContratToView(null)}
          contrat={selectedContratToView}
          scanInfo={selectedContratToView.scanInfo}
        />
      )}
    </Card>
  );
}