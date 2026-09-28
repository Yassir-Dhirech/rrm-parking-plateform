package com.rrm.parking.audit.controller;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.security.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listerTousLesLogs() {
        return auditLogRepository
                .findAllByOrderByDateEvenementDesc(PageRequest.of(0, 500))
                .getContent()
                .stream()
                .map(l -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", l.getId().toString());
                    map.put("timestamp", l.getDateEvenement().toString());
                    map.put("utilisateurId", l.getActeur() != null ? l.getActeur().getId().toString() : "");
                    map.put("utilisateurEmail", l.getActeur() != null ? l.getActeur().getEmail() : (l.getIdentifiantActeur() != null ? l.getIdentifiantActeur() : "Système"));
                    
                    String roleStr = "ADMIN_SI";
                    if (l.getActeur() != null && l.getActeur().getRoles() != null && !l.getActeur().getRoles().isEmpty()) {
                        Role r = l.getActeur().getRoles().iterator().next();
                        roleStr = r.getCode() != null ? r.getCode().name() : "AGENT";
                    }
                    map.put("role", roleStr);
                    map.put("action", l.getTypeAction() != null ? l.getTypeAction().name() : "ACTION");
                    map.put("entite", l.getTypeObjet() != null ? l.getTypeObjet() : (l.getParking() != null ? "PARKING" : "SÉCURITÉ"));
                    map.put("entiteId", l.getReferenceObjet() != null ? l.getReferenceObjet() : "");
                    map.put("adresseIp", l.getAdresseIp() != null ? l.getAdresseIp() : "127.0.0.1");
                    map.put("details", l.getMessage() != null ? l.getMessage() : (l.getDetailsTechniques() != null ? l.getDetailsTechniques() : ""));
                    return map;
                })
                .toList();
    }
}
