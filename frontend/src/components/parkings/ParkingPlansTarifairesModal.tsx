import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Button,
  Alert,
  message,
  Space,
  Card,
  Upload,
  Tooltip,
} from "antd";
import {
  TagsOutlined,
  SaveOutlined,
  CarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  UploadOutlined,
  FileProtectOutlined,
  PlusOutlined,
  DeleteOutlined,
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

export interface PlanItem {
  id: number;
  libelle: string;
  typeAbonnement: string;
  categorie: "Particulier" | "Corporate 20 Ans" | "Conventionné / Spécial";
  plageHoraire: string;
  dureeMois: number;
  tarifTTC: number;
}

export function ParkingPlansTarifairesModal({ open, onClose, parking, onSuccess }: ParkingPlanModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [attachedPvName, setAttachedPvName] = useState<string | null>(null);

  // Dynamic state holding all plans for this parking
  const [plans, setPlans] = useState<PlanItem[]>([]);

  useEffect(() => {
    if (!parking || !open) return;

    // Reset edit mode to locked (read-only grey) whenever modal opens
    setIsEditModeActive(false);
    setAttachedPvName(null);

    // Retrieve active tariffs for this parking from mockTarifs
    const parkingTarifs = mockTarifs.filter((t) => t.parkingId === parking.id);

    if (parkingTarifs.length > 0) {
      setPlans(
        parkingTarifs.map((t) => ({
          id: t.id,
          libelle: t.libelle,
          typeAbonnement: t.typeAbonnement,
          categorie:
            t.typeAbonnement === "CORPORATE"
              ? "Corporate 20 Ans"
              : t.typeAbonnement.includes("CONV")
              ? "Conventionné / Spécial"
              : "Particulier",
          plageHoraire: t.plageHoraire || "24h / 7j",
          dureeMois: t.dureeMois || 1,
          tarifTTC: t.tarifTTC,
        }))
      );
    } else {
      // Default canonical plans if parking has no tariffs configured yet
      setPlans([
        {
          id: Date.now() + 1,
          libelle: "Abonnement Particulier — Permanent (24h / 7j)",
          typeAbonnement: "PERMANENT_24_7",
          categorie: "Particulier",
          plageHoraire: "24h / 7j",
          dureeMois: 1,
          tarifTTC: 600,
        },
        {
          id: Date.now() + 2,
          libelle: "Abonnement Particulier — Diurne (Jour 08:00 - 20:00)",
          typeAbonnement: "JOUR_8H_20H",
          categorie: "Particulier",
          plageHoraire: "08:00 - 20:00",
          dureeMois: 1,
          tarifTTC: 420,
        },
        {
          id: Date.now() + 3,
          libelle: "Abonnement Particulier — Nocturne (Nuit 19:00 - 08:00)",
          typeAbonnement: "NUIT_19H_8H",
          categorie: "Particulier",
          plageHoraire: "19:00 - 08:00",
          dureeMois: 1,
          tarifTTC: 300,
        },
        {
          id: Date.now() + 4,
          libelle: "Contrat Corporate 20 Ans — Formule 08:00 - 20:00",
          typeAbonnement: "CORPORATE",
          categorie: "Corporate 20 Ans",
          plageHoraire: "08:00 - 20:00",
          dureeMois: 240,
          tarifTTC: 500,
        },
        {
          id: Date.now() + 5,
          libelle: "Contrat Corporate 20 Ans — Formule 08:00 - 22:00",
          typeAbonnement: "CORPORATE",
          categorie: "Corporate 20 Ans",
          plageHoraire: "08:00 - 22:00",
          dureeMois: 240,
          tarifTTC: 550,
        },
        {
          id: Date.now() + 6,
          libelle: "Contrat Corporate 20 Ans — Formule 24h / 7j",
          typeAbonnement: "CORPORATE",
          categorie: "Corporate 20 Ans",
          plageHoraire: "24h / 7j",
          dureeMois: 240,
          tarifTTC: 650,
        },
      ]);
    }

    form.setFieldsValue({ motifModification: "" });
  }, [parking, open, form]);

  const handleUpdatePlan = (id: number, field: keyof PlanItem, value: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleAddNewPlan = () => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newPlan: PlanItem = {
      id: newId,
      libelle: `Nouvelle Formule Personnalisée ${plans.length + 1}`,
      typeAbonnement: "PARTICULIER",
      categorie: "Particulier",
      plageHoraire: "24h / 7j",
      dureeMois: 1,
      tarifTTC: 450,
    };
    setPlans((prev) => [...prev, newPlan]);
    message.success("Nouvelle formule d'abonnement ajoutée à la liste ! Vous pouvez modifier son nom et son tarif.");
  };

  const handleDeletePlan = (id: number) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    message.info("Formule retirée de la grille tarifaire.");
  };

  const handleSubmit = async (values: any) => {
    if (!parking) return;

    if (!values.motifModification?.trim()) {
      message.error("Veuillez renseigner le motif officiel justifiant la révision tarifaire.");
      return;
    }

    if (plans.length === 0) {
      message.error("La grille tarifaire doit comporter au moins une formule.");
      return;
    }

    const hasEmptyName = plans.some((p) => !p.libelle?.trim());
    if (hasEmptyName) {
      message.error("Tous les forfaits doivent posséder un intitulé valide.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTarifsParkingMock(
        parking.id,
        plans.map((p) => ({
          id: p.id,
          libelle: p.libelle.trim(),
          typeAbonnement:
            p.categorie === "Corporate 20 Ans"
              ? "CORPORATE"
              : p.typeAbonnement || "PARTICULIER",
          plageHoraire: p.plageHoraire,
          dureeMois: p.categorie === "Corporate 20 Ans" ? 240 : p.dureeMois || 1,
          tarifTTC: Number(p.tarifTTC) || 0,
        }))
      );

      message.success(
        `Plans tarifaires pour ${parking.nom} enregistrés avec succès (${plans.length} formules actives)${
          attachedPvName ? ` avec PV "${attachedPvName}" associé` : ""
        } !`
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
      width={840}
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
            message="Grille Tarifaire Verrouillée en Lecture Seule"
            description="Les intitulés et les tarifs sont grisés et protégés contre toute modification accidentelle. Pour modifier les noms, ajuster les prix ou ajouter une nouvelle formule d'abonnement, cliquez sur 'Débloquer la modification' ci-dessous."
            className="rounded-xl border-amber-200 bg-amber-50/70"
          />
        ) : (
          <Alert
            type="info"
            showIcon
            icon={<UnlockOutlined style={{ color: "#006398" }} />}
            message="Mode Modification Débloqué"
            description="Vous pouvez modifier directement le nom de chaque formule, son tarif mensuel, en ajouter de nouvelles ou en supprimer. La saisie du motif officiel est obligatoire pour enregistrer les modifications."
            className="rounded-xl border-blue-200 bg-blue-50/70"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-3"
        >
          {/* Table Header for Clean Alignment */}
          <div className="hidden sm:flex items-center justify-between px-3.5 py-1 text-[11px] font-black text-slate-500 uppercase tracking-wider">
            <span>Formule d'Abonnement & Intitulé</span>
            <span className="w-56 text-right pr-2">Tarif Mensuel (MAD TTC)</span>
          </div>

          {/* Dynamic List of Plans: Each Plan with Perfectly Aligned Name & Price */}
          <div className="space-y-2.5">
            {plans.map((plan) => {
              const { ht, tva } = getHtAndTva(plan.tarifTTC);

              return (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !isEditModeActive
                      ? "bg-slate-50/70 border-slate-200"
                      : "bg-white border-slate-200/90 shadow-2xs hover:border-[#006398]/50"
                  }`}
                >
                  {/* Top Line: Category Badges, Plage Horaire, Live Tax breakdown & Delete Button */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          plan.categorie === "Corporate 20 Ans"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-[#006398]"
                        }`}
                      >
                        {plan.categorie === "Corporate 20 Ans" ? <CarOutlined /> : <UserOutlined />}
                      </div>

                      {isEditModeActive ? (
                        <>
                          <Select
                            size="small"
                            value={plan.categorie}
                            onChange={(val) => {
                              handleUpdatePlan(plan.id, "categorie", val);
                              if (val === "Corporate 20 Ans") {
                                handleUpdatePlan(plan.id, "typeAbonnement", "CORPORATE");
                                handleUpdatePlan(plan.id, "dureeMois", 240);
                              } else {
                                handleUpdatePlan(plan.id, "typeAbonnement", "PARTICULIER");
                                handleUpdatePlan(plan.id, "dureeMois", 1);
                              }
                            }}
                            style={{ width: 150 }}
                            options={[
                              { value: "Particulier", label: "Particulier" },
                              { value: "Corporate 20 Ans", label: "Corporate 20 Ans" },
                              { value: "Conventionné / Spécial", label: "Spécial / Conv." },
                            ]}
                          />
                          <Select
                            size="small"
                            value={plan.plageHoraire}
                            onChange={(val) => handleUpdatePlan(plan.id, "plageHoraire", val)}
                            style={{ width: 130 }}
                            options={[
                              { value: "24h / 7j", label: "24h / 7j" },
                              { value: "08:00 - 20:00", label: "08:00 - 20:00" },
                              { value: "08:00 - 22:00", label: "08:00 - 22:00" },
                              { value: "19:00 - 08:00", label: "19:00 - 08:00" },
                            ]}
                          />
                        </>
                      ) : (
                        <>
                          <Tag
                            color={plan.categorie === "Corporate 20 Ans" ? "purple" : "blue"}
                            className="font-extrabold text-[10px] m-0"
                          >
                            {plan.categorie}
                          </Tag>
                          <Tag className="font-semibold text-[10px] m-0">
                            {plan.plageHoraire}
                          </Tag>
                        </>
                      )}

                      <span className="text-[11px] text-slate-500 font-medium ml-1">
                        HT : <strong>{ht} MAD</strong> | TVA (20%) : <strong>{tva} MAD</strong>
                      </span>
                    </div>

                    {isEditModeActive && (
                      <Tooltip title="Supprimer cette formule">
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeletePlan(plan.id)}
                          className="rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        />
                      </Tooltip>
                    )}
                  </div>

                  {/* Bottom Line: Name Input and Price Input Perfectly Aligned Side-by-Side! */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <Input
                        disabled={!isEditModeActive}
                        value={plan.libelle}
                        onChange={(e) => handleUpdatePlan(plan.id, "libelle", e.target.value)}
                        placeholder="Intitulé de la formule d'abonnement..."
                        className="font-bold text-sm text-slate-900 rounded-xl w-full h-10"
                      />
                    </div>

                    <div className="w-56 shrink-0">
                      <InputNumber
                        disabled={!isEditModeActive}
                        value={plan.tarifTTC}
                        onChange={(val) => handleUpdatePlan(plan.id, "tarifTTC", val || 0)}
                        style={{ width: "100%" }}
                        min={50}
                        max={10000}
                        step={10}
                        addonAfter="MAD / m"
                        className="font-black text-slate-900 h-10 flex items-center rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add a New Plan Button (Active in Edit Mode) */}
          {isEditModeActive && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddNewPlan}
              className="w-full h-11 rounded-xl font-bold border-dashed border-blue-400 text-[#006398] hover:bg-blue-50/50 flex items-center justify-center gap-2 shadow-2xs mt-2"
            >
              Ajouter une Nouvelle Formule d'Abonnement
            </Button>
          )}

          {/* Mandatory Justification & Optional PV Upload (Visible when editing) */}
          {isEditModeActive && (
            <Card
              size="small"
              title={
                <Space>
                  <FileProtectOutlined style={{ color: "#006398" }} />
                  <span className="font-bold text-slate-900">
                    Justification Réglementaire & PV de Délibération
                  </span>
                  <Tag color="red" className="font-extrabold text-[10px]">
                    OBLIGATOIRE
                  </Tag>
                </Space>
              }
              className="rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs mt-3"
            >
              <Form.Item
                name="motifModification"
                label={
                  <span className="font-bold text-xs text-slate-800">
                    Motif officiel de la modification <span className="text-red-500">*</span>
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
                  placeholder="Ex: Décision du Conseil d'Administration du 15/08/2026, révision ou ajout de nouvelles formules tarifaires..."
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
                  onClick={() => {
                    setIsEditModeActive(false);
                    // Reload original tariffs
                    const parkingTarifs = mockTarifs.filter((t) => t.parkingId === parking?.id);
                    setPlans(
                      parkingTarifs.map((t) => ({
                        id: t.id,
                        libelle: t.libelle,
                        typeAbonnement: t.typeAbonnement,
                        categorie:
                          t.typeAbonnement === "CORPORATE" ? "Corporate 20 Ans" : "Particulier",
                        plageHoraire: t.plageHoraire || "24h / 7j",
                        dureeMois: t.dureeMois || 1,
                        tarifTTC: t.tarifTTC,
                      }))
                    );
                  }}
                  disabled={isSubmitting}
                  className="font-bold rounded-xl px-5"
                >
                  Annuler
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
