"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokenInCookie } from "@/actions/auth/authAction";
import ButtonComponent from "@/components/ui/button/button";
import Loading from "@/components/ui/Loading";
import styles from "./style.module.scss";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        // Vérifier les erreurs de redirection
        if (error) {
          setError(
            error === "access_denied"
              ? "Accès refusé à l'authentification"
              : "Erreur d'authentification",
          );
          setIsLoading(false);
          return;
        }

        // Vérifier la présence du token
        if (!token) {
          setError("Token d'authentification manquant");
          setIsLoading(false);
          return;
        }

        // Valider le token (format simple JWT check)
        if (typeof token !== "string" || token.split(".").length !== 3) {
          setError("Token invalide");
          setIsLoading(false);
          return;
        }

        // Sauvegarder le token
        await setTokenInCookie(token);

        // Rediriger vers les événements
        router.push("/events");
      } catch {
        setError("Une erreur est survenue lors du traitement du callback");
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <main className={styles.callbackPage}>
        <section className={styles.errorCard}>
          <h1 className={styles.errorTitle}>Erreur d&apos;authentification</h1>
          <p className={styles.errorMessage}>{error}</p>
          <ButtonComponent
            type="button"
            disabled={false}
            label="Retour à la connexion"
            onClick={() => router.push("/auth/login")}
            className={styles.loginButton}
          />
        </section>
      </main>
    );
  }

  return null;
}
