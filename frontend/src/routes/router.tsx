import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleLayout } from "../layouts/RoleLayout";
import { Dashboard } from "../pages/Dashboard";
import { LoginPage } from "../features/auth/LoginPage";
import { Unauthorized } from "../pages/Unauthorized";
import { NotFound } from "../pages/NotFound";
import { PublicQrForm } from "../features/demandes/pages/PublicQrForm";
import { roleConfig,type Role } from "../lib/roleConfig";
import {DemandesList } from "../features/demandes/pages/DemandesList";
const roleRoutes = (Object.keys(roleConfig) as Role[]).map((role) => {
  const extraRoutes =
    role === "AGENT"
      ? [{ path: "/agent/demandes", element: <DemandesList /> }]
      : [];

  return {
    element: <ProtectedRoute allowedRoles={[role]} />,
    children: [
      {
        element: <RoleLayout />,
        children: [
          { path: roleConfig[role].homePath, element: <Dashboard /> },
          ...extraRoutes,
        ],
      },
    ],
  };
});

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/demande-publique", element: <PublicQrForm /> },
  {path: "/", element: <LoginPage  />},
  ...roleRoutes,
  { path: "*", element: <NotFound /> },
]);