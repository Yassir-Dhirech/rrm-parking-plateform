import { useState } from "react";
import {
  Alert,
  Button,
  Input,
  Radio,
  Table,
  Tag,
} from "antd";
import type { TableProps } from "antd";
import {
  FileSearchOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  extraireMessageErreur,
  rechercherDemandesParCin,
  rechercherDemandesParReference,
} from "../../../api/demandesApi";
import type {
  DemandeRechercheResponse,
  StatutDemande,
  TypeDemandeRecherche,
} from "../types";

type CritereRecherche = "REFERENCE" | "CIN";

const statutConfig: Record<
  StatutDemande,
  { label: string; color: string }
> = {
  SOUMISE: { label: "Soumise", color: "blue" },
  EN_ATTENTE_PAIEMENT: {
    label: "En attente de paiement",
    color: "gold",
  },
  PAYEE: { label: "Payée", color: "cyan" },
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
  const [critere, setCritere] =
    useState<CritereRecherche>("REFERENCE");
  const [valeur, setValeur] = useState("");
  const [resultats, setResultats] = useState<
    DemandeRechercheResponse[]
  >([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [rechercheEffectuee, setRechercheEffectuee] =
    useState(false);

  const reinitialiser = () => {
    setValeur("");
    setResultats([]);
    setErreur(null);
    setRechercheEffectuee(false);
  };

  const changerCritere = (nouveauCritere: CritereRecherche) => {
    setCritere(nouveauCritere);
    reinitialiser();
  };

  const rechercher = async () => {
    const valeurNormalisee = valeur.trim();

    if (!valeurNormalisee) {
      setErreur(
        critere === "REFERENCE"
          ? "Veuillez saisir une référence."
          : "Veuillez saisir une CIN."
      );
      setResultats([]);
      setRechercheEffectuee(false);
      return;
    }

    setChargement(true);
    setErreur(null);

    try {
      const demandes =
        critere === "REFERENCE"
          ? await rechercherDemandesParReference(
              valeurNormalisee
            )
          : await rechercherDemandesParCin(
              valeurNormalisee
            );

      setResultats(demandes);
      setRechercheEffectuee(true);
    } catch (error) {
      setResultats([]);
      setRechercheEffectuee(true);
      setErreur(extraireMessageErreur(error));
    } finally {
      setChargement(false);
    }
  };

  const columns: TableProps<DemandeRechercheResponse>["columns"] =
    [
      {
        title: "DEMANDE",
        key: "demande",
        render: (_, demande) => (
          <div>
            <div className="font-extrabold text-xs text-slate-900">
              {demande.reference}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              {typeDemandeLabels[demande.typeDemande]}
            </div>
          </div>
        ),
      },
      {
        title: "STATUT",
        dataIndex: "statut",
        key: "statut",
        render: (statut: StatutDemande) => {
          const config = statutConfig[statut];

          return (
            <Tag
              color={config.color}
              className="font-bold rounded-full"
            >
              {config.label}
            </Tag>
          );
        },
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
        render: (
          canal: DemandeRechercheResponse["canalInitiation"]
        ) =>
          canal === "EN_LIGNE"
            ? "En ligne"
            : "Assistée par un agent",
      },
      {
        title: "SOUMISSION",
        dataIndex: "dateSoumission",
        key: "dateSoumission",
        render: (date: string) => formaterDate(date),
        sorter: (a, b) =>
          new Date(a.dateSoumission).getTime() -
          new Date(b.dateSoumission).getTime(),
      },
      {
        title: "VALIDATION OTP",
        dataIndex: "dateValidationOtp",
        key: "dateValidationOtp",
        render: (date: string | null) => formaterDate(date),
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
          Recherchez une demande par sa référence ou toutes les
          demandes associées à une CIN.
        </p>
      </div>

      <div className="p-5 bg-white/80 border border-white rounded-2xl shadow-md">
        <div className="flex flex-col gap-4">
          <Radio.Group
            value={critere}
            onChange={(event) =>
              changerCritere(event.target.value)
            }
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="REFERENCE">
              Référence
            </Radio.Button>

            <Radio.Button value="CIN">CIN</Radio.Button>
          </Radio.Group>

          <div className="flex flex-col md:flex-row gap-3">
            <Input
              value={valeur}
              onChange={(event) => setValeur(event.target.value)}
              onPressEnter={rechercher}
              prefix={<SearchOutlined />}
              placeholder={
                critere === "REFERENCE"
                  ? "Ex. DEM-20260912-7A4C3D7F"
                  : "Ex. X34567"
              }
              allowClear
              className="rounded-xl"
            />

            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={chargement}
              onClick={rechercher}
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
          <div className="px-5 py-4 border-b border-slate-200">
            <span className="font-extrabold text-sm text-slate-900">
              {resultats.length} résultat
              {resultats.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="p-2 overflow-x-auto">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={resultats}
              loading={chargement}
              pagination={{
                pageSize: 8,
                hideOnSinglePage: true,
              }}
              scroll={{ x: "max-content" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}