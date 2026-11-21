"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConfirmeEmail } from "@/hooks/useAuthMutations";
import ButtonComponent from "@/components/ui/button/button";
import Loading from "@/components/ui/Loading";
import styles from "./style.module.scss";

function EmailVerifyContent() {
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
        setError("Lien de vérification incomplet : le jeton est manquant.");
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
          {error ? "Confirmation impossible" : "E-mail confirmé"}
        </h1>
        <p className={styles.errorMessage}>
          {error || message || "Votre adresse e-mail a été confirmée."}
        </p>
        <ButtonComponent
          type="button"
          disabled={false}
          label={error ? "Retour à l'inscription" : "Voir les événements"}
          onClick={() => router.push(error ? "/auth/register" : "/events")}
          className={styles.loginButton}
        />
      </section>
    </main>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<Loading message="Confirmation de votre email..." />}>
      <EmailVerifyContent />
    </Suspense>
  );
}
