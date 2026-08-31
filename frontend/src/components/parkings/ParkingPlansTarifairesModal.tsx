import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Tag,
  Button,
  Alert,
  message,
  Space,
  Card,
  Upload,
} from "antd";
import {
  TagsOutlined,
  SaveOutlined,
  CarOutlined,
  UserOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  UploadOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { mockTarifs, updateTarifsParkingMock } from "../../api/adminMock";

export interface ParkingPlanModalProps {
  open: boolean;
  onClose: () => void;
  parking: {
    id: number;
    nom: string;
    code?: string;
    capaciteTotale?: number;
    adresse?: string;
  } | null;
  onSuccess?: () => void;
}

export function ParkingPlansTarifairesModal({ open, onClose, parking, onSuccess }: ParkingPlanModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [attachedPvName, setAttachedPvName] = useState<string | null>(null);

  // Watch form values to display live HT & TVA calculations
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!parking || !open) return;

    // Reset edit mode to locked (read-only grey) whenever modal opens
    setIsEditModeActive(false);
    setAttachedPvName(null);

    // Find actual tariffs for this parking from mockTarifs or set defaults
    const parkingTarifs = mockTarifs.filter((t) => t.parkingId === parking.id);

    const tarifPermanent = parkingTarifs.find((t) => t.typeAbonnement === "PERMANENT_24_7")?.tarifTTC ?? (parking.id === 3 ? 540 : parking.id === 2 ? 720 : 600);
    const tarifJour = parkingTarifs.find((t) => t.typeAbonnement === "JOUR_8H_20H")?.tarifTTC ?? (parking.id === 3 ? 360 : parking.id === 2 ? 480 : 420);
    const tarifNuit = parkingTarifs.find((t) => t.typeAbonnement === "NUIT_19H_8H")?.tarifTTC ?? (parking.id === 3 ? 250 : parking.id === 2 ? 360 : 300);
    
    const tarifCorpJour = parkingTarifs.find((t) => t.libelle?.includes("08:00 - 20:00") && t.dureeMois === 240)?.tarifTTC ?? 500;
    const tarifCorpEtendu = parkingTarifs.find((t) => t.libelle?.includes("08:00 - 22:00") && t.dureeMois === 240)?.tarifTTC ?? 550;
    const tarifCorp247 = parkingTarifs.find((t) => t.libelle?.includes("24h / 7j") && t.dureeMois === 240)?.tarifTTC ?? 650;
    const tarifDeuxRoues = 150;

    const initialPrices: Record<string, number> = {
      tarifPermanent,
      tarifJour,
      tarifNuit,
      tarifCorpJour,
      tarifCorpEtendu,
      tarifCorp247,
      tarifDeuxRoues,
    };

    form.setFieldsValue({
      ...initialPrices,
      motifModification: "",
    });
    setLivePrices(initialPrices);
  }, [parking, open, form]);

  const handleValuesChange = (_: any, allValues: any) => {
    setLivePrices(allValues);
  };

  const handleSubmit = async (values: any) => {
    if (!parking) return;

    if (!values.motifModification?.trim()) {
      message.error("Veuillez renseigner le motif officiel justifiant la révision tarifaire.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTarifsParkingMock(parking.id, [
        {
          typeAbonnement: "PERMANENT_24_7",
          libelle: "Abonnement Permanent (24h / 7j)",
          plageHoraire: "24h / 7j",
          tarifTTC: values.tarifPermanent,
          dureeMois: 1,
        },
        {
          typeAbonnement: "JOUR_8H_20H",
          libelle: "Abonnement Jour (Diurne 08:00 - 20:00)",
          plageHoraire: "08:00 - 20:00",
          tarifTTC: values.tarifJour,
          dureeMois: 1,
        },
        {
          typeAbonnement: "NUIT_19H_8H",
          libelle: "Abonnement Nuit (Nocturne 19:00 - 08:00)",
          plageHoraire: "19:00 - 08:00",
          tarifTTC: values.tarifNuit,
          dureeMois: 1,
        },
        {
          typeAbonnement: "CORPORATE",
          libelle: "Longue Durée 20 Ans (08:00 - 20:00)",
          plageHoraire: "08:00 - 20:00",
          tarifTTC: values.tarifCorpJour,
          dureeMois: 240,
        },
        {
          typeAbonnement: "CORPORATE",
          libelle: "Longue Durée 20 Ans (08:00 - 22:00)",
          plageHoraire: "08:00 - 22:00",
          tarifTTC: values.tarifCorpEtendu,
          dureeMois: 240,
        },
        {
          typeAbonnement: "CORPORATE",
          libelle: "Longue Durée 20 Ans (24h / 7j)",
          plageHoraire: "24h / 7j",
          tarifTTC: values.tarifCorp247,
          dureeMois: 240,
        },
        {
          typeAbonnement: "DEUX_ROUES",
          libelle: "Abonnement Deux-Roues / Moto (24h / 7j)",
          plageHoraire: "24h / 7j",
          tarifTTC: values.tarifDeuxRoues,
          dureeMois: 1,
        },
      ]);

      message.success(
        `Plans tarifaires pour ${parking.nom} mis à jour avec motif officiel enregistré${attachedPvName ? ` et PV "${attachedPvName}" associé` : ""} !`
      );
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      if (onSuccess) onSuccess();
      setIsEditModeActive(false);
      onClose();
    } catch (err) {
      message.error("Erreur lors de la sauvegarde des tarifs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHtAndTva = (ttc: number = 0) => {
    const ht = Math.round((ttc / 1.2) * 100) / 100;
    const tva = Math.round((ttc - ht) * 100) / 100;
    return { ht: ht.toFixed(2), tva: tva.toFixed(2) };
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between gap-2 text-slate-900 font-black text-lg pr-6">
          <div className="flex items-center gap-2">
            <TagsOutlined style={{ color: "#006398" }} />
            <span>Plans Tarifaires Applicables — {parking?.nom}</span>
          </div>
          {isEditModeActive ? (
            <Tag color="orange" icon={<UnlockOutlined />} className="font-bold text-xs m-0">
              Mode Révision Actif
            </Tag>
          ) : (
            <Tag color="default" icon={<LockOutlined />} className="font-bold text-xs m-0">
              Lecture Seule (Grisé)
            </Tag>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      destroyOnClose
      className="plans-tarifaires-modal"
    >
      <div className="space-y-4 pt-2">
        {/* Parking Info Header Pill */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{parking?.nom}</span>
              {parking?.code && (
                <Tag color="blue" className="font-bold text-xs m-0">
                  {parking.code}
                </Tag>
              )}
              <Tag color="green" className="font-bold text-xs m-0">
                En Exploitation
              </Tag>
            </div>
            {parking?.adresse && (
              <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <EnvironmentOutlined /> {parking.adresse}
              </div>
            )}
          </div>
          {parking?.capaciteTotale && (
            <div className="text-xs text-slate-700 font-extrabold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              Capacité Globale : <strong className="text-[#006398]">{parking.capaciteTotale} places</strong>
            </div>
          )}
        </div>

        {/* Lock / Unlock Banner Alert */}
        {!isEditModeActive ? (
          <Alert
            type="warning"
            showIcon
            icon={<LockOutlined style={{ color: "#d97706" }} />}
            message="Informations Verrouillées en Lecture Seule"
            description="Toutes les valeurs tarifaires apparaissent en gris et sont protégées contre toute modification accidentelle. Pour réviser les tarifs, cliquez sur 'Débloquer la modification' ci-dessous, renseignez le motif officiel et joignez le PV de délibération (optionnel)."
            className="rounded-xl border-amber-200 bg-amber-50/70"
          />
        ) : (
          <Alert
            type="info"
            showIcon
            icon={<UnlockOutlined style={{ color: "#006398" }} />}
            message="Mode Modification Débloqué"
            description="Vous pouvez ajuster les tarifs mensuels TTC. Conformément à la gouvernance RRM, la saisie du motif officiel est requise pour enregistrer les modifications."
            className="rounded-xl border-blue-200 bg-blue-50/70"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          className="space-y-4"
        >
          {/* SECTION 1: Abonnements Particuliers */}
          <Card
            size="small"
            title={
              <Space>
                <UserOutlined style={{ color: "#006398" }} />
                <span className="font-bold text-slate-900">1. Abonnements Particuliers (Mensuel)</span>
                <Tag color="blue" className="font-extrabold text-[10px]">
                  Périodicité : 1 Mois
                </Tag>
              </Space>
            }
            className={`rounded-xl border shadow-2xs transition-all ${
              !isEditModeActive ? "bg-slate-50/60 border-slate-200" : "bg-white border-slate-200/90"
            }`}
          >
            <Row gutter={[16, 12]}>
              {/* Permanent 24/7 */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tarifPermanent"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Permanent (24h / 7j)
                    </span>
                  }
                  rules={[{ required: true, message: "Tarif obligatoire" }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={50}
                    max={5000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold text-slate-900"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifPermanent).ht} MAD (TVA: {getHtAndTva(livePrices.tarifPermanent).tva})
                </div>
              </Col>

              {/* Jour 08:00 - 20:00 */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tarifJour"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Diurne (08:00 - 20:00)
                    </span>
                  }
                  rules={[{ required: true, message: "Tarif obligatoire" }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={50}
                    max={5000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold text-slate-900"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifJour).ht} MAD (TVA: {getHtAndTva(livePrices.tarifJour).tva})
                </div>
              </Col>

              {/* Nuit 19:00 - 08:00 */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tarifNuit"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Nocturne (19:00 - 08:00)
                    </span>
                  }
                  rules={[{ required: true, message: "Tarif obligatoire" }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={50}
                    max={5000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold text-slate-900"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifNuit).ht} MAD (TVA: {getHtAndTva(livePrices.tarifNuit).tva})
                </div>
              </Col>
            </Row>
          </Card>

          {/* SECTION 2: Contrats Corporate Longue Durée 20 Ans */}
          <Card
            size="small"
            title={
              <Space>
                <CarOutlined style={{ color: "#9333ea" }} />
                <span className="font-bold text-slate-900">2. Contrats Flottes Corporate (Contrat 20 Ans)</span>
                <Tag color="purple" className="font-extrabold text-[10px]">
                  Tarif Mensuel / Véhicule
                </Tag>
              </Space>
            }
            className={`rounded-xl border shadow-2xs transition-all ${
              !isEditModeActive ? "bg-slate-50/60 border-slate-200" : "bg-purple-50/20 border-purple-200/90"
            }`}
          >
            <Row gutter={[16, 12]}>
              {/* Formule 1: 08:00 - 20:00 */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tarifCorpJour"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Formule 08:00 - 20:00
                    </span>
                  }
                  rules={[{ required: true, message: "Tarif obligatoire" }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={100}
                    max={5000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold text-purple-900"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifCorpJour).ht} MAD (TVA: {getHtAndTva(livePrices.tarifCorpJour).tva})
                </div>
              </Col>

              {/* Formule 2: 08:00 - 22:00 */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tarifCorpEtendu"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Formule 08:00 - 22:00
                    </span>
                  }
                  rules={[{ required: true, message: "Tarif obligatoire" }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={100}
                    max={5000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold text-purple-900"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifCorpEtendu).ht} MAD (TVA: {getHtAndTva(livePrices.tarifCorpEtendu).tva})
                </div>
              </Col>

              {/* Formule 3: 24h / 7j */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tarifCorp247"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Formule 24h / 7j
                    </span>
                  }
                  rules={[{ required: true, message: "Tarif obligatoire" }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={100}
                    max={5000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold text-purple-900"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifCorp247).ht} MAD (TVA: {getHtAndTva(livePrices.tarifCorp247).tva})
                </div>
              </Col>
            </Row>
          </Card>

          {/* SECTION 3: Deux-Roues & Frais Badges */}
          <Card
            size="small"
            title={
              <Space>
                <IdcardOutlined style={{ color: "#d97706" }} />
                <span className="font-bold text-slate-900">3. Deux-Roues & Frais Réglementaires de Carte RFID</span>
              </Space>
            }
            className={`rounded-xl border shadow-2xs transition-all ${
              !isEditModeActive ? "bg-slate-50/60 border-slate-200" : "bg-white border-slate-200/90"
            }`}
          >
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="tarifDeuxRoues"
                  label={
                    <span className="font-bold text-xs text-slate-800">
                      Deux-Roues / Moto (Permanent 24h/7j)
                    </span>
                  }
                  rules={[{ required: true }]}
                  className="mb-1"
                >
                  <InputNumber
                    disabled={!isEditModeActive}
                    style={{ width: "100%" }}
                    min={50}
                    max={1000}
                    step={10}
                    addonAfter="MAD TTC / m"
                    className="font-bold"
                  />
                </Form.Item>
                <div className="text-[11px] text-slate-500 font-medium px-1">
                  HT: {getHtAndTva(livePrices.tarifDeuxRoues).ht} MAD (TVA: {getHtAndTva(livePrices.tarifDeuxRoues).tva})
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 h-full flex flex-col justify-center">
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <IdcardOutlined /> Politique Badges RFID (Règle des 50 DH)
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium m-0 mt-1">
                    Nouvelle carte / duplicata : <strong>+50 DH TTC</strong> ajoutés à la facture.
                    <br />
                    Renouvellement avec carte existante : <strong>0 DH (Gratuit)</strong>.
                  </p>
                </div>
              </Col>
            </Row>
          </Card>

          {/* SECTION 4: Mandatory Justification & Optional PV Upload (Visible when editing) */}
          {isEditModeActive && (
            <Card
              size="small"
              title={
                <Space>
                  <FileProtectOutlined style={{ color: "#006398" }} />
                  <span className="font-bold text-slate-900">
                    4. Justification Réglementaire & PV de Délibération
                  </span>
                  <Tag color="red" className="font-extrabold text-[10px]">
                    OBLIGATOIRE
                  </Tag>
                </Space>
              }
              className="rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs"
            >
              <Form.Item
                name="motifModification"
                label={
                  <span className="font-bold text-xs text-slate-800">
                    Motif officiel de la modification tarifaire <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Veuillez spécifier la justification officielle de la révision",
                  },
                ]}
                className="mb-3"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Ex: Décision du Conseil d'Administration du 15/08/2026, révision de la grille tarifaire communale..."
                  className="rounded-xl font-medium"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-bold text-xs text-slate-800">
                    Pièce jointe du PV de délibération (Optionnel)
                  </span>
                }
                className="mb-0"
              >
                <Upload
                  beforeUpload={(file) => {
                    message.success(`PV joint : ${file.name}`);
                    setAttachedPvName(file.name);
                    return false;
                  }}
                  maxCount={1}
                  onRemove={() => setAttachedPvName(null)}
                >
                  <Button icon={<UploadOutlined />} className="rounded-xl font-semibold">
                    {attachedPvName ? `PV Attaché : ${attachedPvName}` : "Joindre le document PV (PDF / Image - Optionnel)"}
                  </Button>
                </Upload>
                {attachedPvName && (
                  <div className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <FileProtectOutlined /> Fichier prêt pour enregistrement : {attachedPvName}
                  </div>
                )}
              </Form.Item>
            </Card>
          )}

          {/* Modal Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-200">
            {!isEditModeActive ? (
              <>
                <Button onClick={onClose} className="font-bold rounded-xl px-5">
                  Fermer
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditModeActive(true)}
                  style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
                  className="rounded-xl px-5 shadow-xs"
                >
                  Débloquer la Modification
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditModeActive(false)}
                  disabled={isSubmitting}
                  className="font-bold rounded-xl px-5"
                >
                  Annuler la modification
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  icon={<SaveOutlined />}
                  style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
                  className="rounded-xl px-6 h-10 shadow-sm"
                >
                  Enregistrer & Valider avec Motif
                </Button>
              </>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
}
