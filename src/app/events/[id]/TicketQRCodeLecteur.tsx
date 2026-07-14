"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { OnResultFunction } from "react-qr-reader";
import {
  participantKeys,
  useValidateTicketQrCode,
} from "@/hooks/useParticipants";
import styles from "./TicketQRCodeLecteur.module.scss";

const QrReader = dynamic(
  () => import("react-qr-reader").then((module) => module.QrReader),
  {
    ssr: false,
    loading: () => <p className={styles.loading}>Chargement de la caméra…</p>,
  },
);

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
  const queryClient = useQueryClient();
  const isProcessingRef = useRef(false);
  const lastScannedQrCodeRef = useRef<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const validationMutation = useValidateTicketQrCode();

  const processQrCode = (decodedText: string) => {
    setResult(null);
    validationMutation.mutate(
      { qrCode: decodedText, eventId },
      {
        onSuccess: (response) => {
          setResult(response);

          if (!response.error) {
            void queryClient.invalidateQueries({
              queryKey: participantKeys.byEvent(eventId),
            });
            void queryClient.invalidateQueries({
              queryKey: participantKeys.byUser(),
            });
          }
        },
        onError: () => {
          setResult({
            error: true,
            message: "Impossible de valider ce billet.",
          });
        },
        onSettled: () => {
          isProcessingRef.current = false;
        },
      },
    );
  };

  const handleResult: OnResultFunction = (scanResult, scanError) => {
    if (scanResult && !isProcessingRef.current) {
      const decodedText = scanResult.getText().trim();

      if (!decodedText) return;
      if (decodedText === lastScannedQrCodeRef.current) return;

      lastScannedQrCodeRef.current = decodedText;
      isProcessingRef.current = true;
      void processQrCode(decodedText);
      return;
    }

    if (
      scanError &&
      ["NotAllowedError", "NotReadableError"].includes(scanError.name) &&
      !isProcessingRef.current
    ) {
      isProcessingRef.current = true;
      setResult({
        error: true,
        message: "La caméra est inaccessible. Vérifiez ses autorisations.",
      });
    }
  };

  return (
    <section className={styles.scanner} aria-label="Lecteur de billets">
      <div className={styles.reader}>
        <QrReader
          constraints={{ facingMode: { ideal: "environment" } }}
          onResult={handleResult}
          scanDelay={500}
          videoId={`ticket-camera-${eventId}`}
          className={styles.qrReader}
        />
      </div>

      {result && (
        <div
          className={`${styles.result} ${result.error ? styles.error : styles.success}`}
          role={result.error ? "alert" : "status"}
        >
          <p>{result.message}</p>
          <span className={styles.scanHint}>
            Présentez le billet suivant à la caméra.
          </span>
        </div>
      )}
    </section>
  );
}
