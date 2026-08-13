import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { router } from "./routes/router";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import "antd/dist/reset.css";
import "./Styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider >
        <ConfigProvider
          theme={{
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
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);