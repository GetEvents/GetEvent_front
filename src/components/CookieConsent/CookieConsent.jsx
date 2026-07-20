"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./CookieConsent.module.scss";

const COOKIE_NAME = "getevent_cookie_consent";
const MAX_AGE = 60 * 60 * 24 * 180;

function readConsent() {
  if (typeof document === "undefined") return null;
  const prefix = `${COOKIE_NAME}=`;
  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

function saveConsent(optionalCookies) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const value = JSON.stringify({ necessary: true, optional: optionalCookies });
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
  window.dispatchEvent(
    new CustomEvent("cookie-consent-change", {
      detail: { necessary: true, optional: optionalCookies },
    }),
  );
}

export default function CookieConsent({ hasMobileSidebar = false }) {
  // Toujours false au premier rendu (serveur ET client) pour éviter tout mismatch d'hydratation
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setVisible(!readConsent());
    });

    return () => {
      active = false;
    };
  }, []);

  const choose = (optionalCookies) => {
    saveConsent(optionalCookies);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section
      className={`${styles.banner} ${hasMobileSidebar ? styles.withMobileSidebar : ""}`}
      aria-label="Gestion des cookies"
    >
      <div className={styles.content}>
        <h2>Vos préférences de cookies</h2>
        <p>
          GetEvent utilise des cookies nécessaires pour sécuriser votre session.
          Les cookies optionnels ne sont activés qu’avec votre accord.{" "}
          <Link href="/legal/privacy-policy">En savoir plus</Link>
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => choose(false)}
        >
          Refuser les optionnels
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => choose(true)}
        >
          Tout accepter
        </button>
      </div>
    </section>
  );
}

export { COOKIE_NAME, readConsent };
