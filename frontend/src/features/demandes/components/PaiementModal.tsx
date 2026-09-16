import { useMutation } from "@tanstack/react-query";
import { Alert, Descriptions, Form, Input, Modal } from "antd";
import { enregistrerPaiement, extraireMessageErreur } from "../../../api/demandesApi";
import type {
  DemandeDetailResponse,
  EnregistrementPaiementRequest,
  EnregistrementPaiementResponse,
} from "../types";

interface PaiementFormValues {
  numeroCheque?: string;
  banqueCheque?: string;
  dateEmissionCheque?: string;
}

interface PaiementModalProps {
  demande: DemandeDetailResponse;
  ouvert: boolean;
  onFermer: () => void;
  onSucces: (paiement: EnregistrementPaiementResponse) => void;
}

export function PaiementModal({
  demande,
  ouvert,
  onFermer,
  onSucces,
}: PaiementModalProps) {
  const [form] = Form.useForm<PaiementFormValues>();
  const estCheque = demande.modePaiementSouhaite === "CHEQUE";

  const paiementMutation = useMutation({
    mutationFn: (requete: EnregistrementPaiementRequest) =>
      enregistrerPaiement(demande.id, requete),
    onSuccess: (paiement) => {
      form.resetFields();
      onSucces(paiement);
    },
  });

  const confirmer = (valeurs: PaiementFormValues) => {
    paiementMutation.mutate({
      numeroCheque: estCheque
        ? valeurs.numeroCheque?.trim() || null
        : null,
      banqueCheque: estCheque
        ? valeurs.banqueCheque?.trim() || null
        : null,
      dateEmissionCheque: estCheque
        ? valeurs.dateEmissionCheque || null
        : null,
    });
  };

  return (
    <Modal
      title={`Enregistrer le paiement — ${demande.reference}`}
      open={ouvert}
      okText="Confirmer l’encaissement"
      cancelText="Annuler"
      confirmLoading={paiementMutation.isPending}
      onOk={() => form.submit()}
      onCancel={onFermer}
      afterOpenChange={(estOuvert) => {
        if (estOuvert) {
          form.resetFields();
          paiementMutation.reset();
        }
      }}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        message={
          estCheque
            ? "Paiement par chèque"
            : "Paiement en espèces"
        }
        description={
          estCheque
            ? "Le chèque sera considéré encaissé dès sa réception, jusqu’à notification contraire de la banque."
            : "Le paiement sera confirmé immédiatement."
        }
        style={{ marginBottom: 16 }}
      />

      <Descriptions
        title="Détail du montant à encaisser"
        size="small"
        column={1}
        bordered
        style={{ marginBottom: 16 }}
        items={[
          {
            key: "abonnement",
            label: "Abonnement TTC",
            children: `${demande.montantAbonnementTTC.toLocaleString("fr-FR")} MAD`,
          },
          {
            key: "carte",
            label: "Carte d’accès TTC",
            children: `${demande.fraisCarteTTC.toLocaleString("fr-FR")} MAD`,
          },
          {
            key: "total",
            label: "Total à encaisser",
            children: (
              <strong>
                {demande.montantTotalTTC.toLocaleString("fr-FR")} MAD TTC
              </strong>
            ),
          },
        ]}
      />

      <Form<PaiementFormValues>
        form={form}
        layout="vertical"
        onFinish={confirmer}
        preserve={false}
      >
        {estCheque && (
          <>
            <Form.Item
              name="numeroCheque"
              label="Numéro du chèque"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Le numéro du chèque est obligatoire",
                },
                {
                  max: 80,
                  message: "Le numéro ne peut pas dépasser 80 caractères",
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>

            <Form.Item
              name="banqueCheque"
              label="Banque"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "La banque est obligatoire",
                },
                {
                  max: 120,
                  message: "La banque ne peut pas dépasser 120 caractères",
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>

            <Form.Item
              name="dateEmissionCheque"
              label="Date d’émission"
              rules={[
                {
                  required: true,
                  message: "La date d’émission est obligatoire",
                },
              ]}
            >
              <Input type="date" />
            </Form.Item>
          </>
        )}
      </Form>

      {paiementMutation.isError && (
        <Alert
          type="error"
          showIcon
          message="Paiement non enregistré"
          description={extraireMessageErreur(
            paiementMutation.error
          )}
        />
      )}
    </Modal>
  );
}
