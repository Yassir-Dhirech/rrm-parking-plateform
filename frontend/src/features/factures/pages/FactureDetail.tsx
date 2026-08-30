import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, Space, Tag, message } from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { getFactureByIdMock, signerFactureMock } from "../../../api/facturesMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";

export function FactureDetail() {
  const { id } = useParams<{ id: string }>();
  const factureId = Number(id);
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["facture", factureId],
    queryFn: () => getFactureByIdMock(factureId),
  });

  const signerMutation = useMutation({
    mutationFn: () => signerFactureMock(factureId),
    onSuccess: () => {
      message.success("Facture signée et validée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["facture", factureId] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const canSigner = role === "RESPONSABLE" && data.statut === "EMISE";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    message.success(`Téléchargement de la facture ${data.numero}.pdf démarré.`);
  };

  const handleSendEmail = () => {
    message.success(`Facture officielle envoyée par email au souscripteur ${data.clientNom}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`${basePath}/factures`)}
          className="rounded-xl font-semibold"
        >
          Retour à la liste des factures
        </Button>

        <Space wrap>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="rounded-xl font-bold"
          >
            Imprimer
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadPdf}
            className="rounded-xl font-bold"
          >
            Télécharger PDF
          </Button>

          <Button
            icon={<MailOutlined />}
            onClick={handleSendEmail}
            className="rounded-xl font-bold"
          >
            Envoyer par Email
          </Button>

          {canSigner && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => signerMutation.mutate()}
              loading={signerMutation.isPending}
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 700 }}
              className="rounded-xl"
            >
              Signer la facture
            </Button>
          )}
        </Space>
      </div>

      {/* Official Fiscal Voucher Printable Card */}
      <Card
        className="rounded-2xl shadow-sm border border-slate-200"
        styles={{ body: { padding: "32px 28px" } }}
      >
        {/* Header with Letterhead */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/pictures/logo-rrm.png"
              alt="RRM"
              className="h-14 w-auto object-contain"
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Royaume du Maroc — Région Rabat-Salé-Kénitra
              </div>
              <h2 className="text-lg font-black text-slate-900 m-0">
                Rabat Région Mobilité (RRM) S.A.
              </h2>
              <div className="text-xs text-slate-500 font-medium">
                Société de Développement Local — Gestion des Parcs de Stationnement
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <Tag color="cyan" className="font-extrabold text-xs px-3 py-0.5 rounded-full border-none mb-1">
              Facture Officielle RRM
            </Tag>
            <div className="text-xl font-black text-slate-900 font-mono">
              {data.numero}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Date d'Émission : <strong>{formatDate(data.dateEmission)}</strong>
            </div>
          </div>
        </div>

        {/* Facture Info Descriptions */}
        <div className="my-6">
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Statut Document">
              <StatusBadge statut={data.statut} />
            </Descriptions.Item>
            <Descriptions.Item label="Souscripteur / Client">
              <strong>{data.clientNom}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Référence Abonnement">
              <Tag color="blue" className="font-mono font-bold">
                {data.abonnementReference}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Émise par">
              {data.genereePar}
            </Descriptions.Item>
            <Descriptions.Item label="Validation Signature">
              {data.statut === "SIGNEE" ? (
                <Tag color="green" className="font-bold inline-flex items-center gap-1">
                  <SafetyCertificateOutlined /> Signée & Validée
                </Tag>
              ) : (
                <Tag color="orange" className="font-bold">
                  En Attente de Signature Directeur
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Mode de Paiement">
              <Tag color="purple" className="font-bold">
                Règlement Guichet RRM
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Table of Invoiced Items */}
        <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Désignation de la Prestation</th>
                <th className="p-3 text-center">Quantité</th>
                <th className="p-3 text-right">Montant HT</th>
                <th className="p-3 text-center">TVA</th>
                <th className="p-3 text-right">Montant TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3">
                  <div className="font-extrabold text-slate-900">
                    Abonnement Stationnement Ouvrage Rabat
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Droit d'accès et stationnement nominatif rattaché à l'abonnement {data.abonnementReference}
                  </div>
                </td>
                <td className="p-3 text-center font-bold">1</td>
                <td className="p-3 text-right font-medium">
                  {data.montantHt.toLocaleString("fr-FR")} MAD
                </td>
                <td className="p-3 text-center">
                  <Tag color="blue" className="font-bold">{data.tauxTva}%</Tag>
                </td>
                <td className="p-3 text-right font-black text-slate-900">
                  {data.montantTtc.toLocaleString("fr-FR")} MAD
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Summary Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 max-w-sm leading-relaxed">
            <div><strong>Conditions de Règlement :</strong> Payable au comptant lors de la souscription par Espèces ou Chèque certifié.</div>
            <div className="mt-1">Exonération de droit de timbre conformément au Code Général des Impôts marocain.</div>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Brut Hors Taxe (HT) :</span>
              <strong>{data.montantHt.toLocaleString("fr-FR")} MAD</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>TVA Collectée (20%) :</span>
              <strong className="text-sky-700">{data.montantTva.toLocaleString("fr-FR")} MAD</strong>
            </div>
            <div className="flex justify-between text-base font-black text-emerald-700 pt-2 border-t border-slate-200">
              <span>Total Net à Payer (TTC) :</span>
              <span>{data.montantTtc.toLocaleString("fr-FR")} MAD</span>
            </div>
          </div>
        </div>

        {/* Stamp and Signature Box */}
        <div className="mt-10 pt-6 border-t border-dashed border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left text-[11px] text-slate-400">
            Rabat Région Mobilité S.A. | RC: 114258 | IF: 25489632 | Patente: 35489001 | ICE: 002145896300054
          </div>

          <div className="text-center sm:text-right">
            <div className="text-xs font-bold text-slate-700 mb-1">
              Pour la Direction d'Exploitation RRM :
            </div>
            {data.statut === "SIGNEE" ? (
              <div className="inline-block p-2 border-2 border-emerald-600 rounded-xl bg-emerald-50/60 text-emerald-800 font-black text-xs">
                <CheckCircleOutlined style={{ marginRight: 4 }} />
                Signé Électroniquement — {data.signeePar || "M. le Directeur d'Exploitation"}
              </div>
            ) : (
              <div className="inline-block p-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-semibold text-xs">
                Document en attente de visa réglementaire
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}