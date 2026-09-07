import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { router } from "./routes/router";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import "antd/dist/reset.css";
import "./Styles/tailwind.css";
import "./Styles/theme.css";
import { themeConfig } from "./lib/theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider theme={themeConfig}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);