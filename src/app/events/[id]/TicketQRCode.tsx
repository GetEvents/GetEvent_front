"use client";

import { QRCodeSVG } from "qrcode.react";
import styles from "./TicketQRCode.module.scss";

interface TicketQRCodeProps {
  value: string;
}

export default function TicketQRCode({ value }: TicketQRCodeProps) {
  return (
    <div className={styles.ticket}>
      <p className={styles.title}>Votre billet</p>
      <div className={styles.code}>
        <QRCodeSVG
          value={value}
          size={180}
          level="H"
          marginSize={2}
          title="QR code de votre billet"
        />
      </div>
      <p className={styles.hint}>Présentez ce QR code à l’entrée.</p>
    </div>
  );
}
