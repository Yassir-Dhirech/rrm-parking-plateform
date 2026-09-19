export interface ContratScanSvgOptions {
  reference: string;
  entrepriseNom: string;
  iceEntreprise: string;
  parkingNom: string;
  nombrePlaces: number;
  montantMensuelTTC: number;
  dateDebut: string;
  dateFin: string;
  dateSignature?: string;
  signePar?: string;
  dateScan?: string;
  scannePar?: string;
  page?: number;
}

export function generateContratScanSvgUrl(opts: ContratScanSvgOptions): string {
  const page = opts.page || 1;
  const dateSig = opts.dateSignature || "01/06/2025";
  const dateScan = opts.dateScan || "02/06/2025";
  const scanneur = opts.scannePar || "Mme. Leila Benali (Responsable RRM)";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="100%" height="100%">
    <defs>
      <linearGradient id="paperBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#fcfbf9"/>
        <stop offset="100%" stop-color="#f7f5f0"/>
      </linearGradient>
    </defs>

    <!-- Feuille A4 numérisée -->
    <rect width="800" height="1130" fill="url(#paperBg)" />
    <!-- Marge de reliure scanneur -->
    <rect x="0" y="0" width="14" height="1130" fill="#f1ece1" opacity="0.6" />
    <line x1="14" y1="0" x2="14" y2="1130" stroke="#e2d9c8" stroke-width="1" stroke-dasharray="4,4" />

    <!-- En-tête officiel du Royaume et de RRM -->
    <text x="400" y="48" fill="#1e293b" font-size="11" font-weight="bold" font-family="Georgia, serif" text-anchor="middle" letter-spacing="2">ROYAUME DU MAROC</text>
    <text x="400" y="65" fill="#475569" font-size="10" font-weight="bold" font-family="Arial, sans-serif" text-anchor="middle">RÉGION DE RABAT - SALÉ - KÉNITRA</text>
    <text x="400" y="82" fill="#003566" font-size="15" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="1">RABAT RÉGION MOBILITÉ (RRM) S.A.</text>
    <text x="400" y="98" fill="#64748b" font-size="9" font-family="Arial, sans-serif" text-anchor="middle">Société de Développement Local • Capital 50.000.000 DH • RC Rabat 114258</text>

    <!-- Ligne de séparation dorée RRM -->
    <line x1="60" y1="112" x2="740" y2="112" stroke="#003566" stroke-width="2" />
    <line x1="60" y1="116" x2="740" y2="116" stroke="#d97706" stroke-width="0.8" />

    <!-- Titre de la Convention -->
    <rect x="90" y="135" width="620" height="60" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <text x="400" y="160" fill="#003566" font-size="14" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="0.5">CONVENTION CADRE DE STATIONNEMENT D'ENTREPRISE</text>
    <text x="400" y="180" fill="#982B5E" font-size="12" font-weight="800" font-family="Arial, sans-serif" text-anchor="middle">CONTRAT CORPORATE LONGUE DURÉE (20 ANS) — RÉF : ${opts.reference}</text>

    <!-- Cachet d'horodatage de numérisation (Tampon Scan) -->
    <g transform="translate(610, 30) rotate(-6)">
      <rect width="150" height="52" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="3,1" opacity="0.9" />
      <text x="75" y="16" fill="#1e40af" font-size="8" font-weight="bold" font-family="Arial" text-anchor="middle">RRM NUMÉRISATION</text>
      <text x="75" y="28" fill="#1e3a8a" font-size="9" font-weight="900" font-family="Arial" text-anchor="middle">CONFORME À L'ORIGINAL</text>
      <text x="75" y="40" fill="#3b82f6" font-size="7.5" font-family="monospace" text-anchor="middle">Scan: ${dateScan}</text>
      <text x="75" y="49" fill="#1e40af" font-size="6.5" font-family="Arial" text-anchor="middle">Opérateur: Direction RRM</text>
    </g>

    <!-- Parties Contractantes -->
    <text x="60" y="225" fill="#0f172a" font-size="11" font-weight="900" font-family="Arial">ENTRE LES SOUSSIGNÉS :</text>
    
    <rect x="60" y="235" width="680" height="90" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
    <text x="75" y="255" fill="#003566" font-size="11" font-weight="bold" font-family="Arial">1. D'UNE PART : La Société RABAT RÉGION MOBILITÉ (RRM) S.A.</text>
    <text x="75" y="272" fill="#475569" font-size="10" font-family="Arial">Représentée par sa Direction d'Exploitation, sise à l'Avenue Annakhil, Hay Riad, Rabat.</text>
    <text x="75" y="295" fill="#003566" font-size="11" font-weight="bold" font-family="Arial">2. D'AUTRE PART : La Société ${opts.entrepriseNom.toUpperCase()}</text>
    <text x="75" y="312" fill="#475569" font-size="10" font-family="Arial">Identifiant Commun de l'Entreprise (ICE) : <tspan font-weight="bold" fill="#0f172a">${opts.iceEntreprise}</tspan> | Représentant Légal Habilité.</text>

    <!-- Article 1: Objet & Ouvrage -->
    <text x="60" y="350" fill="#003566" font-size="11" font-weight="900" font-family="Arial">ARTICLE 1 — OBJET DU CONTRAT &amp; AFFECTATION DU PARC</text>
    <text x="60" y="368" fill="#334155" font-size="9.5" font-family="Georgia, serif">La Société RRM concède à l'entreprise souscriptrice un droit de stationnement privatif pour sa flotte de véhicules au sein de l'ouvrage :</text>
    <rect x="60" y="378" width="680" height="30" fill="#f1f5f9" rx="3" />
    <text x="75" y="398" fill="#0f172a" font-size="11" font-weight="bold" font-family="Arial">Site Assigné : ${opts.parkingNom} — Capacité Allouée : ${opts.nombrePlaces} Places Réservées Flotte Corporate</text>

    <!-- Article 2: Formule & Modalités -->
    <text x="60" y="435" fill="#003566" font-size="11" font-weight="900" font-family="Arial">ARTICLE 2 — FORMULE CONTRACTUELLE &amp; BADGES RFID NOMINATIFS</text>
    <text x="60" y="453" fill="#334155" font-size="9.5" font-family="Georgia, serif">Formule souscrite : <tspan font-weight="bold">Pass Permanent 24h / 7j</tspan> — Accès continu garanti par lecture automatique des plaques minéralogiques</text>
    <text x="60" y="468" fill="#334155" font-size="9.5" font-family="Georgia, serif">et dotation de <tspan font-weight="bold">${opts.nombrePlaces} cartes physiques RFID sécurisées RRM</tspan> encodées au nom des collaborateurs désignés.</text>

    <!-- Article 3: Durée & Validité -->
    <text x="60" y="505" fill="#003566" font-size="11" font-weight="900" font-family="Arial">ARTICLE 3 — DURÉE DU CONTRAT (CONVENTION VINGT ANS)</text>
    <text x="60" y="523" fill="#334155" font-size="9.5" font-family="Georgia, serif">La présente convention est conclue pour une période ferme de <tspan font-weight="bold">20 Ans (240 mois consécutifs)</tspan>, prenant effet le :</text>
    <text x="60" y="542" fill="#047857" font-size="11" font-weight="bold" font-family="Arial">Date de prise d'effet : ${opts.dateDebut} — Date d'échéance : ${opts.dateFin}</text>

    <!-- Article 4: Tarification & Redevances -->
    <text x="60" y="580" fill="#003566" font-size="11" font-weight="900" font-family="Arial">ARTICLE 4 — CONDITIONS FINANCIÈRES &amp; MODALITÉS DE RÈGLEMENT</text>
    
    <!-- Tableau financier récapitulatif -->
    <rect x="60" y="595" width="680" height="90" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <line x1="60" y1="625" x2="740" y2="625" stroke="#cbd5e1" stroke-width="1" />
    <line x1="380" y1="595" x2="380" y2="685" stroke="#cbd5e1" stroke-width="1" />
    
    <text x="75" y="615" fill="#64748b" font-size="10" font-weight="bold" font-family="Arial">DESIGNATION DE LA REDEVANCE</text>
    <text x="395" y="615" fill="#64748b" font-size="10" font-weight="bold" font-family="Arial">MONTANT MENSUEL APPLICABLE</text>
    
    <text x="75" y="645" fill="#1e293b" font-size="10" font-family="Arial">Abonnement Flotte Corporate (${opts.nombrePlaces} véhicules x 650 MAD TTC)</text>
    <text x="395" y="645" fill="#047857" font-size="12" font-weight="900" font-family="Arial">${opts.montantMensuelTTC.toLocaleString("fr-FR")} MAD TTC / mois</text>
    
    <text x="75" y="670" fill="#475569" font-size="9" font-family="Arial">Mode de règlement : Chèque certifié ou Espèces au guichet RRM</text>
    <text x="395" y="670" fill="#475569" font-size="9" font-family="Arial">Facturation émise automatiquement au début de chaque échéance</text>

    <!-- Article 5: Engagements et Dispositions Légales -->
    <text x="60" y="715" fill="#003566" font-size="11" font-weight="900" font-family="Arial">ARTICLE 5 — ENGAGEMENT DES PARTIES &amp; ARCHIVAGE NUMÉRIQUE</text>
    <text x="60" y="733" fill="#334155" font-size="9.5" font-family="Georgia, serif">Fait en deux exemplaires originaux paraphés et signés par les parties habilitées. Conformément à la réglementation de</text>
    <text x="60" y="747" fill="#334155" font-size="9.5" font-family="Georgia, serif">gouvernance RRM, cet exemplaire original a été scanné et certifié conforme par la Direction d'Exploitation.</text>

    <!-- Boîtes de Signature Officielle & Tampons -->
    <rect x="60" y="780" width="320" height="200" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,2" />
    <text x="220" y="805" fill="#003566" font-size="11" font-weight="bold" font-family="Arial" text-anchor="middle">POUR RABAT RÉGION MOBILITÉ (RRM)</text>
    <text x="220" y="820" fill="#64748b" font-size="9" font-family="Arial" text-anchor="middle">Le Directeur Général / Responsable d'Exploitation</text>
    <text x="220" y="836" fill="#0f172a" font-size="10" font-weight="bold" font-family="Arial" text-anchor="middle">Mme. Leila Benali</text>

    <!-- Tampon humide RRM encre bleue scannée -->
    <g transform="translate(145, 850) rotate(-4)">
      <circle cx="75" cy="50" r="44" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-dasharray="12,2" opacity="0.85" />
      <circle cx="75" cy="50" r="38" fill="none" stroke="#1d4ed8" stroke-width="1" opacity="0.85" />
      <text x="75" y="32" fill="#1d4ed8" font-size="7.5" font-weight="900" font-family="Arial" text-anchor="middle" letter-spacing="1">RABAT RÉGION MOBILITÉ</text>
      <text x="75" y="53" fill="#1e40af" font-size="9" font-weight="900" font-family="Arial" text-anchor="middle">DIRECTION</text>
      <text x="75" y="65" fill="#1e40af" font-size="8" font-weight="bold" font-family="Arial" text-anchor="middle">EXPLOITATION</text>
      <text x="75" y="77" fill="#1d4ed8" font-size="7" font-family="Arial" text-anchor="middle">★ S.A. RABAT ★</text>
    </g>

    <!-- Signature Manuscrite stylisée RRM -->
    <path d="M120 920 Q160 880 200 910 T240 895 T290 915" fill="none" stroke="#1e3a8a" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />

    <!-- Boîte Signature Entreprise -->
    <rect x="420" y="780" width="320" height="200" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,2" />
    <text x="580" y="805" fill="#0f172a" font-size="11" font-weight="bold" font-family="Arial" text-anchor="middle">POUR L'ENTREPRISE SOUSCRIPTRICE</text>
    <text x="580" y="820" fill="#64748b" font-size="9" font-family="Arial" text-anchor="middle">${opts.entrepriseNom}</text>
    <text x="580" y="836" fill="#0f172a" font-size="10" font-weight="bold" font-family="Arial" text-anchor="middle">Lu et approuvé — Bon pour accord 20 Ans</text>

    <!-- Tampon Entreprise encre violette/bleue -->
    <g transform="translate(505, 850) rotate(5)">
      <rect x="10" y="10" width="130" height="75" rx="4" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="10,2" opacity="0.8" />
      <text x="75" y="32" fill="#6d28d9" font-size="8" font-weight="bold" font-family="Arial" text-anchor="middle">${opts.entrepriseNom.slice(0, 20).toUpperCase()}</text>
      <text x="75" y="48" fill="#5b21b6" font-size="9" font-weight="900" font-family="Arial" text-anchor="middle">DIRECTION GÉNÉRALE</text>
      <text x="75" y="64" fill="#6d28d9" font-size="7.5" font-family="monospace" text-anchor="middle">ICE: ${opts.iceEntreprise}</text>
    </g>
    <!-- Signature Entreprise -->
    <path d="M480 925 Q520 890 560 915 T620 905 T660 920" fill="none" stroke="#4c1d95" stroke-width="2" stroke-linecap="round" opacity="0.85" />

    <!-- Pied de page et traçabilité scanneur -->
    <line x1="60" y1="1040" x2="740" y2="1040" stroke="#cbd5e1" stroke-width="0.8" />
    <text x="60" y="1058" fill="#64748b" font-size="8.5" font-family="monospace">CONVENTION CADRE RRM • ${opts.reference} • PARAPH-PHYSIQUE : ${opts.reference ? "PARAPH-" + opts.reference : "PARAPH-2026"} • PAGE ${page} / 4</text>
    <text x="740" y="1058" fill="#64748b" font-size="8.5" font-family="monospace" text-anchor="end">NUMÉRISÉ À 300 DPI • ARCHIVE LÉGALE RRM</text>
    <text x="400" y="1078" fill="#94a3b8" font-size="8" font-family="Arial" text-anchor="middle">Signé le ${dateSig} • Numérisé le ${dateScan} par ${scanneur} • Système central d'archivage documentaire RRM Rabat.</text>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
