import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Descriptions, Input, InputNumber, Modal, Space, Spin, Table, Tag, Typography, message } from "antd";
import { FileExcelOutlined, FilePdfOutlined, SendOutlined, CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { annulerRecette, detailRecette, receptionnerRecette, telechargerDocumentRecette, transmettreRecette, type LigneRecette, type Recette } from "../../../api/recettes";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const fmt = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
const labels: Record<Recette["statut"], string> = { BROUILLON: "Brouillon", TRANSMISE: "Transmise", RECUE: "Reçue conforme", RECUE_AVEC_RESERVES: "Reçue avec réserves", ANNULEE: "Annulée" };

export function RecetteDetail() {
  const id = Number(useParams<{ id: string }>().id);
  const { role } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const base = role ? roleConfig[role].homePath : "";
  const [receptionOpen, setReceptionOpen] = useState(false);
  const [especes, setEspeces] = useState<number>();
  const [cheques, setCheques] = useState<number>();
  const [nombreCheques, setNombreCheques] = useState<number>();
  const [observation, setObservation] = useState("");
  const { data: r, isLoading, error } = useQuery({ queryKey: ["recette-reelle", id], queryFn: () => detailRecette(id), enabled: Number.isFinite(id) && id > 0 });
  const refresh = () => { void qc.invalidateQueries({ queryKey: ["recette-reelle", id] }); void qc.invalidateQueries({ queryKey: ["recettes-reelles"] }); };
  const transmettre = useMutation({ mutationFn: () => transmettreRecette(id), onSuccess: () => { message.success("Arrêté transmis au comptable"); refresh(); }, onError: () => message.error("Transmission impossible") });
  const annuler = useMutation({ mutationFn: () => annulerRecette(id), onSuccess: () => { message.success("Brouillon annulé ; paiements libérés"); refresh(); }, onError: () => message.error("Annulation impossible") });
  const receptionner = useMutation({ mutationFn: () => receptionnerRecette(id, { montantEspecesRecu: especes!, montantChequesRecu: cheques!, nombreChequesRecus: nombreCheques!, observation }),
    onSuccess: (result) => { message.success(result.statut === "RECUE" ? "Réception conforme enregistrée" : "Réception avec réserves enregistrée"); setReceptionOpen(false); refresh(); },
    onError: () => message.error("Réception impossible. Vérifiez les montants et l'observation.") });
  if (isLoading) return <Spin size="large" />;
  if (error || !r) return <Alert type="error" showIcon message="Arrêté introuvable ou inaccessible" />;
  const ecart = especes !== undefined && cheques !== undefined && nombreCheques !== undefined &&
    (especes !== r.totalEspeces || cheques !== r.totalCheques || nombreCheques !== r.nombreCheques);
  const download = (type: "excel" | "accuse") => void telechargerDocumentRecette(id, type, r.reference).catch(() => message.error("Téléchargement impossible"));
  const columns = [
    { title: "Facture", dataIndex: "numeroFacture", key: "numeroFacture", render: (v: string | null) => v || "—" },
    { title: "Abonné", dataIndex: "referenceAbonnement", key: "referenceAbonnement", render: (v: string | null) => v || "—" },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    { title: "Paiement", dataIndex: "referencePaiement", key: "referencePaiement" },
    { title: "Mode", dataIndex: "modePaiement", key: "modePaiement", render: (v: string) => v === "ESPECE" ? "Espèces" : "Chèque" },
    { title: "N° chèque", dataIndex: "numeroCheque", key: "numeroCheque" },
    { title: "Formule", dataIndex: "typeAbonnement", key: "typeAbonnement" },
    { title: "Date paiement", dataIndex: "datePaiement", key: "datePaiement", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "TTC", dataIndex: "montant", key: "montant", render: (v: number) => <strong>{fmt(v)}</strong> },
    { title: "Observation", dataIndex: "observation", key: "observation" },
  ];
  return <Space direction="vertical" size="large" style={{ width: "100%" }}>
    <Button onClick={() => navigate(`${base}/recettes`)}>← Toutes les recettes</Button>
    <Card className="rrm-glass-card" title={<Typography.Title level={4} style={{ margin: 0 }}>{r.reference}</Typography.Title>} extra={<Tag color={r.statut === "RECUE" ? "green" : r.statut === "RECUE_AVEC_RESERVES" ? "orange" : "blue"}>{labels[r.statut]}</Tag>}>
      <Descriptions column={{ xs: 1, md: 2 }} bordered items={[
        { key: "parking", label: "Parking", children: r.parkingNom },
        { key: "date", label: "Date d'arrêt", children: dayjs(r.dateArret).format("DD/MM/YYYY") },
        { key: "periode", label: "Période des paiements", children: r.periodeDu && r.periodeAu ? `${dayjs(r.periodeDu).format("DD/MM/YYYY")} au ${dayjs(r.periodeAu).format("DD/MM/YYYY")}` : "—" },
        { key: "superviseur", label: "Superviseur", children: r.superviseurNom },
        { key: "comptable", label: "Comptable", children: r.comptableNom || "En attente" },
        { key: "transmission", label: "Transmis le", children: r.dateTransmission ? dayjs(r.dateTransmission).format("DD/MM/YYYY HH:mm") : "Non transmis" },
        { key: "reception", label: "Reçu le", children: r.dateReception ? dayjs(r.dateReception).format("DD/MM/YYYY HH:mm") : "Non reçu" },
      ]} />
      <Space wrap size="large" style={{ marginTop: 20 }}><span>{r.nombrePaiements} paiements</span><span>{r.nombreEspeces} espèces : <strong>{fmt(r.totalEspeces)}</strong></span><span>{r.nombreCheques} chèques : <strong>{fmt(r.totalCheques)}</strong></span><strong>Total TTC : {fmt(r.total)}</strong></Space>
      {r.statut === "RECUE_AVEC_RESERVES" && <Alert style={{ marginTop: 20 }} type="warning" showIcon message="Réception avec réserves" description={`Espèces reçues : ${fmt(r.montantEspecesRecu || 0)} ; chèques reçus : ${fmt(r.montantChequesRecu || 0)} (${r.nombreChequesRecus || 0}). ${r.observationReception || ""}`} />}
      {r.statut === "RECUE" && <Alert style={{ marginTop: 20 }} type="success" showIcon message={`Accusé ${r.accuseNumero} disponible pour le superviseur et le comptable`} />}
      <Space wrap style={{ marginTop: 22 }}>
        {r.statut !== "ANNULEE" && <Button icon={<FileExcelOutlined />} onClick={() => download("excel")}>Télécharger l'Excel</Button>}
        {(r.statut === "RECUE" || r.statut === "RECUE_AVEC_RESERVES") && <Button icon={<FilePdfOutlined />} onClick={() => download("accuse")}>Accusé de réception PDF</Button>}
        {role === "SUPERVISEUR" && r.statut === "BROUILLON" && <>
          <Button type="primary" icon={<SendOutlined />} loading={transmettre.isPending} onClick={() => Modal.confirm({ title: "Transmettre au comptable ?", content: "Après transmission, la sélection des paiements est figée.", onOk: () => transmettre.mutateAsync() })}>Transmettre au comptable</Button>
          <Button danger icon={<DeleteOutlined />} loading={annuler.isPending} onClick={() => Modal.confirm({ title: "Annuler ce brouillon ?", content: "Les paiements redeviendront disponibles pour un autre arrêté.", onOk: () => annuler.mutateAsync() })}>Annuler le brouillon</Button>
        </>}
        {role === "COMPTABLE" && r.statut === "TRANSMISE" && <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { setEspeces(r.totalEspeces); setCheques(r.totalCheques); setNombreCheques(r.nombreCheques); setObservation(""); setReceptionOpen(true); }}>Déclarer la réception physique</Button>}
      </Space>
    </Card>
    <Card className="rrm-glass-card" title="Paiements inclus"><Table<LigneRecette> rowKey="id" dataSource={r.lignes} columns={columns} scroll={{ x: 1300 }} pagination={{ pageSize: 20 }} /></Card>
    <Modal title="Réception physique des fonds" open={receptionOpen} onCancel={() => setReceptionOpen(false)} okText="Confirmer et générer l'accusé"
      okButtonProps={{ disabled: especes === undefined || cheques === undefined || nombreCheques === undefined || (ecart && !observation.trim()), loading: receptionner.isPending }} onOk={() => receptionner.mutate()}>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Alert type="info" showIcon message={`Déclaré : ${fmt(r.totalEspeces)} en espèces et ${r.nombreCheques} chèques pour ${fmt(r.totalCheques)}.`} />
        <label>Espèces réellement reçues (DH)<InputNumber style={{ width: "100%" }} min={0} precision={2} value={especes} onChange={v => setEspeces(v ?? undefined)} /></label>
        <label>Montant des chèques réellement reçus (DH)<InputNumber style={{ width: "100%" }} min={0} precision={2} value={cheques} onChange={v => setCheques(v ?? undefined)} /></label>
        <label>Nombre de chèques reçus<InputNumber style={{ width: "100%" }} min={0} precision={0} value={nombreCheques} onChange={v => setNombreCheques(v ?? undefined)} /></label>
        {ecart && <Alert type="warning" showIcon message="Écart constaté : l'accusé portera la mention « avec réserves ». L'observation est obligatoire." />}
        <Input.TextArea rows={3} maxLength={2000} placeholder="Observation / motif de l'écart" value={observation} onChange={e => setObservation(e.target.value)} />
      </Space>
    </Modal>
  </Space>;
}
