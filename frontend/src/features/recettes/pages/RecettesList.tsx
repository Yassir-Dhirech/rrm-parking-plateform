import { useState } from "react";
import { Alert, Button, Card, DatePicker, Modal, Select, Space, Statistic, Table, Tag, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { creerRecette, listerRecettes, paiementsDisponibles, parkingsRecettes, type PaiementDisponible, type Recette } from "../../../api/recettes";

const fmt = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
const labels: Record<Recette["statut"], string> = { BROUILLON: "Brouillon", TRANSMISE: "Transmise", RECUE: "Reçue", RECUE_AVEC_RESERVES: "Reçue avec réserves", ANNULEE: "Annulée" };

export function RecettesList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const base = role ? roleConfig[role].homePath : "";
  const [open, setOpen] = useState(false);
  const [parkingId, setParkingId] = useState<number>();
  const [dateArret, setDateArret] = useState(dayjs());
  const [selected, setSelected] = useState<React.Key[]>([]);
  const { data: recettes = [], isLoading, error } = useQuery({ queryKey: ["recettes-reelles"], queryFn: listerRecettes });
  const { data: parkings = [] } = useQuery({ queryKey: ["recettes-parkings"], queryFn: parkingsRecettes, enabled: role === "SUPERVISEUR" });
  const { data: disponibles = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["recettes-disponibles", parkingId, dateArret.format("YYYY-MM-DD")],
    queryFn: () => paiementsDisponibles(parkingId!, dateArret.format("YYYY-MM-DD")),
    enabled: open && parkingId !== undefined,
  });
  const mutation = useMutation({ mutationFn: creerRecette, onSuccess: (r) => {
    message.success(`Arrêté ${r.reference} créé`); setOpen(false); setSelected([]);
    void qc.invalidateQueries({ queryKey: ["recettes-reelles"] });
    navigate(`${base}/recettes/${r.id}`);
  }, onError: () => message.error("Impossible de créer l'arrêté. Vérifiez les paiements sélectionnés.") });
  const chosen = disponibles.filter(p => selected.includes(p.id));
  const cash = chosen.filter(p => p.modePaiement === "ESPECE").reduce((sum, p) => sum + p.montant, 0);
  const cheques = chosen.filter(p => p.modePaiement === "CHEQUE").reduce((sum, p) => sum + p.montant, 0);
  const recent = recettes.find(r => r.statut !== "ANNULEE");
  const pending = recettes.filter(r => r.statut === "TRANSMISE").length;
  const columns = [
    { title: "Arrêté", dataIndex: "reference", key: "reference", render: (x: string) => <strong>{x}</strong> },
    { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
    { title: "Date d'arrêt", dataIndex: "dateArret", key: "dateArret", render: (x: string) => dayjs(x).format("DD/MM/YYYY") },
    { title: "Paiements", dataIndex: "nombrePaiements", key: "nombrePaiements" },
    { title: "Espèces", dataIndex: "totalEspeces", key: "totalEspeces", render: fmt },
    { title: "Chèques", dataIndex: "totalCheques", key: "totalCheques", render: fmt },
    { title: "Total TTC", dataIndex: "total", key: "total", render: (x: number) => <strong>{fmt(x)}</strong> },
    { title: "Statut", dataIndex: "statut", key: "statut", render: (x: Recette["statut"]) => <Tag color={x === "RECUE" ? "green" : x === "RECUE_AVEC_RESERVES" ? "orange" : x === "TRANSMISE" ? "blue" : "default"}>{labels[x]}</Tag> },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Gestion & Remise des Recettes par Date</Title>
          <Text type="secondary">Centralisation des arrêtés de recette par date d'encaissement et versement vers la Comptabilité</Text>
        </div>
        {(role === "SUPERVISEUR" || role === "RESPONSABLE") && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            style={{ backgroundColor: "#0284c7" }}
          >
            Créer un Arrêté de Recette (Par Date)
          </Button>
        )}
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
            <Statistic
              title="Recettes Cumulées"
              value={totalGlobal}
              suffix="DH"
              prefix={<DollarOutlined style={{ color: "#0284c7" }} />}
              valueStyle={{ color: "#0369a1", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <Statistic
              title="Espèces à Verser"
              value={totalEspeces}
              suffix="DH"
              prefix={<BankOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ color: "#15803d", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
            <Statistic
              title="Chèques à Remettre"
              value={totalCheques}
              suffix={`DH — ${countCheques} chèques`}
              prefix={<FileTextOutlined style={{ color: "#9333ea" }} />}
              valueStyle={{ color: "#7e22ce", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#fff7ed", borderColor: "#ffedd5" }}>
            <Statistic
              title="Recettes Complétées / Reçues"
              value={data?.filter((r) => r.statut === "RECEIVED" || r.statut === "COMPLETED").length || 0}
              suffix={`/ ${data?.length || 0}`}
              prefix={<AuditOutlined style={{ color: "#ea580c" }} />}
              valueStyle={{ color: "#c2410c", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        scroll={{ y: 550, x: 1200 }}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/recettes/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />


      {/* MODALE DE GÉNÉRATION PAR LE SUPERVISEUR */}
      <Modal
        title="Créer un Arrêté de Recette par Date Spécifique"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={createRecetteMutation.isPending}
            onClick={handleGenerateRecetteSubmit}
            style={{ backgroundColor: "#0284c7" }}
          >
            Générer l'Arrêté du {selectedDate.format("DD/MM/YYYY")} — {totalRecetteCalculee.toLocaleString("fr-FR")} DH
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            message="Procédure de Recette par Date Spécifique"
            description="Sélectionnez le parking et la date d'arrêté, puis cochez dans la liste ci-dessous les paiements récupérés auprès des agents."
            type="info"
            showIcon
          />

          <Row gutter={16} align="middle">
            <Col span={12}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Choisir le Parking :</label>
              <Select
                size="large"
                style={{ width: "100%" }}
                value={selectedParkingId}
                onChange={(val) => {
                  setSelectedParkingId(val);
                  const nom = val === 1 ? "Parking Agdal Gare" : val === 2 ? "Parking Hassan II" : "Parking Bab El Had";
                  setSelectedParkingNom(nom);
                  setSelectedPaiementIds([]);
                }}
              >
                <Option value={1}>Parking Agdal Gare</Option>
                <Option value={2}>Parking Hassan II</Option>
                <Option value={3}>Parking Bab El Had</Option>
              </Select>
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Date d'Arrêté de la Recette :</label>
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={selectedDate}
                onChange={(d) => d && setSelectedDate(d)}
                allowClear={false}
              />
            </Col>
          </Row>

          <Text style={{ fontWeight: 600, display: "block", marginTop: 8 }}>
            Cochez les encaissements perçus pour ce parking — {paiementsAEncasser.length} paiements en attente :
          </Text>

          <Table<PaiementAEncasserRecette>
            columns={columnsPaiementsSelection}
            dataSource={paiementsAEncasser}
            loading={isLoadingPaiements}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
            rowSelection={{
              selectedRowKeys: selectedPaiementIds,
              onChange: (keys) => setSelectedPaiementIds(keys),
            }}
          />

          {/* Synthèse dynamique des paiements cochés */}
          <div style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 12 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Text type="secondary">Espèces Cochées :</Text>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>
                  {montantEspecesCoche.toLocaleString("fr-FR")} DH
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Chèques Physiques Cochés :</Text>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#7e22ce" }}>
                  {montantChequesCoche.toLocaleString("fr-FR")} DH — {mePaiementsChequeCoche.length} chèques
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Total Recette Calculée :</Text>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0369a1" }}>
                  {totalRecetteCalculee.toLocaleString("fr-FR")} DH TTC
                </div>
              </Col>
            </Row>
          </div>
        </Space>
      </Modal>
    </Card>
    {recent && <Card className="rrm-glass-card" title={role === "SUPERVISEUR" ? "Dernière recette" : "Dernier arrêté"} extra={<Button onClick={() => navigate(`${base}/recettes/${recent.id}`)}>Voir le détail</Button>}>
      <Space wrap size="large"><strong>{recent.reference}</strong><span>{recent.parkingNom}</span><span>{dayjs(recent.dateArret).format("DD/MM/YYYY")}</span><Tag>{labels[recent.statut]}</Tag><strong>{fmt(recent.total)}</strong></Space>
    </Card>}
    <Space wrap size="large"><Statistic title="Arrêtés" value={recettes.filter(r => r.statut !== "ANNULEE").length} /><Statistic title="À réceptionner" value={pending} /><Statistic title="Total des arrêtés" value={recettes.filter(r => r.statut !== "ANNULEE").reduce((s, r) => s + r.total, 0)} suffix="DH" /></Space>
    <Card className="rrm-glass-card" title="Historique"><Table<Recette> rowKey="id" loading={isLoading} dataSource={recettes} columns={columns} scroll={{ x: 1100 }} onRow={r => ({ onClick: () => navigate(`${base}/recettes/${r.id}`), style: { cursor: "pointer" } })} /></Card>
    <Modal title="Nouvel arrêté de recette" open={open} width={1000} onCancel={() => setOpen(false)}
      okText="Créer le brouillon" okButtonProps={{ disabled: !parkingId || !selected.length, loading: mutation.isPending }}
      onOk={() => parkingId && mutation.mutate({ parkingId, dateArret: dateArret.format("YYYY-MM-DD"), paiementIds: selected.map(Number) })}>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Alert type="info" showIcon message="Sélectionnez les paiements réellement détenus. Les autres resteront disponibles pour un prochain arrêté." />
        <Space wrap><Select style={{ width: 290 }} placeholder="Parking affecté" value={parkingId} options={parkings.map(p => ({ value: p.id, label: p.nom }))} onChange={v => { setParkingId(v); setSelected([]); }} />
          <DatePicker value={dateArret} format="DD/MM/YYYY" disabledDate={d => d.isAfter(dayjs(), "day")} onChange={d => { if (d) { setDateArret(d); setSelected([]); } }} /></Space>
        <Table<PaiementDisponible> rowKey="id" size="small" loading={loadingPayments} dataSource={disponibles} columns={paymentColumns} scroll={{ x: 900 }} pagination={{ pageSize: 10 }} rowSelection={{ selectedRowKeys: selected, onChange: setSelected, preserveSelectedRowKeys: true }} />
        <Space wrap size="large"><span>{chosen.length} paiements</span><span>Espèces : {fmt(cash)}</span><span>Chèques : {fmt(cheques)}</span><strong>Total TTC : {fmt(cash + cheques)}</strong></Space>
      </Space>
    </Modal>
  </Space>;
}
