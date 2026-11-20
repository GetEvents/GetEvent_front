"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./EventTypes.module.scss";

const eventTypes = [
  { img: "/icons/schedule.webp", name: "Réunions" },
  { img: "/icons/graduation-hat.webp", name: "Formations" },
  { img: "/icons/karaoke.webp", name: "Conférences" },
  { img: "/icons/people.webp", name: "Séminaires" },
  { img: "/icons/neural.webp", name: "Networking" },
  { img: "/icons/trophy.webp", name: "Cérémonies" },
  { img: "/icons/palette.webp", name: "Expositions" },
  { img: "/icons/musical-note.webp", name: "Concerts" },
  { img: "/icons/theatre.webp", name: "Spectacles" },
  { img: "/icons/settings.webp", name: "Ateliers" },
];

// Type affiché au centre à l'arrivée (milieu de la liste).
const INITIAL_INDEX = Math.floor(eventTypes.length / 2);

// Section « Types d'événements » — liste défilante façon « roue » :
// le type placé au centre de la zone est allumé, les autres sont estompés.
export default function EventTypesSection() {
  const wheelRef = useRef(null);
  const itemRefs = useRef([]);
  const frameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(INITIAL_INDEX);

  // Fait défiler la zone (et elle seule, pas la page) pour centrer un type.
  const centerItem = useCallback((index, behavior = "smooth") => {
    const wheel = wheelRef.current;
    const item = itemRefs.current[index];
    if (!wheel || !item) return;
    wheel.scrollTo({
      top: item.offsetTop - (wheel.clientHeight - item.offsetHeight) / 2,
      behavior,
    });
  }, []);

  // Le type actif est celui dont le centre est le plus proche du centre de
  // la zone visible.
  const updateActive = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      const middle = wheel.scrollTop + wheel.clientHeight / 2;
      let closest = 0;
      let closestDistance = Infinity;
      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const distance = Math.abs(
          item.offsetTop + item.offsetHeight / 2 - middle,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });
      setActiveIndex(closest);
    });
  }, []);

  // Centrage initial quand la liste apparaît à l'écran. On n'utilise pas le
  // montage : la page est d'abord montée masquée (écran de chargement), puis
  // Next.js déplace ses éléments, ce qui remet leur défilement à zéro.
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || wheel.clientHeight === 0) return;
      // Seulement si l'utilisateur n'a pas encore fait défiler la liste.
      if (wheel.scrollTop === 0) centerItem(INITIAL_INDEX, "auto");
      observer.disconnect();
    });
    observer.observe(wheel);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [centerItem]);

  const handleKeyDown = (event) => {
    const keys = {
      ArrowDown: 1,
      ArrowUp: -1,
      Home: -activeIndex,
      End: eventTypes.length - 1 - activeIndex,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = Math.min(
      eventTypes.length - 1,
      Math.max(0, activeIndex + keys[event.key]),
    );
    centerItem(next);
  };

  return (
    <div className={styles.eventTypesSection}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Types d&apos;événements</p>
          <h2 className={styles.title}>
            Tous les formats.
            <br />
            <span className={styles.titleOutline}>Une billetterie.</span>
          </h2>
        </div>
        <div className={styles.aside}>
          <span className={styles.count}>{eventTypes.length} catégories</span>
          <p className={styles.subtitle}>
            De la réunion d&apos;équipe au concert, GetEvent gère
            l&apos;inscription, le paiement et le contrôle à l&apos;entrée.
          </p>
        </div>
      </header>

      <div className={styles.stage}>
        {/* Repères du centre (lignes cyan) */}
        <span className={styles.centerGuide} aria-hidden="true" />

        <ul
          ref={wheelRef}
          className={styles.wheel}
          onScroll={updateActive}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Types d'événements (flèches haut et bas pour parcourir)"
        >
          {eventTypes.map((event, index) => {
            const isActive = index === activeIndex;
            return (
              <li
                key={event.name}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className={`${styles.item} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => centerItem(index)}
              >
                <span className={styles.icon} aria-hidden="true">
                  <Image
                    src={event.img}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                  />
                </span>
                <span className={styles.name}>{event.name}</span>
              </li>
            );
          })}
        </ul>

        <p className={styles.counter} aria-hidden="true">
          <span className={styles.counterCurrent}>
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className={styles.counterTotal}>
            / {String(eventTypes.length).padStart(2, "0")}
          </span>
        </p>
      </div>
    </div>
  );
}
