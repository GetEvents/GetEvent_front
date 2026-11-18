import {
  BarChart3,
  BellRing,
  CalendarCheck2,
  MessageCircle,
  Search,
} from "lucide-react";
import styles from "./Features.module.scss";

// Chaque fonctionnalité occupe une case de la grille « bento ».
// tone : dark (bloc anthracite), poster (dégradé cyan), light (carte claire).
// size : wide (2 colonnes), full (toute la largeur). Ordre pensé pour une
// grille de 3 colonnes sans trou : 2+1 / 1+2 / 3.
const FEATURES = [
  {
    id: "creation",
    icon: CalendarCheck2,
    title: "Création d'événements",
    text: "Créez, planifiez et gérez vos événements : date, lieu, capacité, tarif et suivi des participants.",
    tags: ["Planification", "Billetterie", "Suivi en temps réel"],
    tone: "dark",
    size: "wide",
  },
  {
    id: "notifications",
    icon: BellRing,
    title: "Notifications",
    text: "Notifications push, emails automatiques et rappel deux jours avant l'événement.",
    tags: ["Push", "Emails", "Rappels"],
    tone: "poster",
  },
  {
    id: "messagerie",
    icon: MessageCircle,
    title: "Messagerie",
    text: "Un chat en temps réel par événement, entre l'organisateur et les participants.",
    tags: ["Instantané", "Par événement"],
    tone: "light",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Tableau de bord",
    text: "Suivez vos inscriptions, vos ventes et l'activité de vos événements depuis votre espace organisateur.",
    tags: ["Inscriptions", "Ventes", "Solde"],
    tone: "dark",
    size: "wide",
    chart: true,
  },
  {
    id: "recherche",
    icon: Search,
    title: "Recherche",
    text: "Trouvez un événement par mot-clé, ville ou catégorie, et triez par date ou par prix.",
    tags: ["Mot-clé", "Ville", "Catégorie"],
    tone: "light",
    size: "full",
  },
];

export default function FeaturesSection() {
  return (
    <div className={styles.featuresSection}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Fonctionnalités</p>
          <h2 className={styles.title}>
            Tout en un.
            <br />
            <span className={styles.titleOutline}>Rien en trop.</span>
          </h2>
        </div>
        <p className={styles.subtitle}>
          Tout ce dont vous avez besoin pour organiser vos événements, au même
          endroit.
        </p>
      </header>

      <div className={styles.grid}>
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.id}
              className={[
                styles.card,
                styles[feature.tone],
                feature.size ? styles[feature.size] : "",
              ].join(" ")}
              style={{ "--i": index }}
            >
              <div className={styles.cardTop}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={22} />
                </span>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.text}</p>
                <ul className={styles.tags} aria-label="Points clés">
                  {feature.tags.map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>

              {feature.chart && (
                <div className={styles.chart} aria-hidden="true">
                  {[38, 62, 48, 80, 66, 95].map((height, barIndex) => (
                    <span
                      key={barIndex}
                      className={styles.bar}
                      style={{ "--h": `${height}%` }}
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
