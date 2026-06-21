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
          <h2>Impact &amp; Résultats</h2>
          <p>
            Des résultats qui parlent d&apos;eux-mêmes, transformant la manière
            dont vous gérez l&apos;événementiel.
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
              <strong className={styles.heroValue}>75%</strong>
              <h3>Temps économisé</h3>
              <p>
                de réduction du temps d&apos;organisation grâce à nos outils
                automatisés.
              </p>
            </div>

            <div
              className={styles.miniChart}
              role="img"
              aria-label="Progression du temps économisé"
            >
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
            <strong className={styles.heroValue}>90%</strong>
            <h3>Engagement</h3>
            <p>de taux de participation active sur la plateforme.</p>
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
            <strong className={styles.supportValue}>3x</strong>
            <h3>Collaboration</h3>
            <p>plus d&apos;efficacité en équipe</p>
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
            <strong className={styles.supportValue}>95%</strong>
            <h3>Précision</h3>
            <p>d&apos;événements réussis sans erreur</p>
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
                <strong>5min</strong>
                <p>Rapidité de création</p>
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
                <strong>100%</strong>
                <p>Sécurité des données</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
