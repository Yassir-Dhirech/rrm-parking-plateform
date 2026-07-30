import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../features/auth/LoginPage";
import { Unauthorized } from "../pages/Unauthorized";
import { NotFound } from "../pages/NotFound";

import { AgentLayout } from "../layouts/AgentLayout";
import { SuperviseurLayout } from "../layouts/SuperviseurLayout";
import { ResponsableLayout } from "../layouts/ResponsableLayout";
import { ComptableLayout } from "../layouts/ComptableLayout";
import { ReportingLayout } from "../layouts/ReportingLayout";
import { AdminLayout } from "../layouts/AdminLayout";

import { AgentDashboard } from "../pages/agent/Dashboard";
import { SuperviseurDashboard } from "../pages/superviseur/Dashboard";
import { ResponsableDashboard } from "../pages/responsable/Dashboard";
import { ComptableDashboard } from "../pages/comptable/Dashboard";
import { ReportingDashboard } from "../pages/reporting/Dashboard";
import { AdminDashboard } from "../pages/admin/Dashboard";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  {
    element: <ProtectedRoute allowedRoles={["AGENT"]} />,
    children: [
      {
        element: <AgentLayout />,
        children: [{ path: "/agent", element: <AgentDashboard /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["SUPERVISEUR"]} />,
    children: [
      {
        element: <SuperviseurLayout />,
        children: [{ path: "/superviseur", element: <SuperviseurDashboard /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["RESPONSABLE"]} />,
    children: [
      {
        element: <ResponsableLayout />,
        children: [{ path: "/responsable", element: <ResponsableDashboard /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["COMPTABLE"]} />,
    children: [
      {
        element: <ComptableLayout />,
        children: [{ path: "/comptable", element: <ComptableDashboard /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["RESP_REPORTING"]} />,
    children: [
      {
        element: <ReportingLayout />,
        children: [{ path: "/reporting", element: <ReportingDashboard /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["ADMIN_SI"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [{ path: "/admin", element: <AdminDashboard /> }],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);