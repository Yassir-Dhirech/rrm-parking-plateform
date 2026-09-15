import { RechercheDemandes } from "./RechercheDemandes";
import { DemandesEnAttentePaiement } from "./DemandesEnAttentePaiement";

export function EspaceDemandesAgent() {
  return (
    <div className="space-y-8">
      <RechercheDemandes />

      <DemandesEnAttentePaiement />
    </div>
  );
}