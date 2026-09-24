import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Empty, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  extraireMessageErreur,
  listerDemandesCorporateAValider,
} from "../../../api/demandesApi";
import type { DemandeRechercheResponse } from "../types";

type Ordre = "ANCIEN" | "RECENT";

function formaterDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function DemandesCorporateResponsable() {
  const navigate = useNavigate();
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [ordre, setOrdre] = useState<Ordre>("ANCIEN");

  const query = useQuery({
    queryKey: ["demandes", "corporate", "a-valider", recherche, ordre],
    queryFn: () => listerDemandesCorporateAValider(recherche, ordre),
  });

  const columns: ColumnsType<DemandeRechercheResponse> = [
    { title: "RÉFÉRENCE", dataIndex: "reference", key: "reference" },
    {
      title: "ENTREPRISE",
      dataIndex: "nomClient",
      key: "nomClient",
      render: (valeur?: string | null) => valeur || "—",
    },
    {
      title: "ICE",
      dataIndex: "identifiantClient",
      key: "identifiantClient",
      render: (valeur?: string | null) => valeur || "—",
    },
    {
      title: "STATUT",
      key: "statut",
      render: () => <Tag color="purple">À VALIDER PAR LE RESPONSABLE</Tag>,
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
      width: 140,
      render: (_, demande) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/responsable/demandes-corporate/${demande.id}`)}
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
          Demandes corporate à valider
        </h1>
        <p className="text-sm text-slate-500">
          Étude des dossiers entreprise avant génération du contrat non signé.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Space wrap style={{ width: "100%" }}>
          <Input
            allowClear
            value={saisie}
            prefix={<SearchOutlined />}
            placeholder="Référence, raison sociale ou ICE"
            style={{ width: 340 }}
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
          message="Impossible de charger les demandes corporate"
          description={extraireMessageErreur(query.error)}
        />
      )}

      <Table<DemandeRechercheResponse>
        rowKey="id"
        columns={columns}
        dataSource={query.data ?? []}
        loading={query.isLoading}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="Aucune demande corporate à valider" /> }}
      />
    </section>
  );
}
