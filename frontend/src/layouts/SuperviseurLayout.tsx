import { AppShell } from "./AppShell";

export function SuperviseurLayout() {
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