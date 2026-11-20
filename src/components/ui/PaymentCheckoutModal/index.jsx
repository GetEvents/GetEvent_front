"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { openFedaPayCheckout } from "@/lib/fedapay-checkout";
import styles from "./style.module.scss";

const emptySubscribe = () => () => {};

const STEPS = [
  "Choisissez Mobile Money ou carte",
  "Validez le paiement sur votre téléphone",
  "Votre billet QR arrive dans « Mes billets »",
];

const formatAmount = (amount, currency) =>
  `${Number(amount || 0).toLocaleString("fr-FR")} ${currency || "XOF"}`;

/**
 * Modale de paiement aux couleurs de GetEvent : récapitulatif de la commande
 * (bloc sombre) et formulaire FedaPay intégré à côté. Le contenu du formulaire
 * reste celui de FedaPay (iframe) ; tout ce qui l'entoure est à nous.
 *
 * `onClose(outcome)` : "dismissed" (fermé sans payer) ou "redirected" (repli
 * sur la page FedaPay). Après un paiement réussi, le navigateur part vers le
 * retour backend, qui crée les billets.
 */
export default function PaymentCheckoutModal({ session, summary, onClose }) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const embedRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Bloque le défilement de la page tant que la modale est ouverte.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Monte le formulaire FedaPay dans le conteneur une fois la modale affichée.
  useEffect(() => {
    if (!isMounted || !embedRef.current) return undefined;
    let active = true;

    openFedaPayCheckout(session, { container: embedRef.current }).then(
      (outcome) => {
        if (!active) return;
        if (outcome === "completed") setStatus("completed");
        else onCloseRef.current?.(outcome);
      },
    );
    // Le formulaire FedaPay n'avertit pas de son chargement : on retire
    // l'indicateur après un court délai (l'iframe le recouvre de toute façon).
    const timer = window.setTimeout(() => {
      if (active) setStatus((s) => (s === "loading" ? "ready" : s));
    }, 2500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isMounted, session]);

  const isCompleted = status === "completed";

  useEffect(() => {
    if (isCompleted) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onCloseRef.current?.("dismissed");
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isCompleted]);

  if (!isMounted) return null;

  const quantity = summary?.quantity || 1;
  const total = (Number(summary?.unitPrice) || 0) * quantity;

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        {/* ---- Récapitulatif (bloc sombre) ---- */}
        <aside className={styles.recap}>
          <p className={styles.kicker}>
            <LockKeyhole size={13} aria-hidden="true" />
            Paiement sécurisé
          </p>
          <h2 id="payment-modal-title" className={styles.title}>
            {summary?.title || "Votre commande"}
          </h2>

          <dl className={styles.order}>
            <div>
              <dt>Billets</dt>
              <dd>× {quantity}</dd>
            </div>
            <div>
              <dt>Prix unitaire</dt>
              <dd>{formatAmount(summary?.unitPrice, summary?.currency)}</dd>
            </div>
          </dl>

          <div className={styles.total}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>
              {formatAmount(total, summary?.currency)}
            </span>
            <span className={styles.totalHint}>
              Hors frais de service FedaPay
            </span>
          </div>

          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step}>
                <span className={styles.stepNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className={styles.methods}>
            <span className={styles.method}>
              <Smartphone size={13} aria-hidden="true" />
              Mobile Money
            </span>
            <span className={styles.method}>
              <CreditCard size={13} aria-hidden="true" />
              Carte
            </span>
          </div>
        </aside>

        {/* ---- Formulaire FedaPay intégré ---- */}
        <section
          className={styles.checkout}
          aria-label="Formulaire de paiement"
        >
          <header className={styles.checkoutHeader}>
            <span className={styles.secured}>
              <ShieldCheck size={15} aria-hidden="true" />
              Opéré par FedaPay
            </span>
            {!isCompleted && (
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => onClose?.("dismissed")}
                aria-label="Fermer le paiement"
              >
                <X size={18} />
              </button>
            )}
          </header>

          <div className={styles.embedFrame}>
            {status === "loading" && (
              <div className={styles.loader} aria-live="polite">
                <Loader2 size={26} className={styles.spin} aria-hidden="true" />
                Chargement du paiement sécurisé…
              </div>
            )}
            <div ref={embedRef} className={styles.embed} />

            {isCompleted && (
              <div className={styles.done} aria-live="polite">
                <Loader2 size={30} className={styles.spin} aria-hidden="true" />
                <strong>Paiement reçu</strong>
                <span>Validation de vos billets en cours…</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}
