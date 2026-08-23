import type { UserContact, ChatMessage, ConversationThread } from "../features/messaging/types";
import { type Role } from "../lib/roleConfig";

export const mockContacts: UserContact[] = [
  { id: "usr-agent-1", nom: "Agent Rachid (Guichet Agdal)", role: "AGENT", roleLibelle: "Agent d'exploitation", avatarColor: "#0284c7", enLigne: true },
  { id: "usr-agent-2", nom: "Agent Hassan (Guichet Hassan II)", role: "AGENT", roleLibelle: "Agent d'exploitation", avatarColor: "#0284c7", enLigne: true },
  { id: "usr-super-1", nom: "M. Samir El Amrani", role: "SUPERVISEUR", roleLibelle: "Superviseur Référent", avatarColor: "#0d9488", enLigne: true },
  { id: "usr-resp-1", nom: "Mme. Leila Benali", role: "RESPONSABLE", roleLibelle: "Responsable Exploitation & Finance", avatarColor: "#4f46e5", enLigne: true },
  { id: "usr-comp-1", nom: "Mme. Fatine Chraibi", role: "COMPTABLE", roleLibelle: "Comptable Principale RRM", avatarColor: "#9333ea", enLigne: false },
];

let mockMessagesStore: Record<string, ChatMessage[]> = {
  "conv-agent-1": [
    {
      id: "m-1",
      conversationId: "conv-agent-1",
      expediteurId: "usr-agent-1",
      expediteurNom: "Agent Rachid",
      expediteurRole: "AGENT",
      contenu: "Bonjour, le souscripteur pour la demande DEM-2026-000001 a déposé son chèque au guichet.",
      timestamp: "Hier à 14:20",
      referenceEntite: { type: "DEMANDE", reference: "DEM-2026-000001", link: "/superviseur/demandes" },
    },
    {
      id: "m-2",
      conversationId: "conv-agent-1",
      expediteurId: "usr-super-1",
      expediteurNom: "M. Samir El Amrani",
      expediteurRole: "SUPERVISEUR",
      contenu: "Parfait Rachid, je procède à la validation du dossier aujourd'hui.",
      timestamp: "Hier à 14:35",
    },
  ],
  "conv-comp-1": [
    {
      id: "m-3",
      conversationId: "conv-comp-1",
      expediteurId: "usr-comp-1",
      expediteurNom: "Mme. Fatine Chraibi",
      expediteurRole: "COMPTABLE",
      contenu: "Bonjour Samir, la recette REC-2026-W32 a bien été réceptionnée. Merci pour le bordereau.",
      timestamp: "21/08/2026 10:15",
      referenceEntite: { type: "RECETTE", reference: "REC-2026-W32-P01", link: "/comptable/recettes" },
    },
  ],
};

let mockThreadsStore: ConversationThread[] = [
  {
    id: "conv-agent-1",
    contact: mockContacts[0],
    dernierMessage: "Parfait Rachid, je procède à la validation du dossier aujourd'hui.",
    dernierTimestamp: "Hier 14:35",
    nonLus: 1,
  },
  {
    id: "conv-comp-1",
    contact: mockContacts[4],
    dernierMessage: "Bonjour Samir, la recette REC-2026-W32 a bien été réceptionnée.",
    dernierTimestamp: "21/08/2026",
    nonLus: 0,
  },
  {
    id: "conv-resp-1",
    contact: mockContacts[3],
    dernierMessage: "Rapport mensuel des SLA disponible pour consultation.",
    dernierTimestamp: "20/08/2026",
    nonLus: 0,
  },
];

export async function getConversationsMock(): Promise<ConversationThread[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return mockThreadsStore;
}

export async function getMessagesForConversationMock(conversationId: string): Promise<ChatMessage[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return mockMessagesStore[conversationId] || [];
}

export async function envoyerMessageMock(input: {
  conversationId?: string;
  destinataireId?: string;
  expediteurRole: Role;
  expediteurNom: string;
  contenu: string;
  referenceEntite?: { type: "DEMANDE" | "RECETTE" | "ABONNEMENT" | "PAIEMENT"; reference: string; link: string };
}): Promise<ChatMessage> {
  const convId = input.conversationId || `conv-${Date.now()}`;
  
  const newMessage: ChatMessage = {
    id: `m-${Date.now()}`,
    conversationId: convId,
    expediteurId: "me",
    expediteurNom: input.expediteurNom,
    expediteurRole: input.expediteurRole,
    contenu: input.contenu,
    timestamp: "À l'instant",
    referenceEntite: input.referenceEntite,
  };

  if (!mockMessagesStore[convId]) {
    mockMessagesStore[convId] = [];
  }
  mockMessagesStore[convId].push(newMessage);

  // Update thread
  const existingThread = mockThreadsStore.find((t) => t.id === convId);
  if (existingThread) {
    existingThread.dernierMessage = input.contenu;
    existingThread.dernierTimestamp = "À l'instant";
  } else {
    const contact = mockContacts.find((c) => c.id === input.destinataireId) || mockContacts[0];
    mockThreadsStore.unshift({
      id: convId,
      contact,
      dernierMessage: input.contenu,
      dernierTimestamp: "À l'instant",
      nonLus: 0,
    });
  }

  return newMessage;
}
