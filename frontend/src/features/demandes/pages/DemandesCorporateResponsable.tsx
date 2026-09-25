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

const etapes: Record<string, { couleur: string; libelle: string; action: string }> = {
  EN_ATTENTE_VALIDATION_RESPONSABLE: {
    couleur: "purple", libelle: "À VALIDER", action: "Examiner",
  },
  VALIDEE: { couleur: "gold", libelle: "À CONVOQUER", action: "Convoquer" },
  EN_ATTENTE_PAIEMENT_SIGNATURE: {
    couleur: "orange", libelle: "PAIEMENT / SIGNATURE", action: "Paiement",
  },
  EN_ATTENTE_RETOUR_CONTRAT_LEGALISE: {
    couleur: "volcano", libelle: "RETOUR CONTRAT", action: "Déclarer",
  },
  EN_ATTENTE_FACTURATION: {
    couleur: "geekblue", libelle: "À FACTURER", action: "Facturer",
  },
  EN_PREPARATION_CARTES: {
    couleur: "cyan", libelle: "CARTES EN COURS", action: "Suivre",
  },
  PRETE_A_FINALISER: {
    couleur: "green", libelle: "À FINALISER", action: "Finaliser",
  },
};

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
      render: (_, demande) => {
        const etape = etapes[demande.statut] ?? {
          couleur: "default", libelle: demande.statut, action: "Consulter",
        };
        return <Tag color={etape.couleur}>{etape.libelle}</Tag>;
      },
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
          {(etapes[demande.statut] ?? { action: "Consulter" }).action}
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Demandes corporate à traiter
        </h1>
        <p className="text-sm text-slate-500">
          Du contrôle initial jusqu'à la facturation, aux cartes et à la finalisation.
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
        locale={{ emptyText: <Empty description="Aucune demande corporate à traiter" /> }}
      />
    </section>
  );
}
