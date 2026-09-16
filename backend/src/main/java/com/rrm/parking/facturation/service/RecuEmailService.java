package com.rrm.parking.facturation.service;

import com.rrm.parking.facturation.dto.response.RecuConsultationResponse;
import com.rrm.parking.facturation.dto.response.RecuEmailResponse;
import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class RecuEmailService {

    private final RecuConsultationService
            recuConsultationService;

    private final RecuPdfService recuPdfService;

    private final EmailEnvoiService emailEnvoiService;

    public RecuEmailResponse envoyer(Long recuId) {
        RecuConsultationResponse recu =
                recuConsultationService.consulter(recuId);

        verifierAdresseEmail(recu.email());

        byte[] pdf = recuPdfService.generer(recuId);

        String nomFichier =
                recu.numeroRecu() + ".pdf";

        emailEnvoiService.envoyerAvecPieceJointe(
                recu.email(),
                recu.nomClient(),
                "Votre reçu de paiement RRM "
                        + recu.numeroRecu(),
                construireContenuHtml(recu),
                pdf,
                nomFichier
        );

        return new RecuEmailResponse(
                recu.recuId(),
                recu.numeroRecu(),
                recu.email(),
                "ENVOYE",
                "Le reçu a été envoyé par e-mail"
        );
    }

    private void verifierAdresseEmail(String email) {
        if (email == null
                || email.isBlank()
                || !email.contains("@")) {
            throw new IllegalArgumentException(
                    "Le client ne possède pas une adresse e-mail valide"
            );
        }
    }

    private String construireContenuHtml(
            RecuConsultationResponse recu
    ) {
        String client = HtmlUtils.htmlEscape(
                recu.nomClient()
        );

        String numeroRecu = HtmlUtils.htmlEscape(
                recu.numeroRecu()
        );

        String referenceDemande = HtmlUtils.htmlEscape(
                recu.referenceDemande()
        );

        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <title>Reçu de paiement RRM</title>
                </head>
                <body style="
                    margin:0;
                    padding:30px;
                    background-color:#f8fafc;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#0f172a;
                ">
                    <div style="
                        max-width:620px;
                        margin:auto;
                        padding:30px;
                        background:#ffffff;
                        border:1px solid #e2e8f0;
                    ">
                        <h2 style="
                            margin-top:0;
                            color:#075985;
                        ">
                            Reçu de paiement
                        </h2>

                        <p>
                            Bonjour <strong>%s</strong>,
                        </p>

                        <p style="line-height:1.7;">
                            Nous vous confirmons l'enregistrement
                            de votre paiement concernant la demande
                            <strong>%s</strong>.
                        </p>

                        <p style="line-height:1.7;">
                            Votre reçu portant le numéro
                            <strong>%s</strong> est joint à ce message
                            au format PDF.
                        </p>

                        <p style="line-height:1.7;">
                            Abonnement : <strong>%s DH TTC</strong><br>
                            Carte RFID : <strong>%s DH TTC</strong><br>
                            Total encaissé : <strong>%s DH TTC</strong>
                        </p>

                        <p style="line-height:1.7;">
                            Ce reçu confirme l'encaissement du paiement.
                            L'activation de l'abonnement reste soumise
                            à la validation définitive de la demande.
                        </p>

                        <hr style="
                            border:none;
                            border-top:1px solid #e2e8f0;
                            margin:25px 0;
                        ">

                        <p style="
                            margin-bottom:0;
                            color:#64748b;
                            font-size:12px;
                        ">
                            Rabat Région Mobilité — RRM<br>
                            Message automatique, merci de ne pas répondre.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(
                client,
                referenceDemande,
                numeroRecu,
                recu.montantAbonnementTTC().toPlainString(),
                recu.fraisCarteTTC().toPlainString(),
                recu.montantRecu().toPlainString()
        );
    }
}
