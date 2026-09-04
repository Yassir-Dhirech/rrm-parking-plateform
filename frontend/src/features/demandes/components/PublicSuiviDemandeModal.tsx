import { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Tag,
  Row,
  Col,
  Descriptions,
  Divider,
  Steps,
  Alert,
  Form,
  Select,
  message,
  Card,
  Spin,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  IdcardOutlined,
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  RollbackOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { type DemandeDetail } from "../types";
import { searchPublicDemandeByRef, updatePublicDemande } from "../../../api/demandes";
import { getPublicParkings } from "../../../api/parkings";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "../../../lib/dateUtils";

interface PublicSuiviDemandeModalProps {
  open: boolean;
  onClose: () => void;
  initialReference?: string;
}

export function PublicSuiviDemandeModal({
  open,
  onClose,
  initialReference = "",
}: PublicSuiviDemandeModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialReference);
  const [demande, setDemande] = useState<DemandeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm] = Form.useForm();

  // Load public parkings for potential parking change
  const { data: parkings = [] } = useQuery({
    queryKey: ["public_parkings"],
    queryFn: getPublicParkings,
  });

  // Automatically search when modal opens with initialReference
  useEffect(() => {
    if (open && initialReference) {
      setSearchQuery(initialReference);
      handleSearch(initialReference);
    } else if (!open) {
      setIsEditing(false);
    }
  }, [open, initialReference]);

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim();
    if (!q) {
      message.warning("Veuillez saisir un numéro de référence (ex: DEM-2026-000001), CIN ou téléphone.");
      return;
    }

    setIsLoading(true);
    setIsEditing(false);
    try {
      const res = await searchPublicDemandeByRef(q);
      if (res) {
        setDemande(res);
      } else {
        setDemande(null);
        message.error("Aucun dossier correspondant trouvé avec cet identifiant.");
      }
    } catch {
      message.error("Erreur lors de la recherche du dossier.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit mode
  const handleStartEditing = () => {
    if (!demande) return;
    editForm.setFieldsValue({
      clientNom: demande.clientNom,
      cin: demande.cin,
      ice: demande.ice,
      rc: demande.rc,
      telephone: demande.telephone,
      email: demande.email,
      immatriculation: demande.immatriculation,
      typeVehicule: demande.typeVehicule || "VOITURE",
      parkingNom: demande.parkingNom,
      commentaireCorrection: demande.commentaireCorrection || "",
    });
    setIsEditing(true);
  };

  // Save modifications
  const handleSaveModifications = async () => {
    try {
      const values = await editForm.validateFields();
      if (!demande) return;

      setIsSaving(true);
      const updated = await updatePublicDemande(demande.reference, {
        clientNom: values.clientNom,
        cin: values.cin,
        ice: values.ice,
        rc: values.rc,
        telephone: values.telephone,
        email: values.email,
        immatriculation: values.immatriculation,
        typeVehicule: values.typeVehicule,
        parkingNom: values.parkingNom,
        commentaireCorrection: values.commentaireCorrection,
      });

      setDemande(updated);
      setIsEditing(false);
      message.success("Vos modifications ont été enregistrées avec succès sur votre dossier !");
    } catch {
      message.error("Veuillez vérifier les champs obligatoires avant d'enregistrer.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step Status Mapping
  const getStepCurrent = (statut: string) => {
    switch (statut) {
      case "SOUMISE":
      case "CORRIGEE":
        return 0;
      case "EN_COURS":
        return 1;
      case "PAIEMENT_ENREGISTRE":
        return 2;
      case "VALIDEE":
        return 3;
      case "REJETEE":
        return 1;
      default:
        return 0;
    }
  };

  const getStatusTag = (statut: string) => {
    switch (statut) {
      case "SOUMISE":
        return <Tag color="blue" className="font-bold px-3 py-1 rounded-full"><ClockCircleOutlined /> Dossier Soumis</Tag>;
      case "CORRIGEE":
        return <Tag color="cyan" className="font-bold px-3 py-1 rounded-full"><CheckCircleOutlined /> Modifié par le Client</Tag>;
      case "EN_COURS":
        return <Tag color="orange" className="font-bold px-3 py-1 rounded-full"><ClockCircleOutlined /> Instruction en Cours</Tag>;
      case "PAIEMENT_ENREGISTRE":
        return <Tag color="purple" className="font-bold px-3 py-1 rounded-full"><BankOutlined /> Paiement Enregistré au Guichet</Tag>;
      case "VALIDEE":
        return <Tag color="green" className="font-bold px-3 py-1 rounded-full"><CheckCircleOutlined /> Abonnement Actif</Tag>;
      case "REJETEE":
        return <Tag color="red" className="font-bold px-3 py-1 rounded-full"><CloseCircleOutlined /> Dossier à Régulariser</Tag>;
      default:
        return <Tag color="default">{statut}</Tag>;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      destroyOnClose
      centered
      className="rounded-3xl overflow-hidden"
      title={
        <div className="flex items-center gap-2 text-slate-900 pr-6">
          <SafetyCertificateOutlined className="text-secondary text-xl" />
          <span className="font-extrabold text-base sm:text-lg">
            Suivi & Gestion de Dossier de Souscription RRM
          </span>
        </div>
      }
    >
      <div className="py-2 space-y-5">
        {/* Search Bar Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Rechercher votre demande par Référence, N° CIN, ICE ou Téléphone :
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              size="large"
              placeholder="Ex: DEM-2026-000001, A748392 ou 0612345678"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={() => handleSearch()}
              className="rounded-xl font-mono text-sm"
              prefix={<SearchOutlined className="text-slate-400" />}
            />
            <Button
              type="primary"
              size="large"
              loading={isLoading}
              onClick={() => handleSearch()}
              icon={<SearchOutlined />}
              className="rounded-xl bg-secondary px-6 font-bold shrink-0"
            >
              Consulter Mon Dossier
            </Button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 text-center">
            <Spin size="large" />
            <span className="block text-xs font-bold text-slate-500 mt-3">
              Recherche des informations de votre demande...
            </span>
          </div>
        )}

        {/* Dossier Found Content */}
        {!isLoading && demande && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Card with Status and The Requested Modify Button */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Référence Officielle du Dossier
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <strong className="text-lg sm:text-xl font-black text-secondary font-mono">
                      {demande.reference}
                    </strong>
                    {getStatusTag(demande.statut)}
                  </div>
                </div>

                {/* THE REQUESTED BUTTON: Modifier mes informations */}
                {!isEditing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleStartEditing}
                    className="bg-amber-600 hover:bg-amber-700 border-amber-600 rounded-xl font-bold px-4 h-10 shadow-sm flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                  >
                    Modifier Ma Demande / Mes Infos
                  </Button>
                ) : (
                  <Button
                    icon={<RollbackOutlined />}
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl font-semibold h-10 px-4 text-xs"
                  >
                    Fermer l'Édition
                  </Button>
                )}
              </div>

              {/* Rejection / Action Required Alert */}
              {demande.statut === "REJETEE" && (
                <Alert
                  type="error"
                  showIcon
                  className="mt-3 rounded-xl"
                  message="Dossier nécessitant une régularisation"
                  description={
                    <div>
                      <span>Motif indiqué par l'instructeur : <strong>{demande.raisonRejet || "Documents ou informations à corriger."}</strong></span>
                      <p className="mt-1 text-xs text-red-700 font-semibold mb-0">
                        Cliquez sur le bouton "Modifier Ma Demande / Mes Infos" ci-dessus pour corriger vos éléments et valider.
                      </p>
                    </div>
                  }
                />
              )}

              {/* Progress Steps */}
              <div className="mt-4 pt-2">
                <Steps
                  size="small"
                  current={getStepCurrent(demande.statut)}
                  status={demande.statut === "REJETEE" ? "error" : "process"}
                  items={[
                    { title: "Dossier Soumis", description: formatDate(demande.dateCreation) },
                    { title: "Contrôle RRM", description: demande.statut === "REJETEE" ? "Régularisation" : "Examen pièces" },
                    { title: "Règlement Guichet", description: demande.paiementInfo ? "Confirmé" : "En attente" },
                    { title: "Badge Actif", description: demande.numeroCarteAbonne || "À délivrer" },
                  ]}
                />
              </div>
            </div>

            {/* EDIT MODE FORM */}
            {isEditing ? (
              <Card
                className="rounded-2xl border-amber-300 bg-amber-50/40 shadow-md"
                title={
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                    <EditOutlined className="text-amber-700" />
                    <span>Modification de votre Demande ({demande.reference})</span>
                  </div>
                }
              >
                <Alert
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  message="Mise à jour libre de vos données"
                  description="Vous pouvez modifier vos coordonnées de contact, vos identifiants, votre véhicule ou préciser vos remarques. Vos changements seront immédiatement synchronisés sur votre dossier."
                  className="mb-4 rounded-xl text-xs"
                />

                <Form form={editForm} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="clientNom"
                        label={demande.typeClient === "ENTREPRISE" ? "Raison Sociale de l'Entreprise" : "Nom & Prénom"}
                        rules={[{ required: true, message: "Ce champ est obligatoire." }]}
                      >
                        <Input className="rounded-xl py-2 font-semibold" />
                      </Form.Item>
                    </Col>

                    {demande.typeClient === "ENTREPRISE" ? (
                      <>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="ice"
                            label="Identifiant Commun (ICE — 15 chiffres)"
                            normalize={(val) => (val ? val.replace(/\D/g, "").slice(0, 15) : "")}
                            rules={[
                              { required: true, message: "L'ICE est requis pour les entreprises." },
                              { pattern: /^\d{15}$/, message: "L'ICE doit comporter exactement 15 chiffres numériques." },
                            ]}
                          >
                            <Input maxLength={15} className="rounded-xl py-2 font-mono" placeholder="15 chiffres" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="rc" label="Registre de Commerce (RC)">
                            <Input className="rounded-xl py-2 font-mono" />
                          </Form.Item>
                        </Col>
                      </>
                    ) : (
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="cin"
                          label="Carte d'Identité Nationale (CIN)"
                          rules={[{ required: true, message: "La CIN est obligatoire." }]}
                        >
                          <Input className="rounded-xl py-2 font-mono uppercase" />
                        </Form.Item>
                      </Col>
                    )}

                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="telephone"
                        label="Téléphone Mobile (SMS)"
                        rules={[{ required: true, message: "Le numéro de téléphone est obligatoire." }]}
                      >
                        <Input className="rounded-xl py-2 font-mono" prefix={<PhoneOutlined className="text-slate-400" />} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Adresse Email de Confirmation"
                        rules={[
                          { required: true, message: "L'email est obligatoire." },
                          { type: "email", message: "Email invalide." },
                        ]}
                      >
                        <Input className="rounded-xl py-2" prefix={<MailOutlined className="text-slate-400" />} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="immatriculation"
                        label="Immatriculation du Véhicule"
                        rules={[{ required: true, message: "L'immatriculation est obligatoire." }]}
                      >
                        <Input className="rounded-xl py-2 font-mono font-bold text-secondary" prefix={<CarOutlined className="text-slate-400" />} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item name="parkingNom" label="Parking Souhaité à Rabat">
                        <Select className="rounded-xl">
                          {parkings.map((p: any) => (
                            <Select.Option key={p.id} value={p.nom}>
                              {p.nom}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="commentaireCorrection"
                    label="Précisions ou Observations pour le Service Instruction RRM"
                  >
                    <Input.TextArea
                      rows={2}
                      className="rounded-xl"
                      placeholder="Indiquez ici toute information complémentaire ou précision sur votre demande..."
                    />
                  </Form.Item>

                  <div className="flex justify-end gap-3 pt-2 border-t border-amber-200">
                    <Button onClick={() => setIsEditing(false)} className="rounded-xl">
                      Annuler
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={isSaving}
                      onClick={handleSaveModifications}
                      className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-xl font-bold px-6 shadow-sm"
                    >
                      Enregistrer les Modifications
                    </Button>
                  </div>
                </Form>
              </Card>
            ) : (
              /* READ-ONLY OVERVIEW CARDS */
              <div className="space-y-4">
                <Card className="rounded-2xl border-slate-200 bg-white/90 shadow-sm" bodyStyle={{ padding: 16 }}>
                  <Divider titlePlacement="left" className="m-0 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><IdcardOutlined className="text-secondary" /> Identité & Coordonnées</span>
                  </Divider>
                  <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="Souscripteur">
                      <strong className="text-slate-900">{demande.clientNom}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label={demande.typeClient === "ENTREPRISE" ? "Identifiant ICE" : "Identifiant CIN"}>
                      <span className="font-mono font-bold text-slate-800">{demande.ice || demande.cin || "-"}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Téléphone">
                      <span className="font-mono text-slate-800">{demande.telephone || "-"}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <span className="text-slate-800">{demande.email || "-"}</span>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card className="rounded-2xl border-slate-200 bg-white/90 shadow-sm" bodyStyle={{ padding: 16 }}>
                  <Divider titlePlacement="left" className="m-0 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><CarOutlined className="text-secondary" /> Véhicule & Stationnement</span>
                  </Divider>
                  <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="Immatriculation">
                      <Tag color="geekblue" className="font-mono font-bold text-sm m-0">
                        {demande.immatriculation || "-"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Parking d'Affectation">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <EnvironmentOutlined className="text-cyan-600" /> {demande.parkingNom}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Formule Tarifaire">
                      <span className="text-slate-800 font-semibold">{demande.forfaitNom || "Pass Permanent 24h/7j"}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Durée de Souscription">
                      <Tag color="purple" className="font-bold m-0">
                        {demande.dureeMois ? `${demande.dureeMois} Mois` : "Courte Durée"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Montant Net Total">
                      <strong className="text-secondary text-base font-black">
                        {(demande.montantTotal || 0).toLocaleString("fr-FR")} DH TTC
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mode de Règlement">
                      <Tag color={demande.paiementInfo?.modePaiement === "CHEQUE" ? "purple" : "green"} className="font-bold m-0">
                        {demande.paiementInfo?.modePaiement === "CHEQUE" ? "Chèque Bancaire" : "Espèces (Guichet RRM)"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {demande.commentaireCorrection && (
                  <Alert
                    type="info"
                    showIcon
                    className="rounded-xl text-xs"
                    message="Dernière note client enregistrée"
                    description={demande.commentaireCorrection}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
