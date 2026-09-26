import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  modifierDemandeAgent,
  obtenirDetailDemande,
} from "../../../api/demandesApi";
import {
  getParkingsDisponiblesAbonnement,
  getTarifsParking,
} from "../../../api/parkings";
import type {
  DocumentsModificationDemande,
  ModePaiement,
  ModificationDemandeReguliereRequest,
} from "../types";
import type { TypeVehicule } from "../../../lib/enums";

interface FormulaireModification {
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email: string;
  numeroImmatriculation: string;
  serieImmatriculation: string;
  codeRegion: string;
  marque?: string;
  modele?: string;
  couleur?: string;
  typeVehicule: TypeVehicule;
  parkingId: number;
  tarifParkingId: number;
  modePaiement: ModePaiement;
}

type CleDocument = keyof DocumentsModificationDemande;

const libellesDocuments: Record<CleDocument, string> = {
  cinRecto: "CIN — recto",
  cinVerso: "CIN — verso",
  carteGriseRecto: "Carte grise — recto",
  carteGriseVerso: "Carte grise — verso",
};

function obtenirErreur(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail || "La modification a échoué.";
  }
  return "La modification a échoué.";
}

function fichierDepuisListe(liste?: UploadFile[]): File | undefined {
  return liste?.[0]?.originFileObj as File | undefined;
}

export function ModificationDemandeAgent() {
  const { id } = useParams();
  const demandeId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<FormulaireModification>();
  const parkingId = Form.useWatch("parkingId", form);
  const [documents, setDocuments] = useState<
    Partial<Record<CleDocument, UploadFile[]>>
  >({});

  const detail = useQuery({
    queryKey: ["demande", demandeId],
    queryFn: () => obtenirDetailDemande(demandeId),
    enabled: Number.isInteger(demandeId) && demandeId > 0,
  });
  const parkings = useQuery({
    queryKey: ["parkings", "disponibles-abonnement"],
    queryFn: getParkingsDisponiblesAbonnement,
  });
  const tarifs = useQuery({
    queryKey: ["tarifs-parking", parkingId],
    queryFn: () => getTarifsParking(Number(parkingId)),
    enabled: Number.isInteger(Number(parkingId)) && Number(parkingId) > 0,
  });

  useEffect(() => {
    if (!detail.data) return;
    const [numero = "", serie = "", region = ""] =
      detail.data.immatriculation.split("|");
    form.setFieldsValue({
      nom: detail.data.nom,
      prenom: detail.data.prenom,
      cin: detail.data.cin,
      telephone: detail.data.telephone,
      email: detail.data.email,
      numeroImmatriculation: numero,
      serieImmatriculation: serie,
      codeRegion: region,
      marque: detail.data.marque || undefined,
      modele: detail.data.modele || undefined,
      couleur: detail.data.couleur || undefined,
      typeVehicule: detail.data.typeVehicule,
      parkingId: detail.data.parkingId,
      tarifParkingId: detail.data.tarifParkingId,
      modePaiement: detail.data.modePaiementSouhaite,
    });
  }, [detail.data, form]);

  const optionsTarifs = useMemo(
    () =>
      (tarifs.data ?? []).map((tarif) => ({
        value: tarif.tarifParkingId,
        label: `${tarif.forfaitLibelle} — ${tarif.dureeEnMois} mois — ${tarif.montantTotalTTC.toLocaleString("fr-MA")} DH TTC`,
      })),
    [tarifs.data]
  );

  const mutation = useMutation({
    mutationFn: async (valeurs: FormulaireModification) => {
      const payload: ModificationDemandeReguliereRequest = {
        nom: valeurs.nom,
        prenom: valeurs.prenom,
        cin: valeurs.cin,
        telephone: valeurs.telephone,
        email: valeurs.email,
        immatriculation: [
          valeurs.numeroImmatriculation,
          valeurs.serieImmatriculation,
          valeurs.codeRegion,
        ].join("|"),
        marque: valeurs.marque,
        modele: valeurs.modele,
        couleur: valeurs.couleur,
        typeVehicule: valeurs.typeVehicule,
        tarifParkingId: valeurs.tarifParkingId,
        modePaiement: valeurs.modePaiement,
      };
      const fichiers: DocumentsModificationDemande = {};
      (Object.keys(libellesDocuments) as CleDocument[]).forEach((cle) => {
        const fichier = fichierDepuisListe(documents[cle]);
        if (fichier) fichiers[cle] = fichier;
      });
      return modifierDemandeAgent(demandeId, payload, fichiers);
    },
    onSuccess: async (resultat) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["demande", demandeId] }),
        queryClient.invalidateQueries({ queryKey: ["demandes", "en-attente-paiement"] }),
        queryClient.invalidateQueries({ queryKey: ["agent-historique"] }),
      ]);
      message.success("La demande a été modifiée et historisée.");
      navigate(`/agent/demandes/${resultat.id}`);
    },
  });

  if (detail.isLoading) {
    return <Spin size="large" />;
  }
  if (detail.isError || !detail.data) {
    return <Alert type="error" showIcon message="Impossible de charger la demande" />;
  }
  if (detail.data.statut !== "EN_ATTENTE_PAIEMENT") {
    return (
      <Alert
        type="warning"
        showIcon
        message="Modification impossible"
        description="Seules les demandes en attente de paiement peuvent être modifiées."
      />
    );
  }

  return (
    <section className="space-y-5">
      <Space direction="vertical" size={2}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/agent/demandes/${demandeId}`)}
        >
          Retour au détail
        </Button>
        <Typography.Title level={2}>Modifier la demande</Typography.Title>
        <Typography.Text type="secondary">
          {detail.data.reference} — les changements seront conservés dans votre historique.
        </Typography.Text>
      </Space>

      {mutation.isError && (
        <Alert type="error" showIcon message="Échec de l’enregistrement" description={obtenirErreur(mutation.error)} />
      )}

      <Form form={form} layout="vertical" onFinish={(valeurs) => mutation.mutate(valeurs)}>
        <Card title="Client" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="nom" label="Nom" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="cin" label="CIN" rules={[{ required: true }, { min: 5, max: 20 }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="email" label="E-mail" rules={[{ required: true }, { type: "email" }]}><Input /></Form.Item></Col>
          </Row>
        </Card>

        <Card title="Véhicule" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="numeroImmatriculation" label="Numéro" rules={[{ required: true, pattern: /^[0-9]{3,7}$/ }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="serieImmatriculation" label="Série" rules={[{ required: true, pattern: /^\p{L}$/u }]}><Input maxLength={1} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="codeRegion" label="Région" rules={[{ required: true, pattern: /^[0-9]{1,2}$/ }]}><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="marque" label="Marque"><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="modele" label="Modèle"><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="couleur" label="Couleur"><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="typeVehicule" label="Type" rules={[{ required: true }]}><Select options={[{ value: "VOITURE", label: "Voiture" }, { value: "MOTO", label: "Moto / deux-roues" }, { value: "AUTRE", label: "Autre" }]} /></Form.Item></Col>
          </Row>
        </Card>

        <Card title="Abonnement et paiement" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="parkingId" label="Parking" rules={[{ required: true }]}>
                <Select
                  loading={parkings.isLoading}
                  options={(parkings.data ?? []).map((parking) => ({ value: parking.id, label: parking.nom }))}
                  onChange={() => form.setFieldValue("tarifParkingId", undefined)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item name="tarifParkingId" label="Forfait et durée" rules={[{ required: true }]}>
                <Select loading={tarifs.isLoading} options={optionsTarifs} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="modePaiement" label="Mode de paiement" rules={[{ required: true }]}>
                <Select options={[{ value: "ESPECE", label: "Espèces" }, { value: "CHEQUE", label: "Chèque" }]} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Remplacer des justificatifs (facultatif)" className="mb-4">
          <Alert className="mb-4" type="info" showIcon message="Un fichier ajouté remplace la version active correspondante. Les anciens fichiers restent archivés pour la traçabilité." />
          <Row gutter={[16, 16]}>
            {(Object.keys(libellesDocuments) as CleDocument[]).map((cle) => (
              <Col xs={24} md={12} key={cle}>
                <Typography.Text strong>{libellesDocuments[cle]}</Typography.Text>
                <div className="mt-2">
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="application/pdf,image/jpeg,image/png"
                    fileList={documents[cle] ?? []}
                    onChange={({ fileList }) => setDocuments((actuels) => ({ ...actuels, [cle]: fileList.slice(-1) }))}
                  >
                    <Button icon={<UploadOutlined />}>Choisir un nouveau fichier</Button>
                  </Upload>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Space>
          <Button onClick={() => navigate(`/agent/demandes/${demandeId}`)}>Annuler</Button>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={mutation.isPending}>
            Enregistrer les modifications
          </Button>
        </Space>
      </Form>
    </section>
  );
}
