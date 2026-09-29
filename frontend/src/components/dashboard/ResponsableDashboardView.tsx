import { Col, Row } from "antd";
import { ResponsableKpiRow } from "./ResponsableKpiRow";
import { ResponsableActiveSubscriptionsByParkingChart } from "./ResponsableActiveSubscriptionsByParkingChart";
import { ResponsableMonthlyRevenueAreaChart } from "./ResponsableMonthlyRevenueAreaChart";
import { ResponsablePendingValidationList } from "./ResponsablePendingValidationList";
import { ResponsableParkingMixDonut } from "./ResponsableParkingMixDonut";
import { ResponsableParkingMap } from "./ResponsableParkingMap";
import { ChiffreAffairesDashboard } from "./financial/ChiffreAffairesDashboard";
import "./ResponsableDashboardGlass.css";

export function ResponsableDashboardView() {
  return (
    <div className="space-y-6 responsable-dashboard-glass">
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={16}>
          <div className="space-y-4">
            <ResponsableKpiRow />
            <Row gutter={[16, 16]} align="top">
              <Col xs={24} lg={12}>
                <div className="space-y-4">
                  <ResponsableActiveSubscriptionsByParkingChart />
                  <ResponsablePendingValidationList />
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="space-y-4">
                  <ResponsableMonthlyRevenueAreaChart />
                  <ResponsableParkingMixDonut />
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col xs={24} xl={8}>
          <ResponsableParkingMap />
        </Col>
      </Row>

      <ChiffreAffairesDashboard audience="RESPONSABLE" />
    </div>
  );
}
