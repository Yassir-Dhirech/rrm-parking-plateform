package com.rrm.parking.security.entity;

import com.rrm.parking.security.enums.CodeRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "roles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_role_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private CodeRole code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permission",
            joinColumns = @JoinColumn(
                    name = "role_id",
                    foreignKey = @ForeignKey(name = "fk_role_permission_role")
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "permission_id",
                    foreignKey = @ForeignKey(name = "fk_role_permission_permission")
            ),
            uniqueConstraints = {
                    @UniqueConstraint(
                            name = "uk_role_permission",
                            columnNames = {"role_id", "permission_id"}
                    )
            }
    )
    private Set<Permission> permissions = new HashSet<>();

    public void ajouterPermission(Permission permission) {
        permissions.add(permission);
    }

    public void retirerPermission(Permission permission) {
        permissions.remove(permission);
    }
}