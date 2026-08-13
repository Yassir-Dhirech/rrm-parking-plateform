import React, { useState } from "react";
import { AutoComplete, Input, Tag } from "antd";
import { SearchOutlined, FileTextOutlined, CreditCardOutlined, IdcardOutlined, EnvironmentOutlined, DollarOutlined, FileProtectOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleConfig } from "../../lib/roleConfig";

interface SearchIndexItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  tag?: string;
  tagColor?: string;
  targetPath: string; // relative path segment e.g. "demandes/1"
  icon: React.ReactNode;
}

const mockSearchDatabase: SearchIndexItem[] = [
  // Demandes
  { id: "dem-1", category: "Demandes", title: "DEM-2026-000001", subtitle: "Karim El Amrani • Parking Bab El Had", tag: "SOUMISE", tagColor: "orange", targetPath: "demandes/1", icon: <FileTextOutlined /> },
  { id: "dem-2", category: "Demandes", title: "DEM-2026-000002", subtitle: "Société Atlas Trans • Parking Agdal", tag: "EN_COURS", tagColor: "blue", targetPath: "demandes/2", icon: <FileTextOutlined /> },
  { id: "dem-3", category: "Demandes", title: "DEM-2026-000003", subtitle: "Sara Bennis • Parking Bab El Had", tag: "VALIDEE", tagColor: "green", targetPath: "demandes/3", icon: <FileTextOutlined /> },

  // Recettes
  { id: "rec-1", category: "Recettes", title: "REC-2026-W31-P01", subtitle: "Parking Agdal Gare • 48 500 MAD", tag: "VALIDÉE", tagColor: "green", targetPath: "recettes/1", icon: <DollarOutlined /> },
  { id: "rec-2", category: "Recettes", title: "REC-2026-W32-P01", subtitle: "Parking Agdal Gare • 32 400 MAD", tag: "EN_COURS", tagColor: "orange", targetPath: "recettes/2", icon: <DollarOutlined /> },

  // Abonnements
  { id: "abo-1", category: "Abonnements", title: "ABO-2026-0089", subtitle: "Mohamed Benali • Parking Chellah", tag: "ACTIF", tagColor: "green", targetPath: "abonnements/1", icon: <IdcardOutlined /> },
  { id: "abo-2", category: "Abonnements", title: "ABO-2026-0092", subtitle: "Société Transport Express", tag: "ATTENTE_PAYEMENT", tagColor: "orange", targetPath: "abonnements/2", icon: <IdcardOutlined /> },

  // Contrats
  { id: "ctr-1", category: "Contrats", title: "CTR-2026-042", subtitle: "Contrat Entreprise • Atlas Trans", tag: "SIGNÉ", tagColor: "green", targetPath: "contrats/1", icon: <FileProtectOutlined /> },

  // Cartes
  { id: "crt-1", category: "Cartes", title: "CRT-8849-XYZ", subtitle: "Attribuée à Karim El Amrani", tag: "ACTIVE", tagColor: "green", targetPath: "cartes/1", icon: <CreditCardOutlined /> },

  // Parkings
  { id: "prk-1", category: "Parkings", title: "Parking Agdal Gare", subtitle: "450 places • 12 Agents", tag: "EXPLOITATION", tagColor: "blue", targetPath: "parkings", icon: <EnvironmentOutlined /> },
  { id: "prk-2", category: "Parkings", title: "Parking Bab El Had", subtitle: "320 places • 8 Agents", tag: "EXPLOITATION", tagColor: "blue", targetPath: "parkings", icon: <EnvironmentOutlined /> },
];

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  if (!role) return null;
  const basePath = roleConfig[role].homePath;

  const filteredItems = searchValue.trim().length > 0
    ? mockSearchDatabase.filter(
        (item) =>
          item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.category.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

  const options = filteredItems.map((item) => ({
    value: item.title,
    label: (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 0",
          cursor: "pointer",
        }}
        onClick={() => {
          setSearchValue("");
          // Build absolute target path depending on role & category
          if (item.category === "Parkings" && role === "ADMIN_SI") {
            navigate("/admin/parkings");
          } else {
            navigate(`${basePath}/${item.targetPath}`);
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--color-primary, #003566)", fontSize: 16 }}>{item.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{item.title}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{item.subtitle}</div>
          </div>
        </div>
        {item.tag && <Tag color={item.tagColor}>{item.tag}</Tag>}
      </div>
    ),
  }));

  return (
    <div style={{ width: 280, maxWidth: "100%" }}>
      <AutoComplete
        style={{ width: "100%" }}
        options={options}
        value={searchValue}
        onChange={setSearchValue}
      >
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Rechercher (ex: DEM, REC, Agdal...)"
          allowClear
          style={{
            borderRadius: 20,
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            padding: "4px 12px",
          }}
        />
      </AutoComplete>
    </div>
  );
};
