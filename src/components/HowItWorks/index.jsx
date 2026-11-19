"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  CreditCard,
  MessageCircle,
  QrCode,
  Search,
  Ticket,
  UserPlus,
  Wallet,
} from "lucide-react";
import styles from "./HowItWorks.module.scss";

// Catégories réellement proposées sur GetEvent, pour le bandeau défilant.
const TICKER = [
  "Concerts",
  "Conférences",
  "Formations",
  "Spectacles",
  "Networking",
  "Ateliers",
  "Expositions",
  "Cérémonies",
];

// Étapes décrites d'après les parcours réellement disponibles dans l'application.
const journeys = [
  {
    id: "organisateur",
    tab: "J'organise",
    lead: "Lancez votre billetterie. On s'occupe du reste.",
    cta: { href: "/events/createvent", text: "Créer mon événement" },
    steps: [
      {
        icon: UserPlus,
        title: "Créez votre compte",
        text: "Par email ou en un clic avec Google.",
        tags: ["Gratuit", "Google"],
      },
      {
        icon: CalendarPlus,
        title: "Publiez l'événement",
        text: "Date, lieu, capacité et tarif : gratuit ou payant en XOF.",
        tags: ["Billetterie", "XOF"],
      },
      {
        icon: QrCode,
        title: "Scannez à l'entrée",
        text: "Suivez les inscrits et validez chaque QR code depuis votre téléphone.",
        tags: ["QR code", "Contrôle"],
      },
      {
        icon: Wallet,
        title: "Encaissez vos ventes",
        text: "Votre solde est versé via FedaPay, en Mobile Money.",
        tags: ["FedaPay", "Mobile Money"],
      },
    ],
  },
  {
    id: "participant",
    tab: "Je participe",
    lead: "Trouvez. Réservez. Entrez. Sans file d'attente.",
    cta: { href: "/events", text: "Voir les événements" },
    steps: [
      {
        icon: Search,
        title: "Trouvez un événement",
        text: "Par mot-clé, ville ou catégorie.",
        tags: ["Recherche", "Filtres"],
      },
      {
        icon: CreditCard,
        title: "Réservez vos places",
        text: "Gratuit, ou paiement MTN, Moov, Celtiis ou carte bancaire.",
        tags: ["Mobile Money", "Carte"],
      },
      {
        icon: Ticket,
        title: "Recevez vos billets",
        text: "Un QR code unique par place, dans votre espace et par email.",
        tags: ["QR code", "Email"],
      },
      {
        icon: MessageCircle,
        title: "Vivez l'événement",
        text: "Discutez avec les participants, rappel automatique deux jours avant.",
        tags: ["Chat", "Rappel J-2"],
      },
    ],
  },
];

export default function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef([]);
  const active = journeys[activeIndex];

  // Navigation clavier des onglets (flèches gauche/droite), motif ARIA « tabs ».
  const handleKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + delta + journeys.length) % journeys.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.kicker}>Comment ça marche ?</p>
          <h2 className={styles.title}>
            De l&apos;idée
            <br />à l&apos;entrée.
            <br />
            <span className={styles.titleOutline}>En 4 étapes.</span>
          </h2>

          <div className={styles.headerRow}>
            <p className={styles.lead}>{active.lead}</p>

            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Choisir un parcours"
            >
              {journeys.map((journey, index) => (
                <button
                  key={journey.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`how-tab-${journey.id}`}
                  aria-selected={index === activeIndex}
                  aria-controls={`how-panel-${journey.id}`}
                  tabIndex={index === activeIndex ? 0 : -1}
                  className={`${styles.tab} ${
                    index === activeIndex ? styles.tabActive : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={handleKeyDown}
                >
                  {journey.tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {[...TICKER, ...TICKER].map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={
                  index % 2 ? styles.tickerOutline : styles.tickerSolid
                }
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div
          key={active.id}
          role="tabpanel"
          id={`how-panel-${active.id}`}
          aria-labelledby={`how-tab-${active.id}`}
          className={styles.body}
        >
          <ol className={styles.grid}>
            {active.steps.map((step, index) => {
              const Icon = step.icon;
              const number = String(index + 1).padStart(2, "0");
              return (
                <li
                  key={step.title}
                  className={styles.card}
                  data-tone={index}
                  style={{ "--i": index }}
                >
                  <div className={styles.poster} aria-hidden="true">
                    <span className={styles.posterNumber}>{number}</span>
                    <span className={styles.posterIcon}>
                      <Icon size={30} strokeWidth={2.2} />
                    </span>
                  </div>
                  <div className={styles.info}>
                    <p className={styles.stepLabel}>Étape {number}</p>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepText}>{step.text}</p>
                    <ul className={styles.tags} aria-label="Mots-clés">
                      {step.tags.map((tag) => (
                        <li key={tag} className={styles.tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className={styles.footer}>
            <Link href={active.cta.href} className={styles.cta}>
              {active.cta.text}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className={styles.switchLink}
              onClick={() =>
                setActiveIndex((activeIndex + 1) % journeys.length)
              }
            >
              Voir le parcours «&nbsp;
              {journeys[(activeIndex + 1) % journeys.length].tab}&nbsp;»
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
