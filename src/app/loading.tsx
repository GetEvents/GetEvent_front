import React from "react";
import styles from "./loading.module.scss";

export default function RootLoading() {
  return (
    <div
      className={styles.topProgressTrack}
      role="progressbar"
      aria-label="Chargement de la page"
    >
      <div className={styles.topProgressBar} />
    </div>
  );
}
