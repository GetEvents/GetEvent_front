import Image from "next/image";
import Link from "next/link";
import { MessageCircle, QrCode, Smartphone } from "lucide-react";
import styles from "./layout.module.scss";

// Catégories réelles de GetEvent, pour le bandeau défilant.
const TICKER = [
  "Concerts",
  "Conférences",
  "Formations",
  "Spectacles",
  "Networking",
  "Ateliers",
];

const PERKS = [
  { icon: QrCode, text: "Un billet QR code par place" },
  { icon: Smartphone, text: "Paiement Mobile Money et carte" },
  { icon: MessageCircle, text: "Messagerie en temps réel" },
];

// Mise en page commune aux pages /auth : bloc affiche sombre à gauche
// (bandeau compact en haut sur mobile), formulaire à droite.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.poster}>
        <Link href="/" className={styles.logo} aria-label="Accueil GetEvent">
          <Image
            src="/LogoI.png"
            alt="GetEvent"
            width={200}
            height={113}
            priority
          />
        </Link>

        <div className={styles.posterBody}>
          <p className={styles.kicker}>Billetterie &amp; événements</p>
          <p className={styles.title}>
            Votre prochaine sortie
            <span className={styles.titleOutline}> commence ici.</span>
          </p>

          <ul className={styles.perks}>
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className={styles.perkIcon} aria-hidden="true">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

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
      </aside>

      <main className={styles.formSide}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
