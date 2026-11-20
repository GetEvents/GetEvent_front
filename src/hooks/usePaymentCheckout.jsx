"use client";

import { useCallback, useState } from "react";
import PaymentCheckoutModal from "@/components/ui/PaymentCheckoutModal";
import { useNotification } from "@/components/Notification/NotificationProvider";

/**
 * Paiement d'un événement payant dans la modale GetEvent (formulaire FedaPay
 * intégré). `startPayment(session, summary)` l'ouvre ; `paymentModal` est à
 * rendre dans le composant.
 *  - session : { paymentUrl, paymentTransactionId } renvoyés par le backend ;
 *  - summary : { title, quantity, unitPrice, currency } pour le récapitulatif.
 */
export function usePaymentCheckout() {
  const { notify } = useNotification();
  const [checkout, setCheckout] = useState(null);

  const startPayment = useCallback((session, summary) => {
    setCheckout({ session, summary });
  }, []);

  const handleClose = useCallback(
    (outcome) => {
      setCheckout(null);
      if (outcome === "dismissed")
        notify("Paiement annulé : aucun billet n'a été réservé.", "info");
      if (outcome === "redirected")
        notify("Redirection vers le paiement...", "info");
    },
    [notify],
  );

  const paymentModal = checkout ? (
    <PaymentCheckoutModal
      session={checkout.session}
      summary={checkout.summary}
      onClose={handleClose}
    />
  ) : null;

  return { startPayment, paymentModal };
}
