"use client";
import { useEffect, useRef, useState, React } from "react";
import Link from "next/link";
import FAQSection from "../FAQ";
import FeaturesSection from "../Features";
import ImpactSection from "../Impact";
import EventTypesSection from "../EventTypes";
import styles from "./layout.module.scss";

const EVENT_TYPES = [
  "concerts",
  "shows",
  "spectacles",
  "matchs de football",
  "événements gastronomiques",
];

export default function Home() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [isBadgesVisible, setIsBadgesVisible] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [typedEvent, setTypedEvent] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const badgesRef = useRef(null);

  useEffect(() => {
    const observerOptions = { threshold: 0.2 };

    const heroObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsHeroVisible(true);
        heroObserver.disconnect();
      }
    }, observerOptions);

    const ctaObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsCtaVisible(true);
        ctaObserver.disconnect();
      }
    }, observerOptions);

    const badgesObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsBadgesVisible(true);
        badgesObserver.disconnect();
      }
    }, observerOptions);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (ctaRef.current) ctaObserver.observe(ctaRef.current);
    if (badgesRef.current) badgesObserver.observe(badgesRef.current);

    return () => {
      heroObserver.disconnect();
      ctaObserver.disconnect();
      badgesObserver.disconnect();
    };
  }, []);

  // Animation typewriter events
  useEffect(() => {
    if (!isHeroVisible) return;

    const currentEvent = EVENT_TYPES[activeEventIndex];
    let timeoutId;

    if (!isDeleting && typedEvent !== currentEvent) {
      timeoutId = setTimeout(() => {
        setTypedEvent(currentEvent.slice(0, typedEvent.length + 1));
      }, 50);
    } else if (!isDeleting && typedEvent === currentEvent) {
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, 1100);
    } else if (isDeleting && typedEvent.length > 0) {
      timeoutId = setTimeout(() => {
        setTypedEvent((prev) => prev.slice(0, -1));
      }, 55);
    } else {
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setActiveEventIndex((prev) => (prev + 1) % EVENT_TYPES.length);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [isHeroVisible, isDeleting, typedEvent, activeEventIndex]);

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.heroContent}>
        <div className={styles.heroSplit}>
          {/* Left Column — Text Content */}
          <div className={styles.heroTextCol}>
            {/* Modern Glass Badge */}
            <div className={styles.badgeWrap}>
              <div
                className={`${styles.glassBadge} ${isHeroVisible ? styles.badgeVisible : ""}`}
              >
                <span className={styles.dot}></span>
                <span>
                  Plateforme de gestion d&apos;événements nouvelle génération
                </span>
              </div>
            </div>

            {/* Hero Headlines */}
            <div ref={heroRef} className={styles.heroHeadingWrap}>
              <h1
                className={`${styles.heroTitle} ${isHeroVisible ? styles.titleVisible : ""}`}
              >
                Créez, gérez et connectez vos
                <br />
                <span className={styles.eventCarousel} aria-live="polite">
                  <span className={styles.eventItem}>{typedEvent}</span>
                  <span
                    className={styles.typingCursor}
                    aria-hidden="false"
                  ></span>
                </span>
              </h1>
            </div>

            {/* Persuasive Description */}
            <div
              className={`${styles.description} ${isHeroVisible ? styles.descriptionVisible : ""}`}
            >
              <p>
                Billetterie intelligente + networking en temps réel pour des
                événements sans friction.
              </p>
            </div>

            {/* Impactful CTAs */}
            <div
              ref={ctaRef}
              className={`${styles.ctaGroup} ${isCtaVisible ? styles.ctaVisible : ""}`}
            >
              <Link href="/events/create" className={styles.primaryBtn}>
                <span className={styles.btnIcon}>🚀</span>
                Créer mon événement
              </Link>
              <Link href="/events" className={styles.secondaryBtn}>
                <span className={styles.btnIcon}>🎫</span>
                Rejoindre un événement
              </Link>
            </div>

            {/* Search Bar */}
            {/* <div className={`${styles.searchBarWrap} ${isCtaVisible ? styles.searchBarVisible : ""}`}>
              <div className={styles.searchBar}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Entrer un code d'événement"
                  className={styles.searchInput}
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                />
                <span className={styles.searchCode}>9A3-HXK</span>
                <button className={styles.searchBtn} aria-label="Rechercher">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </div> */}

            {/* Trust Badges */}
            <div
              ref={badgesRef}
              className={`${styles.trustBadges} ${isBadgesVisible ? styles.badgesVisible : ""}`}
            >
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>⭐</span>
                <span>4.8/5</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🔒</span>
                <span>Paiement sécurisé</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>⚡</span>
                <span>Temps réel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className={styles.contentSections}>
        <section id="event-types">
          <EventTypesSection />
        </section>

        <section id="features" className={styles.featuresSectionBg}>
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
