import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Empty, Input, Modal, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  declarerCarteActivee,
  declarerCarteImprimee,
  confirmerRemiseCarte,
  extraireErreurOperationCarte,
  listerDemandesActivation,
  listerDemandesImpression,
  listerCartesARemettre,
} from "../../../api/operationsCartesApi";
import type { DemandeOperationnelleCarte, TypeOperationCarte } from "../operationCarteTypes";

export function OperationsCartesPage({ type }: { type: TypeOperationCarte }) {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<DemandeOperationnelleCarte | null>(null);
  const [numeroCarte, setNumeroCarte] = useState("");
  const impression = type === "IMPRESSION";
  const activation = type === "ACTIVATION";
  const queryKey = ["operations-cartes", type];
  const query = useQuery({
    queryKey,
    queryFn: impression
      ? listerDemandesImpression
      : activation
        ? listerDemandesActivation
        : listerCartesARemettre,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selection) throw new Error("Aucune demande sélectionnée");
      if (impression) {
        return declarerCarteImprimee(selection.id, numeroCarte);
      }
      if (activation) {
        return declarerCarteActivee(selection.id);
      }
      return confirmerRemiseCarte(selection.id);
    },
    onSuccess: async () => {
      message.success(
        impression
          ? "Carte déclarée imprimée. La demande d'activation a été créée."
          : activation
            ? "Carte activée et testée. Le client sera informé par e-mail."
            : "La récupération de la carte a été confirmée."
      );
      setSelection(null);
      setNumeroCarte("");
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const columns: ColumnsType<DemandeOperationnelleCarte> = [
    { title: "RÉFÉRENCE", dataIndex: "reference" },
    { title: "CLIENT", dataIndex: "nomClient" },
    { title: "CIN / ICE", dataIndex: "cin" },
    { title: "DEMANDE", dataIndex: "referenceDemandeClient" },
    { title: "CARTE", dataIndex: "referenceCarte" },
    { title: "N° PHYSIQUE", dataIndex: "numeroCarte", render: (v) => v || "—" },
    { title: "PARKING", dataIndex: "parkingNom" },
    {
      title: "FACTURE",
      dataIndex: "numeroFacture",
      render: (v) => v ? <Tag color="green">{v}</Tag> : <Tag color="orange">À générer</Tag>,
    },
    {
      title: "ACTION",
      fixed: "right",
      render: (_, row) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          disabled={activation && !row.factureId}
          title={activation && !row.factureId
            ? "Le responsable doit d'abord générer la facture"
            : undefined}
          onClick={() => setSelection(row)}
        >
          {impression
            ? "Déclarer imprimée"
            : activation
              ? "Déclarer activée et testée"
              : "Confirmer la récupération"}
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          {impression
            ? "Demandes d'impression des cartes"
            : activation
              ? "Demandes d'activation et de test"
              : "Cartes à remettre aux clients"}
        </h1>
        <p className="text-sm text-slate-500">
          {impression
            ? "Imprimez la carte puis saisissez son numéro physique."
            : activation
              ? "Après activation dans les barrières et test réussi, confirmez l'opération."
              : "Confirmez la récupération de la carte par le client."}
        </p>
      </div>
      <Space>
        <Button icon={<ReloadOutlined />} loading={query.isFetching} onClick={() => void query.refetch()}>
          Actualiser
        </Button>
      </Space>
      {query.isError && <Alert type="error" showIcon message="Chargement impossible" description={extraireErreurOperationCarte(query.error)} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={query.data ?? []}
        loading={query.isLoading}
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="Aucune demande en attente" /> }}
      />
      <Modal
        open={Boolean(selection)}
        title={impression
          ? "Confirmer l'impression"
          : activation
            ? "Confirmer l'activation et le test"
            : "Confirmer la récupération"}
        okText={impression
          ? "Carte imprimée"
          : activation
            ? "Carte activée et testée"
            : "Carte remise au client"}
        cancelText="Annuler"
        confirmLoading={mutation.isPending}
        okButtonProps={{ disabled: impression && !numeroCarte.trim() }}
        onCancel={() => { setSelection(null); setNumeroCarte(""); }}
        onOk={() => mutation.mutate()}
      >
        {mutation.isError && <Alert className="mb-4" type="error" showIcon message={extraireErreurOperationCarte(mutation.error)} />}
        {impression ? (
          <Input
            value={numeroCarte}
            maxLength={100}
            placeholder="Numéro physique de la carte"
            onChange={(event) => setNumeroCarte(event.target.value)}
          />
        ) : activation ? (
          <p>
            Confirmez uniquement après l’activation dans les systèmes de barrière et un test réussi.
            La facture doit déjà avoir été générée par le responsable.
          </p>
        ) : (
          <p>
            Confirmez que le client a effectivement récupéré sa carte d’accès.
            L’agent et la date de remise seront enregistrés automatiquement.
          </p>
        )}
      </Modal>
    </section>
  );
}
