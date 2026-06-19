"use client";

import { useEffect, useMemo, useRef } from "react";
import { Check, Clock3, HelpCircle, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./style.module.scss";

type CallbackStatus = "success" | "pending" | "failed" | "unknown";

const REDIRECT_DELAY = 2500;

const normalizeStatus = (status: string | null): CallbackStatus => {
  if (status === "success") return "success";
  if (status === "pending") return "pending";
  if (status === "failed") return "failed";
  return "unknown";
};

export default function ParticipationCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = normalizeStatus(searchParams.get("status"));
  const transactionId =
    searchParams.get("transactionId") || searchParams.get("transaction_id");

  const modalInfo = useMemo(() => {
    switch (status) {
      case "success":
        return {
          icon: <Check size={34} aria-hidden="true" />,
          iconClass: styles.successIcon,
          title: "Inscription confirmée",
          titleClass: styles.successTitle,
          message:
            "Votre paiement a été validé et votre inscription est maintenant active.",
          actionLabel: "Voir mes participations",
          actionHref: "/participations",
        };

      case "pending":
        return {
          icon: <Clock3 size={34} aria-hidden="true" />,
          iconClass: styles.pendingIcon,
          title: "Paiement en attente",
          titleClass: styles.pendingTitle,
          message:
            "Votre paiement est en cours de vérification. Votre inscription sera confirmée automatiquement après validation.",
          actionLabel: "Retour aux événements",
          actionHref: "/events",
        };

      case "failed":
        return {
          icon: <X size={34} aria-hidden="true" />,
          iconClass: styles.errorIcon,
          title: "Paiement échoué",
          titleClass: styles.errorTitle,
          message:
            "Le paiement n'a pas été validé. Vous pouvez réessayer depuis la page de l'événement.",
          actionLabel: "Retour aux événements",
          actionHref: "/events",
        };

      default:
        return {
          icon: <HelpCircle size={34} aria-hidden="true" />,
          iconClass: styles.unknownIcon,
          title: "Statut indisponible",
          titleClass: styles.unknownTitle,
          message:
            "Nous n'avons pas pu déterminer l'état du paiement. Vérifiez vos participations ou réessayez plus tard.",
          actionLabel: "Voir mes participations",
          actionHref: "/participations",
        };
    }
  }, [status]);

  useEffect(() => {
    if (status !== "success") return;

    timeoutRef.current = setTimeout(() => {
      router.replace("/participations");
    }, REDIRECT_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router, status]);

  return (
    <main className={styles.callbackPage}>
      <section className={styles.card} aria-live="polite">
        <div className={`${styles.statusIcon} ${modalInfo.iconClass}`}>
          {modalInfo.icon}
        </div>

        <h1 className={modalInfo.titleClass}>{modalInfo.title}</h1>
        <p className={styles.message}>{modalInfo.message}</p>

        {transactionId && (
          <p className={styles.reference}>
            Référence transaction : <span>{transactionId}</span>
          </p>
        )}

        {status === "success" && (
          <p className={styles.redirectMessage}>
            Redirection vers vos participations...
          </p>
        )}

        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.replace(modalInfo.actionHref)}
        >
          {modalInfo.actionLabel}
        </button>
      </section>
    </main>
  );
}
