"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Lock, Smartphone, Zap } from "lucide-react";
import FAQSection from "../FAQ";
import FeaturesSection from "../Features";
import ImpactSection from "../Impact";
import EventTypesSection from "../EventTypes";
import HowItWorksSection from "../HowItWorks";
import styles from "./layout.module.scss";

// Mots courts : en police d'affiche élargie, ils tiennent sur mobile.
const EVENT_TYPES = [
  "concerts",
  "festivals",
  "conférences",
  "matchs",
  "soirées",
  "ateliers",
];

const TRUST_ITEMS = [
  { icon: Smartphone, label: "Mobile Money" },
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: Zap, label: "Temps réel" },
];

export default function Home() {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  // Premier mot déjà écrit dans le HTML serveur : le titre est complet avant
  // le chargement du JavaScript, puis l'animation reprend normalement.
  const [typedEvent, setTypedEvent] = useState(EVENT_TYPES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Arrivée depuis une autre page sur /#how-it-works, /#faq… : Next.js tente
  // de défiler avant que la page (derrière loading.tsx) soit affichée, et
  // reste en haut. On défile donc vers l'ancre une fois la page montée.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Animation « machine à écrire » du mot en couleur.
  useEffect(() => {
    const currentEvent = EVENT_TYPES[activeEventIndex];
    let timeoutId;

    if (!isDeleting && typedEvent !== currentEvent) {
      timeoutId = setTimeout(() => {
        setTypedEvent(currentEvent.slice(0, typedEvent.length + 1));
      }, 60);
    } else if (!isDeleting && typedEvent === currentEvent) {
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, 1400);
    } else if (isDeleting && typedEvent.length > 0) {
      timeoutId = setTimeout(() => {
        setTypedEvent((prev) => prev.slice(0, -1));
      }, 45);
    } else {
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setActiveEventIndex((prev) => (prev + 1) % EVENT_TYPES.length);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [isDeleting, typedEvent, activeEventIndex]);

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.heroContent}>
        <div className={styles.heroTextCol}>
          <p className={styles.kicker}>
            <span className={styles.dot} aria-hidden="true" />
            Billetterie &amp; gestion d&apos;événements
          </p>

          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>Créez, gérez</span>
            <span className={styles.titleLine}>et remplissez vos</span>
            <span className={styles.typedLine}>
              {/* Lecteurs d'écran : un libellé stable plutôt que l'animation. */}
              <span className={styles.srOnly}>événements</span>
              <span className={styles.typedWord} aria-hidden="true">
                {typedEvent}
              </span>
              <span className={styles.typingCursor} aria-hidden="true" />
            </span>
          </h1>

          <p className={styles.description}>
            Billetterie, paiement Mobile Money, billets QR code et messagerie en
            temps réel : tout pour des événements sans friction.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/events/new" className={styles.primaryBtn}>
              Créer mon événement
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/events" className={styles.secondaryBtn}>
              Rejoindre un événement
            </Link>
          </div>

          <ul className={styles.trustBadges}>
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li key={label} className={styles.trustItem}>
                <Icon size={14} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sections de contenu */}
      <div className={styles.contentSections}>
        <section id="event-types">
          <EventTypesSection />
        </section>

        <section id="how-it-works">
          <HowItWorksSection />
        </section>

        <section id="features">
          <FeaturesSection />
        </section>

        <section id="impact">
          <ImpactSection />
        </section>

        <section id="faq">
          <FAQSection />
        </section>
      </div>
    </div>
  );
}
