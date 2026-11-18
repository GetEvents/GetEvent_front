import Image from "next/image";
import styles from "./EventTypes.module.scss";

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

// Section « Types d'événements » — design affiche : grands mots en
// majuscules, alternant plein et contour, comme une affiche de programmation.
export default function EventTypesSection() {
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

      <ul className={styles.list}>
        {eventTypes.map((event, index) => (
          <li
            key={event.name}
            className={`${styles.item} ${index % 2 ? styles.itemOutline : ""}`}
            style={{ "--i": index }}
          >
            <span className={styles.icon} aria-hidden="true">
              <Image src={event.img} alt="" width={40} height={40} />
            </span>
            <span className={styles.name}>{event.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
