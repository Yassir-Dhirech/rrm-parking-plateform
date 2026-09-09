package com.rrm.parking.notification.service;

public interface EmailEnvoiService {

    void envoyer(
            String destinataire,
            String nomDestinataire,
            String sujet,
            String contenuHtml
    );
}