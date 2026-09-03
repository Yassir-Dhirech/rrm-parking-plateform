package com.rrm.parking.security.auth;

import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class UtilisateurPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String motDePasseHash;
    private final StatutUtilisateur statut;
    private final Set<GrantedAuthority> authorities;

    private UtilisateurPrincipal(
            Long id,
            String email,
            String motDePasseHash,
            StatutUtilisateur statut,
            Set<GrantedAuthority> authorities
    ) {
        this.id = id;
        this.email = email;
        this.motDePasseHash = motDePasseHash;
        this.statut = statut;
        this.authorities = authorities;
    }

    public static UtilisateurPrincipal depuis(Utilisateur utilisateur) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        utilisateur.getRoles().forEach(role -> {
            authorities.add(
                    new SimpleGrantedAuthority(
                            "ROLE_" + role.getCode().name()
                    )
            );

            role.getPermissions().forEach(permission ->
                    authorities.add(
                            new SimpleGrantedAuthority(
                                    permission.getCode().name()
                            )
                    )
            );
        });

        return new UtilisateurPrincipal(
                utilisateur.getId(),
                utilisateur.getEmail(),
                utilisateur.getMotDePasseHash(),
                utilisateur.getStatut(),
                authorities
        );
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return motDePasseHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return statut != StatutUtilisateur.BLOQUE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return statut != StatutUtilisateur.DESACTIVE;
    }
}