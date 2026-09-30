import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Pagination, Rate, Spin, Tag, message } from "antd";
import { FilePdfOutlined, MessageOutlined, StarFilled } from "@ant-design/icons";
import { consulterAvis, rapportAvis, statistiquesAvis } from "../../api/avisApi";
import "./AvisFeedbackPage.css";

const COULEURS = ["#ed6a5a", "#f4a261", "#e9b949", "#4da9bb", "#126994"];
const TYPES: Record<string, string> = {
  SUGGESTION: "Suggestion", SATISFACTION: "Compliment",
  RECLAMATION: "Dysfonctionnement", AUTRE: "Autre remarque",
};

export function AvisFeedbackPage() {
  const [page, setPage] = useState(0);
  const [exportEnCours, setExportEnCours] = useState(false);
  const stats = useQuery({ queryKey: ["responsable-avis-stats"], queryFn: statistiquesAvis });
  const liste = useQuery({ queryKey: ["responsable-avis", page], queryFn: () => consulterAvis(page) });

  const repartition = stats.data?.repartition ?? [];
  let angle = 0;
  const segments = repartition.map((r) => {
    const debut = angle;
    angle += r.pourcentage * 3.6;
    return `${COULEURS[r.note - 1]} ${debut}deg ${angle}deg`;
  });
  const fond = stats.data?.total ? `conic-gradient(${segments.join(", ")})` : "#e5eaf1";

  async function exporter() {
    setExportEnCours(true);
    try {
      const fichier = await rapportAvis();
      const url = URL.createObjectURL(fichier);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = "rapport-avis-rrm.pdf";
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      message.error("Le rapport PDF n'a pas pu être généré.");
    } finally {
      setExportEnCours(false);
    }
  }

  return <main className="avis-page">
    {(stats.isError || liste.isError) && <Alert type="error" showIcon
      message="Impossible de charger les avis. Vérifiez la connexion, puis rechargez la page." />}
    {stats.isPending ? <Spin /> : stats.data && <>
      <section className="avis-page__kpis" aria-label="Indicateurs des avis">
        <Card className="avis-page__kpi avis-page__kpi--rating">
          <div className="avis-page__kpi-head"><span>Note moyenne</span><StarFilled /></div>
          <strong>{stats.data.moyenne.toFixed(2)} <small>/ 5</small></strong>
          <p>Évaluation globale des usagers</p>
        </Card>
        <Card className="avis-page__kpi avis-page__kpi--total">
          <div className="avis-page__kpi-head"><span>Nombre total de feedbacks</span><MessageOutlined /></div>
          <strong>{stats.data.total.toLocaleString("fr-FR")}</strong>
          <p>Retours reçus depuis le formulaire public</p>
        </Card>
        <Card className="avis-page__kpi avis-page__kpi--five">
          <div className="avis-page__kpi-head"><span>Avis avec 5 étoiles</span><StarFilled /></div>
          <strong>{stats.data.cinqEtoiles.toLocaleString("fr-FR")}</strong>
          <p>Meilleures évaluations</p>
        </Card>
        <Card className="avis-page__export-card">
          <div className="avis-page__kpi-head"><span>Rapport des avis</span><FilePdfOutlined /></div>
          <strong>Exporter en PDF</strong>
          <Button type="primary" icon={<FilePdfOutlined />} loading={exportEnCours}
            onClick={() => void exporter()}>Générer le rapport</Button>
        </Card>
      </section>

      <div className="avis-page__content">
      <section className="avis-page__analyses" aria-label="Répartition des évaluations">
        <Card title="Répartition par nombre d’étoiles" className="avis-page__graph">
          {[...repartition].reverse().map((r) => <div className="avis-page__bar-row" key={r.note}>
            <span>{r.note} <StarFilled aria-label="étoile" /></span>
            <div className="avis-page__bar-track"><div className="avis-page__bar-fill"
              style={{ width: `${r.pourcentage}%`, background: COULEURS[r.note - 1] }} /></div>
            <strong>{r.nombre}</strong><small>{r.pourcentage.toFixed(1)} %</small>
          </div>)}
        </Card>
        <Card title="Part des notes" className="avis-page__graph">
          <div className="avis-page__pie-layout">
            <div className="avis-page__pie" style={{ background: fond }} role="img"
              aria-label="Diagramme circulaire des pourcentages des notes de une à cinq étoiles">
              <div className="avis-page__pie-center"><strong>{stats.data.total}</strong><span>avis reçus</span></div>
            </div>
            <ul className="avis-page__legend">{[...repartition].reverse().map((r) => <li key={r.note}>
              <i style={{ background: COULEURS[r.note - 1] }} />
              <span>{r.note} étoile{r.note > 1 ? "s" : ""}</span><strong>{r.pourcentage.toFixed(1)} %</strong>
            </li>)}</ul>
          </div>
        </Card>
      </section>

    <section className="avis-page__list" aria-labelledby="avis-list-title">
      <div className="avis-page__list-heading"><div><span>Retours des usagers</span>
        <h2 id="avis-list-title">Feedbacks récents</h2></div>
        <strong>{liste.data?.totalElements ?? stats.data.total} avis</strong></div>
      {liste.isPending ? <Spin /> : liste.data?.content.length === 0 ? <Empty description="Aucun avis reçu pour le moment" /> :
        liste.data?.content.map((avis) => <Card className="avis-page__review" key={avis.id}>
          <div className="avis-page__review-head"><div><strong>{avis.nomContact || "Visiteur anonyme"}</strong>
            <p>{new Date(avis.dateCreation).toLocaleString("fr-FR")} · {avis.parkingNom || "Parking non précisé"}</p></div>
            <Rate disabled value={avis.noteSatisfaction} /></div>
          <Tag color="blue">{TYPES[avis.typeAvis] ?? avis.typeAvis}</Tag>
          <p className="avis-page__message">{avis.message}</p>
          <p className="avis-page__contact">Contact : {avis.contactInfo || "Non renseigné"}</p>
        </Card>)}
      {!!liste.data?.totalElements && <Pagination current={page + 1} pageSize={10}
        total={liste.data.totalElements} showSizeChanger={false}
        onChange={(suivante) => setPage(suivante - 1)} />}
    </section>
      </div>
    </>}
  </main>;
}
