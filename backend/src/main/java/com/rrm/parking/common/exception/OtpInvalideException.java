package com.rrm.parking.common.exception;

public class OtpInvalideException
        extends RuntimeException {

  private final int tentativesRestantes;

  public OtpInvalideException(
          String message,
          int tentativesRestantes
  ) {
    super(message);
    this.tentativesRestantes =
            Math.max(0, tentativesRestantes);
  }

  public int getTentativesRestantes() {
    return tentativesRestantes;
  }

  public boolean estBloque() {
    return tentativesRestantes == 0;
  }
}