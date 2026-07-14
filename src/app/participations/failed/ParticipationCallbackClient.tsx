"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFinalizeParticipantPayment } from "@/hooks/useParticipants";
import Loading from "@/components/ui/Loading";
import styles from "./style.module.scss";

type CallbackStatus = "loading" | "success" | "error";

const REDIRECT_DELAY = 2000;

export default function ParticipationCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalizationPromiseRef = useRef<Promise<{
    error: boolean;
    message: string;
  }> | null>(null);
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState(
    "Finalisation de votre inscription...",
  );
  const { mutateAsync: finalizePayment } = useFinalizeParticipantPayment();

  useEffect(() => {
    let isActive = true;
    const sessionId = searchParams.get("transactionId");

    const finalizeParticipation = async () => {
      if (!sessionId) {
        setStatus("error");
        setMessage("Session de paiement invalide.");
        return;
      }

      finalizationPromiseRef.current ??= finalizePayment(sessionId);
      const result = await finalizationPromiseRef.current;

      if (!isActive) return;

      if (result.error) {
        setStatus("error");
        setMessage(result.message || "Erreur lors de l'inscription.");
        return;
      }

      setStatus("success");
      setMessage(result.message || "Redirection...");
      timeoutRef.current = setTimeout(() => {
        router.replace("/participations");
      }, REDIRECT_DELAY);
    };

    void finalizeParticipation();

    return () => {
      isActive = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [finalizePayment, router, searchParams]);

  return (
    <main className={styles.callbackPage}>
      <section className={styles.card} aria-live="polite">
        {status === "loading" && <Loading message={message} />}

        {status === "success" && (
          <>
            <div className={`${styles.statusIcon} ${styles.successIcon}`}>
              <Check size={34} aria-hidden="true" />
            </div>
            <h1 className={styles.successTitle}>Inscription confirmée</h1>
            <p className={styles.message}>{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className={`${styles.statusIcon} ${styles.errorIcon}`}>
              <X size={34} aria-hidden="true" />
            </div>
            <h1 className={styles.errorTitle}>Erreur d&apos;inscription</h1>
            <p className={styles.message}>{message}</p>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.replace("/events")}
            >
              Retour aux événements
            </button>
          </>
        )}
      </section>
    </main>
  );
}
