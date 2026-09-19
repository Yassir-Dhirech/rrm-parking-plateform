import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  extraireMessageErreur,
  listerDemandesAValider,
} from "../../../api/demandesApi";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import type { DemandeRechercheResponse } from "../types";

type Ordre = "ANCIEN" | "RECENT";

function formaterDate(date: string | null): string {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function DemandesAValider() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [ordre, setOrdre] = useState<Ordre>("ANCIEN");

  const basePath = role ? roleConfig[role].homePath : "";
  const query = useQuery({
    queryKey: ["demandes", "a-valider", recherche, ordre],
    queryFn: () => listerDemandesAValider(recherche, ordre),
  });

  const columns: ColumnsType<DemandeRechercheResponse> = [
    {
      title: "RÉFÉRENCE",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "CLIENT",
      dataIndex: "nomClient",
      key: "nomClient",
      render: (value?: string | null) => value || "—",
    },
    {
      title: "CIN",
      dataIndex: "identifiantClient",
      key: "identifiantClient",
      render: (value?: string | null) => value || "—",
    },
    {
      title: "TYPE",
      dataIndex: "typeDemande",
      key: "typeDemande",
      render: (value: string) => value.replaceAll("_", " "),
    },
    {
      title: "STATUT",
      dataIndex: "statut",
      key: "statut",
      render: () => <Tag color="cyan">PAYÉE</Tag>,
    },
    {
      title: "SOUMISSION",
      dataIndex: "dateSoumission",
      key: "dateSoumission",
      render: formaterDate,
    },
    {
      title: "ACTION",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, demande) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`${basePath}/demandes/${demande.id}`)
          }
        >
          Examiner
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Demandes payées à valider
        </h1>
        <p className="text-sm text-slate-500">
          Contrôle final avant création de l’abonnement et demande
          d’impression de la carte.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Space wrap style={{ width: "100%" }}>
          <Input
            allowClear
            value={saisie}
            prefix={<SearchOutlined />}
            placeholder="CIN ou référence de demande"
            style={{ width: 320 }}
            onChange={(event) => setSaisie(event.target.value)}
            onPressEnter={() => setRecherche(saisie.trim())}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => setRecherche(saisie.trim())}
          >
            Rechercher
          </Button>
          <Select<Ordre>
            value={ordre}
            style={{ width: 190 }}
            options={[
              { value: "ANCIEN", label: "Plus anciennes d’abord" },
              { value: "RECENT", label: "Plus récentes d’abord" },
            ]}
            onChange={setOrdre}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Actualiser
          </Button>
        </Space>
      </div>

      {query.isError && (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les demandes"
          description={extraireMessageErreur(query.error)}
        />
      )}

      <Table<DemandeRechercheResponse>
        rowKey="id"
        columns={columns}
        dataSource={query.data ?? []}
        loading={query.isLoading}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: (
            <Empty description="Aucune demande payée à valider" />
          ),
        }}
      />
    </section>
  );
}
