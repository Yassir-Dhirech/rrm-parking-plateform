import {
  SearchOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileDoneOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Empty, Input, List, Row, Skeleton, Space, Statistic, Tag, Typography } from "antd";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAgentActions, getAgentDashboardKpis, rechercherAgent } from "../../api/agentDashboard";
import "./Dashboard.css";

const formatMontant = (montant: number): string =>
  new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montant);

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));

const formatDateHeure = (date: string | null): string => date
  ? new Intl.DateTimeFormat("fr-MA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(date))
  : "Date indisponible";

export function AgentDashboard() {
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState("");
  const terme = useDeferredValue(recherche.trim());
  const actions = useQuery({
    queryKey: ["agent-dashboard-actions"],
    queryFn: getAgentActions,
    refetchInterval: 60_000,
  });
  const resultats = useQuery({
    queryKey: ["agent-dashboard-recherche", terme],
    queryFn: () => rechercherAgent(terme),
    enabled: terme.length >= 2,
  });
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["agent-dashboard-kpis"],
    queryFn: getAgentDashboardKpis,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="agent-dashboard">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="agent-dashboard">
        <Alert
          type="error"
          showIcon
          message="Impossible de charger le tableau de bord"
          description="Vérifiez que l'agent possède une affectation active à un parking."
          action={(
            <Button onClick={() => refetch()}>
              Réessayer
            </Button>
          )}
        />
      </div>
    );
  }

  const kpis = [
    {
      key: "demandes",
      title: "Demandes à encaisser",
      value: data.demandesAEncaisser,
      description: `Demandes en attente de paiement pour ${data.parkingNom}`,
      icon: <FileDoneOutlined />,
      color: "#d97706",
      route: "/agent/demandes",
    },
    {
      key: "encaissements",
      title: "Encaissements du jour TTC",
      value: formatMontant(data.encaissementsJourTtc),
      suffix: "DH",
      description: `${data.nombreEncaissementsJour} paiement${data.nombreEncaissementsJour > 1 ? "s" : ""} confirmé${data.nombreEncaissementsJour > 1 ? "s" : ""} par vous`,
      icon: <DollarOutlined />,
      color: "#059669",
      route: "/agent/demandes",
    },
    {
      key: "impressions",
      title: "Cartes à imprimer",
      value: data.cartesAImprimer,
      description: "Demandes d'impression ouvertes pour votre parking",
      icon: <PrinterOutlined />,
      color: "#2563eb",
      route: "/agent/impressions-cartes",
    },
    {
      key: "remises",
      title: "Cartes à remettre",
      value: data.cartesARemettre,
      description: "Cartes actives prêtes à être remises aux clients",
      icon: <CreditCardOutlined />,
      color: "#7c3aed",
      route: "/agent/remises-cartes",
    },
  ];

  return (
    <section className="agent-dashboard">
      <header className="agent-dashboard__header">
        <div>
          <Typography.Title level={2}>Tableau de bord agent</Typography.Title>
          <Typography.Text type="secondary">
            {data.parkingNom} · situation du {formatDate(data.dateReference)}
          </Typography.Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          loading={isFetching}
          onClick={() => { void refetch(); void actions.refetch(); if (terme.length >= 2) void resultats.refetch(); }}
        >
          Actualiser
        </Button>
      </header>

      <Row gutter={[16, 16]}>
        {kpis.map((kpi) => (
          <Col xs={24} sm={12} xl={6} key={kpi.key}>
            <Card
              className="agent-dashboard__kpi"
              hoverable
              onClick={() => navigate(kpi.route)}
              style={{ borderTopColor: kpi.color }}
            >
              <Space align="start" size={14}>
                <span
                  className="agent-dashboard__kpi-icon"
                  style={{ color: kpi.color, backgroundColor: `${kpi.color}14` }}
                >
                  {kpi.icon}
                </span>
                <div>
                  <Statistic
                    title={kpi.title}
                    value={kpi.value}
                    suffix={kpi.suffix}
                    valueStyle={{ color: kpi.color, fontWeight: 700 }}
                  />
                  <Typography.Paragraph
                    type="secondary"
                    className="agent-dashboard__kpi-description"
                  >
                    {kpi.description}
                  </Typography.Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} className="agent-dashboard__sections">
        <Col xs={24} lg={14}>
          <Card title="Mes actions à traiter" extra={(
            <Typography.Text type="secondary">{data.parkingNom}</Typography.Text>
          )}>
            {actions.isError && <Alert showIcon type="error" message="Impossible de charger les actions" />}
            {actions.data && actions.data.alertesRetard > 0 && (
              <Alert className="agent-dashboard__alert" showIcon type="warning"
                message={`${actions.data.alertesRetard} action(s) en attente depuis plus longtemps que le seuil de suivi`}
                description="Paiement : 48 h · impression : 24 h · remise : 72 h. Ces seuils servent uniquement au suivi."
              />
            )}
            <List loading={actions.isPending} locale={{ emptyText: <Empty description="Aucune action en attente" /> }}
              dataSource={actions.data?.actions ?? []}
              renderItem={(action) => (
                <List.Item actions={[
                  <Button key="ouvrir" type="link" onClick={() => navigate(action.lien)}>Ouvrir</Button>,
                ]}>
                  <List.Item.Meta
                    title={<Space wrap><span>{action.reference}</span>
                      <Tag color={action.enRetard ? "orange" : "blue"}>
                        {action.type === "PAIEMENT" ? "Paiement" : action.type === "IMPRESSION" ? "Impression" : "Remise"}
                      </Tag>{action.enRetard && <Tag color="red">À relancer</Tag>}
                    </Space>}
                    description={`${action.nomClient || "Client non renseigné"} · ${action.identifiantClient || "—"} · depuis le ${formatDateHeure(action.depuis)} · ${action.ancienneteHeures} h d’attente`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Recherche rapide">
            <Input prefix={<SearchOutlined />} allowClear value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              placeholder="Référence, CIN, numéro de carte, nom ou prénom"
              aria-label="Rechercher une demande ou une carte" maxLength={100} />
            <Typography.Paragraph type="secondary" className="agent-dashboard__search-hint">
              Demandes régulières de tous les parkings ; cartes de votre parking uniquement.
            </Typography.Paragraph>
            {resultats.isError && <Alert type="error" showIcon message="Recherche indisponible" />}
            {terme.length >= 2 && <List loading={resultats.isFetching} size="small"
              locale={{ emptyText: <Empty description="Aucun dossier trouvé" /> }}
              dataSource={resultats.data ?? []}
              renderItem={(item) => <List.Item actions={[
                <Button key="ouvrir" type="link" onClick={() => navigate(item.lien)}>Ouvrir</Button>,
              ]}>
                <List.Item.Meta title={<Space wrap><Tag>{item.type === "CARTE" ? "Carte" : "Demande"}</Tag>{item.reference}</Space>}
                  description={`${item.nomClient || "—"} · ${item.parkingNom || "—"} · ${item.statut.replaceAll("_", " ")}`} />
              </List.Item>}
            />}
          </Card>
        </Col>
      </Row>
    </section>
  );
}
