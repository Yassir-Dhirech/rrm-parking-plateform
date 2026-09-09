package com.rrm.parking.security.service;

import com.rrm.parking.security.auth.UtilisateurPrincipal;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UtilisateurDetailsService
        implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        String emailNormalise = email.trim().toLowerCase();

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailIgnoreCase(emailNormalise)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Identifiants incorrects"
                        )
                );

        return UtilisateurPrincipal.depuis(utilisateur);
    }
}