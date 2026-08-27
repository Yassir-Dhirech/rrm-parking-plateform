import { createBrowserRouter, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleLayout } from "../layouts/RoleLayout";
import { Dashboard } from "../pages/Dashboard";
import { LoginPage } from "../features/auth/LoginPage";
import { Unauthorized } from "../pages/Unauthorized";
import { NotFound } from "../pages/NotFound";
import { PublicQrForm } from "../features/demandes/pages/PublicQrForm";
import { roleConfig, type Role } from "../lib/roleConfig";
import { DemandesList } from "../features/demandes/pages/DemandesList";
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
import { ContratDetail } from "../features/contrats/pages/ContratDetail";
import { ContratsList } from "../features/contrats/pages/ContratsList";
import { RecettesList } from "../features/recettes/pages/RecettesList";
import { RecetteDetail } from "../features/recettes/pages/RecetteDetail";
import { UtilisateursList } from "../features/admin/pages/UtilisateursList";
import { ParkingsList } from "../features/admin/pages/ParkingsList";
import { PlansTarifairesList } from "../features/admin/pages/PlansTarifairesList";
import { AuditLogsList } from "../features/admin/pages/AuditLogsList";
import { NotificationsPage } from "../pages/NotificationsPage";
import { AboutPage } from "../pages/AboutPage";
import { ContactPage } from "../pages/ContactPage";
import { PublicParkingsPage } from "../pages/PublicParkingsPage";
import { InternalParkingsMapPage } from "../features/parkings/pages/InternalParkingsMapPage";
import { PublicTarifsPage } from "../pages/PublicTarifsPage";
import { ScrollToTop } from "../components/ui/ScrollToTop";

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const roleRoutes = (Object.keys(roleConfig) as Role[]).map((role) => {
  const extraRoutes = [
    { path: "/notifications", element: <NotificationsPage /> },
    { path: `${roleConfig[role].homePath}/notifications`, element: <NotificationsPage /> },
    { path: `${roleConfig[role].homePath}/carte-parkings`, element: <InternalParkingsMapPage /> },
  ];

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
  if (role === "SUPERVISEUR" || role === "RESPONSABLE") {
    extraRoutes.push(
      { path: `${roleConfig[role].homePath}/contrats`, element: <ContratsList /> },
      { path: `${roleConfig[role].homePath}/contrats/:id`, element: <ContratDetail /> },
    );
  }

  if (role === "SUPERVISEUR" || role === "COMPTABLE" || role === "RESPONSABLE") {
    extraRoutes.push(
      { path: `${roleConfig[role].homePath}/recettes`, element: <RecettesList /> },
      { path: `${roleConfig[role].homePath}/recettes/:id`, element: <RecetteDetail /> }
    );
  }

  if (role === "RESPONSABLE") {
    extraRoutes.push(
      { path: `${roleConfig[role].homePath}/parkings`, element: <ParkingsList /> },
      { path: `${roleConfig[role].homePath}/tarifs`, element: <PlansTarifairesList /> },
    );
  }

  if (role === "ADMIN_SI") {
    extraRoutes.push(
      { path: "/admin/utilisateurs", element: <UtilisateursList /> },
      { path: "/admin/parkings", element: <ParkingsList /> },
      { path: "/admin/tarifs", element: <PlansTarifairesList /> },
      { path: "/admin/logs", element: <AuditLogsList /> }
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
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/parkings-public", element: <PublicParkingsPage /> },
      { path: "/tarifs-public", element: <PublicTarifsPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/demande-publique", element: <PublicQrForm /> },

      ...roleRoutes,
      { path: "*", element: <NotFound /> },
    ],
  },
]);