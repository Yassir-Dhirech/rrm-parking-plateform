import { useState } from "react";
import { Modal, Form, Input, Button, Rate, Select, Radio, message, Alert } from "antd";
import {
  CommentOutlined,
  SendOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getPublicParkings } from "../../api/parkings";

interface PublicFeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function PublicFeedbackModal({ open, onClose }: PublicFeedbackModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load parkings list for optional parking attribution
  const { data: parkings = [] } = useQuery({
    queryKey: ["public_parkings"],
    queryFn: getPublicParkings,
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      // Simulate API submission delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Log feedback locally
      console.log("Nouveau feedback usager enregistré :", values);

      message.success("Merci beaucoup pour votre avis ! Vos retours nous aident à améliorer nos services.");
      form.resetFields();
      setIsSubmitting(false);
      onClose();
    } catch {
      message.error("Veuillez renseigner les champs obligatoires avant d'envoyer.");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      destroyOnClose
      className="rounded-3xl overflow-hidden"
      title={
        <div className="flex items-center gap-2.5 text-slate-900 pr-6">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-base">
            <CommentOutlined />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 m-0">
              Donnez votre Avis & Retours
            </h3>
            <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
              Rabat Région Mobilité à votre écoute
            </p>
          </div>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="rounded-xl text-xs"
          message="Votre expérience compte pour nous"
          description="Partagez vos suggestions, signalez un problème rencontré ou faites-nous part de vos impressions sur les parkings et le portail RRM."
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            typeAvis: "SUGGESTION",
            noteSatisfaction: 5,
          }}
        >
          {/* Nature du retour */}
          <Form.Item
            name="typeAvis"
            label="Objet de votre retour"
            rules={[{ required: true, message: "Veuillez choisir l'objet." }]}
          >
            <Radio.Group className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Radio value="SUGGESTION" className="border border-slate-200 rounded-xl p-2.5 bg-white hover:border-secondary flex items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5"><BulbOutlined className="text-amber-500" /> Suggestion</span>
                </Radio>
                <Radio value="SATISFACTION" className="border border-slate-200 rounded-xl p-2.5 bg-white hover:border-secondary flex items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircleOutlined className="text-emerald-500" /> Compliment</span>
                </Radio>
                <Radio value="RECLAMATION" className="border border-slate-200 rounded-xl p-2.5 bg-white hover:border-secondary flex items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5"><InfoCircleOutlined className="text-rose-500" /> Dysfonctionnement</span>
                </Radio>
                <Radio value="AUTRE" className="border border-slate-200 rounded-xl p-2.5 bg-white hover:border-secondary flex items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5"><MessageOutlined className="text-blue-500" /> Autre Remarque</span>
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          {/* Évaluation par étoiles */}
          <Form.Item
            name="noteSatisfaction"
            label="Évaluation globale de votre satisfaction"
            rules={[{ required: true, message: "Veuillez sélectionner une note." }]}
          >
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Rate className="text-amber-400 text-xl" />
              <span className="text-xs text-slate-500 font-semibold">Note sur 5</span>
            </div>
          </Form.Item>

          {/* Parking concerné (Optionnel) */}
          <Form.Item
            name="parkingId"
            label="Parking concerné (Optionnel)"
          >
            <Select
              allowClear
              placeholder="Sélectionnez un parking si applicable"
              className="rounded-xl"
              suffixIcon={<EnvironmentOutlined className="text-slate-400" />}
            >
              {parkings.map((p: any) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.nom}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Message détaillé */}
          <Form.Item
            name="message"
            label="Votre Message ou Commentaire"
            rules={[
              { required: true, message: "Veuillez saisir votre message." },
              { min: 10, message: "Votre message doit comporter au moins 10 caractères." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Décrivez votre expérience, votre remarque ou votre proposition d'amélioration..."
              className="rounded-xl font-normal"
            />
          </Form.Item>

          {/* Coordonnées optionnelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Form.Item name="nomContact" label="Votre Nom (Optionnel)">
              <Input
                placeholder="Ex: Mohamed Alami"
                className="rounded-xl py-2"
                prefix={<UserOutlined className="text-slate-400" />}
              />
            </Form.Item>

            <Form.Item
              name="contactInfo"
              label="Email ou Téléphone (Optionnel)"
            >
              <Input
                placeholder="Pour être recontacté si nécessaire"
                className="rounded-xl py-2"
                prefix={<MailOutlined className="text-slate-400" />}
              />
            </Form.Item>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
            <Button onClick={onClose} className="rounded-xl font-semibold px-4">
              Annuler
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={isSubmitting}
              onClick={handleSubmit}
              className="bg-secondary hover:bg-slate-900 border-secondary rounded-xl font-extrabold px-6 shadow-sm flex items-center gap-1.5"
            >
              Envoyer mon Avis
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
