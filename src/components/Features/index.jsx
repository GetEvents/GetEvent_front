"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  MessageCircle,
  Search,
} from "lucide-react";
import styles from "./Features.module.scss";

const EVENT_FEATURES = [
  "Planification avancée",
  "Invitations automatiques",
  "Suivi en temps réel",
];

const NOTIFICATION_FEATURES = [
  "Notifications push",
  "Emails automatiques",
  "Alertes personnalisées",
];

const SEARCH_FEATURES = [
  "Recherche globale",
  "Filtrage avancé",
  "Suggestions intelligentes",
];

const MESSAGING_FEATURES = [
  "Messages instantanés",
  "Conversations de groupe",
  "Notifications temps réel",
];

const ANALYTICS_FEATURES = [
  "Métriques détaillées",
  "Tableaux de bord personnalisables",
  "Rapports temps réel",
];

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(sectionNode);
    return () => observer.disconnect();
  }, []);

  const visibleClass = isVisible ? styles.visible : "";

  return (
    <section ref={sectionRef} className={styles.featuresSection}>
      <div className={styles.container}>
        <header className={`${styles.header} ${visibleClass}`}>
          <div className={styles.headerContent}>
            <h2>Fonctionnalités</h2>
            <p>
              Tout ce dont vous avez besoin pour organiser efficacement vos
              événements en un seul endroit.
            </p>
          </div>

          {/* <div className={styles.pagination} aria-hidden="true">
            <span className={styles.activeDot} />
            <span />
            <span />
          </div> */}
        </header>

        <div className={styles.grid}>
          <article
            className={`${styles.card} ${styles.mainCard} ${visibleClass}`}
            style={{ "--delay": "80ms" }}
          >
            <div className={styles.cardTop}>
              <span className={`${styles.iconBox} ${styles.primaryIcon}`}>
                <CalendarCheck2 aria-hidden="true" />
              </span>
              <span className={styles.number}>1/5</span>
            </div>

            <h3>Création d&apos;Événements</h3>
            <p className={styles.description}>
              Créez, planifiez et gérez vos événements avec des outils
              puissants. Suivi en temps réel, invitations automatiques et
              gestion des participants simplifiée.
            </p>

            <ul className={`${styles.checkList} ${styles.eventCheckList}`}>
              {EVENT_FEATURES.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article
            className={`${styles.card} ${styles.notificationCard} ${visibleClass}`}
            style={{ "--delay": "180ms" }}
          >
            <div className={styles.cardTop}>
              <span className={`${styles.iconBox} ${styles.secondaryIcon}`}>
                <BellRing aria-hidden="true" />
              </span>
              <span className={styles.number}>2/5</span>
            </div>

            <h3>Système de Notifications</h3>
            <p className={styles.description}>
              Restez informé en temps réel. Notifications push, emails
              automatiques et alertes personnalisées pour tous vos événements.
            </p>

            <ul className={styles.checkList}>
              {NOTIFICATION_FEATURES.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article
            className={`${styles.card} ${styles.messagingCard} ${visibleClass}`}
            style={{ "--delay": "280ms" }}
          >
            <div className={styles.cardTop}>
              <span className={`${styles.iconBox} ${styles.neutralIcon}`}>
                <MessageCircle aria-hidden="true" />
              </span>
              <span className={styles.number}>3/5</span>
            </div>

            <h3>Messagerie</h3>
            <p className={styles.description}>
              Communiquez instantanément via Socket.IO pour une réactivité
              totale.
            </p>

            <ul className={styles.checkList}>
              {MESSAGING_FEATURES.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article
            className={`${styles.card} ${styles.searchCard} ${visibleClass}`}
            style={{ "--delay": "330ms" }}
          >
            <div className={styles.cardTop}>
              <span className={`${styles.iconBox} ${styles.searchIcon}`}>
                <Search aria-hidden="true" />
              </span>
              <span className={styles.number}>4/5</span>
            </div>

            <h3>Recherche Intelligente</h3>
            <p className={styles.description}>
              Trouvez instantanément ce que vous cherchez. Recherche globale,
              filtrage avancé et suggestions intelligentes.
            </p>

            <ul className={styles.checkList}>
              {SEARCH_FEATURES.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article
            className={`${styles.card} ${styles.analyticsCard} ${visibleClass}`}
            style={{ "--delay": "380ms" }}
          >
            <div className={styles.analyticsContent}>
              <div className={styles.analyticsCopy}>
                <div className={styles.cardTop}>
                  <span className={`${styles.iconBox} ${styles.successIcon}`}>
                    <BarChart3 aria-hidden="true" />
                  </span>
                  <span className={styles.number}>5/5</span>
                </div>

                <h3>Analytics &amp; Tableau de Bord</h3>
                <p className={styles.description}>
                  Analysez vos performances avec des métriques détaillées.
                  Tableaux de bord personnalisables et rapports en temps réel.
                </p>

                <ul
                  className={`${styles.checkList} ${styles.analyticsCheckList}`}
                >
                  {ANALYTICS_FEATURES.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.chart} aria-label="Aperçu des analytics">
                <span className={styles.barOne} />
                <span className={styles.barTwo} />
                <span className={styles.barThree} />
                <span className={styles.barFour} />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
