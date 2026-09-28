import { Alert, Checkbox, Descriptions, Form, Input, Modal, Select } from "antd";
import type { DossierRejetCheque } from "../../api/rejetsChequesApi";

export interface PaiementRegularisationForm {
  modePaiement: "ESPECE" | "CHEQUE";
  numeroCheque?: string;
  banqueCheque?: string;
  dateEmissionCheque?: string;
  chequeCertifie?: boolean;
}

interface Props {
  dossier: DossierRejetCheque | null;
  attente: boolean;
  onFermer: () => void;
  onSoumettre: (dossierId: number, valeurs: PaiementRegularisationForm) => void;
}

export function RegularisationPaiementModal({ dossier, attente, onFermer, onSoumettre }: Props) {
  const [form] = Form.useForm<PaiementRegularisationForm>();
  const mode = Form.useWatch("modePaiement", form);
  return (
    <Modal
      title="Paiement d'un abonnement bloqué"
      open={dossier !== null}
      okText="Soumettre au responsable"
      okButtonProps={{ loading: attente }}
      onOk={() => form.submit()}
      onCancel={onFermer}
      destroyOnHidden
      afterOpenChange={(ouvert) => { if (ouvert) form.resetFields(); }}
    >
      {dossier && (
        <>
          <Alert type="warning" showIcon style={{ marginBottom: 16 }}
            message="L'abonnement reste bloqué après la réception du paiement"
            description="Le responsable doit valider le paiement avant la demande de réactivation des cartes." />
          <Descriptions size="small" column={1} bordered style={{ marginBottom: 18 }}
            items={[
              { key: "client", label: "Client", children: dossier.clientNom },
              { key: "identifiant", label: "CIN / ICE", children: dossier.clientIdentifiant || "Non renseigné" },
              { key: "abonnement", label: "Abonnement", children: dossier.referenceAbonnement },
              { key: "statut", label: "Statut", children: "BLOQUÉ" },
              { key: "parking", label: "Parking", children: dossier.parkingNom },
              { key: "abonnementTtc", label: "Abonnement TTC",
                children: dossier.montantAbonnementTtc == null ? "Voir facture initiale"
                  : `${dossier.montantAbonnementTtc.toLocaleString("fr-FR")} MAD` },
              { key: "carteTtc", label: "Carte d'accès TTC",
                children: dossier.fraisCarteTtc == null ? "Voir facture initiale"
                  : `${dossier.fraisCarteTtc.toLocaleString("fr-FR")} MAD` },
              { key: "total", label: "Montant intégral à encaisser",
                children: <strong>{dossier.montantInitialTtc.toLocaleString("fr-FR")} MAD TTC</strong> },
            ]}
          />
          <Form<PaiementRegularisationForm> form={form} layout="vertical"
            initialValues={{ modePaiement: "ESPECE", chequeCertifie: false }}
            onFinish={(valeurs) => onSoumettre(dossier.id, valeurs)}>
            <Form.Item name="modePaiement" label="Mode de paiement"
              rules={[{ required: true, message: "Choisissez un mode de paiement" }]}>
              <Select options={[{ value: "ESPECE", label: "Espèces" },
                { value: "CHEQUE", label: "Chèque certifié" }]} />
            </Form.Item>
            {mode === "CHEQUE" && (
              <>
                <Form.Item name="numeroCheque" label="Numéro du chèque"
                  rules={[{ required: true, whitespace: true }, { max: 80 }]}>
                  <Input autoComplete="off" />
                </Form.Item>
                <Form.Item name="banqueCheque" label="Banque"
                  rules={[{ required: true, whitespace: true }, { max: 120 }]}>
                  <Input autoComplete="off" />
                </Form.Item>
                <Form.Item name="dateEmissionCheque" label="Date d'émission"
                  rules={[{ required: true, message: "La date d'émission est obligatoire" }]}>
                  <Input type="date" />
                </Form.Item>
                <Form.Item name="chequeCertifie" valuePropName="checked"
                  rules={[{ validator: (_: unknown, valeur: boolean) =>
                    valeur ? Promise.resolve() : Promise.reject(new Error("Un chèque certifié est obligatoire")) }]}>
                  <Checkbox>J'ai vérifié que le nouveau chèque est certifié</Checkbox>
                </Form.Item>
              </>
            )}
          </Form>
        </>
      )}
    </Modal>
  );
}
