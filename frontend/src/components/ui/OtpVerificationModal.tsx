import React, { useState, useEffect, useRef } from "react";
import { Modal, Radio, Button, Typography, Alert, message, Input, Tag, Spin } from "antd";
import {
  SafetyCertificateOutlined,
  MobileOutlined,
  MailOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  CopyOutlined,
  SearchOutlined,
  HomeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { sendOtpMock, verifyOtpMock } from "../../api/otpMock";

const { Text, Paragraph } = Typography;

interface OtpVerificationModalProps {
  open: boolean;
  phone?: string;
  email?: string;
  onClose: () => void;
  onSuccessSubmit: () => Promise<any> | void;
  title?: string;
  subtitle?: string;
  referenceNumber?: string;
}

type ModalPhase = "INPUT_OTP" | "LOADING" | "CONFIRMED";

export function OtpVerificationModal({
  open,
  phone = "0661234567",
  email = "client@example.ma",
  onClose,
  onSuccessSubmit,
  title = "Vérification de Sécurité par Code OTP",
  subtitle = "Veuillez certifier votre identité pour finaliser votre souscription.",
  referenceNumber,
}: OtpVerificationModalProps) {
  const navigate = useNavigate();

  // Internal Phase State
  const [phase, setPhase] = useState<ModalPhase>("INPUT_OTP");
  const [channel, setChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [generatedRef, setGeneratedRef] = useState<string>("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const currentRecipient = channel === "SMS" ? phone : email;

  // Initialize or reset when modal opens
  useEffect(() => {
    if (open) {
      setPhase("INPUT_OTP");
      setOtpDigits(["", "", "", "", "", ""]);
      setCountdown(60);
      handleSendOtp();
    }
  }, [open]);

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (open && phase === "INPUT_OTP" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [open, phase, countdown]);

  const handleSendOtp = async () => {
    setIsSending(true);
    try {
      const res = await sendOtpMock({ recipient: currentRecipient, channel });
      if (res.success) {
        message.info(res.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setOtpDigits(["", "", "", "", "", ""]);
    handleSendOtp();
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      setOtpDigits(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyAndSubmit = async () => {
    const fullCode = otpDigits.join("");
    if (fullCode.length < 6) {
      message.warning("Veuillez saisir le code OTP complet à 6 chiffres.");
      return;
    }

    // 1. Switch to LOADING phase in the same popup
    setPhase("LOADING");

    try {
      // Verify OTP mock
      const res = await verifyOtpMock({ recipient: currentRecipient, code: fullCode });
      if (!res.success) {
        message.error(res.message);
        setPhase("INPUT_OTP");
        return;
      }

      // Execute parent submission callback
      const submitRes = await onSuccessSubmit();
      const ref = submitRes?.reference || referenceNumber || `RRM-DEM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedRef(ref);

      // Simulate a brief loading transition for smooth UX
      setTimeout(() => {
        setPhase("CONFIRMED");
      }, 1000);
    } catch {
      message.error("Erreur lors de la validation. Veuillez réespayer.");
      setPhase("INPUT_OTP");
    }
  };

  const maskRecipient = (val: string, type: "SMS" | "EMAIL") => {
    if (type === "SMS") {
      return val.replace(/(\d{2})\d{4}(\d{2})/, "$1 **** $2");
    }
    const [name, domain] = val.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const handleCopyRef = () => {
    const refText = generatedRef || referenceNumber || "RRM-DEM-2026-9988";
    navigator.clipboard.writeText(refText);
    message.success("Numéro de référence copié dans le presse-papier !");
  };

  const handleTrackDemande = () => {
    const refText = generatedRef || referenceNumber || "RRM-DEM-2026-9988";
    message.info(`Votre dossier (${refText}) est enregistré et en cours de traitement par RRM.`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
      centered
      className="rounded-3xl overflow-hidden"
    >
      <div style={{ textAlign: "center", padding: "16px 8px" }}>
        {/* PHASE 1: INPUT OTP DIGITS */}
        {phase === "INPUT_OTP" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#f0f9ff",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 26,
                border: "1px solid #bae6fd",
              }}
            >
              <SafetyCertificateOutlined />
            </div>

            <Text strong style={{ fontSize: 18, color: "#0f172a", display: "block" }}>
              {title}
            </Text>
            <Paragraph style={{ color: "#64748b", fontSize: 13, marginTop: 4, marginBottom: 16 }}>
              {subtitle}
            </Paragraph>

            {/* Channel selection */}
            <div style={{ marginBottom: 16 }}>
              <Radio.Group
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="SMS">
                  <MobileOutlined style={{ marginRight: 6 }} />
                  SMS Mobile
                </Radio.Button>
                <Radio.Button value="EMAIL">
                  <MailOutlined style={{ marginRight: 6 }} />
                  Email Contact
                </Radio.Button>
              </Radio.Group>
            </div>

            <Alert
              type="info"
              showIcon={false}
              style={{ marginBottom: 20, backgroundColor: "#f8fafc", borderColor: "#cbd5e1" }}
              message={
                <div style={{ fontSize: 13, color: "#334155" }}>
                  Code envoyé à : <strong>{maskRecipient(currentRecipient, channel)}</strong>
                </div>
              }
            />

            {/* 6 Digit Input Boxes */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              {otpDigits.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el?.input || null;
                  }}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  maxLength={1}
                  style={{
                    width: 46,
                    height: 54,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#003566",
                    borderRadius: 10,
                    borderColor: digit ? "#0284c7" : "#cbd5e1",
                    boxShadow: digit ? "0 0 0 2px rgba(2, 132, 199, 0.2)" : "none",
                  }}
                />
              ))}
            </div>

            {/* Hint for Demo Testing */}
            <div style={{ marginBottom: 20 }}>
              <Tag color="geekblue" style={{ padding: "4px 12px", fontSize: 12 }}>
                <BulbOutlined style={{ marginRight: 4 }} /> Code OTP test : <strong>123456</strong>
              </Tag>
            </div>

            {/* Submit Action */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined />}
                onClick={handleVerifyAndSubmit}
                style={{ backgroundColor: "#0284c7", borderColor: "#0284c7", height: 44, borderRadius: 12, fontWeight: 700 }}
              >
                Valider le Code OTP & Submettre
              </Button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                <Button type="link" size="small" onClick={onClose} style={{ color: "#64748b" }}>
                  Annuler
                </Button>

                {countdown > 0 ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ré-envoi disponible dans <strong>{countdown}s</strong>
                  </Text>
                ) : (
                  <Button
                    type="link"
                    size="small"
                    icon={<ReloadOutlined />}
                    loading={isSending}
                    onClick={handleResend}
                    style={{ color: "#0284c7", fontWeight: 600 }}
                  >
                    Ré-envoyer le code
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* PHASE 2: LOADING IN THE SAME POPUP */}
        {phase === "LOADING" && (
          <div style={{ padding: "32px 16px" }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 44, color: "#0284c7" }} spin />} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 24, marginBottom: 8 }}>
              Vérification OTP & Création du Dossier...
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Veuillez patienter pendant la confirmation sécurisée de votre souscription auprès de RRM.
            </p>
          </div>
        )}

        {/* PHASE 3: CONFIRMED IN THE EXACT SAME POPUP WITH 3 BUTTONS */}
        {phase === "CONFIRMED" && (
          <div>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 32,
              }}
            >
              <CheckCircleOutlined />
            </div>

            <Tag color="green" style={{ fontWeight: 800, padding: "4px 14px", borderRadius: 20, marginBottom: 12 }}>
              Demande Validée avec Succès
            </Tag>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
              Souscription Confirmée !
            </h2>

            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              Votre dossier a bien été soumis aux services de Rabat Région Mobilité (RRM).
            </p>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "16px",
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Numéro de Référence du Dossier
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#006398", fontFamily: "monospace" }}>
                {generatedRef || referenceNumber || "RRM-DEM-2026-9988"}
              </span>
            </div>

            {/* 3 Action Buttons in the Same Popup */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Button 1: Copier la référence */}
              <Button
                type="primary"
                size="large"
                icon={<CopyOutlined />}
                onClick={handleCopyRef}
                style={{
                  backgroundColor: "#006398",
                  borderColor: "#006398",
                  fontWeight: 700,
                  borderRadius: 12,
                  height: 44,
                }}
              >
                Copier la Référence
              </Button>

              {/* Button 2: Suivre ma demande */}
              <Button
                size="large"
                icon={<SearchOutlined />}
                onClick={handleTrackDemande}
                style={{
                  fontWeight: 700,
                  borderRadius: 12,
                  height: 44,
                  borderColor: "#cbd5e1",
                  color: "#334155",
                }}
              >
                Suivre Ma Demande
              </Button>

              {/* Button 3: Retourner à l'accueil */}
              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                style={{
                  fontWeight: 700,
                  borderRadius: 12,
                  height: 44,
                  borderColor: "#cbd5e1",
                  color: "#334155",
                }}
              >
                Retourner à l'Accueil
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
