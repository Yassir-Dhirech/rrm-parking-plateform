import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Breadcrumb, Button, Card, Descriptions, Input, Modal, Space, Steps, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, BellOutlined, FileDoneOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { consulterAbonnementResponsable, suspendreAbonnementResponsable, type RelanceAbonnement } from "../../../api/responsableAbonnements";
import type { FactureResponse } from "../../factures/facturationTypes";

const { Text } = Typography;
const date = (value: string | null) => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString("fr-FR", value.length === 10 ? { dateStyle: "short" } : { dateStyle: "short", timeStyle: "short" }) : "—";
const monnaie = (value: number | null) => value == null ? "—" : `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
const erreur = (value: unknown) => axios.isAxiosError<{ detail?: string }>(value) ? value.response?.data?.detail || "Action impossible" : "Action impossible";
const statuts: Record<string, { label: string; color: string }> = {
  ACTIF: { label: "Actif", color: "green" }, SUSPENDU: { label: "Suspendu", color: "volcano" },
  EXPIRE: { label: "Expiré", color: "red" }, EN_ATTENTE_ACTIVATION: { label: "En attente d'activation", color: "gold" },
  RESILIE: { label: "Résilié", color: "default" },
};
const libellePalier: Record<string, string> = {
  ABONNEMENT_EXPIRATION_J10: "1ère Relance Préventive (J−10)",
  ABONNEMENT_EXPIRATION_J5: "2ème Relance Urgente (J−5)",
  ABONNEMENT_EXPIRE: "Notification 3 : Expiration",
};

export function AbonnementResponsableDetailPage() {
  const { id } = useParams();
  const abonnementId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOuverte, setModalOuverte] = useState(false);
  const [motif, setMotif] = useState("");
  const { data, isLoading, error: erreurChargement } = useQuery({
    queryKey: ["responsable-abonnement", abonnementId],
    queryFn: () => consulterAbonnementResponsable(abonnementId),
    enabled: Number.isSafeInteger(abonnementId) && abonnementId > 0,
  });
  const suspension = useMutation({
    mutationFn: () => suspendreAbonnementResponsable(abonnementId, motif.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responsable-abonnement", abonnementId] });
      queryClient.invalidateQueries({ queryKey: ["responsable-abonnements"] });
      setModalOuverte(false); setMotif("");
      message.success("Suspension enregistrée dans la plateforme.");
    },
    onError: (e) => message.error(erreur(e)),
  });

  if (!Number.isSafeInteger(abonnementId) || abonnementId < 1) return <Alert type="error" message="Identifiant invalide" />;
  if (isLoading) return <Card loading style={{ maxWidth: 900, margin: "0 auto" }} />;
  if (erreurChargement || !data) return <Alert type="error" message="Impossible de charger cet abonnement" />;

  const statut = statuts[data.statut] || { label: data.statut, color: "default" };
  const palier = (type: string) => data.relances.find((r) => r.type === type);
  const dateCible = (jours: number) => data.dateFin ? new Date(new Date(`${data.dateFin}T12:00:00`).getTime() - jours * 86400000).toISOString().slice(0, 10) : null;
  const etapes = [
    { type: "ABONNEMENT_EXPIRATION_J10", cible: dateCible(10) },
    { type: "ABONNEMENT_EXPIRATION_J5", cible: dateCible(5) },
    { type: "ABONNEMENT_EXPIRE", cible: data.dateFin },
  ];
  const colonnesRelances: ColumnsType<RelanceAbonnement> = [
    { title: "Date d'Envoi", dataIndex: "dateEnvoi", render: (value) => date(value) },
    { title: "Événement / Palier", dataIndex: "type", render: (value) => <Tag color={value === "ABONNEMENT_EXPIRE" ? "red" : value === "ABONNEMENT_EXPIRATION_J5" ? "volcano" : "gold"}>{libellePalier[value] || value}</Tag> },
    { title: "Canal", dataIndex: "canal", render: (value) => <Tag color="purple">{value}</Tag> },
    { title: "Sujet du Message", dataIndex: "sujet" },
    { title: "Statut", dataIndex: "statut", render: (value, record) => <Tag title={record.erreur || undefined} color={value === "ENVOYEE" ? "success" : value === "ECHEC" ? "red" : "default"}>{value === "ENVOYEE" ? "Transmise" : value === "A_ENVOYER" ? "À envoyer" : value}</Tag> },
  ];
  const colonnesFactures: ColumnsType<FactureResponse> = [
    { title: "N° Facture", dataIndex: "numero", render: (value, facture) => <Button type="link" style={{ padding: 0, color: "#006398", fontWeight: 700 }} onClick={() => navigate(`/responsable/factures/${facture.id}`)}>{value}</Button> },
    { title: "Date de Facturation", dataIndex: "dateEmission", render: (value, facture) => date(value || facture.dateCreation) },
    { title: "Prestation / Objet du Règlement", key: "objet", render: (_, facture) => facture.lignes.map((ligne) => ligne.description).join(" · ") || "—" },
    { title: "Mode de Règlement", dataIndex: "modePaiement", render: (value) => value === "ESPECE" ? "Espèces" : "Chèque" },
    { title: "Frais Carte RFID", key: "carte", render: (_, facture) => monnaie(facture.lignes.filter((ligne) => ligne.typeLigne === "CARTE_ACCES").reduce((somme, ligne) => somme + ligne.montantTtc, 0)) },
    { title: "Montant HT / TVA", key: "ht", render: (_, facture) => <span>{monnaie(facture.totalHt)}<br /><Text type="secondary">TVA {monnaie(facture.totalTva)}</Text></span> },
    { title: "Total TTC", dataIndex: "totalTtc", render: (value) => <strong>{monnaie(value)}</strong> },
    { title: "Statut", dataIndex: "statut", render: (value) => <Tag color={value === "EMISE" ? "green" : "default"}>{value}</Tag> },
    { title: "Action", key: "action", render: (_, facture) => <Button size="small" onClick={() => navigate(`/responsable/factures/${facture.id}`)}>Détails</Button> },
  ];

  return <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 24 }}>
    <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: <a onClick={() => navigate("/responsable/abonnements")}>Abonnements</a> }, { title: data.reference }]} />
    <Card style={{ background: "#fff" }} title={<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/responsable/abonnements")}>Retour</Button>
      <Space wrap><strong style={{ color: "#003566" }}>Abonnement {data.reference}</strong><Tag color={statut.color}>{statut.label}</Tag>
        {data.statut === "ACTIF" && <Button danger type="primary" icon={<PauseCircleOutlined />} onClick={() => setModalOuverte(true)}>Suspendre l'Abonnement</Button>}</Space>
    </div>}>
      {data.statut === "SUSPENDU" && <Alert type="warning" showIcon message="Abonnement suspendu dans la plateforme" description="Le contrôle des barrières externes est traité séparément." style={{ marginBottom: 20 }} />}
      <Descriptions bordered size="middle" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label="Statut d'Activation"><Tag color={statut.color}>{statut.label}</Tag></Descriptions.Item>
        <Descriptions.Item label="Type d'Abonnement"><Tag color={data.type === "REGULIER" ? "blue" : "purple"}>{data.type === "REGULIER" ? "Régulier" : data.type === "REGULIER_ENTREPRISE" ? "Régulier entreprise" : "Entreprise"}</Tag></Descriptions.Item>
        <Descriptions.Item label="Client / Bénéficiaire"><strong>{data.clientNom}</strong></Descriptions.Item>
        <Descriptions.Item label="Parking d'Attache">{data.parkingNom || "—"}</Descriptions.Item>
        <Descriptions.Item label="E-mail">{data.clientEmail || "—"}</Descriptions.Item>
        <Descriptions.Item label="ICE">{data.entrepriseIce || "—"}</Descriptions.Item>
        <Descriptions.Item label="Date de Début">{date(data.dateDebut)}</Descriptions.Item>
        <Descriptions.Item label="Date d'Expiration">{date(data.dateFin)}</Descriptions.Item>
        <Descriptions.Item label="Immatriculation Véhicule LPR">{data.immatriculation ? <Tag color="geekblue">{data.immatriculation}</Tag> : "—"}</Descriptions.Item>
        <Descriptions.Item label="Formule Tarifaire">{data.factures[0]?.forfaitLibelle || "—"}</Descriptions.Item>
        <Descriptions.Item label="Montant Total TTC"><strong style={{ fontSize: "1.1rem", color: "#16a34a" }}>{monnaie(data.prixTtcPeriode)} TTC</strong></Descriptions.Item>
      </Descriptions>
    </Card>

    <Card style={{ marginTop: 20, background: "#fff" }} title={<Space><FileDoneOutlined style={{ color: "#006398", fontSize: 20 }} /><strong style={{ color: "#003566" }}>Factures Fiscales & Règlements Encaissés (1 Facture par Paiement)</strong><Tag color="cyan">{data.factures.length} Facture(s)</Tag></Space>}>
      <Alert type="info" showIcon message="Principe Comptable RRM : 1 Paiement = 1 Facture Unique" description="Chaque paiement confirmé possède sa facture fiscale distincte. Cliquez sur Détails pour consulter les lignes et le document." style={{ marginBottom: 16 }} />
      <Table rowKey="id" dataSource={data.factures} columns={colonnesFactures} scroll={{ x: 1100 }} pagination={{ pageSize: 5 }} />
    </Card>

    <Card style={{ marginTop: 20, background: "#fff" }} title={<Space><BellOutlined style={{ color: "#0284c7", fontSize: 20 }} /><strong style={{ color: "#003566" }}>Échéancier de Relance & Notifications d'Expiration (3 Paliers)</strong></Space>}>
      {data.type === "CORPORATE" ? <Alert type="info" showIcon message="Les relances automatiques actuelles concernent les abonnements réguliers." /> : <>
        <Alert type="info" showIcon message="Politique RRM de Relance d'Abonnement" description="Le serveur prévoit une relance à J−10, une autre à J−5, puis une notification à l'expiration. Seuls les envois enregistrés en base sont indiqués comme transmis." style={{ marginBottom: 20 }} />
        <div style={{ padding: "16px 20px", marginBottom: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12 }}>
          <Steps responsive items={etapes.map((etape) => { const notification = palier(etape.type); const envoyee = notification?.statut === "ENVOYEE";
            return { title: <span style={{ fontWeight: 700, fontSize: 13 }}>{libellePalier[etape.type]}</span>,
              subTitle: <Tag color={envoyee ? "cyan" : notification ? "gold" : "default"}>{envoyee ? "Transmise" : notification ? "En attente" : "Non enregistrée"}</Tag>,
              description: <div style={{ fontSize: 12 }}><div>Date cible : {date(etape.cible)}</div>{notification?.dateEnvoi && <div>Envoyée le {date(notification.dateEnvoi)} ({notification.canal})</div>}</div>,
              status: envoyee ? "finish" as const : notification ? "process" as const : "wait" as const }; })} />
        </div>
        <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Journal des Relances & Notifications transmises à {data.clientNom} :</div>
        <Table rowKey={(record) => `${record.type}-${record.datePrevue}`} size="small" dataSource={data.relances} columns={colonnesRelances} pagination={{ pageSize: 5 }} scroll={{ x: 850 }} />
      </>}
    </Card>

    <Modal title="Suspendre l'abonnement" open={modalOuverte} onCancel={() => setModalOuverte(false)}
      okText="Confirmer" okButtonProps={{ danger: true, disabled: !motif.trim(), loading: suspension.isPending }} onOk={() => suspension.mutate()}>
      <p>Le statut de l'abonnement et des cartes actives changera dans la plateforme. Aucune commande n'est envoyée au système de barrières externe.</p>
      <Input.TextArea aria-label="Motif de suspension" rows={4} value={motif} maxLength={1000} showCount placeholder="Motif obligatoire" onChange={(e) => setMotif(e.target.value)} />
    </Modal>
  </div>;
}
