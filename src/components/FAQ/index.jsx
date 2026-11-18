"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import styles from "./FAQ.module.scss";

const CATEGORIES = ["Tout", "Général", "Événements", "Support"];

// Contenu inchangé (réponses vérifiées lors de la refonte).
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
  const [category, setCategory] = useState("Tout");

  const visibleItems =
    category === "Tout"
      ? faqItems
      : faqItems.filter((item) => item.category === category);

  const toggleItem = (id) => setOpenItem(openItem === id ? null : id);

  return (
    <div className={styles.faqSection}>
      <div className={styles.layout}>
        <header className={styles.header}>
          <p className={styles.kicker}>Questions fréquentes</p>
          <h2 className={styles.title}>
            Des
            <br />
            <span className={styles.titleOutline}>questions ?</span>
          </h2>
          <p className={styles.caption}>
            Les réponses aux questions les plus fréquentes. Notre équipe est
            aussi là pour vous aider.
          </p>

          <div
            className={styles.filters}
            role="group"
            aria-label="Filtrer les questions"
          >
            {CATEGORIES.map((name) => (
              <button
                key={name}
                type="button"
                className={`${styles.filter} ${
                  category === name ? styles.filterActive : ""
                }`}
                aria-pressed={category === name}
                onClick={() => {
                  setCategory(name);
                  setOpenItem(null);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </header>

        <ul className={styles.list}>
          {visibleItems.map((item, index) => {
            const isOpen = openItem === item.id;
            const answerId = `faq-answer-${item.id}`;
            return (
              <li
                key={item.id}
                className={`${styles.item} ${isOpen ? styles.open : ""}`}
              >
                <h3 className={styles.questionHeading}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className={styles.number} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.questionText}>
                      <span className={styles.itemCategory}>
                        {item.category}
                      </span>
                      {item.question}
                    </span>
                    <span className={styles.toggle} aria-hidden="true">
                      <Plus size={18} />
                    </span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  className={styles.answerWrapper}
                  hidden={!isOpen}
                >
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
