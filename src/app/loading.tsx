import React from "react";
import Image from "next/image";
import styles from "./loading.module.scss";

export default function RootLoading() {
  return (
    <div
      className={styles.loadingContainer}
      aria-label="Chargement de GetEvent"
    >
      <div className={styles.logoWrapper}>
        <Image
          src="/flashicon.png"
          alt="GetEvent Logo"
          width={44}
          height={44}
          priority
        />
      </div>
      <div className={styles.spinner} role="status" aria-hidden="true" />
    </div>
  );
}
