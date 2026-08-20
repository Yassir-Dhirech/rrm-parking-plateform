import React, { useState, useEffect, useRef } from "react";
import { Modal, Radio, Button, Typography, Alert, message, Input, Tag } from "antd";
import {
  SafetyCertificateOutlined,
  MobileOutlined,
  MailOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { sendOtpMock, verifyOtpMock } from "../../api/otpMock";

const { Text, Paragraph } = Typography;

interface OtpVerificationModalProps {
  open: boolean;
  phone?: string;
  email?: string;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export function OtpVerificationModal({
  open,
  phone = "0612345678",
  email = "client@example.ma",
  onClose,
  onSuccess,
  title = "Vérification de Sécurité par Code OTP",
  subtitle = "Veuillez certifier votre identité pour finaliser votre souscription.",
}: OtpVerificationModalProps) {
  const [channel, setChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const currentRecipient = channel === "SMS" ? phone : email;

  // Initialize or reset when modal opens
  useEffect(() => {
    if (open) {
      setOtpDigits(["", "", "", "", "", ""]);
      setCountdown(60);
      handleSendOtp();
    }
  }, [open, channel]);

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (open && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [open, countdown]);

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

  const handleVerify = async () => {
    const fullCode = otpDigits.join("");
    if (fullCode.length < 6) {
      message.warning("Veuillez saisir le code OTP complet à 6 chiffres.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyOtpMock({ recipient: currentRecipient, code: fullCode });
      if (res.success) {
        message.success("Code OTP vérifié avec succès !");
        onSuccess();
      } else {
        message.error(res.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const maskRecipient = (val: string, type: "SMS" | "EMAIL") => {
    if (type === "SMS") {
      return val.replace(/(\d{2})\d{4}(\d{2})/, "$1 **** $2");
    }
    const [name, domain] = val.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
      centered
    >
      <div style={{ textAlign: "center", padding: "12px 8px 8px" }}>
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

        {/* Sélection du Canal SMS / Email */}
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

        {/* 6 Input Digit Boxes */}
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
                borderRadius: 8,
                borderColor: digit ? "#0284c7" : "#cbd5e1",
                boxShadow: digit ? "0 0 0 2px rgba(2, 132, 199, 0.2)" : "none",
              }}
            />
          ))}
        </div>

        {/* Hint for Demo Testing */}
        <div style={{ marginBottom: 20 }}>
          <Tag color="geekblue" style={{ padding: "4px 12px", fontSize: 12 }}>
            <BulbOutlined style={{ marginRight: 4 }} /> Code OTP de test / démo : <strong>123456</strong>
          </Tag>
        </div>

        {/* Actions & Resend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            type="primary"
            size="large"
            block
            loading={isVerifying}
            icon={<CheckCircleOutlined />}
            onClick={handleVerify}
            style={{ backgroundColor: "#0284c7", borderColor: "#0284c7", height: 44, borderRadius: 8 }}
          >
            Valider le Code OTP
          </Button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
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
      </div>
    </Modal>
  );
}
