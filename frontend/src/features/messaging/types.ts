import { type Role } from "../../lib/roleConfig";

export interface UserContact {
  id: string;
  nom: string;
  role: Role;
  roleLibelle: string;
  avatarColor: string;
  enLigne: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  expediteurId: string;
  expediteurNom: string;
  expediteurRole: Role;
  contenu: string;
  timestamp: string;
  referenceEntite?: {
    type: "DEMANDE" | "RECETTE" | "ABONNEMENT" | "PAIEMENT";
    reference: string;
    link: string;
  };
}

export interface ConversationThread {
  id: string;
  contact: UserContact;
  dernierMessage: string;
  dernierTimestamp: string;
  nonLus: number;
}
