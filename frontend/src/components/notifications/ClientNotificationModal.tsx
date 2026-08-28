import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Radio, Alert, Button, Tag, Space } from "antd";
import {
  MailOutlined,
  MobileOutlined,
  SendOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { sendClientNotificationMock } from "../../api/clientNotificationsMock";

interface Props {
  open: boolean;
  onClose: () => void;
  typeEvenement: "CARTE_PRETE" | "CHEQUE_REFUSE" | "ABONNEMENT_EXPIRATION" | "SUSPENSION" | "PAIEMENT_CONFIRME";
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  referenceDoc?: string;
}

const TEMPLATES: Record<string, { sujet: string; contenu: string }> = {
  CARTE_PRETE: {
    sujet: "RRM - Votre Carte RFID est prête au guichet",
    contenu: "Bonjour {nom}, votre carte d'accès RFID est préparée, testée et disponible au guichet RRM. Veuillez vous munir de votre reçu de paiement pour la récupérer.",
  },
  CHEQUE_REFUSE: {
    sujet: "RRM - Information urgente : Chèque non conforme",
    contenu: "Bonjour {nom}, votre règlement par chèque nécessite une régularisation au guichet RRM. Merci de contacter le guichet dans les plus brefs délais.",
  },
  ABONNEMENT_EXPIRATION: {
    sujet: "RRM - Rappel d'expiration de votre abonnement",
    contenu: "Bonjour {nom}, votre abonnement de stationnement arrive bientôt à échéance. Connectez-vous ou passez au guichet pour effectuer le renouvellement.",
  },
  SUSPENSION: {
    sujet: "RRM - Notification de suspension administrative",
    contenu: "Bonjour {nom}, votre abonnement et badge RFID ont été temporairement suspendus. Veuillez contacter le service client RRM pour régularisation.",
  },
  PAIEMENT_CONFIRME: {
    sujet: "RRM - Confirmation de réception de paiement",
    contenu: "Bonjour {nom}, nous vous confirmons la réception et le quittancement de votre paiement. Votre reçu est disponible.",
  },
};

export const ClientNotificationModal: React.FC<Props> = ({
  open,
  onClose,
  typeEvenement,
  clientNom,
  clientEmail,
  clientTelephone,
  referenceDoc,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const template = TEMPLATES[typeEvenement] || TEMPLATES.CARTE_PRETE;
      const parsedSujet = template.sujet.replace("{nom}", clientNom);
      const parsedContenu = template.contenu.replace("{nom}", clientNom) + (referenceDoc ? ` (Ref: ${referenceDoc})` : "");

      form.setFieldsValue({
        channel: "BOTH",
        sujet: parsedSujet,
        contenu: parsedContenu,
      });
    }
  }, [open, typeEvenement, clientNom, referenceDoc, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await sendClientNotificationMock({
        channel: values.channel,
        typeEvenement,
        destinataireNom: clientNom,
        destinataireEmail: clientEmail,
        destinataireTelephone: clientTelephone,
        sujet: values.sujet,
        contenu: values.contenu,
      });
      setLoading(false);
      onClose();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-primary font-bold text-base">
          <NotificationOutlined className="text-amber-500 text-lg" />
          <span>Notification Client en Temps Réel (SMS / Email)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={560}
    >
      <Alert
        message="Transmission Automatisée d'Alerte Client"
        description="Le système transmet immédiatement un message SMS et/ou Email au souscripteur pour l'informer des étapes critiques de son dossier."
        type="info"
        showIcon
        className="mb-4 rounded-xl text-xs"
      />

      <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 text-xs flex justify-between items-center">
        <div>
          <span className="text-slate-500 font-semibold block">Destinataire :</span>
          <strong className="text-slate-900 font-bold">{clientNom}</strong>
        </div>
        <div className="flex gap-2">
          {clientTelephone && (
            <Tag color="blue" className="m-0 font-semibold">
              <MobileOutlined className="mr-1" />
              {clientTelephone}
            </Tag>
          )}
          {clientEmail && (
            <Tag color="purple" className="m-0 font-semibold">
              <MailOutlined className="mr-1" />
              {clientEmail}
            </Tag>
          )}
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="channel"
          label="Canal de Transmission"
          rules={[{ required: true }]}
        >
          <Radio.Group buttonStyle="solid" className="w-full">
            <Radio.Button value="BOTH" className="w-1/3 text-center">
              <Space>
                <MobileOutlined />
                <MailOutlined />
                SMS & Email
              </Space>
            </Radio.Button>
            <Radio.Button value="SMS" className="w-1/3 text-center">
              <Space>
                <MobileOutlined />
                SMS Seul
              </Space>
            </Radio.Button>
            <Radio.Button value="EMAIL" className="w-1/3 text-center">
              <Space>
                <MailOutlined />
                Email Seul
              </Space>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="sujet"
          label="Objet / Sujet du Message"
          rules={[{ required: true, message: "Sujet obligatoire" }]}
        >
          <Input className="rounded-xl font-semibold text-slate-900" />
        </Form.Item>

        <Form.Item
          name="contenu"
          label="Message personnalisé à envoyer au client"
          rules={[{ required: true, message: "Contenu obligatoire" }]}
        >
          <Input.TextArea rows={4} className="rounded-xl font-sans" />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} className="rounded-xl font-semibold">
            Annuler
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SendOutlined />}
            className="bg-primary rounded-xl font-bold px-6 shadow-md"
          >
            Envoyer Notification Client →
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
