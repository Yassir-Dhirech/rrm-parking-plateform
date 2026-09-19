import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  EyeOutlined,
  FileDoneOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  extraireErreurFacturation,
  genererFacturePourDemande,
  listerDemandesValideesPourFacturation,
  telechargerFacturePdf,
} from "../../../api/facturationApi";
import { roleConfig } from "../../../lib/roleConfig";
import { useAuth } from "../../../context/AuthContext";
import type { DemandeFacturationResponse } from "../../factures/facturationTypes";

type Ordre = "ANCIEN" | "RECENT";

function dateFr(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function montant(value: number): string {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`;
}

export function DemandesValidees() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "/responsable";
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [ordre, setOrdre] = useState<Ordre>("ANCIEN");

  const query = useQuery({
    queryKey: ["demandes", "validees", recherche, ordre],
    queryFn: () => listerDemandesValideesPourFacturation(recherche, ordre),
  });

  const generation = useMutation({
    mutationFn: genererFacturePourDemande,
    onSuccess: async (facture) => {
      message.success(`Facture ${facture.numero} générée avec succès.`);
      await queryClient.invalidateQueries({
        queryKey: ["demandes", "validees"],
      });
      const url = await telechargerFacturePdf(facture.id);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    onError: (error) => {
      message.error(extraireErreurFacturation(error));
    },
  });

  const columns: ColumnsType<DemandeFacturationResponse> = [
    {
      title: "RÉFÉRENCE",
      dataIndex: "referenceDemande",
      key: "referenceDemande",
    },
    {
      title: "CLIENT / CIN",
      key: "client",
      render: (_, row) => (
        <div>
          <strong>{row.clientNom}</strong>
          <div className="text-xs text-slate-500">{row.cin}</div>
        </div>
      ),
    },
    {
      title: "PARKING",
      dataIndex: "parkingNom",
      key: "parkingNom",
    },
    {
      title: "TOTAL TTC",
      dataIndex: "montantTotalTtc",
      key: "montantTotalTtc",
      render: (value: number) => <strong>{montant(value)}</strong>,
    },
    {
      title: "VALIDATION",
      dataIndex: "dateModification",
      key: "dateModification",
      render: dateFr,
    },
    {
      title: "FACTURE",
      key: "facture",
      render: (_, row) => row.factureId ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {row.factureNumero}
        </Tag>
      ) : (
        <Tag color="orange">À générer</Tag>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`${basePath}/demandes/${row.demandeId}`)}
          >
            Détail
          </Button>
          {row.factureId ? (
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={async () => {
                const url = await telechargerFacturePdf(row.factureId!);
                window.open(url, "_blank", "noopener,noreferrer");
                window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
              }}
            >
              Imprimer
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<FileDoneOutlined />}
              loading={generation.isPending
                && generation.variables === row.demandeId}
              onClick={() => generation.mutate(row.demandeId)}
            >
              Générer facture
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Demandes validées — facturation
        </h1>
        <p className="text-sm text-slate-500">
          Consultez les dossiers validés, générez leur facture officielle et imprimez-la.
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
          message="Impossible de charger les demandes validées"
          description={extraireErreurFacturation(query.error)}
        />
      )}

      <Table<DemandeFacturationResponse>
        rowKey="demandeId"
        columns={columns}
        dataSource={query.data ?? []}
        loading={query.isLoading}
        scroll={{ x: 1250 }}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: <Empty description="Aucune demande validée" />,
        }}
      />
    </section>
  );
}
