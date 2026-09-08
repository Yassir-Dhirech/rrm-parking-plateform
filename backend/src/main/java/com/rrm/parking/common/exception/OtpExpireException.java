package com.rrm.parking.common.exception;

public class OtpExpireException
        extends RuntimeException {

    public OtpExpireException(String message) {
        super(message);
    }
}