package com.rrm.parking.carte.corporate;

import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EcheanceCarteCorporateTest {
    @Test
    void deuxRappelsSontEmisDeuxJoursAvantEtLeJourDeLEcheance() {
        CarteAcces carte = mock(CarteAcces.class);
        when(carte.getDateActivation()).thenReturn(LocalDateTime.of(2026, 9, 30, 10, 0));
        EcheanceCarteCorporate cycle = new EcheanceCarteCorporate(carte);

        assertEquals(LocalDate.of(2028, 9, 30), cycle.getDateEcheance());
        cycle.enregistrerRappels(LocalDate.of(2028, 9, 27));
        assertNull(cycle.getDateRappelAnticipe());
        cycle.enregistrerRappels(LocalDate.of(2028, 9, 28));
        assertNotNull(cycle.getDateRappelAnticipe());
        assertNull(cycle.getDateRappelEcheance());
        LocalDateTime premier = cycle.getDateRappelAnticipe();
        cycle.enregistrerRappels(LocalDate.of(2028, 9, 30));
        assertEquals(premier, cycle.getDateRappelAnticipe());
        assertNotNull(cycle.getDateRappelEcheance());
    }

    @Test
    void demandeDeclarationEtClotureRestentDansLeDossier() {
        CarteAcces carte = mock(CarteAcces.class);
        when(carte.getDateActivation()).thenReturn(LocalDateTime.of(2026, 9, 30, 10, 0));
        EcheanceCarteCorporate cycle = new EcheanceCarteCorporate(carte);
        Utilisateur responsable = mock(Utilisateur.class);
        Utilisateur superviseur = mock(Utilisateur.class);
        DemandeOperationnelle operation = mock(DemandeOperationnelle.class);

        assertThrows(IllegalStateException.class, () -> cycle.cloturer(responsable));
        cycle.demander(operation, responsable);
        assertEquals(StatutEcheanceCorporate.DEMANDEE, cycle.getStatut());
        assertThrows(IllegalStateException.class, () -> cycle.demander(operation, responsable));
        cycle.declarer(superviseur);
        assertEquals(StatutEcheanceCorporate.DECLAREE, cycle.getStatut());
        cycle.cloturer(responsable);
        assertEquals(StatutEcheanceCorporate.CLOTUREE, cycle.getStatut());
        assertNotNull(cycle.getDateCloture());
    }
}
