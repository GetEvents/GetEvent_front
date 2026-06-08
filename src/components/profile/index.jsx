"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { getUser } from "@/actions/auth/authAction";
import styles from "./style.module.scss";

export default function Profil() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getUser()
      .then((response) => {
        if (isMounted) {
          if (response?.user) {
            setCurrentUser(response.user);
          } else {
            setError("Impossible de récupérer les informations de profil");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        if (isMounted) {
          setError("Erreur réseau");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0b5ed7, #4e92ff)",
                color: "white",
                fontSize: "3rem",
                fontWeight: "bold",
              }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className={styles.infouser}>
          <p className={styles.infousername}>
            {currentUser.nom} <br /> {currentUser.prenom}
          </p>
          <p className={styles.infousermail}>{currentUser.email}</p>
          {currentUser.role && (
            <span
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.2rem 0.8rem",
                background: "#e0f2fe",
                color: "#0284c7",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {currentUser.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
