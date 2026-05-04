"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./FAQ.module.scss";

const faqCategories = [
  {
    id: 1,
    name: "Général",
    icon: "❓",
  },
  {
    id: 2,
    name: "Événements",
    icon: "📅",
  },
  {
    id: 4,
    name: "Support",
    icon: "🛠️",
  },
];

const faqItems = [
  {
    id: 1,
    question: "Comment fonctionne GetEvent ?",
    answer:
      "GetEvent vous permet de créer et gérer des événements, suivre les participations, communiquer via la messagerie en temps réel et recevoir des notifications. L'application centralise les actions principales autour des événements et des échanges entre utilisateurs.",
    category: "Général",
  },
  {
    id: 3,
    question: "Comment fonctionne la messagerie temps réel ?",
    answer:
      "La messagerie GetEvent repose sur WebSocket (Socket.IO) pour l'envoi et la réception instantanés des messages liés aux événements. Vous pouvez envoyer, modifier et supprimer des messages, et voir l'activité des participants en temps réel.",
    category: "Événements",
  },
  {
    id: 4,
    question: "Puis-je inviter des participants externes à mes événements ?",
    answer:
      "Les participants peuvent rejoindre les événements via les parcours de participation prévus dans l'application. L'organisateur garde la main sur la gestion des inscriptions et des participants depuis l'espace événement.",
    category: "Événements",
  },
  {
    id: 5,
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Oui. L'application utilise une authentification sécurisée et des contrôles d'accès sur les API. Les actions sensibles (création, modifications, accès utilisateur) sont protégées et seules les opérations autorisées sont acceptées.",
    category: "Général",
  },
  {
    id: 6,
    question: "Quel type de support proposez-vous ?",
    answer:
      "Si vous avez un problème, vous pouvez contacter l'équipe support via les canaux de contact disponibles sur la plateforme. Nous vous accompagnons pour les problèmes de connexion, d'événements, de participation et de messagerie.",
    category: "Support",
  },
  {
    id: 8,
    question: "Y a-t-il des limites sur le nombre d'événements ?",
    answer:
      "Non, vous pouvez créer autant d'événements que vous le souhaitez. Il n'y a pas de limite sur le nombre d'événements, de participants ou de conversations.",
    category: "Événements",
  },
  {
    id: 9,
    question: "Comment puis-je analyser les performances de mes événements ?",
    answer:
      "Vous pouvez déjà suivre des indicateurs pratiques depuis l'application, comme les participations et l'activité liée aux événements. Les tableaux de bord analytiques avancés peuvent être ajoutés progressivement selon les besoins.",
    category: "Événements",
  },
];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sectionNode);
    return () => observer.disconnect();
  }, []);

  function toggleItem(id) {
    setOpenItem(openItem === id ? null : id);
  }

  return (
    <section ref={sectionRef} className={styles.faqSection} id="faq">
      <div className={styles.maxContainer}>
        {/* Header */}
        <div
          className={`${styles.header} ${isVisible ? styles.headerVisible : ""}`}
        >
          <span className={styles.subtitle}>Questions fréquentes</span>
          <h2 className={styles.title}>
            Vous avez des <span>questions</span> ?
          </h2>
          <p className={styles.caption}>
            Trouvez rapidement les réponses à vos questions les plus fréquentes.
            Notre équipe est également là pour vous aider.
          </p>
        </div>

        {/* Categories */}
        <div className={styles.categories}>
          {faqCategories.map((category) => (
            <div key={category.id} className={styles.categoryBadge}>
              <span>{category.icon}</span>
              {category.name}
            </div>
          ))}
        </div>

        {/* FAQ Items */}
        <div className={styles.faqList}>
          {faqItems.map((item, index) => {
            const isOpen = openItem === item.id;
            return (
              <div
                key={item.id}
                className={`${styles.faqItem} ${isOpen ? styles.open : ""} ${isVisible ? styles.headerVisible : ""}`}
                style={{ "--delay": `${index * 80}ms` }}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className={styles.questionButton}
                  aria-expanded={isOpen}
                >
                  <div className={styles.questionContent}>
                    <span className={styles.itemCategory}>{item.category}</span>
                    <h3 className={styles.questionText}>{item.question}</h3>
                  </div>

                  <div
                    className={`${styles.iconToggle} ${isOpen ? styles.rotated : ""}`}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                <div
                  className={`${styles.answerWrapper} ${isOpen ? styles.expanded : ""}`}
                >
                  <div className={styles.answerContent}>
                    <div className={styles.answerInner}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
