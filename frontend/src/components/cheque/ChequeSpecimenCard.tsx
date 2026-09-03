import { Tag, Alert } from "antd";
import {
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDate } from "../../lib/dateUtils";

interface ChequeSpecimenCardProps {
  montant?: number;
  clientNom?: string;
  typeClient?: "PARTICULIER" | "ENTREPRISE" | "STAFF" | string;
  compact?: boolean;
}

// Convert numbers up to 1,000,000 to French words for realistic cheques
function numberToFrenchWords(n: number): string {
  if (n <= 0) return "Zéro dirham";

  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];

  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingts",
    "quatre-vingt-dix",
  ];

  function convertSmall(num: number): string {
    if (num < 20) return units[num];
    if (num < 70) {
      const u = num % 10;
      return tens[Math.floor(num / 10)] + (u === 1 ? " et un" : u > 0 ? `-${units[u]}` : "");
    }
    if (num < 80) {
      const u = num - 60;
      return "soixante" + (u === 11 ? " et onze" : `-${units[u]}`);
    }
    if (num < 100) {
      const u = num - 80;
      return "quatre-vingt" + (u > 0 ? `-${units[u]}` : "s");
    }
    const h = Math.floor(num / 100);
    const rest = num % 100;
    const hStr = h === 1 ? "cent" : `${units[h]} cents`;
    return rest > 0 ? `${hStr.replace(/s$/, "")} ${convertSmall(rest)}` : hStr;
  }

  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  let result = "";
  if (thousands > 0) {
    result += thousands === 1 ? "mille" : `${convertSmall(thousands)} mille`;
  }
  if (remainder > 0) {
    result += (result ? " " : "") + convertSmall(remainder);
  }

  return (result.charAt(0).toUpperCase() + result.slice(1) + " dirhams").trim();
}

export function ChequeSpecimenCard({
  montant = 450,
  clientNom = "Client RRM",
  typeClient = "PARTICULIER",
  compact = false,
}: ChequeSpecimenCardProps) {
  const montantEnLettres = numberToFrenchWords(montant);
  const currentDate = formatDate(dayjs().format("YYYY-MM-DD"));

  return (
    <div className="space-y-3">
      {/* Alert Header Reminder */}
      <Alert
        message={
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
            <SafetyCertificateOutlined className="text-amber-600 text-sm" />
            <span>Spécimen de Remplissage Conforme — Évitez les erreurs de libellé</span>
          </div>
        }
        description={
          <span className="text-[11px] text-amber-800">
            Pour être accepté sans rejet bancaire, votre chèque doit être libellé strictement à l'ordre de{" "}
            <strong>« Société Rabat Région Mobilité SA »</strong> et comporter les mentions exactes ci-dessous.
          </span>
        }
        type="warning"
        showIcon={false}
        className="rounded-xl border-amber-200 bg-amber-50/80"
      />

      {/* Realistic Bank Cheque Mockup */}
      <div className="relative rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-amber-50/40 via-sky-50/30 to-emerald-50/40 p-4 sm:p-5 shadow-md overflow-hidden text-slate-900 font-sans select-none">
        {/* Decorative Watermark & Safety Guilloche Line */}
        <div className="absolute inset-0 bg-[radial-gradient(#003566_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
        <div className="absolute top-2 right-4 text-[40px] font-black tracking-widest text-slate-900/5 uppercase pointer-events-none select-none">
          SPÉCIMEN
        </div>

        {/* Top Cheque Row: Bank Name, Number & Delimited Amount */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-200/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-900 text-white flex items-center justify-center text-sm font-black shadow-xs">
              <BankOutlined />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                Banque du Titulaire
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Agence Centrale — Rabat
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block">Chèque N°</span>
              <span className="font-mono text-xs font-extrabold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                0123456
              </span>
            </div>

            {/* Amount in Numbers with Security Delimiters */}
            <div className="bg-white px-3 py-1.5 rounded-xl border-2 border-slate-800 shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block -mb-0.5">
                Montant en Chiffres
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-slate-950 tracking-wider">
                # {montant.toLocaleString("fr-FR")},00 # DH
              </span>
            </div>
          </div>
        </div>

        {/* Body 1: Pay Against This Cheque / Beneficiary Order */}
        <div className="py-3 space-y-2.5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">
              Payez contre ce chèque non endossable à l'ordre de :
            </span>
            <div className="flex-1 bg-white/90 border-b-2 border-emerald-600 px-3 py-1 rounded-t-md">
              <span className="font-serif font-black text-sm sm:text-base text-emerald-950 tracking-wide">
                Société Rabat Région Mobilité SA
              </span>
            </div>
            <Tag color="green" className="font-black text-[10px] m-0 self-start sm:self-auto shrink-0">
              <CheckCircleOutlined /> Bénéficiaire Strict
            </Tag>
          </div>

          {/* Body 2: Amount in French Words */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0 sm:pt-1">
              La somme de (en toutes lettres) :
            </span>
            <div className="flex-1 bg-white/90 border-b border-dashed border-slate-400 px-3 py-1 rounded-t-md">
              <span className="font-serif italic font-extrabold text-xs sm:text-sm text-slate-900 leading-relaxed block">
                {montantEnLettres} -----------------------------
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Cheque Row: Place, Date & Signature */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-700">
              <span className="font-semibold">Payable à :</span>
              <strong className="text-slate-900">Rabat</strong>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-700">
              <span className="font-semibold">Le :</span>
              <strong className="font-mono text-slate-900 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                {currentDate}
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">(Date du jour obligatoire)</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Émetteur : <strong className="text-slate-800">{clientNom}</strong>
            </div>
          </div>

          {/* Signature Box */}
          <div className="border border-dashed border-slate-400 rounded-xl p-2.5 bg-white/70 text-center relative min-h-[64px] flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold absolute top-1 left-2">
              Signature de l'émetteur
            </span>
            <div className="font-serif italic text-base text-slate-800 font-bold mt-2">
              {clientNom.split(" ")[0]} ...
            </div>
            {typeClient === "ENTREPRISE" && (
              <Tag color="purple" className="text-[9px] font-bold mt-1 m-0">
                Cachet Société Requis
              </Tag>
            )}
          </div>
        </div>

        {/* Magnetic MICR Bottom Code Line */}
        <div className="mt-4 pt-2 border-t border-slate-200 text-center font-mono text-[10px] tracking-[0.25em] text-slate-400 font-bold select-none">
          ⑈ 0123456 ⑈ 021 780 0001234567890123 ⑈ 54
        </div>
      </div>

      {/* 4 Golden Rules Checklist */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-start gap-2">
            <CheckCircleOutlined className="text-emerald-600 text-sm mt-0.5 shrink-0" />
            <span>
              <strong>Ordre officiel</strong> : Écrire <em>« Société Rabat Région Mobilité SA »</em> ou <em>« RRM SA »</em> sans abréviations non reconnues.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleOutlined className="text-emerald-600 text-sm mt-0.5 shrink-0" />
            <span>
              <strong>Montant conforme</strong> : Le montant en lettres doit correspondre au centime près au montant en chiffres.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleOutlined className="text-emerald-600 text-sm mt-0.5 shrink-0" />
            <span>
              <strong>Lieu et Date</strong> : Indiquer impérativement le lieu (ex: <em>Rabat</em>) et la date d'émission (ne pas post-dater).
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleOutlined className="text-emerald-600 text-sm mt-0.5 shrink-0" />
            <span>
              <strong>Signature & Cachet</strong> : Signature manuscrite obligatoire (+ cachet commercial pour les Sociétés et Flottes).
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
