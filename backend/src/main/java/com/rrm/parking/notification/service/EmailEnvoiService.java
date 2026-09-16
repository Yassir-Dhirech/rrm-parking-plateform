package com.rrm.parking.notification.service;

public interface EmailEnvoiService {

    void envoyer(
            String destinataire,
            String nomDestinataire,
            String sujet,
            String contenuHtml
    );

    void envoyerAvecPieceJointe(
            String destinataire,
            String nomDestinataire,
            String sujet,
            String contenuHtml,
            byte[] contenuPieceJointe,
            String nomPieceJointe
    );
}
