import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleLayout } from "../layouts/RoleLayout";
import { Dashboard } from "../pages/Dashboard";
import { LoginPage } from "../features/auth/LoginPage";
import { Unauthorized } from "../pages/Unauthorized";
import { NotFound } from "../pages/NotFound";
import { PublicQrForm } from "../features/demandes/pages/PublicQrForm";
import { roleConfig,type Role } from "../lib/roleConfig";

const roleRoutes = (Object.keys(roleConfig) as Role[]).map((role) => ({
  element: <ProtectedRoute allowedRoles={[role]} />,
  children: [
    {
      element: <RoleLayout />,
      children: [
        { path: roleConfig[role].homePath, element: <Dashboard /> },
        // future feature routes for this role get added here later
      ],
    },
  ],
}));

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/demande-publique", element: <PublicQrForm /> },
  ...roleRoutes,
  { path: "*", element: <NotFound /> },
]);