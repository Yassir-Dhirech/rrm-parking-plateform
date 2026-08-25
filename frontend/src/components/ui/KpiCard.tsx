import React from "react";
import { Card, Statistic } from "antd";

export interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
  precision?: number;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  prefix,
  suffix,
  color = "#003566",
  precision,
  onClick,
}: KpiCardProps) {
  return (
    <Card
      bordered={false}
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${color}`,
        boxShadow: "var(--shadow-sm)",
        borderRadius: 12,
        cursor: onClick ? "pointer" : "default",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      styles={{ body: { width: "100%" } }}
    >
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision ?? (suffix === "%" ? 1 : 0)}
        valueStyle={{ color, fontWeight: 700 }}
      />
    </Card>
  );
}
