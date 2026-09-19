import { useState } from "react";
import { Modal, Button, Space, Tag, Tooltip, message } from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SafetyCertificateOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import type { ContratDetail, ContratScanInfo } from "../types";
import { generateContratScanSvgUrl } from "../utils/generateContratScanSvg";
import { formatDate } from "../../../lib/dateUtils";

export interface VisualiserScanContratModalProps {
  open: boolean;
  onClose: () => void;
  contrat: {
    id?: number;
    reference: string;
    entrepriseNom: string;
    iceEntreprise?: string;
    parkingNom?: string;
    nombrePlaces?: number;
    montantMensuelTTC?: number;
    dateDebut?: string;
    dateFin?: string;
    dateSignature?: string;
    signePar?: string;
    scanInfo?: ContratScanInfo;
  } | ContratDetail;
  scanInfo?: ContratScanInfo;
  onRescan?: () => void;
  canRescan?: boolean;
}

export function VisualiserScanContratModal({
  open,
  onClose,
  contrat,
  scanInfo,
  onRescan,
  canRescan = false,
}: VisualiserScanContratModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  const effectiveScanInfo = scanInfo || contrat.scanInfo;
  const totalPages = effectiveScanInfo?.nombrePages || 4;

  const svgUrl = generateContratScanSvgUrl({
    reference: contrat.reference,
    entrepriseNom: contrat.entrepriseNom,
    iceEntreprise: contrat.iceEntreprise || "001524389000045",
    parkingNom: contrat.parkingNom || "Parking Agdal Gare",
    nombrePlaces: contrat.nombrePlaces || 10,
    montantMensuelTTC: contrat.montantMensuelTTC || 6500,
    dateDebut: contrat.dateDebut ? formatDate(contrat.dateDebut) : "01/01/2026",
    dateFin: contrat.dateFin ? formatDate(contrat.dateFin) : "31/12/2045",
    dateSignature: contrat.dateSignature ? formatDate(contrat.dateSignature) : undefined,
    signePar: contrat.signePar,
    dateScan: effectiveScanInfo?.dateScan ? formatDate(effectiveScanInfo.dateScan) : formatDate("02/06/2025"),
    scannePar: effectiveScanInfo?.scannePar || "Mme. Leila Benali (Responsable RRM)",
    page: currentPage,
  });

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 15, 160));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 15, 70));

  const handleDownload = () => {
    message.success(`Téléchargement de la copie certifiée du contrat ${contrat.reference}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Impression Contrat - ${contrat.reference}</title></head>
          <body style="margin:0;display:flex;justify-content:center;background:#fff;">
            <img src="${svgUrl}" style="width:100%;max-width:800px;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      destroyOnClose
      centered
      title={
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pr-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FilePdfOutlined />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">
                  Contrat Corporate Numérisé — {contrat.reference}
                </span>
                <Tag color="green" className="font-bold text-[11px] m-0">
                  <SafetyCertificateOutlined className="mr-1" /> Copie Certifiée Conforme
                </Tag>
              </div>
              <span className="text-xs text-slate-500 font-semibold block">
                {contrat.entrepriseNom} • Flotte de {contrat.nombrePlaces} places • {contrat.parkingNom}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Controls Toolbar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<LeftOutlined />}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg"
            />
            <span className="text-xs font-bold text-slate-700 px-1">
              Page <strong>{currentPage}</strong> / {totalPages}
            </span>
            <Button
              size="small"
              icon={<RightOutlined />}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <Tooltip title="Zoom arrière">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} className="rounded-lg" />
            </Tooltip>
            <span className="text-xs font-bold text-slate-500 min-w-12 text-center">{zoomLevel}%</span>
            <Tooltip title="Zoom avant">
              <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} className="rounded-lg" />
            </Tooltip>
          </div>

          {/* Document Actions */}
          <Space>
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="font-bold rounded-lg"
            >
              Imprimer
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              className="font-bold rounded-lg bg-[#003566]"
            >
              Télécharger PDF
            </Button>
            {canRescan && onRescan && (
              <Button
                size="small"
                onClick={() => {
                  onClose();
                  onRescan();
                }}
                className="font-bold rounded-lg border-amber-600 text-amber-800 bg-amber-50"
              >
                Re-scanner
              </Button>
            )}
          </Space>
        </div>

        {/* Scanned Document View Container */}
        <div className="max-h-[620px] overflow-auto rounded-xl border border-slate-300 bg-slate-100/90 p-4 flex justify-center shadow-inner">
          <div
            style={{
              width: `${(800 * zoomLevel) / 100}px`,
              transition: "width 0.2s ease-out",
            }}
            className="shadow-xl rounded-sm overflow-hidden bg-white"
          >
            <img
              src={svgUrl}
              alt={`Page ${currentPage} - Contrat ${contrat.reference}`}
              className="w-full h-auto block select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Audit & Archival Footer */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="font-bold text-emerald-950 block">
              Archivage Numérique : Certificat d'authenticité RRM
            </span>
            <span className="text-[11px] text-slate-500">
              Scanné le <strong>{contrat.scanInfo?.dateScan || "02/06/2025"}</strong> par{" "}
              <strong>{contrat.scanInfo?.scannePar || "Mme. Leila Benali (Responsable RRM)"}</strong>
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-500 block">
              Parapheur Physique :
            </span>
            <Tag color="purple" className="font-mono font-bold m-0 text-xs">
              {contrat.scanInfo?.referenceParapheur || `PARAPH-${contrat.reference}`}
            </Tag>
          </div>
        </div>
      </div>
    </Modal>
  );
}
