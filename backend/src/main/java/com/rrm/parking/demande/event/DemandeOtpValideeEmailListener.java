package com.rrm.parking.demande.event;

import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
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
public class DemandeOtpValideeEmailListener {


    private final EmailEnvoiService emailEnvoiService;

    @Value("${app.integration.brevo.enabled:false}")
    private boolean brevoEnabled;

    @PostConstruct
    void verifierConfiguration() {
        log.info(
                "Configuration Brevo activée : {}",
                brevoEnabled
        );

    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void envoyerConfirmation(
            DemandeOtpValideeEvent evenement
    ) {
        log.info(
                "Listener OTP déclenché pour la demande {}",
                evenement.reference()
        );
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.nomComplet(),
                    "Confirmation de votre demande "
                            + evenement.reference(),
                    construireContenu(evenement)
            );

        } catch (RuntimeException exception) {
            log.error(
                    "Échec de l'email de confirmation pour la demande {}",
                    evenement.reference(),
                    exception
            );
        }
    }

    private String construireContenu(
            DemandeOtpValideeEvent evenement
    ) {
        String nom = HtmlUtils.htmlEscape(
                evenement.nomComplet()
        );

        String reference = HtmlUtils.htmlEscape(
                evenement.reference()
        );

        String parking = HtmlUtils.htmlEscape(
                evenement.parkingNom()
        );

        String adresse = HtmlUtils.htmlEscape(
                evenement.parkingAdresse()
        );

        String forfait = HtmlUtils.htmlEscape(
                evenement.forfaitLibelle()
        );

        String modePaiement = HtmlUtils.htmlEscape(
                evenement.modePaiement()
                        .replace('_', ' ')
        );

        String montant = evenement
                .montantTotalTtc()
                .toPlainString();

        String dateLimite = evenement
                .dateLimitePaiement()
                .format(
                        DateTimeFormatter.ofPattern(
                                "dd/MM/yyyy"
                        )
                );

        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport"
                      content="width=device-width, initial-scale=1.0">
                <title>Confirmation de demande RRM</title>
            </head>

            <body style="
                margin:0;
                padding:0;
                background-color:#f1f5f9;
                font-family:Arial,Helvetica,sans-serif;
                color:#0f172a;
            ">

                <div style="
                    display:none;
                    max-height:0;
                    overflow:hidden;
                    color:transparent;
                ">
                    Votre demande RRM %s a été confirmée.
                </div>

                <table role="presentation"
                       width="100%%"
                       cellspacing="0"
                       cellpadding="0"
                       border="0"
                       style="background-color:#f1f5f9;
                              padding:30px 12px;">

                    <tr>
                        <td align="center">

                            <table role="presentation"
                                   width="640"
                                   cellspacing="0"
                                   cellpadding="0"
                                   border="0"
                                   style="
                                       width:100%%;
                                       max-width:640px;
                                       background-color:#ffffff;
                                       border-radius:14px;
                                       overflow:hidden;
                                       box-shadow:0 4px 16px rgba(15,23,42,0.10);
                                   ">

                                <tr>
                                    <td style="
                                        padding:28px 32px;
                                        background-color:#075985;
                                        color:#ffffff;
                                    ">
                                        <div style="
                                            font-size:13px;
                                            font-weight:bold;
                                            letter-spacing:1px;
                                            text-transform:uppercase;
                                            color:#bae6fd;
                                            margin-bottom:8px;
                                        ">
                                            Rabat Région Mobilité
                                        </div>

                                        <div style="
                                            font-size:25px;
                                            font-weight:bold;
                                            line-height:1.3;
                                        ">
                                            Demande confirmée
                                        </div>

                                        <div style="
                                            margin-top:8px;
                                            font-size:15px;
                                            color:#e0f2fe;
                                        ">
                                            Votre code OTP a été validé avec succès.
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:32px;">

                                        <p style="
                                            margin:0 0 18px;
                                            font-size:16px;
                                            line-height:1.6;
                                        ">
                                            Bonjour <strong>%s</strong>,
                                        </p>

                                        <p style="
                                            margin:0 0 24px;
                                            color:#475569;
                                            font-size:15px;
                                            line-height:1.7;
                                        ">
                                            Votre demande d’abonnement parking
                                            a été enregistrée et confirmée.
                                            Conservez la référence suivante pour
                                            effectuer le suivi et le paiement.
                                        </p>

                                        <div style="
                                            padding:18px;
                                            margin-bottom:25px;
                                            border:1px solid #bae6fd;
                                            border-radius:10px;
                                            background-color:#f0f9ff;
                                            text-align:center;
                                        ">
                                            <div style="
                                                margin-bottom:7px;
                                                color:#64748b;
                                                font-size:12px;
                                                font-weight:bold;
                                                letter-spacing:1px;
                                                text-transform:uppercase;
                                            ">
                                                Référence de la demande
                                            </div>

                                            <div style="
                                                color:#0369a1;
                                                font-size:22px;
                                                font-weight:bold;
                                                letter-spacing:1px;
                                            ">
                                                %s
                                            </div>
                                        </div>

                                        <h2 style="
                                            margin:0 0 15px;
                                            font-size:18px;
                                            color:#0f172a;
                                        ">
                                            Récapitulatif
                                        </h2>

                                        <table role="presentation"
                                               width="100%%"
                                               cellspacing="0"
                                               cellpadding="0"
                                               border="0"
                                               style="
                                                   border:1px solid #e2e8f0;
                                                   border-radius:10px;
                                                   border-collapse:separate;
                                                   overflow:hidden;
                                               ">

                                            <tr>
                                                <td style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    color:#64748b;
                                                    font-size:14px;
                                                ">
                                                    Parking
                                                </td>
                                                <td align="right" style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    font-size:14px;
                                                    font-weight:bold;
                                                ">
                                                    %s
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    color:#64748b;
                                                    font-size:14px;
                                                ">
                                                    Adresse
                                                </td>
                                                <td align="right" style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    font-size:14px;
                                                ">
                                                    %s
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    color:#64748b;
                                                    font-size:14px;
                                                ">
                                                    Forfait
                                                </td>
                                                <td align="right" style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    font-size:14px;
                                                    font-weight:bold;
                                                ">
                                                    %s
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    color:#64748b;
                                                    font-size:14px;
                                                ">
                                                    Durée
                                                </td>
                                                <td align="right" style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    font-size:14px;
                                                    font-weight:bold;
                                                ">
                                                    %d mois
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    color:#64748b;
                                                    font-size:14px;
                                                ">
                                                    Mode de paiement
                                                </td>
                                                <td align="right" style="
                                                    padding:13px 16px;
                                                    border-bottom:1px solid #e2e8f0;
                                                    font-size:14px;
                                                    font-weight:bold;
                                                ">
                                                    %s
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="
                                                    padding:16px;
                                                    background-color:#ecfdf5;
                                                    color:#047857;
                                                    font-size:15px;
                                                    font-weight:bold;
                                                ">
                                                    Montant total TTC
                                                </td>
                                                <td align="right" style="
                                                    padding:16px;
                                                    background-color:#ecfdf5;
                                                    color:#047857;
                                                    font-size:20px;
                                                    font-weight:bold;
                                                ">
                                                    %s DH
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="
                                            margin-top:24px;
                                            padding:18px;
                                            border-left:4px solid #f59e0b;
                                            border-radius:6px;
                                            background-color:#fffbeb;
                                        ">
                                            <div style="
                                                margin-bottom:7px;
                                                color:#92400e;
                                                font-size:14px;
                                                font-weight:bold;
                                            ">
                                                Paiement avant le %s
                                            </div>

                                            <div style="
                                                color:#78350f;
                                                font-size:13px;
                                                line-height:1.6;
                                            ">
                                                Présentez-vous au parking choisi
                                                avec cette référence ou votre CIN.
                                                Sans paiement avant cette date,
                                                la demande sera marquée comme expirée.
                                            </div>
                                        </div>

                                        <p style="
                                            margin:25px 0 0;
                                            color:#475569;
                                            font-size:14px;
                                            line-height:1.7;
                                        ">
                                            Ce message confirme uniquement
                                            l’enregistrement de votre demande.
                                            L’abonnement sera activé après le
                                            traitement administratif prévu.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:22px 32px;
                                        background-color:#0f172a;
                                        color:#cbd5e1;
                                        text-align:center;
                                        font-size:12px;
                                        line-height:1.6;
                                    ">
                                        Rabat Région Mobilité — RRM<br>
                                        Message automatique, merci de ne pas répondre.
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(
                reference,
                nom,
                reference,
                parking,
                adresse,
                forfait,
                evenement.dureeEnMois(),
                modePaiement,
                montant,
                dateLimite
        );
    }


}