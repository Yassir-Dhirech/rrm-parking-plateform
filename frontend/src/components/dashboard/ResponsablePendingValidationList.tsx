import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { Button, Skeleton, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { getPendingValidationRequests } from "../../api/responsableDashboard";
import "./ResponsablePendingValidationList.css";

function formatStatus(statut: string): string {
  if (statut === "PAYEE") {
    return "À valider";
  }

  if (statut === "EN_ATTENTE_VALIDATION_RESPONSABLE") {
    return "Validation responsable";
  }

  return statut.replaceAll("_", " ");
}

function statusClassName(statut: string): string {
  if (statut === "EN_ATTENTE_VALIDATION_RESPONSABLE") {
    return "responsable-pending-status responsable-pending-status--corporate";
  }

  return "responsable-pending-status responsable-pending-status--paid";
}

export function ResponsablePendingValidationList() {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["responsable-dashboard-pending-validation"],
    queryFn: getPendingValidationRequests,
    staleTime: 30_000,
  });

  if (query.isLoading) {
    return (
      <section className="responsable-pending-card glass-effect">
        <Skeleton active paragraph={{ rows: 7 }} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="responsable-pending-card glass-effect responsable-pending-state">
        <strong>Demandes en attente de validation</strong>
        <span>Données momentanément indisponibles.</span>
      </section>
    );
  }

  const data = query.data;

  return (
    <section className="responsable-pending-card glass-effect">
      <header className="responsable-pending-header">
        <div className="responsable-pending-heading">
          <span className="responsable-pending-icon">
            <FileSearchOutlined />
          </span>

          <div className="responsable-pending-heading-copy">
            <h3>Demandes en attente de validation</h3>
            <p>
              Toutes les demandes nécessitant une décision du responsable,
              classées des plus anciennes aux plus récentes.
            </p>
          </div>
        </div>

        <div className="responsable-pending-kpi">
          <span>En attente</span>
          <strong>{data.total.toLocaleString("fr-FR")}</strong>
        </div>
      </header>

      {data.demandes.length === 0 ? (
        <div className="responsable-pending-empty">
          <span className="responsable-pending-empty__icon">
            <FileSearchOutlined />
          </span>
          <strong>Aucune demande à valider</strong>
          <p>Toutes les demandes ont été traitées.</p>
        </div>
      ) : (
        <div className="responsable-pending-list" role="list">
          {data.demandes.map((demande) => (
            <article
              key={demande.id}
              className="responsable-pending-item"
              role="listitem"
            >
              <div className="responsable-pending-item__main">
                <div className="responsable-pending-reference">
                  {demande.reference}
                </div>

                <div
                  className="responsable-pending-client"
                  title={demande.client}
                >
                  {demande.client}
                </div>
              </div>

              <div className="responsable-pending-item__status">
                <Tag className={statusClassName(demande.statut)}>
                  {formatStatus(demande.statut)}
                </Tag>
              </div>

              <div className="responsable-pending-action">
                <Button
                  type="text"
                  size="small"
                  onClick={() => navigate("/responsable/demandes")}
                  icon={<ArrowRightOutlined />}
                >
                  Examiner
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {data.demandes.length > 0 && (
        <button
          type="button"
          className="responsable-pending-open-workspace"
          onClick={() => navigate("/responsable/demandes")}
        >
          Ouvrir l’espace de validation
          <ArrowRightOutlined />
        </button>
      )}
    </section>
  );
}
