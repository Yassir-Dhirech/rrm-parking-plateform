import { useQuery } from "@tanstack/react-query";
import { ArrowRightOutlined, FileSearchOutlined } from "@ant-design/icons";
import { Button, Skeleton, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { getPendingValidationRequests } from "../../api/responsableDashboard";
import "./ResponsablePendingValidationList.css";

function formatStatus(statut: string): string {
  if (statut === "PAYEE") return "À valider";
  return statut.replaceAll("_", " ");
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
        <Skeleton active paragraph={{ rows: 6 }} />
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

          <div>
            <h3>Demandes en attente de validation</h3>
            <p>Les 6 dossiers les plus anciens à examiner</p>
          </div>
        </div>

        <div className="responsable-pending-kpi">
          <span>Total</span>
          <strong>{data.total.toLocaleString("fr-FR")}</strong>
        </div>
      </header>

      {data.demandes.length === 0 ? (
        <div className="responsable-pending-empty">
          Aucune demande en attente de validation.
        </div>
      ) : (
        <div className="responsable-pending-table-wrap">
          <table className="responsable-pending-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Statut</th>
                <th aria-label="Action" />
              </tr>
            </thead>

            <tbody>
              {data.demandes.map((demande) => (
                <tr key={demande.id}>
                  <td className="responsable-pending-reference">
                    {demande.reference}
                  </td>
                  <td className="responsable-pending-client">
                    {demande.client}
                  </td>
                  <td>
                    <Tag className="responsable-pending-status">
                      {formatStatus(demande.statut)}
                    </Tag>
                  </td>
                  <td className="responsable-pending-action">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => navigate("/responsable/demandes")}
                      icon={<ArrowRightOutlined />}
                    >
                      Examiner
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.total > 6 && (
        <button
          type="button"
          className="responsable-pending-view-all"
          onClick={() => navigate("/responsable/demandes")}
        >
          Voir toutes les demandes en attente
          <ArrowRightOutlined />
        </button>
      )}
    </section>
  );
}
