"use client";
import Image from "next/image";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./style.module.scss";

export default function Profil() {
  const { user: currentUser, loading, error } = useAuth();

  if (loading) {
    return (
      <div className={styles.modifomulair}>
        <div style={{ padding: "2rem", color: "#0b5ed7" }}>
          Chargement du profil...
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className={styles.modifomulair}>
        <div style={{ padding: "2rem", color: "#dc3545" }}>
          {error || "Profil introuvable"}
        </div>
      </div>
    );
  }

  // Initiales pour l'avatar par défaut
  const initials = `${(currentUser.prenom?.[0] || "").toUpperCase()}${(currentUser.nom?.[0] || "").toUpperCase()}`;
  const roleLabel =
    currentUser.role === "ORGANISATEUR"
      ? "Organisateur"
      : currentUser.role === "ADMIN"
        ? "Administrateur"
        : "Participant";

  return (
    <div className={styles.modifomulair}>
      <div className={styles.profil}>
        <div className={styles.avatar}>
          {currentUser.photo ? (
            <Image
              src={currentUser.photo}
              alt={`Profile de ${currentUser.prenom}`}
              fill
              sizes="140px"
              className={styles.avatarImage}
              priority
            />
          ) : (
            <div className={styles.avatarFallback}>{initials}</div>
          )}
        </div>
        <div className={styles.infouser}>
          <p className={styles.infousername}>
            {currentUser.prenom} {currentUser.nom}
          </p>
          <p className={styles.infousermail}>{currentUser.email}</p>
          {currentUser.role && (
            <span className={styles.roleBadge}>{roleLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}
