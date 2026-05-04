"use client";
import { useEffect, useRef, useState, React } from "react";
import Image from "next/image";
import styles from "./Impact.module.scss";

export default function ImpactSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    {
      img: "/stopwatch.png",
      value: "75%",
      label: "Temps économisé",
      sublabel: "de réduction du temps d'organisation",
    },
    {
      img: "/people.png",
      value: "3x",
      label: "Collaboration",
      sublabel: "plus d'efficacité en équipe",
    },
    {
      img: "/increase.png",
      value: "90%",
      label: "Engagement",
      sublabel: "de taux de participation",
    },
    {
      img: "/target.png",
      value: "95%",
      label: "Précision",
      sublabel: "d'événements réussis",
    },
    {
      img: "/thunder.png",
      value: "5min",
      label: "Rapidité",
      sublabel: "pour créer un événement",
    },
    {
      img: "/lock.png",
      value: "100%",
      label: "Sécurité",
      sublabel: "de données protégées",
    },
  ];

  useEffect(() => {
    const sectionNode = sectionRef.current;

    if (!sectionNode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(sectionNode);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.impactSection}>
      <div
        className={`${styles.header} ${isVisible ? styles.headerVisible : ""}`}
      >
        <h2 className={styles.title}>Impact & Résultats</h2>
        <p className={styles.subtitle}>
          Des résultats qui parlent d&apos;eux-mêmes
        </p>
        <p className={styles.caption}>
          Découvrez comment GetEvent transforme la gestion d&apos;événements.
        </p>
      </div>

      <div className={styles.grid}>
        {stats.map((stat, index) => (
          <article
            key={index}
            className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
            style={{ "--delay": `${index * 100}ms` }}
          >
            <div className={styles.iconWrap}>
              <Image
                src={stat.img}
                alt={stat.label}
                width={46}
                height={46}
                priority={index < 3}
                quality={90}
              />
            </div>
            <p className={styles.value}>{stat.value}</p>
            <p className={styles.label}>{stat.label}</p>
            <p className={styles.sublabel}>{stat.sublabel}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
