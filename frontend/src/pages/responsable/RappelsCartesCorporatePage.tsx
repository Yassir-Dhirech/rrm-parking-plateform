import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Modal, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, ClockCircleOutlined, HistoryOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  cloturerReactivationCorporate, genererDemandeReactivationCorporate,
  listerEcheancesCartesCorporate, type CarteCorporateEcheance, type DossierCorporateEcheance,
} from "../../api/echeancesCartesCorporate";

const { Text } = Typography;
const date = (value?: string | null) => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString("fr-FR", value.length === 10 ? { dateStyle: "short" } : { dateStyle: "short", timeStyle: "short" }) : "—";
const erreur = (value: unknown) => axios.isAxiosError<{ detail?: string }>(value) ? value.response?.data?.detail || "Action impossible" : "Action impossible";
const aujourdHui = () => {
  const champs = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date());
  const valeur = (type: string) => champs.find((champ) => champ.type === type)?.value || "";
  return `${valeur("year")}-${valeur("month")}-${valeur("day")}`;
};
const couleur: Record<string, string> = { A_TRAITER: "volcano", DEMANDEE: "blue", DECLAREE: "green", CLOTUREE: "default" };
const libelle: Record<string, string> = { A_TRAITER: "À traiter", DEMANDEE: "Demande envoyée", DECLAREE: "Réactivation déclarée", CLOTUREE: "Clôturée" };

export function RappelsCartesCorporatePage() {
  const clientRequete = useQueryClient();
  const [carteSelectionnee, setCarteSelectionnee] = useState<CarteCorporateEcheance | null>(null);
  const [dossierSelectionne, setDossierSelectionne] = useState<DossierCorporateEcheance | null>(null);
  const requete = useQuery({ queryKey: ["echeances-cartes-corporate"], queryFn: listerEcheancesCartesCorporate, refetchInterval: 60_000 });
  const rafraichir = () => { void clientRequete.invalidateQueries({ queryKey: ["echeances-cartes-corporate"] }); void clientRequete.invalidateQueries({ queryKey: ["notifications", "RESPONSABLE"] }); };
  const demande = useMutation({ mutationFn: (id: number) => genererDemandeReactivationCorporate(id),
    onSuccess: () => { message.success("Demande envoyée au superviseur du parking."); setCarteSelectionnee(null); rafraichir(); },
    onError: (e) => message.error(erreur(e)) });
  const cloture = useMutation({ mutationFn: (id: number) => cloturerReactivationCorporate(id),
    onSuccess: () => { message.success("Dossier clôturé et conservé dans l'historique."); setDossierSelectionne(null); rafraichir(); },
    onError: (e) => message.error(erreur(e)) });

  const cartes = requete.data?.cartes || [];
  const historique = requete.data?.historique || [];
  const colonnesCartes: ColumnsType<CarteCorporateEcheance> = [
    { title: "Carte / N° physique", key: "carte", render: (_, c) => <><strong>{c.reference}</strong><br /><Text type="secondary">{c.numero || "—"}</Text></> },
    { title: "Entreprise", dataIndex: "entrepriseNom" },
    { title: "Parking", dataIndex: "parkingNom", render: (v) => v || "—" },
    { title: "Immatriculation", dataIndex: "immatriculation", render: (v) => v || "—" },
    { title: "Dernière activation", dataIndex: "dateActivation", render: date },
    { title: "Rappel J−2", key: "rappel2", render: (_, c) => <><span>{date(c.dateRappelAnticipe)}</span><br /><Tag color={c.rappelAnticipeEnvoye ? "gold" : "default"}>{c.rappelAnticipeEnvoye ? "Rappel émis" : "À venir"}</Tag></> },
    { title: "Échéance 24 mois", key: "echeance", render: (_, c) => <><strong>{date(c.dateEcheance)}</strong><br /><Tag color={c.rappelEcheanceEnvoye ? "red" : "default"}>{c.rappelEcheanceEnvoye ? "Second rappel émis" : "À venir"}</Tag></> },
    { title: "Suivi", key: "statut", render: (_, c) => c.statutDossier ? <Tag color={couleur[c.statutDossier]}>{libelle[c.statutDossier]}</Tag> : <Tag>Cycle en cours</Tag> },
    { title: "Action", key: "action", render: (_, c) => c.dateRappelAnticipe <= aujourdHui() && (!c.statutDossier || c.statutDossier === "A_TRAITER")
      ? <Button type="primary" size="small" onClick={() => setCarteSelectionnee(c)}>Générer demande de réactivation</Button> : <Text type="secondary">—</Text> },
  ];
  const colonnesHistorique: ColumnsType<DossierCorporateEcheance> = [
    { title: "Carte", dataIndex: "carteReference" }, { title: "Entreprise", dataIndex: "entrepriseNom" },
    { title: "Parking", dataIndex: "parkingNom", render: (v) => v || "—" },
    { title: "Échéance", dataIndex: "dateEcheance", render: date },
    { title: "Demande", key: "demande", render: (_, d) => <>{date(d.dateDemande)}<br /><Text type="secondary">{d.operationReference || "—"}</Text></> },
    { title: "Déclaration superviseur", key: "declaration", render: (_, d) => <>{date(d.dateDeclaration)}<br /><Text type="secondary">{d.superviseur || "—"}</Text></> },
    { title: "Statut", dataIndex: "statut", render: (v) => <Tag color={couleur[v]}>{libelle[v]}</Tag> },
    { title: "Action", key: "action", render: (_, d) => d.statut === "DECLAREE"
      ? <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setDossierSelectionne(d)}>Clôturer</Button> : <Text type="secondary">{d.dateCloture ? `Clôturé le ${date(d.dateCloture)}` : "—"}</Text> },
  ];

  return <div style={{ padding: "6px 12px 28px" }}>
    <Card style={{ background: "#fff", marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button icon={<ReloadOutlined />} loading={requete.isFetching} onClick={() => void requete.refetch()}>Actualiser</Button>
      </div>
      <Text type="secondary">Chaque carte a son propre cycle. La limite technique des barrières est de 24 mois ; le contrat corporate reste valable 20 ans.</Text>
      <Alert type="info" showIcon style={{ marginTop: 16 }} message="Deux rappels par cycle" description="Le premier est émis deux jours avant la fin des 24 mois, le second le jour de l’échéance. La demande peut alors être envoyée au superviseur du parking, qui confirme la réactivation après intervention sur la barrière." />
    </Card>
    {requete.isError && <Alert type="error" showIcon message="Impossible de charger les cartes corporate" description={erreur(requete.error)} style={{ marginBottom: 16 }} />}
    <Card style={{ background: "#fff", marginBottom: 18 }} title={<Space><ClockCircleOutlined style={{ color: "#006398" }} />Suivi des cartes corporate <Tag color="blue">{cartes.length} cartes</Tag></Space>}>
      <Table rowKey="id" loading={requete.isLoading} dataSource={cartes} columns={colonnesCartes} scroll={{ x: 1450 }} pagination={{ pageSize: 10 }} />
    </Card>
    <Card style={{ background: "#fff" }} title={<Space><HistoryOutlined style={{ color: "#006398" }} />Demandes et historique <Tag color="cyan">{historique.length}</Tag></Space>}>
      <Table rowKey="id" dataSource={historique} columns={colonnesHistorique} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} />
    </Card>
    <Modal title="Générer la demande de réactivation" open={Boolean(carteSelectionnee)} onCancel={() => setCarteSelectionnee(null)}
      okText="Envoyer au superviseur" confirmLoading={demande.isPending} onOk={() => carteSelectionnee && demande.mutate(carteSelectionnee.id)}>
      <p>Carte <strong>{carteSelectionnee?.reference}</strong> · {carteSelectionnee?.entrepriseNom} · échéance le {date(carteSelectionnee?.dateEcheance)}.</p>
      <p>Le superviseur doit réactiver la carte dans le système de barrières puis déclarer cette intervention dans la plateforme.</p>
    </Modal>
    <Modal title="Clôturer la réactivation" open={Boolean(dossierSelectionne)} onCancel={() => setDossierSelectionne(null)}
      okText="Clôturer le dossier" confirmLoading={cloture.isPending} onOk={() => dossierSelectionne && cloture.mutate(dossierSelectionne.id)}>
      <p>Le superviseur <strong>{dossierSelectionne?.superviseur}</strong> a déclaré la réactivation le {date(dossierSelectionne?.dateDeclaration)}.</p>
      <p>Le dossier sera conservé dans l'historique après clôture.</p>
    </Modal>
  </div>;
}
