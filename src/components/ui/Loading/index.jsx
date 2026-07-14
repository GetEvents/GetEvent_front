"use client";
import React from "react";
import styles from "./style.module.scss";

export default function Loading({ message = "Chargement..." }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner}>
          <div className={styles.spinnerInner} />
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
