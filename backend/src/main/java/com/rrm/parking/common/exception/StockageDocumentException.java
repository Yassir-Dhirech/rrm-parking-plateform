package com.rrm.parking.common.exception;

public class StockageDocumentException
        extends RuntimeException {

    public StockageDocumentException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}