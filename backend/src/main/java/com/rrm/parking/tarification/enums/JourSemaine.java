package com.rrm.parking.tarification.enums;

import java.time.DayOfWeek;

public enum JourSemaine {
    LUNDI,
    MARDI,
    MERCREDI,
    JEUDI,
    VENDREDI,
    SAMEDI,
    DIMANCHE;

    public static JourSemaine depuis(DayOfWeek jour) {
        return switch (jour) {
            case MONDAY -> LUNDI;
            case TUESDAY -> MARDI;
            case WEDNESDAY -> MERCREDI;
            case THURSDAY -> JEUDI;
            case FRIDAY -> VENDREDI;
            case SATURDAY -> SAMEDI;
            case SUNDAY -> DIMANCHE;
        };
    }
}