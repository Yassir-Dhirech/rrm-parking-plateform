import { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Form, Input, Modal, Select, Space, Spin, Tag, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getParkingsDisponiblesAbonnement, getTarifsParking } from "../../../api/parkings";
import {
  demanderOtpModification, enregistrerModification, suivreDemande,
  type PiecesModifiees, type SuiviDemande,
} from "../../../api/suiviDemandeApi";
import type { ModificationDemandeReguliereRequest } from "../types";

interface Props { open: boolean; onClose: () => void; initialReference?: string }
const STATUTS: Record<string, string> = {
  SOUMISE: "Demande soumise", EN_ATTENTE_PAIEMENT: "En attente de paiement",
  EN_ATTENTE_VALIDATION_RESPONSABLE: "En attente de validation", PAYEE: "Paiement enregistré",
  VALIDEE: "Demande validée", EN_ATTENTE_CORRECTION: "Correction attendue",
  EN_ATTENTE_PAIEMENT_SIGNATURE: "Paiement et signature attendus",
  EN_ATTENTE_RETOUR_CONTRAT_LEGALISE: "Contrat légalisé attendu",
  EN_ATTENTE_FACTURATION: "Facturation en cours", EN_PREPARATION_CARTES: "Cartes en préparation",
  PRETE_A_FINALISER: "Prête à finaliser", FINALISEE: "Finalisée",
  REFUSEE: "Refusée", EXPIREE: "Expirée", ANNULEE: "Annulée",
};

export function PublicSuiviDemandeModal({ open, onClose, initialReference = "" }: Props) {
  const [reference, setReference] = useState(initialReference);
  const [demande, setDemande] = useState<SuiviDemande | null>(null);
  const [recherche, setRecherche] = useState(false);
  const [edition, setEdition] = useState(false);
  const [otpOuvert, setOtpOuvert] = useState(false);
  const [code, setCode] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [valeursAConfirmer, setValeursAConfirmer] = useState<ModificationDemandeReguliereRequest | null>(null);
  const [fichiers, setFichiers] = useState<PiecesModifiees>({});
  const [form] = Form.useForm<ModificationDemandeReguliereRequest & { parkingId: number }>();
  const parkingId = Form.useWatch("parkingId", form);
  const { data: parkings = [] } = useQuery({ queryKey: ["parkings_souscription"], queryFn: getParkingsDisponiblesAbonnement, enabled: open && edition });
  const { data: tarifs = [] } = useQuery({ queryKey: ["suivi_tarifs", parkingId], queryFn: () => getTarifsParking(parkingId!), enabled: open && edition && !!parkingId });

  async function consulter(ref = reference) {
    if (!ref.trim()) { message.warning("Copiez la référence reçue par e-mail."); return; }
    setRecherche(true);
    setDemande(null);
    setEdition(false);
    try {
      const resultat = await suivreDemande(ref.trim());
      setDemande(resultat);
      setReference(resultat.reference);
    } catch {
      message.error("Demande introuvable ou suivi indisponible.");
    } finally { setRecherche(false); }
  }

  useEffect(() => {
    if (open && initialReference) { setReference(initialReference); void consulter(initialReference); }
    if (!open) { setEdition(false); setOtpOuvert(false); setDemande(null); setFichiers({}); }
    // La recherche automatique se déclenche uniquement à l'ouverture avec une référence fournie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialReference]);

  function commencerEdition() {
    if (!demande?.modifiable) return;
    form.setFieldsValue({
      nom: demande.nom ?? "", prenom: demande.prenom ?? "", cin: demande.cin ?? "",
      email: demande.email ?? "", telephone: demande.telephone ?? "",
      immatriculation: demande.immatriculation ?? "", marque: demande.marque ?? "",
      modele: demande.modele ?? "", couleur: demande.couleur ?? "",
      typeVehicule: demande.typeVehicule ?? "VOITURE",
      parkingId: demande.parkingId ?? undefined, tarifParkingId: demande.tarifParkingId ?? undefined,
      modePaiement: demande.modePaiement ?? "ESPECE",
    });
    setEdition(true);
  }

  async function demanderValidation() {
    if (!demande) return;
    let formulaire: ModificationDemandeReguliereRequest & { parkingId: number };
    try { formulaire = await form.validateFields(); } catch { return; }
    const { parkingId: _parkingId, ...donnees } = formulaire;
    void _parkingId;
    setEnCours(true);
    try {
      await demanderOtpModification(demande.reference);
      setValeursAConfirmer(donnees);
      setCode("");
      setOtpOuvert(true);
      message.success("Un code de confirmation a été envoyé à l'adresse e-mail du dossier.");
    } catch {
      message.error("Impossible d'envoyer le code. Réessayez dans un instant.");
    } finally { setEnCours(false); }
  }

  async function confirmer() {
    if (!demande || !valeursAConfirmer || !/^\d{6}$/.test(code)) {
      message.warning("Saisissez le code de 6 chiffres reçu par e-mail."); return;
    }
    setEnCours(true);
    try {
      const resultat = await enregistrerModification(demande.reference, code, valeursAConfirmer, fichiers);
      setDemande(resultat);
      setEdition(false);
      setOtpOuvert(false);
      setFichiers({});
      setValeursAConfirmer(null);
      message.success("La modification a été enregistrée dans votre dossier.");
    } catch {
      message.error("Code incorrect ou expiré, ou informations invalides : aucune modification enregistrée.");
    } finally { setEnCours(false); }
  }

  function fichier(champ: keyof PiecesModifiees, file?: File) {
    setFichiers((anciens) => ({ ...anciens, [champ]: file }));
  }

  return <>
    <Modal title="Suivre ma demande RRM" open={open} onCancel={onClose} footer={null} width={820} destroyOnClose>
      <p>Copiez la référence figurant dans l'e-mail de confirmation de votre demande.</p>
      <Space.Compact style={{ width: "100%" }}>
        <Input value={reference} onChange={(e) => setReference(e.target.value)}
          onPressEnter={() => void consulter()} placeholder="Ex. DEM-20260927-AB12CD34" />
        <Button type="primary" loading={recherche} onClick={() => void consulter()}>Consulter</Button>
      </Space.Compact>
      {recherche && <div style={{ padding: 24, textAlign: "center" }}><Spin /></div>}
      {demande && !recherche && <div style={{ marginTop: 22 }}>
        <Card title={<Space><span>Demande {demande.reference}</span><Tag color="blue">{STATUTS[demande.statut] ?? demande.statut}</Tag></Space>}
          extra={demande.modifiable && !edition ? <Button onClick={commencerEdition}>Modifier avant paiement</Button> : null}>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Type">{demande.typeDemande.replaceAll("_", " ")}</Descriptions.Item>
            <Descriptions.Item label="Soumise le">{new Date(demande.dateCreation).toLocaleString("fr-FR")}</Descriptions.Item>
            <Descriptions.Item label="Client">{demande.clientNom ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Identité">{demande.cin ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="E-mail">{demande.email ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Téléphone">{demande.telephone ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Véhicule">{demande.immatriculation ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Parking">{demande.parkingNom ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Formule">{demande.forfaitNom ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Durée">{demande.dureeMois ? `${demande.dureeMois} mois` : "—"}</Descriptions.Item>
            <Descriptions.Item label="Montant TTC">{demande.montantTotalTTC == null ? "—" : `${demande.montantTotalTTC.toLocaleString("fr-FR")} MAD`}</Descriptions.Item>
            <Descriptions.Item label="Mode de paiement">{demande.modePaiement ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Documents">{demande.piecesJointes.length ? demande.piecesJointes.join(", ") : "—"}</Descriptions.Item>
          </Descriptions>
        </Card>
        {edition && <Card title="Modifier ma demande" style={{ marginTop: 16 }}>
          <Alert type="info" showIcon style={{ marginBottom: 18 }} message="Confirmez les changements avec le code envoyé à l'e-mail actuellement associé au dossier. Le tarif et le montant seront recalculés par le serveur." />
          <Form form={form} layout="vertical">
            <Form.Item name="nom" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="cin" label="CIN" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="email" label="Nouvelle adresse e-mail" rules={[{ required: true }, { type: "email" }]}><Input /></Form.Item>
            <Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="immatriculation" label="Immatriculation (numéro|lettre|région)" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="marque" label="Marque"><Input /></Form.Item>
            <Form.Item name="modele" label="Modèle"><Input /></Form.Item>
            <Form.Item name="couleur" label="Couleur"><Input /></Form.Item>
            <Form.Item name="typeVehicule" label="Type de véhicule" rules={[{ required: true }]}>
              <Select options={["VOITURE", "MOTO", "AUTRE"].map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="parkingId" label="Parking" rules={[{ required: true }]}>
              <Select options={parkings.map((p) => ({ value: p.id, label: p.nom }))}
                onChange={() => form.setFieldValue("tarifParkingId", undefined)} />
            </Form.Item>
            <Form.Item name="tarifParkingId" label="Forfait et durée" rules={[{ required: true }]}>
              <Select options={tarifs.map((t) => ({ value: t.tarifParkingId,
                label: `${t.forfaitLibelle} · ${t.dureeEnMois} mois · ${t.montantTotalTTC} MAD TTC` }))} />
            </Form.Item>
            <Form.Item name="modePaiement" label="Mode de paiement" rules={[{ required: true }]}>
              <Select options={[{ value: "ESPECE", label: "Espèces" }, { value: "CHEQUE", label: "Chèque" }]} />
            </Form.Item>
            <p>Remplacer une pièce jointe (facultatif) :</p>
            {([ ["cinRecto", "CIN recto"], ["cinVerso", "CIN verso"],
              ["carteGriseRecto", "Carte grise recto"], ["carteGriseVerso", "Carte grise verso"] ] as const)
              .map(([champ, titre]) => <label key={champ} style={{ display: "block", marginBottom: 10 }}>
                {titre} <input type="file" accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => fichier(champ, e.target.files?.[0])} />
              </label>)}
            <Space style={{ marginTop: 16 }}><Button type="primary" loading={enCours}
              onClick={() => void demanderValidation()}>Valider et recevoir un code</Button>
              <Button onClick={() => setEdition(false)}>Annuler</Button></Space>
          </Form>
        </Card>}
      </div>}
    </Modal>
    <Modal title="Confirmer la modification par e-mail" open={otpOuvert}
      onCancel={() => setOtpOuvert(false)} onOk={() => void confirmer()} okText="Confirmer"
      okButtonProps={{ loading: enCours }}>
      <p>Entrez le code à 6 chiffres envoyé à l’adresse e-mail initiale de la demande. Sans code valide, aucun changement n’est appliqué.</p>
      <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6} inputMode="numeric" placeholder="Code de confirmation" onPressEnter={() => void confirmer()} />
    </Modal>
  </>;
}
