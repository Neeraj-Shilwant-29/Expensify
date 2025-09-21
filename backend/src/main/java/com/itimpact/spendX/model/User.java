package com.itimpact.spendX.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
@Access(AccessType.FIELD)
public class User {
    @Id
    @Column(name = "userId") 
    private Long userId;
    @Column(name = "username")
    private String username;
     @Column(name = "email")
    private String email;
     @Column(name = "passwordHash")
    private String passwordHash;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
