"use client";

import { useEffect, useId, useRef, useState } from "react";
import { validateTicketQrCode } from "@/actions/participant";
import type { Html5QrcodeScanner } from "html5-qrcode";
import styles from "./TicketQRCodeLecteur.module.scss";

type ScanResult = {
  error: boolean;
  message: string;
};

interface TicketQRCodeLecteurProps {
  eventId: number;
}

export default function TicketQRCodeLecteur({
  eventId,
}: TicketQRCodeLecteurProps) {
  const reactId = useId();
  const scannerId = `ticket-reader-${reactId.replaceAll(":", "")}`;
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessingRef = useRef(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const startScanner = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      if (isDisposed) return;

      const scanner = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false,
      );

      scannerRef.current = scanner;
      scanner.render(async (decodedText) => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        setResult(null);

        try {
          scanner.pause(true);
        } catch {
          // Le scanner peut changer d'état entre la détection et la pause.
        }

        try {
          const response = await validateTicketQrCode(decodedText, eventId);

          if (!isDisposed) {
            setResult(response);
          }
        } catch {
          if (!isDisposed) {
            setResult({
              error: true,
              message: "Impossible de valider ce billet.",
            });
          }
        }
      }, undefined);
    };

    void startScanner().catch(() => {
      if (!isDisposed) {
        setResult({
          error: true,
          message: "Impossible de démarrer le lecteur QR.",
        });
      }
    });

    return () => {
      isDisposed = true;
      isProcessingRef.current = false;

      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        void scanner.clear().catch(() => undefined);
      }
    };
  }, [eventId, scannerId]);

  const scanAnotherTicket = () => {
    setResult(null);
    isProcessingRef.current = false;

    try {
      scannerRef.current?.resume();
    } catch {
      setResult({
        error: true,
        message: "Impossible de relancer la caméra. Rechargez la page.",
      });
    }
  };

  return (
    <section className={styles.scanner} aria-label="Lecteur de billets">
      <div id={scannerId} className={styles.reader} />

      {result && (
        <div
          className={`${styles.result} ${result.error ? styles.error : styles.success}`}
          role={result.error ? "alert" : "status"}
        >
          <p>{result.message}</p>
          <button type="button" onClick={scanAnotherTicket}>
            Scanner un autre billet
          </button>
        </div>
      )}
    </section>
  );
}
