import { AppShell } from "./AppShell";

export function AdminLayout() {
  return (
    <AppShell
      title="Espace Agent"
      menuItems={[
        { key: "dashboard", label: "Tableau de bord", path: "/agent" },
        { key: "demandes", label: "Demandes", path: "/agent/demandes" },
      ]}
    />
  );
}