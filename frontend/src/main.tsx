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
      <AuthProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1B7A79",
              colorSuccess: "#2E7D32",
              colorWarning: "#E8A93A",
              colorError: "#C0392B",
              colorBgLayout: "#F7F8FA",
              fontFamily: "Inter, sans-serif",
              borderRadius: 6,
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);