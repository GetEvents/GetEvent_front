"use client";

import { CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./TicketQRCode.module.scss";

interface TicketQRCodeProps {
  value: string;
  status?: string;
}

export default function TicketQRCode({ value, status }: TicketQRCodeProps) {
  const isUsed = status === "USED";

  return (
    <div className={`${styles.ticket} ${isUsed ? styles.ticketUsed : ""}`}>
      <div className={styles.header}>
        <p className={styles.title}>Votre billet</p>
        {isUsed && (
          <span className={styles.statusBadge}>
            <CheckCircle2 aria-hidden="true" />
            Déjà validé
          </span>
        )}
      </div>
      <div className={`${styles.code} ${isUsed ? styles.codeUsed : ""}`}>
        <QRCodeSVG
          value={value}
          size={180}
          level="H"
          marginSize={2}
          title="QR code de votre billet"
        />
      </div>
      <p className={styles.hint}>
        {isUsed
          ? "Ce billet a déjà été validé à l’entrée de l’événement."
          : "Présentez ce QR code à l’entrée."}
      </p>
    </div>
  );
}
