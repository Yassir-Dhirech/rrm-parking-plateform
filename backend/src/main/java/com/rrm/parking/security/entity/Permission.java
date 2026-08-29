package com.rrm.parking.security.entity;

import com.rrm.parking.security.enums.CodePermission;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "permission",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_permission_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private CodePermission code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean active = true;
}