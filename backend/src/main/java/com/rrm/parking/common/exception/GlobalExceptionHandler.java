package com.rrm.parking.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RessourceIntrouvableException.class)
    public ResponseEntity<ProblemDetail> gererRessourceIntrouvable(
            RessourceIntrouvableException exception,
            HttpServletRequest request
    ) {
        return construireReponse(
                HttpStatus.NOT_FOUND,
                "Ressource introuvable",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(ConflitMetierException.class)
    public ResponseEntity<ProblemDetail> gererConflitMetier(
            ConflitMetierException exception,
            HttpServletRequest request
    ) {
        return construireReponse(
                HttpStatus.CONFLICT,
                "Conflit métier",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(OtpExpireException.class)
    public ResponseEntity<ProblemDetail> gererOtpExpire(
            OtpExpireException exception,
            HttpServletRequest request
    ) {
        return construireReponse(
                HttpStatus.GONE,
                "Code OTP expiré",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(OtpInvalideException.class)
    public ResponseEntity<ProblemDetail> gererOtpInvalide(
            OtpInvalideException exception,
            HttpServletRequest request
    ) {
        HttpStatus statut = exception.estBloque()
                ? HttpStatus.LOCKED
                : HttpStatus.BAD_REQUEST;

        ProblemDetail probleme = creerProbleme(
                statut,
                exception.estBloque()
                        ? "Validation OTP bloquée"
                        : "Code OTP invalide",
                exception.getMessage(),
                request
        );

        probleme.setProperty(
                "tentativesRestantes",
                exception.getTentativesRestantes()
        );

        return ResponseEntity
                .status(statut)
                .body(probleme);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> gererValidationDto(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> erreurs =
                new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(erreur ->
                        erreurs.putIfAbsent(
                                erreur.getField(),
                                erreur.getDefaultMessage()
                        )
                );

        ProblemDetail probleme = creerProbleme(
                HttpStatus.BAD_REQUEST,
                "Données invalides",
                "Un ou plusieurs champs sont invalides",
                request
        );

        probleme.setProperty("erreurs", erreurs);

        return ResponseEntity
                .badRequest()
                .body(probleme);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail>
    gererViolationContrainte(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        Map<String, String> erreurs =
                new LinkedHashMap<>();

        exception.getConstraintViolations()
                .forEach(violation ->
                        erreurs.putIfAbsent(
                                violation
                                        .getPropertyPath()
                                        .toString(),
                                violation.getMessage()
                        )
                );

        ProblemDetail probleme = creerProbleme(
                HttpStatus.BAD_REQUEST,
                "Données invalides",
                "Une contrainte de validation n'est pas respectée",
                request
        );

        probleme.setProperty("erreurs", erreurs);

        return ResponseEntity
                .badRequest()
                .body(probleme);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> gererArgumentInvalide(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {
        return construireReponse(
                HttpStatus.BAD_REQUEST,
                "Requête invalide",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> gererEtatInvalide(
            IllegalStateException exception,
            HttpServletRequest request
    ) {
        return construireReponse(
                HttpStatus.CONFLICT,
                "Opération impossible",
                exception.getMessage(),
                request
        );
    }

    private ResponseEntity<ProblemDetail> construireReponse(
            HttpStatus statut,
            String titre,
            String detail,
            HttpServletRequest request
    ) {
        ProblemDetail probleme = creerProbleme(
                statut,
                titre,
                detail,
                request
        );

        return ResponseEntity
                .status(statut)
                .body(probleme);
    }

    private ProblemDetail creerProbleme(
            HttpStatus statut,
            String titre,
            String detail,
            HttpServletRequest request
    ) {
        ProblemDetail probleme =
                ProblemDetail.forStatusAndDetail(
                        statut,
                        detail
                );

        probleme.setTitle(titre);
        probleme.setProperty(
                "date",
                LocalDateTime.now()
        );
        probleme.setProperty(
                "chemin",
                request.getRequestURI()
        );

        return probleme;
    }
}