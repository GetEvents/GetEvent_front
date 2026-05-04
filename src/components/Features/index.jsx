"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Features.module.scss";

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      img: "/schedule.png",
      title: "Création d'Événements",
      description:
        "Créez, planifiez et gérez vos événements avec des outils puissants. Suivi en temps réel, invitations automatiques et gestion des participants.",
      features: [
        "Planification avancée",
        "Invitations automatiques",
        "Suivi en temps réel",
      ],
      number: "1/6",
    },
    {
      img: "/people.png",
      title: "Création d'Organisations",
      description:
        "Créez vos organisations avec des rôles personnalisés. Gérez les permissions, invitez des membres et structurez vos projets.",
      features: [
        "Rôles personnalisés",
        "Gestion des permissions",
        "Invitations d'équipe",
      ],
      number: "2/6",
    },
    {
      img: "/chat-bubble.png",
      title: "Messagerie Temps Réel",
      description:
        "Communiquez instantanément avec votre équipe. Conversations privées et de groupe avec notifications en temps réel.",
      features: [
        "Messages instantanés",
        "Conversations de groupe",
        "Notifications temps réel",
      ],
      number: "3/6",
    },
    {
      img: "/bell.png",
      title: "Système de Notifications",
      description:
        "Restez informé en temps réel. Notifications push, emails automatiques et alertes personnalisées pour tous vos événements.",
      features: [
        "Notifications push",
        "Emails automatiques",
        "Alertes personnalisées",
      ],
      number: "4/6",
    },
    {
      img: "/loupe.png",
      title: "Recherche Intelligente",
      description:
        "Trouvez instantanément ce que vous cherchez. Recherche globale, filtrage avancé et suggestions intelligentes.",
      features: [
        "Recherche globale",
        "Filtrage avancé",
        "Suggestions intelligentes",
      ],
      number: "5/6",
    },
    {
      img: "/increase.png",
      title: "Analytics & Tableau de Bord",
      description:
        "Analysez vos performances avec des métriques détaillées. Tableaux de bord personnalisables et rapports en temps réel.",
      features: [
        "Métriques détaillées",
        "Tableaux de bord",
        "Rapports temps réel",
      ],
      number: "6/6",
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
    <section ref={sectionRef} className={styles.featuresSection}>
      <div
        className={`${styles.header} ${isVisible ? styles.headerVisible : ""}`}
      >
        <h2 className={styles.title}>Fonctionnalités</h2>
        <p className={styles.subtitle}>
          Tout ce dont vous avez besoin pour organiser efficacement
        </p>
        <p className={styles.caption}>
          Une plateforme complète qui regroupe tous les outils nécessaires pour
          gérer vos événements, collaborer avec vos équipes et communiquer en
          temps réel.
        </p>
      </div>

      <div className={styles.list}>
        {features.map((feature, index) => (
          <article
            key={index}
            className={`${styles.card} ${isVisible ? styles.cardVisible : ""}`}
            style={{ "--delay": `${index * 120}ms` }}
          >
            <div className={styles.cardContent}>
              <div className={styles.iconShell}>
                <div className={styles.iconWrap}>
                  <Image
                    src={feature.img}
                    alt={feature.title}
                    width={46}
                    height={46}
                    priority={index < 3}
                    quality={90}
                  />
                </div>
              </div>

              <div className={styles.body}>
                <div className={styles.headingRow}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <span className={styles.number}>{feature.number}</span>
                </div>
                <p className={styles.description}>{feature.description}</p>
                <div className={styles.badges}>
                  {feature.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className={`${styles.badge} ${isVisible ? styles.badgeVisible : ""}`}
                      style={{ "--badge-delay": `${index * 120 + idx * 80}ms` }}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
