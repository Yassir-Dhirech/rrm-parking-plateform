import { useState } from "react";
import { Steps, Form, Input, Select, Button, Result, Card, message } from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPublicParkings } from "../../../api/parkings";
import { submitPublicDemande } from "../../../api/demandes";
import { type PublicDemandeInput } from "../types";
import {type TypeClient, type TypeVehicule, typeVehiculeLabels } from "../../../lib/enums";

const { Option } = Select;

export function PublicQrForm() {
  const [current, setCurrent] = useState(0);
  const [typeClient, setTypeClient] = useState<TypeClient>("PARTICULIER");
  const [formData, setFormData] = useState<Partial<PublicDemandeInput>>({});
  const [reference, setReference] = useState<string | null>(null);

  const { data: parkings, isLoading: parkingsLoading } = useQuery({
    queryKey: ["public-parkings"],
    queryFn: getPublicParkings,
  });

  const mutation = useMutation({
    mutationFn: submitPublicDemande,
    onSuccess: (result) => {
      setReference(result.reference);
    },
    onError: () => {
      message.error("Une erreur est survenue lors de l'envoi de votre demande.");
    },
  });

  const [step1Form] = Form.useForm();
  const [step2Form] = Form.useForm();

  const goNextFromStep1 = async (): Promise<void> => {
    const values = await step1Form.validateFields();
    setFormData((prev) => ({ ...prev, ...values, typeClient }));
    setCurrent(1);
  };

  const goNextFromStep2 = async (): Promise<void> => {
    const values = await step2Form.validateFields();
    const fullData = { ...formData, ...values } as PublicDemandeInput;
    setFormData(fullData);
    mutation.mutate(fullData);
    setCurrent(2);
  };

  if (reference) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
        <Result
          status="success"
          title="Votre demande a été soumise avec succès"
          subTitle={`Référence : ${reference}`}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Card title="Demande d'abonnement de parking — RRM">
        <Steps
          current={current}
          items={[
            { title: "Informations" },
            { title: "Véhicule" },
            { title: "Confirmation" },
          ]}
          style={{ marginBottom: 24 }}
        />

        {current === 0 && (
          <Form form={step1Form} layout="vertical">
            <Form.Item label="Type de client" required>
              <Select
                value={typeClient}
                onChange={(value: TypeClient) => setTypeClient(value)}
              >
                <Option value="PARTICULIER">Particulier</Option>
                <Option value="ENTREPRISE">Entreprise</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="parkingId"
              label="Parking souhaité"
              rules={[{ required: true, message: "Veuillez choisir un parking" }]}
            >
              <Select loading={parkingsLoading} placeholder="Sélectionnez un parking">
                {parkings?.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {typeClient === "PARTICULIER" ? (
              <>
                <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="cin" label="CIN" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item name="raisonSociale" label="Raison sociale" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="ice" label="ICE" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </>
            )}

            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Button type="primary" onClick={goNextFromStep1} block>
              Suivant
            </Button>
          </Form>
        )}

        {current === 1 && (
          <Form form={step2Form} layout="vertical">
            <Form.Item
              name="immatriculation"
              label="Immatriculation"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="marque" label="Marque">
              <Input />
            </Form.Item>
            <Form.Item name="modele" label="Modèle">
              <Input />
            </Form.Item>
            <Form.Item
              name="typeVehicule"
              label="Type de véhicule"
              rules={[{ required: true }]}
            >
              <Select placeholder="Sélectionnez">
                {(Object.keys(typeVehiculeLabels) as TypeVehicule[]).map((key) => (
                  <Option key={key} value={key}>
                    {typeVehiculeLabels[key]}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Button onClick={() => setCurrent(0)} style={{ marginRight: 8 }}>
              Précédent
            </Button>
            <Button
              type="primary"
              onClick={goNextFromStep2}
              loading={mutation.isPending}
            >
              Soumettre la demande
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}