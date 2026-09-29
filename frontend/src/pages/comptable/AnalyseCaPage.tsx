import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileExcelOutlined } from "@ant-design/icons";
import { Alert, Button, InputNumber, Modal, Radio, Spin } from "antd";
import {
  obtenirAnalyseMensuelle, obtenirAnalysePeriode, telechargerAnalyseExcel,
  type MontantParkingCa, type TableauxExportCa,
} from "../../api/analyseCaApi";
import "./AnalyseCaPage.css";

const monnaie = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function valeursParParking(montants: MontantParkingCa[]): Map<number, number> {
  return new Map(montants.map((item) => [item.parkingId, item.montantHt]));
}

function erreurLisible(erreur: unknown): string {
  return erreur instanceof Error ? erreur.message : "Une erreur est survenue";
}

export function AnalyseCaPage() {
  const maintenant = new Date();
  const [dateDebut, setDateDebut] = useState(isoDate(new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)));
  const [dateFin, setDateFin] = useState(isoDate(maintenant));
  const [annee, setAnnee] = useState(maintenant.getFullYear());
  const [modalOuvert, setModalOuvert] = useState(false);
  const [choix, setChoix] = useState<TableauxExportCa>("DEUX");
  const [telechargement, setTelechargement] = useState(false);
  const [erreurExport, setErreurExport] = useState("");
  const datesValides = !!dateDebut && !!dateFin && dateDebut <= dateFin && dateDebut <= isoDate(maintenant);

  const periode = useQuery({
    queryKey: ["comptable-analyse-ca-periode", dateDebut, dateFin],
    queryFn: () => obtenirAnalysePeriode(dateDebut, dateFin),
    enabled: datesValides,
    staleTime: 0,
  });
  const mensuel = useQuery({
    queryKey: ["comptable-analyse-ca-mensuel", annee],
    queryFn: () => obtenirAnalyseMensuelle(annee),
    staleTime: 0,
  });
  const periodeResultat = periode.data;
  const mensuelResultat = mensuel.data;

  async function exporter() {
    setErreurExport("");
    setTelechargement(true);
    try {
      const fichier = await telechargerAnalyseExcel(dateDebut, dateFin, annee, choix);
      const url = URL.createObjectURL(fichier);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `analyse-ca-${annee}-${choix.toLowerCase()}.xlsx`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setModalOuvert(false);
    } catch (erreur) {
      setErreurExport(erreurLisible(erreur));
    } finally {
      setTelechargement(false);
    }
  }

  return (
    <main className="analyse-ca">
      <header className="analyse-ca__entete">
        <div>
          <p className="analyse-ca__surtitre">Espace comptable</p>
          <h1>Analyse CA</h1>
          <p>Chiffre d’affaires HT des abonnements, calculé au prorata journalier.</p>
        </div>
        <Button type="primary" icon={<FileExcelOutlined />} onClick={() => setModalOuvert(true)}
          disabled={!mensuelResultat}>
          Exporter Excel
        </Button>
      </header>

      <section className="analyse-ca__section" aria-labelledby="analyse-ca-periode">
        <div className="analyse-ca__titre">
          <div><h2 id="analyse-ca-periode">CA par parking sur une période</h2>
            <p>Du début à la fin sélectionnés, en dirhams hors taxes.</p></div>
          <div className="analyse-ca__filtres">
            <label>Du <input type="date" max={isoDate(maintenant)} value={dateDebut}
              onChange={(event) => setDateDebut(event.target.value)} /></label>
            <label>Au <input type="date" max={isoDate(maintenant)} value={dateFin}
              onChange={(event) => setDateFin(event.target.value)} /></label>
          </div>
        </div>
        {!datesValides && <Alert type="warning" message="Choisissez une période valide, sans date de début dans le futur." />}
        {periode.isError && <Alert type="error" message="Impossible de charger le CA de la période"
          description={erreurLisible(periode.error)} />}
        {periode.isPending && datesValides && <Spin />}
        {periodeResultat && datesValides && (
          <div className="analyse-ca__defilement">
            <table className="analyse-ca__tableau">
              <thead><tr><th scope="col">Période</th><th scope="col">Total HT</th>
                {periodeResultat.parkings.map((parking) => <th scope="col" key={parking.id}>{parking.nom}</th>)}
              </tr></thead>
              <tbody><tr><th scope="row">{periodeResultat.dateDebut} → {periodeResultat.dateFin}</th>
                <td className="analyse-ca__total">{monnaie.format(periodeResultat.totalHt)}</td>
                {(() => {
                  const valeurs = valeursParParking(periodeResultat.montants);
                  return periodeResultat.parkings.map((parking) =>
                    <td key={parking.id}>{monnaie.format(valeurs.get(parking.id) ?? 0)}</td>);
                })()}
              </tr></tbody>
            </table>
          </div>
        )}
      </section>

      <section className="analyse-ca__section" aria-labelledby="analyse-ca-annee">
        <div className="analyse-ca__titre">
          <div><h2 id="analyse-ca-annee">CA mensuel par parking</h2>
            <p>Les douze mois de l’année choisie ; les périodes à venir restent vides.</p></div>
          <label className="analyse-ca__annee">Année <InputNumber min={2000} max={2100}
            precision={0}
            value={annee} onChange={(value) => { if (value != null) setAnnee(value); }} /></label>
        </div>
        {mensuel.isError && <Alert type="error" message="Impossible de charger le CA mensuel"
          description={erreurLisible(mensuel.error)} />}
        {mensuel.isPending && <Spin />}
        {mensuelResultat && (
          <div className="analyse-ca__defilement">
            <table className="analyse-ca__tableau">
              <thead><tr><th scope="col">Mois</th><th scope="col">Total HT</th>
                {mensuelResultat.parkings.map((parking) => <th scope="col" key={parking.id}>{parking.nom}</th>)}
              </tr></thead>
              <tbody>{mensuelResultat.mois.map((mois) => {
                const valeurs = valeursParParking(mois.montants);
                return <tr key={mois.numero}>
                  <th scope="row">{mois.libelle} {mensuelResultat.annee}</th>
                  <td className="analyse-ca__total">{mois.aVenir ? "—" : monnaie.format(mois.totalHt)}</td>
                  {mensuelResultat.parkings.map((parking) => <td key={parking.id}>
                    {mois.aVenir ? "—" : monnaie.format(valeurs.get(parking.id) ?? 0)}
                  </td>)}
                </tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>

      <Modal title="Exporter l’analyse du chiffre d’affaires" open={modalOuvert}
        okText="Télécharger .xlsx" okButtonProps={{ loading: telechargement,
          disabled: choix !== "MENSUEL" && (!datesValides || !periodeResultat) }}
        onCancel={() => { if (!telechargement) setModalOuvert(false); }}
        onOk={() => void exporter()}>
        <p>Choisissez les tableaux à inclure dans le fichier :</p>
        <Radio.Group value={choix} onChange={(event) => setChoix(event.target.value as TableauxExportCa)}>
          <div className="analyse-ca__choix"><Radio value="PERIODE" disabled={!datesValides || !periodeResultat}>
            CA par parking sur la période</Radio>
            <Radio value="MENSUEL">CA mensuel pour {annee}</Radio>
            <Radio value="DEUX" disabled={!datesValides || !periodeResultat}>
              Les deux tableaux (deux feuilles)</Radio></div>
        </Radio.Group>
        {erreurExport && <Alert type="error" message={erreurExport} style={{ marginTop: 16 }} />}
      </Modal>
    </main>
  );
}
