"use client";
import { React, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./EventTypes.module.scss";

export default function EventTypesSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const eventTypes = [
    { img: "/schedule.png", name: "Réunions" },
    { img: "/graduation-hat.png", name: "Formations" },
    { img: "/karaoke.png", name: "Conférences" },
    { img: "/people.png", name: "Séminaires" },
    { img: "/neural.png", name: "Networking" },
    { img: "/trophy.png", name: "Cérémonies" },
    { img: "/palette.png", name: "Expositions" },
    { img: "/musical-note.png", name: "Concerts" },
    { img: "/theatre.png", name: "Spectacles" },
    { img: "/settings.png", name: "Ateliers" },
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
    <section ref={sectionRef} className={styles.eventTypesSection}>
      <div
        className={`${styles.header} ${isVisible ? styles.headerVisible : ""}`}
      >
        <h2 className={styles.title}>Types d&apos;événements supportés</h2>
        <p className={styles.subtitle}>
          Plus de 10 catégories d&apos;événements pour couvrir tous vos besoins
        </p>
      </div>

      <div className={styles.grid}>
        {eventTypes.map((event, index) => (
          <div
            key={index}
            className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
            style={{ "--delay": `${index * 90}ms` }}
          >
            <span className={styles.iconWrap}>
              <Image
                src={event.img}
                alt={event.name}
                width={46}
                height={46}
                priority={index < 3}
                quality={90}
              />
            </span>
            <span className={styles.label}>{event.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
