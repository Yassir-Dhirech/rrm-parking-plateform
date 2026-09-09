package com.rrm.parking.document.service;

public record FichierStocke(
        String nomFichierOriginal,
        String storageKey,
        String typeMime,
        Long tailleOctets,
        String checksumSha256
) {
}