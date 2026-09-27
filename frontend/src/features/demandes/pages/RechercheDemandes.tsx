import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Button,
  Input,
  Space,
  Table,
  Tag,
} from "antd";
import type { TableProps } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  extraireMessageErreur,
  rechercherDemandes,
} from "../../../api/demandesApi";
import type {
  DemandeRechercheResponse,
  StatutDemande,
  TypeDemandeRecherche,
} from "../types";



const statutConfig: Record<
  StatutDemande,
  { label: string; color: string }
> = {
  SOUMISE: { label: "Soumise", color: "blue" },
  EN_ATTENTE_PAIEMENT: {
    label: "En attente de paiement",
    color: "gold",
  },
  EN_ATTENTE_VALIDATION_RESPONSABLE: {
    label: "En attente de validation responsable",
    color: "purple",
  },
  EN_ATTENTE_PAIEMENT_SIGNATURE: {
    label: "Paiement et signature attendus",
    color: "gold",
  },
  EN_ATTENTE_RETOUR_CONTRAT_LEGALISE: {
    label: "Retour du contrat légalisé attendu",
    color: "orange",
  },
  EN_ATTENTE_FACTURATION: {
    label: "Prête à facturer",
    color: "geekblue",
  },
  EN_PREPARATION_CARTES: {
    label: "Cartes en préparation",
    color: "cyan",
  },
  PRETE_A_FINALISER: {
    label: "Prête à finaliser",
    color: "lime",
  },
  FINALISEE: { label: "Finalisée", color: "green" },
  PAYEE: { label: "Payée", color: "cyan" },
  EN_ATTENTE_CORRECTION: {
    label: "En attente de correction",
    color: "orange",
  },
  VALIDEE: { label: "Validée", color: "green" },
  REFUSEE: { label: "Refusée", color: "red" },
  EXPIREE: { label: "Expirée", color: "default" },
  ANNULEE: { label: "Annulée", color: "default" },
};

const typeDemandeLabels: Record<TypeDemandeRecherche, string> = {
  NOUVEL_ABONNEMENT_REGULIER: "Nouvel abonnement régulier",
  RENOUVELLEMENT_REGULIER: "Renouvellement régulier",
  CHANGEMENT_PARKING: "Changement de parking",
  CHANGEMENT_VEHICULE: "Changement de véhicule",
  NOUVEAU_CONTRAT_CORPORATE: "Nouveau contrat corporate",
  AUTRE: "Autre",
};

function formaterDate(date: string | null): string {
  if (!date) {
    return "—";
  }

  const valeur = new Date(date);

  if (Number.isNaN(valeur.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valeur);
}

export function RechercheDemandes() {
  const navigate = useNavigate();
  const [valeur, setValeur] = useState("");
  const [resultats, setResultats] = useState<DemandeRechercheResponse[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [rechercheEffectuee, setRechercheEffectuee] = useState(false);

  const lancerRecherche = useCallback(
    async (
      termeCherche: string = valeur,
    ) => {
      setChargement(true);
      setErreur(null);

      try {
        const demandes = await rechercherDemandes(
          termeCherche.trim() || undefined,
          
        );
        setResultats(demandes);
        setRechercheEffectuee(true);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setResultats([]);
          setRechercheEffectuee(true);
          setErreur(null);
        } else {
          setResultats([]);
          setRechercheEffectuee(true);
          setErreur(extraireMessageErreur(error));
        }
      } finally {
        setChargement(false);
      }
    },
    [valeur]
  );

  useEffect(() => {
  // 1. Si la barre est vide (au chargement ou après effacement), on affiche tout immédiatement
  if (!valeur.trim()) {
    void lancerRecherche("");
    return;
  }
  // 2. Dès que vous tapez du texte, on attend 250ms après la dernière touche avant de chercher
  const timer = setTimeout(() => {
    void lancerRecherche(valeur);
  }, 250);
  // Nettoyer le timer si l'utilisateur continue de taper
  return () => clearTimeout(timer);
}, [valeur, lancerRecherche]);
const reinitialiser = () => {
  setValeur("");
};


 

  const columns: TableProps<DemandeRechercheResponse>["columns"] = [
    {
      title: "DEMANDE",
      key: "demande",
      render: (_, demande) => (
        <div>
          <div className="font-extrabold text-xs text-slate-900">
            {demande.reference}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            {typeDemandeLabels[demande.typeDemande] ?? demande.typeDemande}
          </div>
        </div>
      ),
    },
    {
      title: "STATUT",
      dataIndex: "statut",
      key: "statut",
      render: (statut: StatutDemande) => {
        const config = statutConfig[statut] ?? {
          label: statut,
          color: "default",
        };

        return (
          <Tag color={config.color} className="font-bold rounded-full">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "PARKING",
      key: "parking",
      render: (_, demande) => (
        <div>
          {demande.parkingNom ? (
            <Tag color="cyan" className="font-bold rounded-md">
              {demande.parkingNom}
            </Tag>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      title: "CLIENT",
      key: "client",
      render: (_, demande) => (
        <div>
          <div className="font-bold text-xs text-slate-800">
            {demande.nomClient ?? "Nom indisponible"}
          </div>

          <div className="text-[11px] text-slate-500">
            {demande.typeClient}
            {demande.identifiantClient
              ? ` · ${demande.identifiantClient}`
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "CONTACT",
      key: "contact",
      render: (_, demande) => (
        <div className="text-xs text-slate-700">
          <div>{demande.telephone ?? "—"}</div>
          <div className="text-[11px] text-slate-500">
            {demande.email ?? "—"}
          </div>
        </div>
      ),
    },
    {
      title: "INITIATION",
      dataIndex: "canalInitiation",
      key: "canalInitiation",
      render: (canal: DemandeRechercheResponse["canalInitiation"]) =>
        canal === "EN_LIGNE" ? "En ligne" : "Assistée par un agent",
    },
    {
      title: "SOUMISSION",
      dataIndex: "dateSoumission",
      key: "dateSoumission",
      render: (date: string) => formaterDate(date),
      sorter: (a, b) =>
        new Date(a.dateSoumission ?? 0).getTime() -
        new Date(b.dateSoumission ?? 0).getTime(),
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      width: 170,
      render: (_, demande) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/agent/demandes/${demande.id}`)}
          >
            Détails
          </Button>

          {(demande.statut === "SOUMISE" ||
            demande.statut === "EN_ATTENTE_PAIEMENT") && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/agent/demandes/${demande.id}/modifier`)
              }
            >
              Modifier
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 m-0 text-2xl md:text-3xl font-black text-slate-900">
          <FileSearchOutlined className="text-secondary" />
          Recherche de demandes
        </h2>

        <p className="mt-1 mb-0 text-xs md:text-sm font-medium text-slate-500">
          Recherchez sur l'ensemble des demandes de la base de données (référence,
          nom, CIN, parking, email, téléphone ou statut).
        </p>
      </div>

      <div className="p-5 bg-white/80 border border-white rounded-2xl shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
  <span className="text-xs font-bold text-slate-700">
    Recherche rapide
  </span>
  <span className="text-xs font-semibold text-slate-500">
    {resultats.length} demande{resultats.length > 1 ? "s" : ""} trouvée{resultats.length > 1 ? "s" : ""}
  </span>
</div>


                   <div className="flex flex-col md:flex-row gap-3">
            <Input
              value={valeur}
              onChange={(event) => setValeur(event.target.value)}
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Recherche instantanée : tapez un nom, parking, CIN, référence, téléphone..."
              allowClear
              onClear={() => setValeur("")}
              className="rounded-xl text-sm"
            />

            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={chargement}
              onClick={() => void lancerRecherche(valeur)}
              className="rounded-xl font-bold"
            >
              Rechercher
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={reinitialiser}
              disabled={chargement}
              className="rounded-xl font-bold"
            >
              Réinitialiser
            </Button>
          </div>
          </div>
          </div>



      {erreur && (
        <Alert
          type="error"
          showIcon
          message="Recherche impossible"
          description={erreur}
          closable
          onClose={() => setErreur(null)}
        />
      )}

      {rechercheEffectuee && !erreur && (
        <div className="overflow-hidden bg-white/80 border border-white rounded-2xl shadow-xl">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <span className="font-extrabold text-sm text-slate-900">
              {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
            </span>

            {valeur.trim() && (
              <span className="text-xs text-slate-500">
                Filtre : <span className="font-semibold text-slate-700">« {valeur} »</span>
              </span>
            )}
          </div>

          <div className="p-2 overflow-x-auto">
            <Table
  rowKey="id"
  columns={columns}
  dataSource={resultats}
  loading={chargement}
  pagination={false}
  scroll={{ y: 500, x: "max-content" }}
/>
          </div>
        </div>
      )}
    </div>
  );
}
