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
import { DemandeDetail } from "../features/demandes/pages/DemandeDetail";
import { AbonnementsList } from "../features/abonnements/pages/AbonnementsList";
import { AbonnementDetail } from "../features/abonnements/pages/AbonnementDetail";
import { PaiementsList } from "../features/paiements/pages/PaiementsList";
import { PaiementDetail } from "../features/paiements/pages/PaiementDetail";
import { FacturesList } from "../features/factures/pages/FacturesList";
import { FactureDetail } from "../features/factures/pages/FactureDetail";
import { CartesList } from "../features/cartes/pages/CartesList";
import { CarteDetail } from "../features/cartes/pages/CarteDetail";





const roleRoutes = (Object.keys(roleConfig) as Role[]).map((role) => {
  const extraRoutes = [];

  if (role === "AGENT" || role === "SUPERVISEUR" || role === "RESPONSABLE") {
  extraRoutes.push(
    { path: `${roleConfig[role].homePath}/demandes`, element: <DemandesList /> },
    { path: `${roleConfig[role].homePath}/demandes/:id`, element: <DemandeDetail /> },
  );
}

if (role === "SUPERVISEUR" || role === "RESPONSABLE") {
  extraRoutes.push(
    { path: `${roleConfig[role].homePath}/abonnements`, element: <AbonnementsList /> },
    { path: `${roleConfig[role].homePath}/abonnements/:id`, element: <AbonnementDetail /> },
  );
}

if (role === "AGENT" || role === "SUPERVISEUR" || role === "COMPTABLE") {
  extraRoutes.push(
    { path: `${roleConfig[role].homePath}/paiements`, element: <PaiementsList /> },
    { path: `${roleConfig[role].homePath}/paiements/:id`, element: <PaiementDetail /> },
  );
}

if (role === "SUPERVISEUR" || role === "RESPONSABLE" || role === "COMPTABLE") {
  extraRoutes.push(
    { path: `${roleConfig[role].homePath}/factures`, element: <FacturesList /> },
    { path: `${roleConfig[role].homePath}/factures/:id`, element: <FactureDetail /> },
  );
}

if (role === "AGENT" || role === "SUPERVISEUR") {
  extraRoutes.push(
    { path: `${roleConfig[role].homePath}/cartes`, element: <CartesList /> },
    { path: `${roleConfig[role].homePath}/cartes/:id`, element: <CarteDetail /> },
  );
}

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