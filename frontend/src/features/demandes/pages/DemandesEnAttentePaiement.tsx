import axios from "axios";
import { Alert, Button, Empty, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { listerDemandesEnAttentePaiement } from "../../../api/demandesApi";
import type { DemandeRechercheResponse } from "../types";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";


function formaterDate(date?: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function obtenirErreur(error: unknown) {
  if (
    axios.isAxiosError<{ detail?: string }>(error)
    && error.response?.data?.detail
  ) {
    return error.response.data.detail;
  }

  return "Impossible de charger les demandes en attente de paiement.";
}

export function DemandesEnAttentePaiement() {
  const navigate = useNavigate();
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["demandes", "en-attente-paiement"],
    queryFn: listerDemandesEnAttentePaiement,
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
    },
    {
      title: "CIN / IDENTIFIANT",
      dataIndex: "identifiantClient",
      key: "identifiantClient",
      render: (value?: string) => value || "—",
    },
    {
      title: "TYPE DE DEMANDE",
      dataIndex: "typeDemande",
      key: "typeDemande",
      render: (value: string) => value.replaceAll("_", " "),
    },
    {
      title: "STATUT",
      dataIndex: "statut",
      key: "statut",
      render: (value: string) => (
        <Tag color="gold">
          {value.replaceAll("_", " ")}
        </Tag>
      ),
    },
    {
      title: "VALIDATION OTP",
      dataIndex: "dateValidationOtp",
      key: "dateValidationOtp",
      render: formaterDate,
    },
    {
      title: "TÉLÉPHONE",
      dataIndex: "telephone",
      key: "telephone",
      render: (value?: string) => value || "—",
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, demande) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/agent/demandes/${demande.id}`)
          }
        >
          Plus de détails
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Demandes en attente de paiement
          </h1>

          <p className="text-sm text-slate-500">
            Liste chargée depuis le backend.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={isLoading}
          onClick={() => void refetch()}
        >
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Erreur de chargement"
          description={obtenirErreur(error)}
        />
      )}

      <Table<DemandeRechercheResponse>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: (
            <Empty description="Aucune demande en attente de paiement" />
          ),
        }}
      />
    </section>
  );
}