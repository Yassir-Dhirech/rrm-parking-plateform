import type { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#003566",
    colorLink: "#003566",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#003566",
    colorBgLayout: "#F4F6FA",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    borderRadius: 8,
  },
  components: {
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Table: {
      borderRadius: 8,
      headerBg: "#F8FAFC",
      headerColor: "#475569",
    },
    Menu: {
      darkItemBg: "#003566",
      darkSubMenuItemBg: "#002244",
      darkItemSelectedBg: "rgba(255, 255, 255, 0.15)",
      darkItemHoverBg: "rgba(255, 255, 255, 0.08)",
    },
    Tag: {
      borderRadius: 6,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 16,
    },
  },
};
