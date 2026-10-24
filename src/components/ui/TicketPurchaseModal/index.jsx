"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  CalendarDays,
  Clock,
  MapPin,
  Minus,
  Plus,
  Ticket,
  Users,
  X,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import styles from "./style.module.scss";

const emptySubscribe = () => () => {};

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  event,
  isLoading = false,
  alreadyRegisteredCount = 0,
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const isFree =
    !event.paymentRequired ||
    !event.paymentPrice ||
    Number(event.paymentPrice) === 0;

  const unitPrice = isFree ? 0 : Number(event.paymentPrice);
  const currency = event.currency || "XOF";
  const totalPrice = unitPrice * quantity;

  // Max places: default max 10 per purchase
  const maxPlaces = 10;

  const handleIncrement = () => {
    if (quantity < maxPlaces) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuickSelect = (num) => {
    setQuantity(Math.min(num, maxPlaces));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date à confirmer";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Date à confirmer";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (!Number.isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes(),
        ).padStart(2, "0")}`;
      }
    }
    const [h = "00", m = "00"] = timeString.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={isLoading ? undefined : onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
      >
        {/* Bouton Fermer */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          disabled={isLoading}
          aria-label="Fermer la fenêtre"
        >
          <X size={18} />
        </button>

        {/* En-tête */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Ticket size={24} />
          </div>
          <div>
            <h3 id="ticket-modal-title" className={styles.title}>
              {isFree ? "Participer à l'événement" : "Réserver des places"}
            </h3>
            <p className={styles.subtitle}>
              Achetez ou réservez pour vous et vos accompagnateurs
            </p>
          </div>
        </div>

        {/* Aperçu de l'événement */}
        <div className={styles.eventCardPreview}>
          <div className={styles.eventThumb}>
            <Image
              src={event.image || "/images/ev1.jpg"}
              alt={event.title}
              fill
              sizes="80px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.eventDetails}>
            <h4 className={styles.eventTitle}>{event.title}</h4>
            <div className={styles.metaRow}>
              <span className={styles.meta}>
                <CalendarDays size={13} />
                {formatDate(event.startDate)}
              </span>
              {event.startTime && (
                <span className={styles.meta}>
                  <Clock size={13} />
                  {formatTime(event.startTime)}
                </span>
              )}
            </div>
            {event.location && (
              <span className={styles.metaLocation}>
                <MapPin size={13} />
                <span>{event.location}</span>
              </span>
            )}
          </div>
        </div>

        {alreadyRegisteredCount > 0 && (
          <div className={styles.alreadyRegisteredNotice}>
            <Users size={15} />
            <span>
              Vous avez déjà {alreadyRegisteredCount} billet
              {alreadyRegisteredCount > 1 ? "s" : ""} enregistré
              {alreadyRegisteredCount > 1 ? "s" : ""}. Vous pouvez ajouter des
              places supplémentaires ci-dessous.
            </span>
          </div>
        )}

        {/* Sélecteur de quantité */}
        <div className={styles.quantitySection}>
          <div className={styles.quantityHeader}>
            <label className={styles.label}>Nombre de participants</label>
            <span className={styles.hint}>
              Chaque personne reçoit un QR Code unique
            </span>
          </div>

          <div className={styles.counterRow}>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={handleDecrement}
              disabled={quantity <= 1 || isLoading}
              aria-label="Diminuer le nombre de places"
            >
              <Minus size={18} />
            </button>

            <div className={styles.counterDisplay}>
              <span className={styles.counterValue}>{quantity}</span>
              <span className={styles.counterUnit}>
                {quantity > 1 ? "personnes" : "personne"}
              </span>
            </div>

            <button
              type="button"
              className={styles.counterBtn}
              onClick={handleIncrement}
              disabled={quantity >= maxPlaces || isLoading}
              aria-label="Augmenter le nombre de places"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Raccourcis rapides */}
          <div className={styles.quickSelectRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                type="button"
                key={num}
                className={`${styles.quickBtn} ${
                  quantity === num ? styles.active : ""
                }`}
                onClick={() => handleQuickSelect(num)}
                disabled={isLoading}
              >
                {num} {num === 1 ? "place" : "places"}
              </button>
            ))}
          </div>
        </div>

        {/* Récapitulatif du tarif */}
        <div className={styles.pricingSummary}>
          <div className={styles.priceRow}>
            <span>Prix unitaire</span>
            <span className={styles.priceUnitValue}>
              {isFree
                ? "Gratuit"
                : `${unitPrice.toLocaleString("fr-FR")} ${currency}`}
            </span>
          </div>

          <div className={styles.priceRow}>
            <span>Nombre de places</span>
            <span>× {quantity}</span>
          </div>

          <div className={`${styles.priceRow} ${styles.totalRow}`}>
            <span className={styles.totalLabel}>Total à régler</span>
            <span className={styles.totalValue}>
              {isFree
                ? "Gratuit"
                : `${totalPrice.toLocaleString("fr-FR")} ${currency}`}
            </span>
          </div>
        </div>

        {/* Note de réassurance */}
        <div className={styles.assuranceNote}>
          <ShieldCheck size={16} />
          <span>
            {isFree
              ? "Vos billets électroniques seront instantanément ajoutés à votre compte."
              : "Paiement 100% sécurisé via FedaPay (Mobile Money & Carte bancaire)."}
          </span>
        </div>

        {/* Boutons d'action */}
        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>

          <button
            type="button"
            className={styles.confirmButton}
            onClick={() => onConfirm(quantity)}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Traitement en cours...</span>
            ) : isFree ? (
              <span>
                Valider {quantity > 1 ? `les ${quantity} places` : "la place"}
              </span>
            ) : (
              <>
                <CreditCard size={18} />
                <span>
                  Payer {totalPrice.toLocaleString("fr-FR")} {currency}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!isMounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}
