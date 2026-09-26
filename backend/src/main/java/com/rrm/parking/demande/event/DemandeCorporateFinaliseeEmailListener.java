package com.rrm.parking.demande.event;

import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class DemandeCorporateFinaliseeEmailListener {

    private static final DateTimeFormatter DATE_HEURE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    private final EmailEnvoiService emailEnvoiService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyer(DemandeCorporateFinaliseeEvent evenement) {
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.destinataire(),
                    "Vos cartes corporate et votre facture sont disponibles",
                    construireContenu(evenement)
            );
        } catch (RuntimeException exception) {
            log.error(
                    "Le dossier corporate {} est finalisé, mais l'e-mail de disponibilité a échoué",
                    evenement.reference(),
                    exception
            );
        }
    }

    private String construireContenu(DemandeCorporateFinaliseeEvent evenement) {
        String activation = evenement.dateActivationCartes() == null
                ? "—"
                : evenement.dateActivationCartes().format(DATE_HEURE);
        return """
                <!DOCTYPE html>
                <html lang="fr"><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                  <h2 style="color:#166534">Votre dossier corporate est finalisé</h2>
                  <p>Bonjour <strong>%s</strong>,</p>
                  <p>Les <strong>%d cartes d'accès</strong> de la société <strong>%s</strong> ont été imprimées, activées et testées pour le parking <strong>%s</strong>.</p>
                  <div style="padding:16px;background:#f0fdf4;border-left:4px solid #16a34a">
                    <p>Vos cartes et la facture <strong>%s</strong> sont disponibles au siège de Rabat Région Mobilité.</p>
                    <p><strong>Déclaration d'activation :</strong> %s</p>
                  </div>
                  <p><strong>Adresse :</strong> 1 rue Ghafsa, place Al Joulane, Hassan, Rabat.</p>
                  <p><strong>Référence de la demande :</strong> %s</p>
                  <p>La facture n'est pas jointe à cet e-mail ; elle est à récupérer au siège avec les cartes.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                  <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                </div></body></html>
                """.formatted(
                echapper(evenement.destinataire()),
                evenement.nombreCartes(),
                echapper(evenement.raisonSociale()),
                echapper(evenement.parkingNom()),
                echapper(evenement.numeroFacture()),
                echapper(activation),
                echapper(evenement.reference())
        );
    }

    private String echapper(String valeur) {
        return HtmlUtils.htmlEscape(valeur == null ? "" : valeur);
    }
}
