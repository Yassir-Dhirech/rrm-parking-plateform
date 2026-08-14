import { useState } from "react";
import { Modal, Tabs, Form, Input, Button, message, Descriptions, Tag, Divider } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined, KeyOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { roleConfig } from "../../lib/roleConfig";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { role, userName } = useAuth();
  const [activeTab, setActiveTab] = useState("1");
  const [phone, setPhone] = useState("0661234567"); // Mock default phone number
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);
  
  const [passwordForm] = Form.useForm();
  const [savingPassword, setSavingPassword] = useState(false);

  const roleTitle = role ? roleConfig[role].title : "Utilisateur";

  const handleSavePhone = () => {
    if (!tempPhone.trim()) {
      message.error("Veuillez saisir un numéro de téléphone valide");
      return;
    }
    setPhone(tempPhone);
    setIsEditingPhone(false);
    message.success("Numéro de téléphone mis à jour avec succès");
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Le nouveau mot de passe et la confirmation ne correspondent pas");
      return;
    }
    setSavingPassword(true);
    // Simulate API call
    setTimeout(() => {
      setSavingPassword(false);
      message.success("Mot de passe modifié avec succès !");
      passwordForm.resetFields();
    }, 600);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "var(--color-primary, #003366)" }} />
          <span>Gestion du Compte Utilisateur</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Fermer
        </Button>,
      ]}
      width={560}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: (
              <span>
                <UserOutlined /> Mon Profil & Infos
              </span>
            ),
            children: (
              <div style={{ paddingTop: 12 }}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Nom & Prénom">
                    <strong>{userName ?? "Utilisateur"}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rôle Actif">
                    <Tag color="blue" style={{ fontWeight: 600 }}>
                      {roleTitle} ({role})
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Adresse Email">
                    {userName ? `${userName.toLowerCase().replace(/\s+/g, ".")}@rrm-parking.ma` : "utilisateur@rrm-parking.ma"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone (Modifiable)">
                    {isEditingPhone ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Input
                          prefix={<PhoneOutlined />}
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          style={{ width: 180 }}
                        />
                        <Button type="primary" size="small" onClick={handleSavePhone}>
                          Enregistrer
                        </Button>
                        <Button size="small" onClick={() => setIsEditingPhone(false)}>
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{phone}</span>
                        <Button type="link" size="small" icon={<PhoneOutlined />} onClick={() => { setTempPhone(phone); setIsEditingPhone(true); }}>
                          Modifier
                        </Button>
                      </div>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
          },
          {
            key: "2",
            label: (
              <span>
                <LockOutlined /> Changer Mot de Passe
              </span>
            ),
            children: (
              <div style={{ paddingTop: 12 }}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  Sécurisez votre compte en mettant à jour votre mot de passe régulièrement.
                </p>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Mot de passe actuel"
                    rules={[{ required: true, message: "Veuillez saisir votre mot de passe actuel" }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="Nouveau mot de passe"
                    rules={[
                      { required: true, message: "Veuillez saisir le nouveau mot de passe" },
                      { min: 6, message: "Le mot de passe doit contenir au moins 6 caractères" },
                    ]}
                  >
                    <Input.Password prefix={<KeyOutlined />} placeholder="Nouveau mot de passe" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirmer le nouveau mot de passe"
                    rules={[{ required: true, message: "Veuillez confirmer le nouveau mot de passe" }]}
                  >
                    <Input.Password prefix={<KeyOutlined />} placeholder="Confirmer mot de passe" />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Button type="primary" htmlType="submit" loading={savingPassword}>
                      Mettre à jour le mot de passe
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
