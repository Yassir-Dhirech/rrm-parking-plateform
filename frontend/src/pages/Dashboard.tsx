import { Card, Row, Col, Statistic } from "antd";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../lib/roleConfig";

export function Dashboard() {
  const { role } = useAuth();
  if (!role) return null;

  const config = roleConfig[role];

  return (
    <Row gutter={16}>
      {config.kpis.map((label) => (
        <Col span={8} key={label}>
          <Card>
            <Statistic title={label} value={0} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}