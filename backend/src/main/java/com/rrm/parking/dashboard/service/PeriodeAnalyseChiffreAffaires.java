package com.rrm.parking.dashboard.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;

record PeriodeAnalyseChiffreAffaires(
        LocalDate debut,
        LocalDate fin,
        ModeComparaison modeComparaison
) {
    PeriodeAnalyseChiffreAffaires precedente() {
        return switch (modeComparaison) {
            case MOIS_PRECEDENT ->
                    new PeriodeAnalyseChiffreAffaires(
                            debut.minusMonths(1),
                            fin.minusMonths(1),
                            modeComparaison
                    );
            case ANNEE_PRECEDENTE ->
                    new PeriodeAnalyseChiffreAffaires(
                            debut.minusYears(1),
                            fin.minusYears(1),
                            modeComparaison
                    );
            case DUREE_PRECEDENTE -> {
                long nombreJours = ChronoUnit.DAYS.between(debut, fin) + 1;
                LocalDate finPrecedente = debut.minusDays(1);
                LocalDate debutPrecedent = finPrecedente.minusDays(
                        nombreJours - 1
                );

                yield new PeriodeAnalyseChiffreAffaires(
                        debutPrecedent,
                        finPrecedente,
                        modeComparaison
                );
            }
        };
    }

    static PeriodeAnalyseChiffreAffaires resoudre(
            LocalDate dateDebut,
            LocalDate dateFin,
            Integer annee,
            Integer mois,
            LocalDate aujourdHui
    ) {
        boolean uneSeuleDate = (dateDebut == null) != (dateFin == null);
        if (uneSeuleDate) {
            throw new IllegalArgumentException(
                    "La date de début et la date de fin doivent être fournies ensemble"
            );
        }

        if (dateDebut != null && (annee != null || mois != null)) {
            throw new IllegalArgumentException(
                    "Les dates ne peuvent pas être combinées avec l'année ou le mois"
            );
        }

        if (annee != null && (annee < 2000 || annee > 2100)) {
            throw new IllegalArgumentException(
                    "L'année doit être comprise entre 2000 et 2100"
            );
        }

        if (mois != null && (mois < 1 || mois > 12)) {
            throw new IllegalArgumentException(
                    "Le mois doit être compris entre 1 et 12"
            );
        }

        LocalDate debut;
        LocalDate fin;
        ModeComparaison modeComparaison;

        if (dateDebut != null) {
            debut = dateDebut;
            fin = dateFin;
            modeComparaison = YearMonth.from(debut)
                    .equals(YearMonth.from(fin))
                    ? ModeComparaison.MOIS_PRECEDENT
                    : ModeComparaison.DUREE_PRECEDENTE;
        } else if (annee != null && mois != null) {
            YearMonth selection = YearMonth.of(annee, mois);
            debut = selection.atDay(1);
            fin = selection.atEndOfMonth();
            modeComparaison = ModeComparaison.MOIS_PRECEDENT;
        } else if (annee != null) {
            debut = LocalDate.of(annee, 1, 1);
            fin = LocalDate.of(annee, 12, 31);
            modeComparaison = ModeComparaison.ANNEE_PRECEDENTE;
        } else if (mois != null) {
            YearMonth selection = YearMonth.of(
                    aujourdHui.getYear(),
                    mois
            );
            debut = selection.atDay(1);
            fin = selection.atEndOfMonth();
            modeComparaison = ModeComparaison.MOIS_PRECEDENT;
        } else {
            debut = aujourdHui.withDayOfMonth(1);
            fin = aujourdHui;
            modeComparaison = ModeComparaison.MOIS_PRECEDENT;
        }

        if (debut.isAfter(aujourdHui)) {
            throw new IllegalArgumentException(
                    "La période d'analyse ne peut pas commencer dans le futur"
            );
        }

        if (fin.isAfter(aujourdHui)) {
            fin = aujourdHui;
        }

        if (fin.isBefore(debut)) {
            throw new IllegalArgumentException(
                    "La date de fin doit être postérieure ou égale à la date de début"
            );
        }

        return new PeriodeAnalyseChiffreAffaires(
                debut,
                fin,
                modeComparaison
        );
    }

    enum ModeComparaison {
        MOIS_PRECEDENT,
        ANNEE_PRECEDENTE,
        DUREE_PRECEDENTE
    }
}
