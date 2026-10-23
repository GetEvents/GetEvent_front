"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./style.module.scss";

const STORAGE_KEY = "getevent_app_launched";

export default function AppSplashScreen() {
  const [showSplash, setShowSplash] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Vérifier si l'application a déjà été ouverte dans cette session
    const hasLaunched = sessionStorage.getItem(STORAGE_KEY) === "true";
    if (hasLaunched) return;

    sessionStorage.setItem(STORAGE_KEY, "true");

    const showTimer = setTimeout(() => {
      setShowSplash(true);
    }, 0);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 650);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1050);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className={`${styles.splashOverlay} ${isFadingOut ? styles.fadeOut : ""}`}
      aria-hidden="true"
    >
      <div className={styles.logoWrapper}>
        <Image
          src="/flashicon.png"
          alt="GetEvent"
          width={48}
          height={48}
          priority
        />
      </div>
    </div>
  );
}
