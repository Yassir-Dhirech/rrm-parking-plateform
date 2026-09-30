import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Segmented, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { CheckCircleOutlined, ClockCircleOutlined, StopOutlined, SearchOutlined } from "@ant-design/icons";
import { listerAbonnementsResponsable, type AbonnementResponsable } from "../../../api/responsableAbonnements";

const { Text } = Typography;
const date = (value: string | null) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR") : "—";
const type = (value: string) => value === "CORPORATE" ? <Tag color="purple">Entreprise</Tag>
  : value === "REGULIER_ENTREPRISE" ? <Tag color="purple">Régulier entreprise</Tag> : <Tag color="blue">Régulier</Tag>;
const statut = (value: string) => {
  if (value === "ACTIF") return <Tag color="green" icon={<CheckCircleOutlined />}>Actif</Tag>;
  if (value === "EN_ATTENTE_ACTIVATION") return <Tag color="gold" icon={<ClockCircleOutlined />}>En attente d’activation</Tag>;
  if (value === "SUSPENDU") return <Tag color="volcano" icon={<StopOutlined />}>Suspendu</Tag>;
  if (value === "EXPIRE") return <Tag color="red">Expiré</Tag>;
  return <Tag>{value}</Tag>;
};

export function BaseAbonnementsResponsablePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [onglet, setOnglet] = useState("TOUS");
  const [recherche, setRecherche] = useState("");
  const [rechercheDifferee, setRechercheDifferee] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => { setPage(0); setRechercheDifferee(recherche); }, 300);
    return () => window.clearTimeout(timer);
  }, [recherche]);
  const filtreStatut = ["ACTIF", "EN_ATTENTE_ACTIVATION", "SUSPENDU", "EXPIRE"].includes(onglet) ? onglet : "TOUS";
  const { data, isLoading, error } = useQuery({
    queryKey: ["responsable-abonnements", page, rechercheDifferee, filtreStatut],
    queryFn: () => listerAbonnementsResponsable(page, rechercheDifferee, filtreStatut),
  });
  const contenu = data?.content || [];
  const lignes = onglet === "REGULIER" ? contenu.filter((a) => a.type.startsWith("REGULIER"))
    : onglet === "ENTREPRISE" ? contenu.filter((a) => a.type === "CORPORATE" || a.type === "REGULIER_ENTREPRISE") : contenu;
  const choisirOnglet = (value: string) => { setPage(0); setOnglet(value); };

  const colonnes: ColumnsType<AbonnementResponsable> = [
    { title: "Référence", dataIndex: "reference", key: "reference", sorter: (a, b) => a.reference.localeCompare(b.reference), render: (value) => <strong>{value}</strong> },
    { title: "Type d'Abonnement", dataIndex: "type", key: "type", render: type },
    { title: "Client / Bénéficiaire", dataIndex: "clientNom", key: "clientNom", sorter: (a, b) => a.clientNom.localeCompare(b.clientNom) },
    { title: "Parking d'Attache", dataIndex: "parkingNom", key: "parkingNom", render: (value) => value || "—" },
    { title: "Créé / Traité Par", key: "acteur", render: () => <Text type="secondary">Non renseigné</Text> },
    { title: "Statut", dataIndex: "statut", key: "statut", render: statut },
    { title: "Date Début", dataIndex: "dateDebut", key: "dateDebut", sorter: (a, b) => (a.dateDebut || "").localeCompare(b.dateDebut || ""), render: date },
    { title: "Date Expiration", dataIndex: "dateFin", key: "dateFin", sorter: (a, b) => (a.dateFin || "").localeCompare(b.dateFin || ""), render: date },
    { title: "Relance Expiration", key: "relance", render: (_, a) => {
      if (!a.dateFin) return <Tag>Non définie</Tag>;
      const jours = Math.ceil((new Date(`${a.dateFin}T12:00:00`).getTime() - Date.now()) / 86400000);
      if (jours < 0) return <Tag color="red">Échéance passée</Tag>;
      if (jours <= 5) return <Tag color="volcano">Échéance proche · J−5</Tag>;
      if (jours <= 10) return <Tag color="gold">Échéance proche · J−10</Tag>;
      return <Tag color="green">Valide</Tag>;
    } },
    { title: "Action", key: "action", render: (_, a) => <Button size="small" onClick={(event) => { event.stopPropagation(); navigate(`/responsable/abonnements/${a.id}`); }}>Consulter</Button> },
  ];

  return <Card style={{ margin: "6px 12px 28px", background: "#fff" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
      <Text type="secondary" style={{ fontSize: 13 }}>Consulter les abonnements réels, leurs factures et leurs relances.</Text>
      <Input allowClear prefix={<SearchOutlined />} placeholder="Rechercher un abonnement" value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ width: 290 }} />
    </div>
    <Space wrap style={{ marginBottom: 16 }}>
      <Segmented value={onglet} onChange={(value) => choisirOnglet(String(value))} options={[
        { label: "Tous", value: "TOUS" }, { label: "En Attente", value: "EN_ATTENTE_ACTIVATION" },
        { label: "Actifs", value: "ACTIF" }, { label: "Réguliers", value: "REGULIER" },
        { label: "Entreprises", value: "ENTREPRISE" }, { label: "Suspendus", value: "SUSPENDU" },
      ]} />
    </Space>
    {error && <Text type="danger">Impossible de charger les abonnements.</Text>}
    <Table rowKey="id" dataSource={lignes} columns={colonnes} loading={isLoading} scroll={{ x: 1370, y: 550 }}
      pagination={{ current: page + 1, pageSize: data?.size || 20, total: data?.totalElements || 0,
        showSizeChanger: false, onChange: (next) => setPage(next - 1) }}
      onRow={(record) => ({ onClick: () => navigate(`/responsable/abonnements/${record.id}`), style: { cursor: "pointer" } })} />
    {(onglet === "REGULIER" || onglet === "ENTREPRISE") && <Text type="secondary" style={{ fontSize: 12 }}>Le filtre par type s'applique à la page affichée.</Text>}
  </Card>;
}
