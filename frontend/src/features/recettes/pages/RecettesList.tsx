import { useState } from "react";
import { Alert, Button, Card, DatePicker, Modal, Select, Space, Statistic, Table, Tag, Typography, message } from "antd";
import { PlusOutlined, DollarOutlined, BankOutlined, FileTextOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { creerRecette, listerRecettes, paiementsDisponibles, parkingsRecettes, type PaiementDisponible, type Recette } from "../../../api/recettes";

const { Title, Text } = Typography;

const fmt = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
const labels: Record<Recette["statut"], string> = {
  BROUILLON: "Brouillon",
  TRANSMISE: "Transmise",
  RECUE: "Reçue",
  RECUE_AVEC_RESERVES: "Reçue avec réserves",
  ANNULEE: "Annulée",
};

export function RecettesList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const base = role ? roleConfig[role].homePath : "";
  const [open, setOpen] = useState(false);
  const [parkingId, setParkingId] = useState<number>();
  const [dateArret, setDateArret] = useState(dayjs());
  const [selected, setSelected] = useState<React.Key[]>([]);

  const { data: recettes = [], isLoading, error } = useQuery({
    queryKey: ["recettes-reelles"],
    queryFn: listerRecettes,
  });

  const { data: parkings = [] } = useQuery({
    queryKey: ["recettes-parkings"],
    queryFn: parkingsRecettes,
    enabled: role === "SUPERVISEUR" || role === "RESPONSABLE",
  });

  const { data: disponibles = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["recettes-disponibles", parkingId, dateArret.format("YYYY-MM-DD")],
    queryFn: () => paiementsDisponibles(parkingId!, dateArret.format("YYYY-MM-DD")),
    enabled: open && parkingId !== undefined,
  });

  const mutation = useMutation({
    mutationFn: creerRecette,
    onSuccess: (r) => {
      message.success(`Arrêté ${r.reference} créé avec succès !`);
      setOpen(false);
      setSelected([]);
      void qc.invalidateQueries({ queryKey: ["recettes-reelles"] });
      navigate(`${base}/recettes/${r.id}`);
    },
    onError: () => {
      message.error("Impossible de créer l'arrêté. Vérifiez les paiements sélectionnés.");
    },
  });

  const chosen = disponibles.filter((p) => selected.includes(p.id));
  const cash = chosen.filter((p) => p.modePaiement === "ESPECE").reduce((sum, p) => sum + p.montant, 0);
  const cheques = chosen.filter((p) => p.modePaiement === "CHEQUE").reduce((sum, p) => sum + p.montant, 0);
  const recent = recettes.find((r) => r.statut !== "ANNULEE");
  const pending = recettes.filter((r) => r.statut === "TRANSMISE").length;
  const totalCumule = recettes.filter((r) => r.statut !== "ANNULEE").reduce((s, r) => s + r.total, 0);

  const columns = [
    { title: "Arrêté", dataIndex: "reference", key: "reference", render: (x: string) => <strong>{x}</strong> },
    { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
    { title: "Date d'arrêt", dataIndex: "dateArret", key: "dateArret", render: (x: string) => dayjs(x).format("DD/MM/YYYY") },
    { title: "Paiements", dataIndex: "nombrePaiements", key: "nombrePaiements" },
    { title: "Espèces", dataIndex: "totalEspeces", key: "totalEspeces", render: fmt },
    { title: "Chèques", dataIndex: "totalCheques", key: "totalCheques", render: fmt },
    { title: "Total TTC", dataIndex: "total", key: "total", render: (x: number) => <strong>{fmt(x)}</strong> },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (x: Recette["statut"]) => (
        <Tag color={x === "RECUE" ? "green" : x === "RECUE_AVEC_RESERVES" ? "orange" : x === "TRANSMISE" ? "blue" : "default"}>
          {labels[x] || x}
        </Tag>
      ),
    },
  ];

  const paymentColumns = [
    { title: "Paiement", dataIndex: "reference", key: "reference" },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    { title: "Abonnement", dataIndex: "referenceAbonnement", key: "referenceAbonnement" },
    {
      title: "Mode",
      dataIndex: "modePaiement",
      key: "modePaiement",
      render: (x: string) => (x === "ESPECE" ? "Espèces" : "Chèque"),
    },
    { title: "N° chèque", dataIndex: "numeroCheque", key: "numeroCheque" },
    { title: "Date paiement", dataIndex: "datePaiement", key: "datePaiement", render: (x: string) => dayjs(x).format("DD/MM/YYYY") },
    { title: "TTC", dataIndex: "montant", key: "montant", render: fmt },
  ];

  return (
    <Space className={role === "SUPERVISEUR" ? "supervisor-screen supervisor-recettes" : undefined}
      direction="vertical" size="large" style={{ width: "100%" }}>
      {/* En-tête */}
      <Card
        className="rrm-glass-card"
        title={<Title level={4} style={{ margin: 0 }}>Gestion & Remise des Recettes par Date</Title>}
        extra={
          role === "SUPERVISEUR" ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setParkingId(parkings[0]?.id);
                setDateArret(dayjs());
                setSelected([]);
                setOpen(true);
              }}
              style={{ backgroundColor: "#0284c7" }}
            >
              Créer un Arrêté de Recette
            </Button>
          ) : null
        }
      >
        <Text type="secondary">
          Remise des espèces et chèques issus des paiements confirmés. Un paiement non sélectionné reste disponible pour le prochain arrêté.
        </Text>
        {error && <Alert style={{ marginTop: 16 }} type="error" showIcon message="Chargement des recettes impossible" />}
      </Card>

      {/* Dernier Arrêté */}
      {recent && (
        <Card
          className="rrm-glass-card"
          title={role === "SUPERVISEUR" ? "Dernière recette émise" : "Dernier arrêté reçu"}
          extra={<Button onClick={() => navigate(`${base}/recettes/${recent.id}`)}>Voir le détail</Button>}
        >
          <Space wrap size="large">
            <strong>{recent.reference}</strong>
            <span>{recent.parkingNom}</span>
            <span>{dayjs(recent.dateArret).format("DD/MM/YYYY")}</span>
            <Tag color="blue">{labels[recent.statut]}</Tag>
            <strong>{fmt(recent.total)}</strong>
          </Space>
        </Card>
      )}

      {/* Statistiques Synthèse */}
      <Space wrap size="large">
        <Statistic
          title="Arrêtés Validés"
          value={recettes.filter((r) => r.statut !== "ANNULEE").length}
          prefix={<FileTextOutlined style={{ color: "#0284c7" }} />}
        />
        <Statistic
          title="À Réceptionner"
          value={pending}
          prefix={<BankOutlined style={{ color: "#ea580c" }} />}
        />
        <Statistic
          title="Total des Arrêtés"
          value={totalCumule}
          suffix="DH"
          prefix={<DollarOutlined style={{ color: "#16a34a" }} />}
        />
      </Space>

      {/* Table Principale Défilable (Sans Pagination) */}
      <Card className="rrm-glass-card" title="Historique des Arrêtés de Recettes">
        <Table<Recette>
          rowKey="id"
          loading={isLoading}
          dataSource={recettes}
          columns={columns}
          pagination={false}
          scroll={{ y: 550, x: 1100 }}
          onRow={(r) => ({
            onClick: () => navigate(`${base}/recettes/${r.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Modal Création Arrêté */}
      <Modal
        title="Nouvel Arrêté de Recette"
        open={open}
        width={1000}
        onCancel={() => setOpen(false)}
        okText="Créer le brouillon d'arrêté"
        okButtonProps={{ disabled: !parkingId || !selected.length, loading: mutation.isPending }}
        onOk={() =>
          parkingId &&
          mutation.mutate({
            parkingId,
            dateArret: dateArret.format("YYYY-MM-DD"),
            paiementIds: selected.map(Number),
          })
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            type="info"
            showIcon
            message="Sélectionnez le parking et la date, puis cochez les paiements physiquement détenus. Les paiements non cochés resteront disponibles pour le prochain arrêté."
          />
          <Space wrap size="middle">
            <Select
              style={{ width: 300 }}
              placeholder="Sélectionner le Parking"
              value={parkingId}
              options={parkings.map((p) => ({ value: p.id, label: p.nom }))}
              onChange={(v) => {
                setParkingId(v);
                setSelected([]);
              }}
            />
            <DatePicker
              value={dateArret}
              format="DD/MM/YYYY"
              disabledDate={(d) => d.isAfter(dayjs(), "day")}
              onChange={(d) => {
                if (d) {
                  setDateArret(d);
                  setSelected([]);
                }
              }}
            />
          </Space>

          {/* Table Défilable dans la Modale (Sans Pagination) */}
          <Table<PaiementDisponible>
            rowKey="id"
            size="small"
            loading={loadingPayments}
            dataSource={disponibles}
            columns={paymentColumns}
            pagination={false}
            scroll={{ y: 350, x: 900 }}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: setSelected,
              preserveSelectedRowKeys: true,
            }}
          />

          <Space wrap size="large" style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, width: "100%" }}>
            <span><strong>{chosen.length}</strong> paiements cochés</span>
            <span style={{ color: "#16a34a" }}>Espèces : <strong>{fmt(cash)}</strong></span>
            <span style={{ color: "#9333ea" }}>Chèques : <strong>{fmt(cheques)}</strong></span>
            <span style={{ color: "#003566", fontSize: "1.05rem" }}><strong>Total TTC : {fmt(cash + cheques)}</strong></span>
          </Space>
        </Space>
      </Modal>
    </Space>
  );
}
