"use client";

import { useEffect, useState } from "react";
import styles from "./PwaInstallPrompt.module.scss";
import Image from "next/image";

const DISMISS_KEY = "getevent-pwa-install-dismissed-at";
const DISMISS_DELAY = 1000 * 60 * 60 * 24 * 7;

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function isIosDevice() {
  if (typeof window === "undefined") return false;

  const platform = window.navigator.platform || "";
  const userAgent = window.navigator.userAgent || "";
  const isTouchMac =
    platform === "MacIntel" && window.navigator.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/.test(userAgent) || isTouchMac;
}

function wasRecentlyDismissed() {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);

  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_DELAY;
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (isStandaloneMode() || wasRecentlyDismissed()) return;

    const ios = isIosDevice();

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (ios) {
      const timer = window.setTimeout(() => {
        setIsIos(true);
        setVisible(true);
      }, 2500);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section
      className={styles.prompt}
      role="dialog"
      aria-live="polite"
      aria-label="Installer GetEvent"
    >
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          <Image
            src="/flashicon.png"
            alt="GetEvent"
            width={200}
            height={156}
            priority
            quality={500}
          />
        </div>
        <div className={styles.text}>
          <h2 className={styles.title}>Installer GetEvent</h2>
          <p className={styles.description}>
            Ajoutez GetEvent sur votre ecran d&apos;accueil pour ouvrir la
            plateforme plus rapidement comme une application.
          </p>

          {isIos && (
            <ol className={styles.iosSteps}>
              <li>Appuyez sur le bouton de partage dans Safari.</li>
              <li>Choisissez Sur l&apos;ecran d&apos;accueil.</li>
              <li>Validez avec Ajouter.</li>
            </ol>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {!isIos && installPrompt && (
          <button
            type="button"
            className={styles.installButton}
            onClick={install}
          >
            Installer
          </button>
        )}
        <button
          type="button"
          className={styles.dismissButton}
          onClick={dismiss}
        >
          Plus tard
        </button>
      </div>
    </section>
  );
}
