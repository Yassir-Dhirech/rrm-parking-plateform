import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Input, InputNumber, message, Modal, Spin, Switch, Tag } from "antd";
import { DeleteOutlined, EnvironmentOutlined, LockOutlined, PlusOutlined, TagsOutlined, UnlockOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ajouterForfaitParking, getTarifsApplicablesParking, retirerForfaitParking, reviserTarifParking,
  type NouveauForfaitParking,
} from "../../api/adminParkingsApi";
import type { TarifParkingPublicResponse } from "../../api/parkings";

export interface ParkingPlanModalProps {
  open: boolean;
  onClose: () => void;
  parking: {
    id: number;
    nom: string;
    code?: string;
    capaciteTotale?: number;
    adresse?: string;
    actif?: boolean;
  } | null;
}

const montant = (valeur: number) =>
  `${Number(valeur).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MAD`;

function grouperParForfait(tarifs: TarifParkingPublicResponse[]) {
  const groupes = new Map<number, TarifParkingPublicResponse[]>();
  tarifs.forEach((tarif) => {
    const groupe = groupes.get(tarif.forfaitId) ?? [];
    groupe.push(tarif);
    groupes.set(tarif.forfaitId, groupe);
  });
  return [...groupes.values()];
}

function erreurApi(erreur: unknown): string {
  if (axios.isAxiosError(erreur)) {
    const details = erreur.response?.data as { detail?: string } | undefined;
    return details?.detail ?? "L'enregistrement a échoué.";
  }
  return "L'enregistrement a échoué.";
}

export function ParkingPlansTarifairesModal({ open, onClose, parking }: ParkingPlanModalProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<NouveauForfaitParking>();
  const [modificationActive, setModificationActive] = useState(false);
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [prixModifies, setPrixModifies] = useState<Record<number, number | null>>({});
  const tarifs = useQuery({
    queryKey: ["parking-tarifs-applicables", parking?.id],
    queryFn: () => getTarifsApplicablesParking(parking!.id),
    enabled: open && parking !== null,
    staleTime: 0,
  });
  const forfaits = useMemo(() => grouperParForfait(tarifs.data ?? []), [tarifs.data]);

  useEffect(() => {
    if (!open) {
      setModificationActive(false);
      setCreationOuverte(false);
    }
  }, [open]);

  useEffect(() => {
    setPrixModifies({});
    setModificationActive(false);
  }, [parking?.id]);

  const revision = useMutation({
    mutationFn: ({ tarifId, prix }: { tarifId: number; prix: number }) =>
      reviserTarifParking(parking!.id, tarifId, prix),
    onSuccess: async (_, variables) => {
      message.success("Tarif enregistré en base de données.");
      setPrixModifies((courant) => {
        const suivant = { ...courant };
        delete suivant[variables.tarifId];
        return suivant;
      });
      await queryClient.invalidateQueries({ queryKey: ["parking-tarifs-applicables", parking?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
    },
    onError: (erreur) => message.error(erreurApi(erreur)),
  });

  const creation = useMutation({
    mutationFn: (valeurs: NouveauForfaitParking) => ajouterForfaitParking(parking!.id, valeurs),
    onSuccess: async () => {
      message.success("Nouveau forfait et tarif enregistrés en base de données.");
      setCreationOuverte(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ["parking-tarifs-applicables", parking?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
    },
    onError: (erreur) => message.error(erreurApi(erreur)),
  });

  const retrait = useMutation({
    mutationFn: (forfaitId: number) => retirerForfaitParking(parking!.id, forfaitId),
    onSuccess: async () => {
      message.success("Forfait retiré de ce parking. Les anciens dossiers sont conservés.");
      await queryClient.invalidateQueries({ queryKey: ["parking-tarifs-applicables", parking?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      await queryClient.invalidateQueries({ queryKey: ["tarifs-parking", parking?.id] });
    },
    onError: (erreur) => message.error(erreurApi(erreur)),
  });

  const confirmerRetrait = (forfaitId: number, nom: string) => {
    Modal.confirm({
      title: `Retirer « ${nom} » de ${parking?.nom} ?`,
      content: "Ce forfait et toutes ses durées ne seront plus proposés aux nouveaux clients de ce parking. Les demandes, paiements et factures existants seront conservés.",
      okText: "Retirer ce forfait",
      okButtonProps: { danger: true },
      cancelText: "Annuler",
      onOk: async () => { await retrait.mutateAsync(forfaitId); },
    });
  };

  const fermer = () => {
    setPrixModifies({});
    setModificationActive(false);
    onClose();
  };

  return (
    <Modal
      title={<span className="flex items-center gap-2"><TagsOutlined style={{ color: "#006398" }} />
        Plans tarifaires applicables — {parking?.nom}</span>}
      open={open}
      onCancel={fermer}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div className="space-y-4 pt-2" style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <strong>{parking?.nom}</strong>
              {parking?.code && <Tag color="blue">{parking.code}</Tag>}
              <Tag color={parking?.actif ? "green" : "default"}>{parking?.actif ? "En exploitation" : "Inactif"}</Tag>
            </div>
            {parking?.adresse && <small className="text-slate-500"><EnvironmentOutlined /> {parking.adresse}</small>}
          </div>
          {parking?.capaciteTotale !== undefined && <strong>{parking.capaciteTotale} places</strong>}
        </div>

        <Alert
          type="info"
          showIcon
          message="Tarifs et forfaits issus de la base de données"
          description="Les prix sont verrouillés par défaut. Une révision conserve l'ancien tarif dans l'historique et prend effet aujourd'hui."
        />

        <div className="flex flex-wrap gap-2">
          <Button
            icon={modificationActive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => {
              setPrixModifies({});
              setModificationActive((active) => !active);
            }}
            disabled={!tarifs.isSuccess || !parking?.actif}
          >{modificationActive ? "Verrouiller les tarifs" : "Activer la modification"}</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreationOuverte(true)}
            disabled={!parking?.actif || !tarifs.isSuccess}>Ajouter un forfait</Button>
        </div>

        {tarifs.isPending && <div className="py-12 text-center"><Spin tip="Chargement des tarifs réels…" /></div>}
        {tarifs.isError && <Alert type="error" showIcon message="Impossible de charger les tarifs du parking" description="Aucune grille fictive n’est affichée en cas d’erreur. Réessayez en rouvrant la fenêtre." />}
        {tarifs.isSuccess && forfaits.length === 0 && <Alert type="warning" showIcon message="Aucun tarif applicable n’est configuré pour ce parking." />}

        {forfaits.map((groupe) => {
          const forfait = groupe[0];
          return <section key={forfait.forfaitId} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <strong className="text-slate-900">{forfait.forfaitLibelle}</strong>
              <Tag color="blue">{forfait.forfaitCode}</Tag>
              {forfait.placeReservee && <Tag color="purple">Place réservée</Tag>}
              {modificationActive && <Button danger size="small" icon={<DeleteOutlined />}
                disabled={retrait.isPending || revision.isPending}
                onClick={() => confirmerRetrait(forfait.forfaitId, forfait.forfaitLibelle)}
                className="ml-auto">Supprimer du parking</Button>}
            </div>
            {forfait.forfaitDescription && <p className="text-slate-600 text-xs mb-3">{forfait.forfaitDescription}</p>}
            <div className="space-y-2">
              {groupe.map((tarif) => <div key={tarif.tarifParkingId} className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <div><small className="block text-slate-500">Durée</small><strong>{tarif.dureeEnMois} mois</strong></div>
                <div><small className="block text-slate-500">Mensuel HT actuel</small><strong>{montant(tarif.prixMensuelHT)}</strong></div>
                <div><small className="block text-slate-500">TVA {tarif.tauxTVA} % · mensuel TTC</small>
                  <InputNumber<number> min={0.01} precision={2} style={{ width: "100%" }}
                    disabled={!modificationActive || revision.isPending}
                    value={Object.prototype.hasOwnProperty.call(prixModifies, tarif.tarifParkingId)
                      ? prixModifies[tarif.tarifParkingId] : tarif.prixMensuelTTC}
                    onChange={(valeur) => setPrixModifies((courant) => ({ ...courant, [tarif.tarifParkingId]: valeur }))} />
                </div>
                <div><small className="block text-slate-500">Total TTC</small><strong className="text-[#006398]">{montant(tarif.montantTotalTTC)}</strong></div>
                {modificationActive && prixModifies[tarif.tarifParkingId] != null
                  && prixModifies[tarif.tarifParkingId] !== tarif.prixMensuelTTC &&
                  <div className="col-span-2 sm:col-span-4 text-right">
                    <Button type="primary" loading={revision.isPending}
                      onClick={() => revision.mutate({ tarifId: tarif.tarifParkingId,
                        prix: prixModifies[tarif.tarifParkingId]! })}>Enregistrer ce tarif</Button>
                  </div>}
              </div>)}
            </div>
          </section>;
        })}
      </div>
      <Modal title={`Nouveau forfait — ${parking?.nom ?? ""}`} open={creationOuverte}
        onCancel={() => { setCreationOuverte(false); form.resetFields(); }}
        onOk={() => form.submit()} okText="Enregistrer le forfait" confirmLoading={creation.isPending}
        destroyOnClose>
        <Form form={form} layout="vertical" onFinish={(valeurs) => creation.mutate(valeurs)}
          initialValues={{ placeReservee: false, dureeEnMois: 3, tauxTva: 20 }}>
          <Form.Item name="nom" label="Nom du forfait" rules={[{ required: true, whitespace: true, max: 150 }]}>
            <Input maxLength={150} placeholder="Ex. Abonnement nuit 7j/7" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea maxLength={500} rows={2} placeholder="Conditions d'accès ou horaires" />
          </Form.Item>
          <Form.Item name="placeReservee" label="Place réservée" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="dureeEnMois" label="Durée (mois)" rules={[{ required: true }]}>
            <InputNumber min={1} max={240} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="prixMensuelTtc" label="Prix mensuel TTC (MAD)" rules={[{ required: true }]}>
            <InputNumber min={0.01} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="tauxTva" label="TVA (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} precision={2} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
}
