import { useState } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Progress,
  Space,
  Tag,
  message,
} from "antd";
import {
  ScanOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  InboxOutlined,
  LoadingOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import type { ContratDetail, ContratScanInfo } from "../types";
import { useAuth } from "../../../context/AuthContext";
import { formatDate } from "../../../lib/dateUtils";

export interface ScannerContratModalProps {
  open: boolean;
  onClose: () => void;
  contrat?: {
    id?: number;
    reference: string;
    entrepriseNom: string;
    iceEntreprise?: string;
    parkingNom?: string;
  } | ContratDetail;
  contratReference?: string;
  entrepriseNom?: string;
  parkingNom?: string;
  onScanComplete?: (scanInfo: ContratScanInfo) => void;
  onScanSuccess?: (scanInfo: ContratScanInfo) => void;
}

const { Dragger } = Upload;

export function ScannerContratModal({
  open,
  onClose,
  contrat,
  contratReference,
  entrepriseNom,
  parkingNom,
  onScanComplete,
  onScanSuccess,
}: ScannerContratModalProps) {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("hardware");
  const [form] = Form.useForm();

  const ref = contrat?.reference || contratReference || "CTR-2026-0003";
  const ent = contrat?.entrepriseNom || entrepriseNom || "Entreprise Souscriptrice";
  const park = contrat?.parkingNom || parkingNom || "Parking Agdal Gare";

  // Scanning simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState("");
  const [scannedCompleted, setScannedCompleted] = useState(false);

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const defaultScanneur = userName ? `${userName} (Responsable RRM)` : "Mme. Leila Benali (Responsable RRM)";
  const todayFormatted = formatDate(new Date().toISOString());

  const handleStartHardwareScan = () => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStepText("Initialisation du scanner haute résolution (300 DPI)...");

    setTimeout(() => {
      setScanProgress(35);
      setScanStepText("Numérisation Page 1 & 2 (Recto-Verso - Convention Cadre)...");
    }, 800);

    setTimeout(() => {
      setScanProgress(70);
      setScanStepText("Numérisation Page 3 & 4 (Tableau Flotte & Signatures/Tampons)...");
    }, 1700);

    setTimeout(() => {
      setScanProgress(90);
      setScanStepText("Traitement OCR, redressement automatique et compression PDF/A...");
    }, 2500);

    setTimeout(() => {
      setScanProgress(100);
      setScanStepText("Numérisation terminée avec succès !");
      setIsScanning(false);
      setScannedCompleted(true);
      message.success("4 pages numérisées et certifiées conformes !");
    }, 3200);
  };

  const handleSaveScan = async () => {
    try {
      const values = await form.validateFields();
      const nomFichier =
        activeTab === "hardware"
          ? `CONTRAT_SCANNE_${ref}_300DPI.pdf`
          : uploadedFileName || `CONTRAT_${ref}_SIGNE.pdf`;

      const scanInfo: ContratScanInfo = {
        scanne: true,
        dateScan: values.dateScan || todayFormatted,
        scannePar: values.scannePar || defaultScanneur,
        referenceParapheur: values.referenceParapheur || `PARAPH-${ref}`,
        nomFichier,
        tailleFichier: activeTab === "hardware" ? "2.8 Mo (4 pages)" : "3.1 Mo (PDF)",
        nombrePages: values.nombrePages || 4,
        notesScan: values.notesScan || "Contrat original paraphé et signé conservé au siège d'exploitation RRM.",
      };

      if (onScanComplete) onScanComplete(scanInfo);
      if (onScanSuccess) onScanSuccess(scanInfo);
      message.success(`Contrat ${ref} numérisé et archivé avec succès !`);
      onClose();
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={780}
      destroyOnClose
      centered
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#003566] text-white flex items-center justify-center text-lg font-bold shadow-xs">
            <ScanOutlined />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 m-0 leading-tight">
              Numérisation du Contrat Corporate — {ref}
            </h3>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">
              Client : <strong>{ent}</strong> • Site : <strong>{park}</strong>
            </span>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-slate-400 font-medium">
            Archivage numérique certifié • Gouvernance RRM
          </span>
          <Space>
            <Button onClick={onClose} className="rounded-xl font-bold">
              Annuler
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleSaveScan}
              disabled={activeTab === "hardware" ? !scannedCompleted : !uploadedFileName}
              className="rounded-xl font-bold bg-[#003566] border-[#003566]"
            >
              Enregistrer & Archiver le Scan
            </Button>
          </Space>
        </div>
      }
    >
      <div className="pt-2 space-y-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: "hardware",
              label: (
                <span className="font-bold flex items-center gap-1.5 px-1">
                  <ScanOutlined /> Numérisation Directe (Scanner Réseau / USB)
                </span>
              ),
              children: (
                <div className="space-y-4 pt-1">
                  {/* Scanner Config Controls */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        <SettingOutlined className="mr-1" /> Périphérique Détecté
                      </span>
                      <Select
                        defaultValue="fujitsu"
                        className="w-full font-semibold"
                        options={[
                          { value: "fujitsu", label: "Fujitsu fi-7160 (ADF 300 DPI)" },
                          { value: "hp", label: "HP Digital Flow Sender (Réseau)" },
                          { value: "flatbed", label: "Scanner Vitre Platine RRM" },
                        ]}
                      />
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Résolution Numérisation</span>
                      <Select
                        defaultValue="300"
                        className="w-full font-semibold"
                        options={[
                          { value: "200", label: "200 DPI (Standard)" },
                          { value: "300", label: "300 DPI (Recommandé Légal RRM)" },
                          { value: "600", label: "600 DPI (Haute Définition)" },
                        ]}
                      />
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Mode & Alimentation</span>
                      <Select
                        defaultValue="color_duplex"
                        className="w-full font-semibold"
                        options={[
                          { value: "color_duplex", label: "Couleur • Recto-Verso (ADF)" },
                          { value: "color_simplex", label: "Couleur • Recto Seul" },
                          { value: "gray_duplex", label: "Niveaux de Gris • Duplex" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Scan Action Box */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center flex flex-col items-center justify-center min-h-[170px]">
                    {isScanning ? (
                      <div className="w-full max-w-md space-y-3">
                        <LoadingOutlined className="text-3xl text-secondary animate-spin mb-1" />
                        <Progress
                          percent={scanProgress}
                          status="active"
                          strokeColor={{ "0%": "#003566", "100%": "#047857" }}
                        />
                        <span className="text-xs font-bold text-slate-700 block animate-pulse">
                          {scanStepText}
                        </span>
                      </div>
                    ) : scannedCompleted ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                          <CheckCircleOutlined />
                        </div>
                        <h4 className="font-black text-slate-900 m-0 text-base">
                          Document 4 Pages Numérisé avec Succès !
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mb-3">
                          Fichier : <strong>CONTRAT_SCANNE_{ref}_300DPI.pdf</strong> (2.8 Mo • Format PDF/A)
                        </p>
                        <Space>
                          <Tag color="green" className="font-bold px-3 py-1">
                            Tampon RRM Détecté
                          </Tag>
                          <Tag color="blue" className="font-bold px-3 py-1">
                            Signatures Reconnues
                          </Tag>
                          <Button
                            size="small"
                            onClick={handleStartHardwareScan}
                            className="rounded-lg font-bold"
                          >
                            Re-scanner
                          </Button>
                        </Space>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-[#003566] flex items-center justify-center text-2xl">
                          <ScanOutlined />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 m-0 text-sm">
                            Prêt pour la numérisation du contrat physique signé
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Placez les 4 feuillets originaux dans le bac d'alimentation ADF du scanner.
                          </p>
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          icon={<ScanOutlined />}
                          onClick={handleStartHardwareScan}
                          className="bg-[#003566] border-[#003566] font-extrabold rounded-xl px-6 h-10 shadow-xs"
                        >
                          Démarrer la Numérisation (Scanner)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "upload",
              label: (
                <span className="font-bold flex items-center gap-1.5 px-1">
                  <CloudUploadOutlined /> Téléverser un Fichier Scanné (PDF / Image)
                </span>
              ),
              children: (
                <div className="pt-2">
                  <Dragger
                    name="file"
                    multiple={false}
                    accept=".pdf,.png,.jpg,.jpeg,.tiff"
                    beforeUpload={(file) => {
                      setUploadedFileName(file.name);
                      message.success(`Fichier ${file.name} sélectionné avec succès !`);
                      return false; // Prevent automatic HTTP post
                    }}
                    className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300"
                  >
                    <p className="ant-upload-drag-icon text-3xl text-secondary mb-2">
                      <InboxOutlined />
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm mb-1">
                      {uploadedFileName ? `Fichier prêt : ${uploadedFileName}` : "Glissez-déposez le scan du contrat ici"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Formats acceptés : <strong>PDF, TIFF, JPEG haute définition</strong> (Max 25 Mo)
                    </p>
                  </Dragger>
                </div>
              ),
            },
          ]}
        />

        {/* Archival & Parapheur Form */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpenOutlined className="text-secondary" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Métadonnées d'Archivage & Parapheur Physique
            </span>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              referenceParapheur: (contrat as any)?.referencePhysique || `PARAPH-${ref}`,
              dateScan: todayFormatted,
              scannePar: defaultScanneur,
              nombrePages: 4,
              notesScan: "Original certifié conforme archivé dans le parapheur central RRM.",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Réf. Parapheur Physique</span>}
                name="referenceParapheur"
                rules={[{ required: true, message: "Référence parapheur obligatoire" }]}
              >
                <Input className="font-bold rounded-lg" placeholder="Ex: PARAPH-CORP-2026-001" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Date Numérisation</span>}
                name="dateScan"
                rules={[{ required: true }]}
              >
                <Input className="font-bold rounded-lg" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Opérateur Numérisateur</span>}
                name="scannePar"
                rules={[{ required: true }]}
              >
                <Input className="font-semibold rounded-lg" />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-700">Observations & Notes d'Authenticité</span>}
              name="notesScan"
            >
              <Input.TextArea
                rows={2}
                className="rounded-lg text-xs"
                placeholder="Ex: Exemplaire original paraphé sur les 4 pages et revêtu des cachets officiels."
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
