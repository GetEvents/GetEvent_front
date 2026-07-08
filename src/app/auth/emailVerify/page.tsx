"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConfirmeEmail } from "@/hooks/useAuthMutations";
import ButtonComponent from "@/components/ui/button/button";
import Loading from "@/components/ui/Loading";
import styles from "../callback/style.module.scss";

export default function EmailVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending, mutateAsync } = useConfirmeEmail();
  const hasVerified = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEmailVerification = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      const token = searchParams.get("token");

      if (!token) {
        setError("Token de verification manquant.");
        return;
      }

      try {
        const result = await mutateAsync(token);

        if (result.error) {
          setError(result.message);
          return;
        }

        setMessage(result.message);
      } catch {
        setError("Une erreur est survenue pendant la confirmation.");
      }
    };

    handleEmailVerification();
  }, [mutateAsync, searchParams]);

  if (isPending && !message && !error) {
    return <Loading message="Confirmation de votre email..." />;
  }

  return (
    <main className={styles.callbackPage}>
      <section className={styles.errorCard}>
        <h1 className={styles.errorTitle}>
          {error ? "Confirmation impossible" : "Email confirme"}
        </h1>
        <p className={styles.errorMessage}>
          {error || message || "Votre adresse email a ete confirmee."}
        </p>
        <ButtonComponent
          type="button"
          disabled={false}
          label={error ? "Retour a l'inscription" : "Voir les evenements"}
          onClick={() => router.push(error ? "/auth/register" : "/events")}
          className={styles.loginButton}
        />
      </section>
    </main>
  );
}
