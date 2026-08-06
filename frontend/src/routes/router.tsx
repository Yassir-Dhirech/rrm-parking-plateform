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
import { LandingPage } from "../pages/LandingPage";

const roleRoutes = (Object.keys(roleConfig) as Role[]).map((role) => {
  const extraRoutes =
    role === "AGENT" || role === "SUPERVISEUR" || role === "RESPONSABLE"
      ? [{ path: "/agent/demandes", element: <DemandesList /> },
        {path: "/agent/demandes/:id", element: <DemandesList />}]
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
  {path: "/", element: <LandingPage  />},
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/demande-publique", element: <PublicQrForm /> },
  
  ...roleRoutes,
  { path: "*", element: <NotFound /> },
]);