"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Impact.module.scss";

export default function ImpactSection() {
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
    <section ref={sectionRef} className={styles.impactSection}>
      <div className={styles.backgroundEffects} aria-hidden="true">
        <span className={styles.centerGlow} />
        <span className={styles.topGlow} />
        <span className={styles.bottomGlow} />
      </div>

      <div className={styles.container}>
        <header className={`${styles.header} ${visibleClass}`}>
          <h2>Pourquoi GetEvent ?</h2>
          <p>
            Ce que la plateforme fait concrètement pour vos événements, de la
            réservation jusqu&apos;à l&apos;entrée.
          </p>
        </header>

        <div className={styles.grid}>
          <article
            className={`${styles.statCard} ${styles.timeCard} ${visibleClass}`}
            style={{ "--delay": "80ms" }}
          >
            <div className={styles.timeCopy}>
              <Image
                src="/stopwatch.png"
                alt=""
                width={40}
                height={40}
                className={styles.statIcon}
                aria-hidden="true"
              />
              <strong className={styles.heroValue}>QR</strong>
              <h3>Billets numériques</h3>
              <p>
                Chaque place réservée génère un billet avec un QR code unique,
                validé à l&apos;entrée par l&apos;organisateur.
              </p>
            </div>

            <div className={styles.miniChart} aria-hidden="true">
              <span className={styles.shortBar} />
              <span className={styles.mediumBar} />
              <span className={styles.tallBar} />
            </div>
          </article>

          <article
            className={`${styles.statCard} ${styles.engagementCard} ${visibleClass}`}
            style={{ "--delay": "170ms" }}
          >
            <Image
              src="/increase.png"
              alt=""
              width={40}
              height={40}
              className={styles.statIcon}
              aria-hidden="true"
            />
            <strong className={styles.heroValue}>XOF</strong>
            <h3>Paiement local</h3>
            <p>
              Mobile Money (MTN, Moov, Celtiis) et carte bancaire via FedaPay.
            </p>
          </article>

          <article
            className={`${styles.statCard} ${styles.supportCard} ${visibleClass}`}
            style={{ "--delay": "260ms" }}
          >
            <Image
              src="/people.png"
              alt=""
              width={40}
              height={40}
              className={styles.statIcon}
              aria-hidden="true"
            />
            <strong className={styles.supportValue}>Live</strong>
            <h3>Messagerie</h3>
            <p>Un chat en temps réel par événement avec les participants.</p>
          </article>

          <article
            className={`${styles.statCard} ${styles.supportCard} ${visibleClass}`}
            style={{ "--delay": "350ms" }}
          >
            <Image
              src="/target.png"
              alt=""
              width={40}
              height={40}
              className={styles.statIcon}
              aria-hidden="true"
            />
            <strong className={styles.supportValue}>J-2</strong>
            <h3>Rappels</h3>
            <p>Notifications et rappels automatiques avant l&apos;événement.</p>
          </article>

          <div className={styles.compactStack}>
            <article
              className={`${styles.statCard} ${styles.compactCard} ${visibleClass}`}
              style={{ "--delay": "440ms" }}
            >
              <Image
                src="/thunder.png"
                alt=""
                width={30}
                height={30}
                className={styles.statIcon}
                aria-hidden="true"
              />
              <div>
                <strong>PWA</strong>
                <p>Installable sur mobile</p>
              </div>
            </article>

            <article
              className={`${styles.statCard} ${styles.compactCard} ${visibleClass}`}
              style={{ "--delay": "530ms" }}
            >
              <Image
                src="/lock.png"
                alt=""
                width={30}
                height={30}
                className={styles.statIcon}
                aria-hidden="true"
              />
              <div>
                <strong>HTTPS</strong>
                <p>Connexions chiffrées</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
