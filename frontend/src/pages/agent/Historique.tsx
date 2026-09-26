import {
  CreditCardOutlined,
  DollarOutlined,
  EditOutlined,
  FileAddOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Space, Table, Tabs, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  getAgentHistorique,
  type HistoriqueDemandeCreee,
  type HistoriqueOperationCarte,
  type HistoriquePaiementValide,
  type HistoriqueModificationDemande,
} from "../../api/agentHistorique";

const formaterDate = (date?: string | null): string =>
  date
    ? new Intl.DateTimeFormat("fr-MA", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(date))
    : "—";

const formaterMontant = (montant: number): string =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
  }).format(montant);

const texte = (valeur?: string | null): string => valeur || "—";

const formaterDetails = (details: string): string => {
  try {
    return JSON.stringify(JSON.parse(details), null, 2);
  } catch {
    return details;
  }
};

export function AgentHistoriquePage() {
  const historique = useQuery({
    queryKey: ["agent-historique"],
    queryFn: getAgentHistorique,
  });

  const colonnesDemandes: ColumnsType<HistoriqueDemandeCreee> = [
    { title: "RÉFÉRENCE", dataIndex: "reference" },
    {
      title: "TYPE",
      dataIndex: "typeDemande",
      render: (valeur: string) => valeur.replaceAll("_", " "),
    },
    { title: "CLIENT", dataIndex: "nomClient" },
    { title: "PARKING", dataIndex: "parkingNom", render: texte },
    {
      title: "STATUT ACTUEL",
      dataIndex: "statut",
      render: (valeur: string) => <Tag color="blue">{valeur.replaceAll("_", " ")}</Tag>,
    },
    { title: "CRÉÉE LE", dataIndex: "dateCreation", render: formaterDate },
  ];

  const colonnesPaiements: ColumnsType<HistoriquePaiementValide> = [
    { title: "PAIEMENT", dataIndex: "reference" },
    { title: "DEMANDE", dataIndex: "referenceDemande" },
    { title: "CLIENT", dataIndex: "nomClient" },
    { title: "PARKING", dataIndex: "parkingNom", render: texte },
    {
      title: "MODE",
      dataIndex: "modePaiement",
      render: (valeur: string) => <Tag color={valeur === "CHEQUE" ? "gold" : "green"}>{valeur}</Tag>,
    },
    { title: "MONTANT TTC", dataIndex: "montantTtc", render: formaterMontant },
    { title: "VALIDÉ LE", dataIndex: "dateValidation", render: formaterDate },
  ];

  const colonnesOperations: ColumnsType<HistoriqueOperationCarte> = [
    { title: "OPÉRATION", dataIndex: "reference" },
    { title: "DEMANDE", dataIndex: "referenceDemande", render: texte },
    { title: "CLIENT", dataIndex: "nomClient", render: texte },
    { title: "PARKING", dataIndex: "parkingNom", render: texte },
    { title: "CARTE", dataIndex: "referenceCarte" },
    { title: "N° PHYSIQUE", dataIndex: "numeroCarte", render: texte },
    { title: "DÉCLARÉE LE", dataIndex: "dateDeclaration", render: formaterDate },
  ];

  const colonnesModifications: ColumnsType<HistoriqueModificationDemande> = [
    { title: "DEMANDE", dataIndex: "referenceDemande" },
    { title: "PARKING APRÈS MODIFICATION", dataIndex: "parkingNom", render: texte },
    { title: "RÉSUMÉ", dataIndex: "resume" },
    { title: "MODIFIÉE LE", dataIndex: "dateModification", render: formaterDate },
  ];

  const data = historique.data;
  const items = [
    {
      key: "demandes",
      label: <Space><FileAddOutlined />Demandes créées ({data?.demandesCreees.length ?? 0})</Space>,
      children: (
        <Table
          rowKey="id"
          columns={colonnesDemandes}
          dataSource={data?.demandesCreees ?? []}
          loading={historique.isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      key: "paiements",
      label: <Space><DollarOutlined />Paiements validés ({data?.paiementsValides.length ?? 0})</Space>,
      children: (
        <Table
          rowKey="id"
          columns={colonnesPaiements}
          dataSource={data?.paiementsValides ?? []}
          loading={historique.isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
        />
      ),
    },
    {
      key: "impressions",
      label: <Space><PrinterOutlined />Impressions ({data?.impressionsDeclarees.length ?? 0})</Space>,
      children: (
        <Table
          rowKey="id"
          columns={colonnesOperations}
          dataSource={data?.impressionsDeclarees ?? []}
          loading={historique.isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1150 }}
        />
      ),
    },
    {
      key: "remises",
      label: <Space><CreditCardOutlined />Remises de cartes ({data?.remisesDeclarees.length ?? 0})</Space>,
      children: (
        <Table
          rowKey="id"
          columns={colonnesOperations}
          dataSource={data?.remisesDeclarees ?? []}
          loading={historique.isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1150 }}
        />
      ),
    },
    {
      key: "modifications",
      label: <Space><EditOutlined />Modifications ({data?.modificationsDemandes.length ?? 0})</Space>,
      children: (
        <Table
          rowKey="id"
          columns={colonnesModifications}
          dataSource={data?.modificationsDemandes ?? []}
          loading={historique.isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: (ligne) => (
              <div>
                <Typography.Text strong>Données exactes avant / après</Typography.Text>
                <pre className="mt-2 max-h-96 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100">
                  {formaterDetails(ligne.detailsAvantApres)}
                </pre>
              </div>
            ),
          }}
        />
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Typography.Title level={2}>Historique de mes opérations</Typography.Title>
          <Typography.Text type="secondary">
            Les actions affichées proviennent directement de la base de données et concernent votre compte.
          </Typography.Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          loading={historique.isFetching}
          onClick={() => historique.refetch()}
        >
          Actualiser
        </Button>
      </div>

      {historique.isError && (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger l'historique"
          description="Vérifiez votre connexion puis réessayez."
        />
      )}

      <Card bordered={false}>
        <Tabs items={items} destroyOnHidden />
      </Card>
    </section>
  );
}
