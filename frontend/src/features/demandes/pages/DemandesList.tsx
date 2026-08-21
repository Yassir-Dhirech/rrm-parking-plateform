import { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tabs,
  Input,
  Tag,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getDemandesMock } from "../../../api/demandesMock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { type TypeDemande, typeDemandeLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";

const { Title, Text } = Typography;

export function DemandesList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchText, setSearchText] = useState<string>("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: getDemandesMock,
  });

  // Filter demandes by tab and search text
  const filteredData = data.filter((item) => {
    if (activeTab === "SOUMISE" && item.statut !== "SOUMISE") return false;
    if (activeTab === "PAIEMENT_ENREGISTRE" && item.statut !== "PAIEMENT_ENREGISTRE") return false;
    if (activeTab === "EN_COURS" && item.statut !== "EN_COURS") return false;
    if (activeTab === "VALIDEE" && item.statut !== "VALIDEE") return false;
    if (activeTab === "REJETEE" && item.statut !== "REJETEE") return false;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchRef = item.reference.toLowerCase().includes(q);
      const matchClient = item.clientNom.toLowerCase().includes(q);
      const matchParking = item.parkingNom.toLowerCase().includes(q);
      return matchRef || matchClient || matchParking;
    }

    return true;
  });

  const countSoumises = data.filter((d) => d.statut === "SOUMISE").length;
  const countPaiementEnregistre = data.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const countValidees = data.filter((d) => d.statut === "VALIDEE").length;

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{ref}</Tag>,
    },
    {
      title: "Type",
      dataIndex: "typeDemande",
      key: "typeDemande",
      render: (value: TypeDemande) => {
        const info = typeDemandeLabels[value] || { label: value, color: "blue" };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "Client / Souscripteur",
      dataIndex: "clientNom",
      key: "clientNom",
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
    },
    {
      title: "Statut Traitement",
      dataIndex: "statut",
      key: "statut",
      render: (statut: string) => {
        let color = "default";
        let label = statut;
        if (statut === "SOUMISE") {
          color = "orange";
          label = "En Attente de Paiement";
        } else if (statut === "PAIEMENT_ENREGISTRE") {
          color = "processing";
          label = "Paiement Enregistré";
        } else if (statut === "VALIDEE") {
          color = "success";
          label = "Validée (Abonnement Actif)";
        } else if (statut === "REJETEE") {
          color = "error";
          label = "Rejetée";
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Date Soumission",
      dataIndex: "dateCreation",
      key: "dateCreation",
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined /> Consultation & Traitement des Demandes Clients
            </Title>
            <Text type="secondary">
              Gérez les encaissements guichet (Agent) et la validation des dossiers (Superviseur).
            </Text>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Rechercher par référence, nom client, immatriculation ou parking..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 450 }}
            allowClear
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "ALL", label: `Toutes les Demandes (${data.length})` },
            { key: "SOUMISE", label: `En Attente de Paiement (${countSoumises})` },
            { key: "PAIEMENT_ENREGISTRE", label: `Paiement Enregistré (${countPaiementEnregistre})` },
            { key: "VALIDEE", label: `Validées (${countValidees})` },
            { key: "REJETEE", label: "Rejetées" },
          ]}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({
            onClick: () => navigate(`${basePath}/demandes/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
}