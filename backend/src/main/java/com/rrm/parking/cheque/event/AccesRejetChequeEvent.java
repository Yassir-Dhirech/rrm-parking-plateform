package com.rrm.parking.cheque.event;

public record AccesRejetChequeEvent(
        String email, String clientNom, String abonnementReference, boolean accesRetabli
) {}
