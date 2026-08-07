import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import "./LandingPage.module.css";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PublicNavbar />

      <section id="accueil" className="landing-hero">
        <h1>Gestion des abonnements de parking</h1>
        <p>
          Rabat Région Mobilité facilite la gestion de vos abonnements de
          stationnement dans les 17 parkings de la région. Soumettez votre
          demande en quelques minutes.
          
        </p>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/demande-publique")}
        >
          Faire une demande d'abonnement
        </Button>
      </section>

      <section id="abonnement" className="landing-subscribe">
        <h2>Choisissez votre type d'abonnement</h2>
        <div className="landing-subscribe-cards">
          <Card className="landing-subscribe-card">
            <h3>Particulier</h3>
            <p>
              Idéal pour un usage individuel. Choisissez une durée de 3, 6, 9
              ou 12 mois selon vos besoins, pour un véhicule.
            </p>
            <Button type="primary" onClick={() => navigate("/demande-publique")}>
              Faire ma demande
            </Button>
          </Card>

          <Card className="landing-subscribe-card">
            <h3>Entreprise</h3>
            <p>
              Pour les entreprises souhaitant abonner plusieurs véhicules dans
              le cadre d'un contrat sur mesure.
            </p>
            <Button type="primary" onClick={() => navigate("/demande-publique")}>
              Faire ma demande
            </Button>
          </Card>
        </div>
      </section>

      <section id="about" className="landing-section">
        <h2>À propos de RRM</h2>
        <p>
          Rabat Région Mobilité est l'opérateur public de mobilité urbaine de
          la région Rabat-Salé-Témara, en charge du tramway, des bus, et de la
          gestion du stationnement dans 17 parkings.
        </p>
      </section>
    </div>
  );
}