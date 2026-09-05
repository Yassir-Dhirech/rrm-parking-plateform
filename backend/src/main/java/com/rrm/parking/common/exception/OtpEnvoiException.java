package com.rrm.parking.common.exception;

public class OtpEnvoiException extends RuntimeException {

    public OtpEnvoiException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}