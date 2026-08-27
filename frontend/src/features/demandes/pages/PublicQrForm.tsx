import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Tag,
  Row,
  Col,
  Collapse,
  Upload,
  InputNumber,
  Radio,
  Checkbox,
  Card as AntCard,
} from "antd";
import {
  PlusCircleOutlined,
  SyncOutlined,
  SwapOutlined,
  CopyOutlined,
  BankOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CarOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  UploadOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PublicNavbar } from "../../../components/ui/PublicNavbar";
import { PublicFooter } from "../../../components/ui/PublicFooter";
import { getPublicParkings } from "../../../api/parkings";
import { submitPublicDemande } from "../../../api/demandes";
import { OtpVerificationModal } from "../../../components/ui/OtpVerificationModal";
import { searchSubscriberByCinOrCardMock } from "../../../api/subscribersMock";

const { Option } = Select;

type TypeDemande = "NEW" | "RENEW" | "TRANSFER" | "DUPLICATE" | "CORPORATE";

// Custom Scan Upload Cadre with File Attached State
interface ScanUploadFieldProps {
  name: string;
  label: string;
  tagText: string;
  tagColor: string;
  icon: React.ReactNode;
  btnText: string;
  isRequired?: boolean;
  form: any;
}

function ScanUploadField({
  name,
  label,
  tagText,
  tagColor,
  icon,
  btnText,
  isRequired = true,
  form,
}: ScanUploadFieldProps) {
  const fileValue = Form.useWatch(name, form);
  const hasFile = Array.isArray(fileValue) && fileValue.length > 0;
  const fileName = hasFile ? fileValue[0]?.name || "Scan_Document.pdf" : "";

  return (
    <Form.Item
      name={name}
      valuePropName="fileList"
      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      rules={
        isRequired
          ? [{ required: true, message: `Le document (${label}) est obligatoire.` }]
          : undefined
      }
      className="m-0"
    >
      <Upload
        maxCount={1}
        beforeUpload={() => false}
        showUploadList={false}
        className="w-full flex justify-center"
      >
        {hasFile ? (
          <div className="scan-document-cadre w-full flex flex-col items-center justify-center p-5 text-center border-2 border-solid border-emerald-500 bg-emerald-50/70 shadow-md">
            <Tag color="green" className="font-extrabold px-3 py-0.5 rounded-full text-xs mb-2 border-none shadow-2xs">
              <CheckCircleOutlined /> Document Joint & Validé
            </Tag>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl mb-2 shadow-sm mx-auto">
              <CheckCircleOutlined />
            </div>
            <h5 className="text-sm font-bold text-slate-900 mb-1 text-center">{label}</h5>
            <p className="text-xs text-emerald-800 font-mono font-semibold truncate max-w-xs mb-3 text-center">
              📄 {fileName}
            </p>
            <Button
              icon={<SyncOutlined />}
              size="small"
              className="rounded-xl font-bold text-xs h-8 px-4 bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-2xs"
            >
              Changer le document
            </Button>
          </div>
        ) : (
          <div className="scan-document-cadre w-full flex flex-col items-center justify-center p-5 text-center">
            <Tag color={tagColor} className="font-extrabold px-3 py-0.5 rounded-full text-xs mb-3 border-none shadow-2xs">
              {tagText} {isRequired ? "*" : ""}
            </Tag>
            <div className="w-14 h-14 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center text-2xl mb-3 shadow-xs mx-auto">
              {icon}
            </div>
            <h5 className="text-sm font-bold text-slate-900 mb-3 text-center">{label}</h5>
            <Button
              icon={<UploadOutlined />}
              className="rounded-xl font-bold text-xs h-9 px-5 bg-white/90 border-slate-300 hover:bg-white shadow-2xs"
            >
              {btnText}
            </Button>
          </div>
        )}
      </Upload>
    </Form.Item>
  );
}

export function PublicQrForm() {
  const [searchParams] = useSearchParams();

  // Stepper & Type State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [typeDemande, setTypeDemande] = useState<TypeDemande>("NEW");

  // Accordion Folding & Section Validation State
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>(["perso_particulier"]);
  const [isPersoValid, setIsPersoValid] = useState<boolean>(false);
  const [isVehiculeValid, setIsVehiculeValid] = useState<boolean>(false);
  const [isCorporateValid, setIsCorporateValid] = useState<boolean>(false);

  // Corporate Fleet Count
  const [nombreVehiculesCorporate, setNombreVehiculesCorporate] = useState<number>(3);

  // Form Instance
  const [form] = Form.useForm();

  // Account Lookup State for RENEW / TRANSFER / DUPLICATE
  const [lookupQuery, setLookupQuery] = useState("");
  const [isSearchingLookup, setIsSearchingLookup] = useState(false);
  const [hasFoundAccount, setHasFoundAccount] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  // Form Live Watchers for Summary Calculation
  const watchedParkingId = Form.useWatch("parkingId", form);
  const watchedFormuleCode = Form.useWatch("formuleCode", form);
  const watchedDureeMois = Form.useWatch("dureeMois", form);

  // Public Parkings List
  const { data: parkings = [] } = useQuery({
    queryKey: ["public_parkings"],
    queryFn: getPublicParkings,
  });

  // Read URL parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const clientParam = searchParams.get("typeClient");
    const planParam = searchParams.get("plan");
    const parkingParam = searchParams.get("parkingId");

    if (tabParam) {
      if (tabParam === "NEW") setTypeDemande("NEW");
      if (tabParam === "RENEW") setTypeDemande("RENEW");
      if (tabParam === "TRANSFER") setTypeDemande("TRANSFER");
      if (tabParam === "DUPLICATE") setTypeDemande("DUPLICATE");
    }

    if (clientParam === "ENTREPRISE") {
      setTypeDemande("CORPORATE");
    }

    if (planParam) {
      form.setFieldValue("formuleCode", planParam);
    }

    if (parkingParam) {
      form.setFieldValue("parkingId", Number(parkingParam));
    }
  }, [searchParams, form]);

  // BETA Quick Test Autofill Handler
  const handleBetaAutofill = () => {
    const mockDocumentList = [
      {
        uid: "-1",
        name: "scan_document_test_rrm.pdf",
        status: "done",
        url: "#",
      },
    ];

    form.setFieldsValue({
      nom: "BENNANI",
      prenom: "Karim",
      cin: "AB123456",
      telephone: "0661234567",
      email: "karim.bennani@gmail.com",
      immatriculation: "12345-A-1",
      marque: "Dacia Logan 2023",
      photoCinRecto: mockDocumentList,
      photoCinVerso: mockDocumentList,
      photoCarteGriseRecto: mockDocumentList,
      photoCarteGriseVerso: mockDocumentList,
      raisonSociale: "Maroc Telecom SA",
      ice: "001234567000089",
      rc: "998877",
      nomContact: "Karim BENNANI",
      photoDocEntreprise: mockDocumentList,
      parkingId: parkings[0]?.id || 1,
      formuleCode: "24H7J",
      dureeMois: 6,
      modePaiement: "ESPECES",
      acceptTerms: true,
    });

    setIsPersoValid(true);
    setIsVehiculeValid(true);
    setIsCorporateValid(true);

    message.success("⚡ Mode BETA Test : Formulaire et documents pré-remplis avec succès !");
  };

  // Account search handler
  const handleLookupSubscriber = async () => {
    if (!lookupQuery.trim()) {
      message.warning("Veuillez saisir votre CIN ou Numéro de Carte RFID.");
      return;
    }
    setIsSearchingLookup(true);
    try {
      const res = await searchSubscriberByCinOrCardMock(lookupQuery.trim());
      if (res) {
        setHasFoundAccount(true);
        form.setFieldsValue({
          nom: res.nom,
          prenom: res.prenom,
          cin: res.cin,
          email: res.email,
          telephone: res.telephone,
          immatriculation: res.immatriculation,
          carteRfidActuelle: res.numeroCarteAbonne,
          parkingId: res.parkingId,
          formuleCode: res.forfaitNom.includes("24h") ? "24H7J" : "JOUR",
        });
        message.success("Compte abonné identifié avec succès !");
      } else {
        message.error("Aucun compte correspondant trouvé.");
      }
    } catch {
      message.error("Erreur lors de la recherche de l'abonné.");
    } finally {
      setIsSearchingLookup(false);
    }
  };

  // Section 1 Validation (Informations Personnelles) -> Folds Sec 1 & Unfolds Sec 2
  const handleValidatePerso = async () => {
    try {
      await form.validateFields(["nom", "prenom", "cin", "telephone", "email", "photoCinRecto", "photoCinVerso"]);
      setIsPersoValid(true);
      message.success("Informations Personnelles & CIN validées !");
      setActiveCollapseKeys(["vehicule_particulier"]);
    } catch {
      message.error("Veuillez remplir les informations et téléverser les photos CIN (Recto & Verso).");
    }
  };

  // Section 2 Validation (Informations Véhicule) -> Advance to Step 2 (Tarification)
  const handleValidateVehiculeAndNext = async () => {
    try {
      await form.validateFields(["immatriculation", "photoCarteGriseRecto", "photoCarteGriseVerso"]);
      setIsVehiculeValid(true);
      message.success("Informations Véhicule & Carte Grise validées !");
      setCurrentStep(2);
    } catch {
      message.error("Veuillez remplir l'immatriculation et téléverser les photos de la Carte Grise.");
    }
  };

  // Step 2 Validation (Parking & Option) -> Advance to Step 3 (Récapitulatif & OTP)
  const handleValidateParkingAndGoToRecap = async () => {
    try {
      await form.validateFields(["parkingId", "formuleCode", "dureeMois"]);
      setCurrentStep(3);
      message.success("Choix du parking et formule validés ! Vérifiez votre récapitulatif.");
    } catch {
      message.error("Veuillez choisir un parking et une formule.");
    }
  };

  // Corporate Section Validation
  const handleValidateCorporateAndNext = async () => {
    try {
      await form.validateFields(["raisonSociale", "ice", "rc", "nomContact", "telephone", "email", "photoDocEntreprise"]);
      setIsCorporateValid(true);
      message.success("Informations Société validées !");
      setCurrentStep(2);
    } catch {
      message.error("Veuillez remplir les informations et téléverser le document entreprise (ICE / RC).");
    }
  };

  // Calculate pricing summary
  const getMonthlyPrice = () => {
    switch (watchedFormuleCode) {
      case "24H7J":
        return 600;
      case "JOUR":
        return 420;
      case "NUIT":
        return 350;
      case "MOTO":
        return 200;
      default:
        return 600;
    }
  };

  const selectedParkingName =
    parkings.find((p: any) => p.id === watchedParkingId)?.nom || "Parking Mamounia (Rabat Hassan)";
  const totalMonths = watchedDureeMois || 3;
  const totalPrice = getMonthlyPrice() * totalMonths;

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: (values: any) => submitPublicDemande(values),
    onSuccess: (data) => {
      setSubmittedResult(data);
      message.success("Demande enregistrée avec succès !");
    },
    onError: () => {
      message.error("Erreur lors de la soumission de la demande.");
    },
  });

  const handleNextToOtp = async () => {
    try {
      const values = await form.validateFields();
      setPendingValues({
        ...values,
        typeDemande,
        typeClient: typeDemande === "CORPORATE" ? "ENTREPRISE" : "PARTICULIER",
      });
      setIsOtpModalOpen(true);
    } catch {
      message.error("Veuillez remplir les champs obligatoires et accepter les conditions d'utilisation.");
    }
  };

  // Dynamic Stepper Titles
  const getStepTitles = () => {
    if (typeDemande === "DUPLICATE") {
      return ["Type", "Recherche", "Vérification OTP", "Confirmation"];
    }
    if (typeDemande === "RENEW" || typeDemande === "TRANSFER") {
      return ["Type", "Recherche", "Tarification", "Récapitulatif & OTP"];
    }
    return ["1. Type de Demande", "2. Saisie Informations", "3. Tarification", "4. Récapitulatif & OTP"];
  };

  const STEP_TITLES = getStepTitles();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-0">
      {/* Shared Desktop & Mobile Unified Glass Navbar */}
      <PublicNavbar />

      {/* Hero Section Banner for Abonnement Page */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 my-6 w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-xl p-8 md:p-12 border border-white/60 group">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCQODW1HZ_NvXiKKSVVOX5SH4sgu1igMSmxOS0XoVaKgtYo2ucrDd6Ueetov0TP_AlBopE6PeMq_wZVHHV9oGO40DQjm3O_5yolQKuqZfxbX2km9XEgpI9tufvXXTc-43WjkPe0ybXaoCBh-MmAYGPm-m8W62T_GnnfYm7jj9o0-l-5y1LrB2N9SrI1hHsaZ4cPz660VvXRzfKVodhyW_gDO7berdjNLIBDxm0W5gLrOq-5H3q5atj')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Tag color="cyan" className="px-3 py-1 rounded-full font-extrabold border-none shadow-md text-xs inline-flex items-center gap-1.5 m-0">
                  <SafetyCertificateOutlined /> Portail Officiel des Démarches en Ligne
                </Tag>
                <Tag color="gold" className="px-3 py-1 rounded-full font-extrabold border-none shadow-md text-xs m-0">
                  Rabat Région Mobilité
                </Tag>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 leading-tight drop-shadow-xs">
                {typeDemande === "CORPORATE"
                  ? "Demande d'Abonnement Flotte Corporate"
                  : typeDemande === "DUPLICATE"
                  ? "Réclamation de Perte & Duplicata Carte RFID"
                  : "Demande d'Abonnement Parking"}
              </h1>
              <p className="text-slate-700 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                Souscrivez, renouvelez ou transférez votre abonnement parking en ligne en 4 étapes simples avec validation sécurisée.
              </p>
            </div>

            {/* BETA Test Autofill Action */}
            <div className="shrink-0">
              <Button
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={handleBetaAutofill}
                className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-white font-extrabold rounded-2xl px-5 shadow-lg shadow-amber-900/40 inline-flex items-center gap-2 h-12 text-xs"
              >
                ⚡ Mode Remplissage Rapide (BETA Test)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 my-6 mb-16">
        {/* Visual Stepper — Persistent Fixed Floating Compact Glass Capsule */}
        <div className="fixed top-[92px] left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/90 shadow-2xl flex items-center gap-2 max-w-fit">
            {STEP_TITLES.map((title, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompleted) setCurrentStep(idx);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300 border-none ${
                      isCurrent
                        ? "bg-secondary text-white shadow-md scale-105"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                    title={title}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isCurrent
                          ? "bg-white text-secondary"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-300 text-slate-600"
                      }`}
                    >
                      {isCompleted ? <CheckOutlined style={{ fontSize: "11px", fontWeight: "bold" }} /> : idx + 1}
                    </span>

                    {/* ONLY SHOW TEXT TITLE FOR THE ACTIVE STEP */}
                    {isCurrent && (
                      <span className="font-extrabold tracking-tight whitespace-nowrap animate-fade-in pr-1">
                        {title}
                      </span>
                    )}
                  </button>

                  {/* Connecting Line between step pills */}
                  {idx < STEP_TITLES.length - 1 && (
                    <div
                      className={`w-3 h-0.5 rounded-full transition-colors ${
                        idx < currentStep ? "bg-emerald-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 0: Select Request Type */}
        {currentStep === 0 && (
          <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-xl bg-white/70">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6">
              Sélectionnez le Type de Demande
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Nouvel Abonnement Particulier */}
              <div
                onClick={() => setTypeDemande("NEW")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  typeDemande === "NEW"
                    ? "border-secondary bg-secondary-container/20 shadow-md ring-2 ring-secondary/30"
                    : "border-slate-200 bg-white/60 hover:bg-white/90"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl shrink-0">
                  <PlusCircleOutlined />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Nouvel Abonnement</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Créer une nouvelle souscription pour votre véhicule (Particulier).
                  </p>
                </div>
              </div>

              {/* Option 2: Renouvellement */}
              <div
                onClick={() => setTypeDemande("RENEW")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  typeDemande === "RENEW"
                    ? "border-secondary bg-secondary-container/20 shadow-md ring-2 ring-secondary/30"
                    : "border-slate-200 bg-white/60 hover:bg-white/90"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                  <SyncOutlined />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Renouvellement</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Prolonger un abonnement existant (Recherche CIN/RFID + Choix Durée).
                  </p>
                </div>
              </div>

              {/* Option 3: Transfert / Changement */}
              <div
                onClick={() => setTypeDemande("TRANSFER")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  typeDemande === "TRANSFER"
                    ? "border-secondary bg-secondary-container/20 shadow-md ring-2 ring-secondary/30"
                    : "border-slate-200 bg-white/60 hover:bg-white/90"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">
                  <SwapOutlined />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Transfert & Changement de Parking</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Changer de parking d'affectation ou mettre à jour votre abonnement actif.
                  </p>
                </div>
              </div>

              {/* Option 4: Duplicata / Réclamation Perte */}
              <div
                onClick={() => setTypeDemande("DUPLICATE")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  typeDemande === "DUPLICATE"
                    ? "border-secondary bg-secondary-container/20 shadow-md ring-2 ring-secondary/30"
                    : "border-slate-200 bg-white/60 hover:bg-white/90"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">
                  <CopyOutlined />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Duplicata RFID (Réclamation Perte)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Déclarer la perte d'une carte RFID et demander l'édition d’un duplicata via OTP.
                  </p>
                </div>
              </div>

              {/* Option 5: Abonnement Long Terme Corporate */}
              <div
                onClick={() => setTypeDemande("CORPORATE")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 md:col-span-2 ${
                  typeDemande === "CORPORATE"
                    ? "border-secondary bg-secondary-container/20 shadow-md ring-2 ring-secondary/30"
                    : "border-amber-200 bg-amber-50/50 hover:bg-amber-100/60"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center text-xl shrink-0">
                  <BankOutlined />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-extrabold text-slate-900 m-0">Abonnement Long Terme (Entreprises & Flottes)</h3>
                    <Tag color="gold" className="font-bold border-none">Flottes Multi-Véhicules</Tag>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Formulaire dédié aux sociétés pour saisir le responsable, les documents entreprise et la liste des véhicules de la flotte.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => setCurrentStep(1)}
                className="bg-primary rounded-xl font-bold h-12 px-8 shadow-md"
              >
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: Dynamic Form based on TypeDemande */}
        {currentStep === 1 && (
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/80 shadow-xl bg-white/80">
            {/* FLOW 1: RENOUVELLEMENT / TRANSFERT / DUPLICATE -> SEARCH ACCOUNT ONLY */}
            {["RENEW", "TRANSFER", "DUPLICATE"].includes(typeDemande) ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 m-0">
                      {typeDemande === "DUPLICATE"
                        ? "Identification pour Déclaration de Perte Carte RFID"
                        : "Recherche de votre Compte Abonné"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Saisissez votre CIN ou numéro de carte RFID pour retrouver automatiquement vos informations.
                    </p>
                  </div>
                  <Tag color="blue" className="font-bold px-3 py-1 rounded-full">
                    {typeDemande === "DUPLICATE" ? "Duplicata RFID" : "Recherche Rapide"}
                  </Tag>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex flex-col md:flex-row gap-3">
                    <Input
                      size="large"
                      placeholder="Ex: CIN (AB123456) ou N° Carte RFID (RFID-9988)"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="rounded-xl"
                    />
                    <Button
                      type="primary"
                      size="large"
                      loading={isSearchingLookup}
                      onClick={handleLookupSubscriber}
                      icon={<SearchOutlined />}
                      className="rounded-xl bg-secondary px-8 font-bold"
                    >
                      Identifier Mon Compte
                    </Button>
                  </div>
                </div>

                {hasFoundAccount && (
                  <Form form={form} layout="vertical" className="space-y-4">
                    <AntCard className="rounded-2xl border-emerald-200 bg-emerald-50/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag color="green" className="font-bold">Abonné Validé</Tag>
                        <span className="font-bold text-slate-900 text-sm">Informations Récupérées</span>
                      </div>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="nom" label="Nom & Prénom">
                            <Input readOnly className="rounded-xl bg-white font-semibold" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="cin" label="CIN">
                            <Input readOnly className="rounded-xl bg-white font-semibold" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="telephone" label="Téléphone Mobile">
                            <Input readOnly className="rounded-xl bg-white font-semibold" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="immatriculation" label="Véhicule Immatriculation">
                            <Input readOnly className="rounded-xl bg-white font-semibold" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </AntCard>
                  </Form>
                )}

                <div className="mt-8 flex justify-between">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setCurrentStep(0)}
                    className="rounded-xl h-11 px-6 font-semibold"
                  >
                    Retour
                  </Button>

                  {typeDemande === "DUPLICATE" ? (
                    <Button
                      type="primary"
                      disabled={!hasFoundAccount}
                      onClick={handleNextToOtp}
                      className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-white rounded-xl h-11 px-8 font-bold shadow-md"
                    >
                      Valider & Recevoir Code OTP →
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      disabled={!hasFoundAccount}
                      onClick={() => setCurrentStep(2)}
                      className="bg-primary rounded-xl h-11 px-8 font-bold"
                    >
                      Étape Suivante (Parking & Durée) →
                    </Button>
                  )}
                </div>
              </div>
            ) : typeDemande === "CORPORATE" ? (
              /* FLOW 2: CORPORATE (ENTREPRISE & FLOTTE) */
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 m-0">
                      Souscription Corporate — Entreprise & Flotte
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Renseignez les informations de la société, le document officiel et les véhicules de la flotte.
                    </p>
                  </div>
                  <Tag color="gold" className="font-bold px-3 py-1 rounded-full">
                    Formulaire Flotte
                  </Tag>
                </div>

                <Form form={form} layout="vertical" className="space-y-4">
                  <Collapse defaultActiveKey={["societe", "vehicules_flotte", "docs_entreprise"]} className="bg-transparent border-none space-y-4">
                    {/* Panel 1: Société & Responsable */}
                    <Collapse.Panel
                      header={
                        <div className="flex items-center justify-between w-full pr-4 py-1">
                          <div className="flex items-center gap-3">
                            {isCorporateValid ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base shadow-sm">
                                <CheckOutlined />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                            )}
                            <span className={`text-base ${isCorporateValid ? "font-extrabold text-emerald-950" : "font-bold text-slate-900"}`}>
                              1. Informations Société & Responsable Flotte
                            </span>
                          </div>
                          {isCorporateValid ? (
                            <Tag color="green" className="font-extrabold border-none px-3.5 py-1 rounded-full text-xs shadow-2xs inline-flex items-center gap-1.5">
                              <CheckCircleOutlined /> Étape Validée & Confirmée
                            </Tag>
                          ) : (
                            <Tag color="gold" className="font-bold border-none px-2.5 py-0.5 rounded-full text-xs">
                              À Remplir
                            </Tag>
                          )}
                        </div>
                      }
                      key="societe"
                      className={`glass-panel rounded-2xl transition-all duration-300 overflow-hidden shadow-xs ${
                        isCorporateValid
                          ? "bg-emerald-50/90 border-2 border-emerald-500 shadow-emerald-100/50"
                          : "bg-white/80 border border-slate-200"
                      }`}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="raisonSociale"
                            label="Raison Sociale de l'Entreprise"
                            rules={[{ required: true, message: "La raison sociale est requise." }]}
                          >
                            <Input placeholder="ex: Maroc Telecom SA" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            name="ice"
                            label="Identifiant Commun (ICE)"
                            rules={[{ required: true, message: "L'ICE est requis." }]}
                          >
                            <Input placeholder="001234567000089" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            name="rc"
                            label="Registre de Commerce (RC)"
                            rules={[{ required: true, message: "Le RC est requis." }]}
                          >
                            <Input placeholder="12345" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="nomContact"
                            label="Nom & Prénom du Responsable Flotte"
                            rules={[{ required: true, message: "Le nom du responsable est requis." }]}
                          >
                            <Input placeholder="ex: Karim BENNANI" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="telephone"
                            label="Téléphone Professionnel"
                            rules={[{ required: true, message: "Le téléphone est requis." }]}
                          >
                            <Input placeholder="06 61 00 00 00" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="email"
                        label="Email Professionnel pour Facturation"
                        rules={[
                          { required: true, message: "L'email est requis." },
                          { type: "email", message: "Email invalide." },
                        ]}
                      >
                        <Input placeholder="flotte@entreprise.ma" className="rounded-xl py-2" />
                      </Form.Item>
                    </Collapse.Panel>

                    {/* Panel 2: Dynamic Fleet Vehicles count */}
                    <Collapse.Panel
                      header={
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                          <CarOutlined className="text-secondary text-lg" />
                          <span>2. Nombre de Cartes RFID & Liste des Véhicules de la Flotte</span>
                        </div>
                      }
                      key="vehicules_flotte"
                      className="glass-panel rounded-2xl border border-slate-200 bg-white/70 overflow-hidden shadow-xs"
                    >
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <label className="font-bold text-slate-900 text-sm block mb-1">
                            Combien de cartes RFID / abonnements souhaitez-vous ?
                          </label>
                        </div>
                        <InputNumber
                          min={1}
                          max={50}
                          value={nombreVehiculesCorporate}
                          onChange={(val) => setNombreVehiculesCorporate(val || 1)}
                          size="large"
                          className="rounded-xl font-bold w-36"
                          addonAfter="Cartes"
                        />
                      </div>

                      <div className="space-y-4">
                        {Array.from({ length: nombreVehiculesCorporate }).map((_, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <Tag color="gold" className="mb-2 font-bold">Véhicule #{idx + 1}</Tag>
                            <Row gutter={16}>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  name={["flotteVehicules", idx, "immatriculation"]}
                                  label={`Matricule Véhicule #${idx + 1}`}
                                  rules={[{ required: true, message: "Immatriculation requise." }]}
                                >
                                  <Input prefix={<CarOutlined />} placeholder="12345-A-1" className="rounded-xl py-2" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  name={["flotteVehicules", idx, "marque"]}
                                  label={`Marque & Modèle Véhicule #${idx + 1}`}
                                >
                                  <Input placeholder="ex: Dacia / Renault / Peugeot" className="rounded-xl py-2" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    </Collapse.Panel>

                    {/* Panel 3: Corporate Documents Upload (Required with Clean Custom Cadre State) */}
                    <Collapse.Panel
                      header={
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                          <FileImageOutlined className="text-amber-600 text-lg" />
                          <span>3. Document Entreprise (Attestation ICE / Registre de Commerce)</span>
                        </div>
                      }
                      key="docs_entreprise"
                      className="glass-panel rounded-2xl border border-slate-200 bg-white/70 overflow-hidden shadow-xs"
                    >
                      <ScanUploadField
                        name="photoDocEntreprise"
                        label="Attestation ICE ou Registre de Commerce (RC)"
                        tagText="Document Entreprise Officiel"
                        tagColor="gold"
                        icon={<BankOutlined />}
                        btnText="Scanner Document Entreprise"
                        isRequired={true}
                        form={form}
                      />
                    </Collapse.Panel>
                  </Collapse>
                </Form>

                <div className="mt-8 flex justify-between">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setCurrentStep(0)}
                    className="rounded-xl h-11 px-6 font-semibold"
                  >
                    Retour
                  </Button>
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={handleValidateCorporateAndNext}
                    className="bg-primary rounded-xl h-11 px-8 font-bold"
                  >
                    Étape Suivante (Choix Parking) →
                  </Button>
                </div>
              </div>
            ) : (
              /* FLOW 3: NOUVEL ABONNEMENT PARTICULIER (ESTHETIQUE SEQUENTIAL ACCORDION VALIDATION) */
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 m-0">
                      Informations du Souscripteur Particulier
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Remplissez et validez chaque section pour poursuivre votre souscription.
                    </p>
                  </div>
                  <Tag color="blue" className="font-bold px-3 py-1 rounded-full">
                    Compte Particulier
                  </Tag>
                </div>

                <Form form={form} layout="vertical" className="space-y-4">
                  <Collapse
                    activeKey={activeCollapseKeys}
                    onChange={(keys) => setActiveCollapseKeys(typeof keys === "string" ? [keys] : (keys as string[]))}
                    className="bg-transparent border-none space-y-4"
                  >
                    {/* Panel 1: Informations Personnelles & CIN */}
                    <Collapse.Panel
                      header={
                        <div className="flex items-center justify-between w-full pr-4 py-1">
                          <div className="flex items-center gap-3">
                            {isPersoValid ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base shadow-sm">
                                <CheckOutlined />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                            )}
                            <span className={`text-base ${isPersoValid ? "font-extrabold text-emerald-950" : "font-bold text-slate-900"}`}>
                              1. Informations Personnelles & Pièce d'Identité (CIN)
                            </span>
                          </div>
                          {isPersoValid ? (
                            <Tag color="green" className="font-extrabold border-none px-3.5 py-1 rounded-full text-xs shadow-2xs inline-flex items-center gap-1.5">
                              <CheckCircleOutlined /> Étape Validée & Confirmée
                            </Tag>
                          ) : (
                            <Tag color="blue" className="font-bold border-none px-2.5 py-0.5 rounded-full text-xs">
                              En Cours de Saisie
                            </Tag>
                          )}
                        </div>
                      }
                      key="perso_particulier"
                      className={`glass-panel rounded-2xl transition-all duration-300 overflow-hidden shadow-xs ${
                        isPersoValid
                          ? "bg-emerald-50/90 border-2 border-emerald-500 shadow-emerald-100/50"
                          : "bg-white/80 border border-slate-200"
                      }`}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="nom"
                            label="Nom de famille"
                            rules={[{ required: true, message: "Le nom est requis." }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="BENNANI" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="prenom"
                            label="Prénom"
                            rules={[{ required: true, message: "Le prénom est requis." }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="Karim" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="cin"
                            label="Carte d'Identité Nationale (CIN)"
                            rules={[{ required: true, message: "La CIN est requise." }]}
                          >
                            <Input prefix={<IdcardOutlined />} placeholder="AB123456" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="telephone"
                            label="Numéro de Téléphone Mobile"
                            rules={[{ required: true, message: "Le téléphone est requis." }]}
                          >
                            <Input placeholder="0661234567" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="email"
                        label="Adresse Email de confirmation"
                        rules={[
                          { required: true, message: "L'email est requis." },
                          { type: "email", message: "Email invalide." },
                        ]}
                      >
                        <Input placeholder="contact@example.ma" className="rounded-xl py-2" />
                      </Form.Item>

                      {/* Photo CIN Upload Fields (Required Scan Cadres Recto & Verso) */}
                      <div className="mt-4 border-t border-slate-200/80 pt-4">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <IdcardOutlined className="text-secondary" /> Scan & Téléversement Carte CIN (Obligatoire *)
                        </h4>
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <ScanUploadField
                              name="photoCinRecto"
                              label="Photo CIN — Recto"
                              tagText="Face Recto"
                              tagColor="cyan"
                              icon={<IdcardOutlined />}
                              btnText="Scanner CIN Recto"
                              isRequired={true}
                              form={form}
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <ScanUploadField
                              name="photoCinVerso"
                              label="Photo CIN — Verso"
                              tagText="Face Verso"
                              tagColor="cyan"
                              icon={<IdcardOutlined />}
                              btnText="Scanner CIN Verso"
                              isRequired={true}
                              form={form}
                            />
                          </Col>
                        </Row>
                      </div>

                      {/* Validation Action for Section 1 */}
                      <div className="mt-6 flex justify-end">
                        <Button
                          type="primary"
                          onClick={handleValidatePerso}
                          className="bg-secondary hover:bg-secondary-dark rounded-xl font-bold h-10 px-6 shadow-sm"
                        >
                          Valider Section 1 & Passer au Véhicule ↓
                        </Button>
                      </div>
                    </Collapse.Panel>

                    {/* Panel 2: Informations du Véhicule & Carte Grise */}
                    <Collapse.Panel
                      header={
                        <div className="flex items-center justify-between w-full pr-4 py-1">
                          <div className="flex items-center gap-3">
                            {isVehiculeValid ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base shadow-sm">
                                <CheckOutlined />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                            )}
                            <span className={`text-base ${isVehiculeValid ? "font-extrabold text-emerald-950" : "font-bold text-slate-900"}`}>
                              2. Informations du Véhicule & Carte Grise (Recto / Verso)
                            </span>
                          </div>
                          {isVehiculeValid ? (
                            <Tag color="green" className="font-extrabold border-none px-3.5 py-1 rounded-full text-xs shadow-2xs inline-flex items-center gap-1.5">
                              <CheckCircleOutlined /> Étape Validée & Confirmée
                            </Tag>
                          ) : (
                            <Tag color="blue" className="font-bold border-none px-2.5 py-0.5 rounded-full text-xs">
                              À Remplir
                            </Tag>
                          )}
                        </div>
                      }
                      key="vehicule_particulier"
                      className={`glass-panel rounded-2xl transition-all duration-300 overflow-hidden shadow-xs ${
                        isVehiculeValid
                          ? "bg-emerald-50/90 border-2 border-emerald-500 shadow-emerald-100/50"
                          : "bg-white/80 border border-slate-200"
                      }`}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="immatriculation"
                            label="Matricule du Véhicule"
                            rules={[{ required: true, message: "L'immatriculation est requise." }]}
                          >
                            <Input prefix={<CarOutlined />} placeholder="12345-A-1" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="marque" label="Marque & Modèle (Optionnel)">
                            <Input placeholder="ex: Dacia Logan / Golf 8" className="rounded-xl py-2" />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Photo Carte Grise Upload Fields (Required Scan Cadres Recto & Verso) */}
                      <div className="mt-4 border-t border-slate-200/80 pt-4">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <FileImageOutlined className="text-emerald-600" /> Scan & Téléversement Carte Grise (Obligatoire *)
                        </h4>
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <ScanUploadField
                              name="photoCarteGriseRecto"
                              label="Carte Grise — Recto"
                              tagText="Face Recto"
                              tagColor="green"
                              icon={<FileImageOutlined />}
                              btnText="Scanner Carte Grise Recto"
                              isRequired={true}
                              form={form}
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <ScanUploadField
                              name="photoCarteGriseVerso"
                              label="Carte Grise — Verso"
                              tagText="Face Verso"
                              tagColor="green"
                              icon={<FileImageOutlined />}
                              btnText="Scanner Carte Grise Verso"
                              isRequired={true}
                              form={form}
                            />
                          </Col>
                        </Row>
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </Form>

                <div className="mt-8 flex justify-between">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setCurrentStep(0)}
                    className="rounded-xl h-11 px-6 font-semibold"
                  >
                    Retour
                  </Button>
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={handleValidateVehiculeAndNext}
                    className="bg-primary rounded-xl h-11 px-8 font-bold shadow-md"
                  >
                    Valider & Passer à la Tarification →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Parking, Formula & Duration */}
        {currentStep === 2 && (
          <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-xl bg-white/80">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">
              Choix du Parking & Tarification Souhaitée
            </h2>

            <Form form={form} layout="vertical" className="space-y-4">
              <Form.Item
                name="parkingId"
                label="Sélectionnez le Parking Souhaité à Rabat"
                rules={[{ required: true, message: "Veuillez choisir un parking." }]}
              >
                <Select placeholder="Choisir un ouvrage..." size="large" className="rounded-xl">
                  {parkings.map((p: any) => (
                    <Option key={p.id} value={p.id}>
                      {p.nom} — {p.placesLibresAbst ?? p.placesTotal} places libres disponibles
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="formuleCode"
                label="Sélectionnez la Formule Tarifaire"
                rules={[{ required: true, message: "Veuillez sélectionner une formule." }]}
              >
                <Select placeholder="Choisir une formule..." size="large" className="rounded-xl">
                  <Option value="24H7J">Pass Permanent 24h / 7j — 600 DH / mois</Option>
                  <Option value="JOUR">Pass Diurne (08:00 - 20:00) — 420 DH / mois</Option>
                  <Option value="NUIT">Pass Nocturne (19:00 - 08:00) — 350 DH / mois</Option>
                  <Option value="MOTO">Tarif Spécial Deux-roues — 200 DH / mois</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dureeMois"
                label="Durée de Souscription Souhaitée (Mois)"
                initialValue={3}
                rules={[{ required: true, message: "Choisissez la durée." }]}
              >
                <Select size="large" className="rounded-xl">
                  <Option value={3}>3 Mois</Option>
                  <Option value={6}>6 Mois</Option>
                  <Option value={9}>9 Mois</Option>
                  <Option value={12}>12 Mois (1 An)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="modePaiement"
                label="Mode de Règlement Homologué"
                initialValue="ESPECES"
                rules={[{ required: true }]}
              >
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="ESPECES">Espèces (Au guichet RRM)</Radio.Button>
                  <Radio.Button value="CHEQUE">Chèque Bancaire (Au guichet RRM)</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Form>

            <div className="mt-8 flex justify-between">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setCurrentStep(1)}
                className="rounded-xl h-11 px-6 font-semibold"
              >
                Retour
              </Button>
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={handleValidateParkingAndGoToRecap}
                className="bg-primary rounded-xl h-11 px-8 font-bold shadow-md"
              >
                Valider & Passer au Récapitulatif →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Final Step - Récapitulatif, CGU & Confirmation OTP */}
        {currentStep === 3 && (
          <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-xl bg-white/90">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 m-0">
                  Récapitulatif Final & Validation par SMS OTP
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Vérifiez le détail de votre souscription avant d'effectuer la validation sécurisée.
                </p>
              </div>
              <Tag color="cyan" className="font-bold px-3 py-1 rounded-full">
                Étape Finale 4 / 4
              </Tag>
            </div>

            <Form form={form} layout="vertical">
              {/* Dynamic Live Subscription Summary Card */}
              <div className="glass-panel rounded-2xl p-6 border border-secondary/30 bg-gradient-to-br from-secondary/5 via-white to-secondary/10 mb-6 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <SafetyCertificateOutlined className="text-secondary text-xl" />
                    <h3 className="text-base md:text-lg font-extrabold text-slate-900 m-0">Récapitulatif de votre Souscription</h3>
                  </div>
                  <Tag color="blue" className="font-bold border-none px-3 py-1 rounded-full">Dossier RRM</Tag>
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={12} md={6}>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Souscripteur</span>
                    <span className="text-sm font-bold text-slate-900">
                      {form.getFieldValue("nom") ? `${form.getFieldValue("nom")} ${form.getFieldValue("prenom") || ""}` : form.getFieldValue("raisonSociale") || "Particulier"}
                    </span>
                  </Col>
                  <Col xs={12} md={6}>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Identifiant (CIN/ICE)</span>
                    <span className="text-sm font-bold text-slate-900">{form.getFieldValue("cin") || form.getFieldValue("ice") || "AB123456"}</span>
                  </Col>
                  <Col xs={12} md={6}>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Immatriculation</span>
                    <span className="text-sm font-bold text-secondary font-mono">{form.getFieldValue("immatriculation") || "12345-A-1"}</span>
                  </Col>
                  <Col xs={12} md={6}>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Parking Sélectionné</span>
                    <span className="text-sm font-bold text-slate-900">{selectedParkingName}</span>
                  </Col>
                </Row>

                <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block font-semibold">Formule Tarifaire & Durée :</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {watchedFormuleCode === "24H7J" ? "Pass Permanent 24h/7j (600 DH/mois)" : watchedFormuleCode === "JOUR" ? "Pass Diurne 08h-20h (420 DH/mois)" : watchedFormuleCode === "NUIT" ? "Pass Nocturne 19h-08h (350 DH/mois)" : "Tarif Deux-roues (200 DH/mois)"} — {totalMonths} Mois
                    </span>
                  </div>
                  <div className="bg-secondary/10 px-4 py-2 rounded-xl text-right">
                    <span className="text-xs text-slate-500 block font-semibold">Montant Total Estimé</span>
                    <span className="text-lg font-black text-secondary">
                      {totalPrice.toLocaleString()} DH TTC
                    </span>
                  </div>
                </div>
              </div>

              {/* Mandatory Terms & Conditions Checkbox */}
              <Form.Item
                name="acceptTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject("Vous devez accepter les conditions générales d'utilisation pour soumettre votre demande."),
                  },
                ]}
                className="mt-6 mb-4"
              >
                <Checkbox className="text-xs text-slate-700 font-semibold">
                  J'ai lu et j'accepte les{" "}
                  <a href="#terms" onClick={(e) => e.preventDefault()} className="text-secondary underline font-bold">
                    conditions générales d'utilisation (CGU)
                  </a>{" "}
                  des parkings sous la gestion de Rabat Région Mobilité (RRM) ainsi que la politique de traitement des données personnelles (Loi 09-08).
                </Checkbox>
              </Form.Item>
            </Form>

            <div className="mt-8 flex justify-between">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setCurrentStep(2)}
                className="rounded-xl h-11 px-6 font-semibold"
              >
                Retour
              </Button>
              <Button
                type="primary"
                onClick={handleNextToOtp}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white rounded-xl h-12 px-8 font-extrabold shadow-md"
              >
                Confirmer Ma Demande & Recevoir Code OTP par SMS →
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* OTP Verification Modal with In-Popup Loading & Confirmation Transitions */}
      <OtpVerificationModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccessSubmit={async () => {
          const res = await submitMutation.mutateAsync(pendingValues);
          setSubmittedResult(res);
          return res;
        }}
        phone={pendingValues?.telephone || "0661234567"}
        referenceNumber={submittedResult?.reference}
      />

      <PublicFooter />
    </div>
  );
}