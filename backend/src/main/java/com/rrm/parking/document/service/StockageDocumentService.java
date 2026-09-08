package com.rrm.parking.document.service;

import org.springframework.web.multipart.MultipartFile;

public interface StockageDocumentService {

    FichierStocke stocker(
            MultipartFile fichier,
            String dossier
    );

    void supprimerSiExiste(String storageKey);
}