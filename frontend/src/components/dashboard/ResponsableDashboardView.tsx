import { Col, Row } from "antd";
import { ResponsableKpiRow } from "./ResponsableKpiRow";
import { ResponsableActiveSubscriptionsByParkingChart } from "./ResponsableActiveSubscriptionsByParkingChart";
import { ResponsableMonthlyRevenueAreaChart } from "./ResponsableMonthlyRevenueAreaChart";
import { ResponsablePendingValidationList } from "./ResponsablePendingValidationList";
import { ResponsableParkingMixDonut } from "./ResponsableParkingMixDonut";
import { ResponsableParkingMap } from "./ResponsableParkingMap";
import { ResponsableTasksCard } from "./ResponsableTasksCard";
import { ChiffreAffairesDashboard } from "./financial/ChiffreAffairesDashboard";
import "./ResponsableDashboardGlass.css";
import "./ResponsableDashboardLight.css";

export function ResponsableDashboardView() {
  return (
    <div className="space-y-6 responsable-dashboard-glass">
      <Row gutter={[16, 16]} align="stretch" className="responsable-dashboard-layout">
        <Col xs={24} xl={16} className="responsable-dashboard-layout__primary">
          <div className="responsable-dashboard-layout__primary-stack">
            <ResponsableKpiRow />
            <Row gutter={[16, 16]} align="stretch" className="responsable-dashboard-layout__charts">
              <Col xs={24} lg={12} className="responsable-dashboard-layout__chart-column">
                <div className="responsable-dashboard-layout__chart-stack">
                  <ResponsableActiveSubscriptionsByParkingChart />
                  <ResponsablePendingValidationList />
                </div>
              </Col>
              <Col xs={24} lg={12} className="responsable-dashboard-layout__chart-column">
                <div className="responsable-dashboard-layout__chart-stack">
                  <ResponsableMonthlyRevenueAreaChart />
                  <ResponsableParkingMixDonut />
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col xs={24} xl={8} className="responsable-dashboard-layout__secondary">
          <div className="responsable-dashboard-layout__secondary-stack">
            <ResponsableParkingMap />
            <ResponsableTasksCard />
          </div>
        </Col>
      </Row>

      <ChiffreAffairesDashboard audience="RESPONSABLE" />
    </div>
  );
}
