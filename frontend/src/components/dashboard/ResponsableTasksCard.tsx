import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOutlined,
  AuditOutlined,
  FileDoneOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getPendingValidationRequests } from "../../api/responsableDashboard";
import { listerDemandesCorporateAValider } from "../../api/demandesApi";
import { listerDemandesValideesPourFacturation } from "../../api/facturationApi";
import "./ResponsableTasksCard.css";

const STATUTS_CORPORATE_ACTION = new Set([
  "EN_ATTENTE_VALIDATION_RESPONSABLE",
  "VALIDEE",
  "EN_ATTENTE_FACTURATION",
  "PRETE_A_FINALISER",
]);

export function ResponsableTasksCard() {
  const navigate = useNavigate();
  const demandes = useQuery({
    queryKey: ["responsable-dashboard-pending-validation"],
    queryFn: getPendingValidationRequests,
    refetchInterval: 60_000,
  });
  const corporate = useQuery({
    queryKey: ["demandes", "corporate", "a-valider", "", "ANCIEN"],
    queryFn: () => listerDemandesCorporateAValider("", "ANCIEN"),
    refetchInterval: 60_000,
  });
  const facturation = useQuery({
    queryKey: ["demandes", "validees", "", "ANCIEN"],
    queryFn: () => listerDemandesValideesPourFacturation("", "ANCIEN"),
    refetchInterval: 60_000,
  });

  const demandesPayees = demandes.data?.demandes.filter(d => d.statut === "PAYEE") ?? [];
  const corporateATraiter = corporate.data?.filter(d => STATUTS_CORPORATE_ACTION.has(d.statut)) ?? [];
  const facturesAGenerer = facturation.data?.filter(d => d.factureId == null) ?? [];
  const total = demandesPayees.length + corporateATraiter.length + facturesAGenerer.length;
  const chargement = demandes.isPending || corporate.isPending || facturation.isPending;
  const erreur = demandes.isError || corporate.isError || facturation.isError;

  const lignes = [
    {
      label: "Demandes payées à valider",
      detail: demandesPayees[0]?.reference ?? "Aucun dossier en attente",
      nombre: demandesPayees.length,
      lien: "/responsable/demandes",
      icone: <AuditOutlined />,
      ton: "cyan",
    },
    {
      label: "Dossiers corporate à traiter",
      detail: corporateATraiter[0]?.reference ?? "Aucun dossier en attente",
      nombre: corporateATraiter.length,
      lien: "/responsable/demandes-corporate",
      icone: <FileDoneOutlined />,
      ton: "violet",
    },
    {
      label: "Factures à générer",
      detail: facturesAGenerer[0]?.referenceDemande ?? "Aucune facture à générer",
      nombre: facturesAGenerer.length,
      lien: "/responsable/demandes-validees",
      icone: <FileTextOutlined />,
      ton: "orange",
    },
  ];

  return (
    <section className="responsable-tasks-card glass-effect" aria-labelledby="responsable-tasks-title">
      <header className="responsable-tasks-card__header">
        <div>
          <span className="responsable-tasks-card__eyebrow">Suivi opérationnel · Tous les parkings</span>
          <h2 id="responsable-tasks-title">Tâches à faire</h2>
        </div>
        <span className="responsable-tasks-card__total" aria-label={`${total} tâches en attente`}>
          {chargement ? "…" : erreur ? "!" : total}
        </span>
      </header>
      {erreur && <p className="responsable-tasks-card__error" role="alert">Certaines tâches sont momentanément indisponibles.</p>}
      <div className="responsable-tasks-card__list">
        {lignes.map(ligne => (
          <button key={ligne.lien} type="button" className="responsable-tasks-card__item"
            onClick={() => navigate(ligne.lien)}>
            <span className={`responsable-tasks-card__icon responsable-tasks-card__icon--${ligne.ton}`}>{ligne.icone}</span>
            <span className="responsable-tasks-card__text">
              <strong>{ligne.label}</strong>
              <small>{chargement ? "Chargement…" : ligne.detail}</small>
            </span>
            <span className="responsable-tasks-card__count">{chargement ? "…" : ligne.nombre}</span>
            <ArrowRightOutlined className="responsable-tasks-card__arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}
