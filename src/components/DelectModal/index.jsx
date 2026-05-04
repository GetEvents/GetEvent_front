"use client";

import styles from "./style.module.scss";
import React from "react";

export default function DelectModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-modal-title"
      >
        <h3 id="delete-event-modal-title">Confirmer la suppression</h3>
        <p>
          Voulez-vous vraiment supprimer l&apos;evenement
          {eventTitle ? ` "${eventTitle}"` : ""} ?
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
