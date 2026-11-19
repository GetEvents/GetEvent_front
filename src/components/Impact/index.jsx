import styles from "./Impact.module.scss";

// Atouts réels de la plateforme (vérifiés dans le code), présentés comme un
// tableau d'affichage : une grande valeur, un titre, une explication.
const STRENGTHS = [
  {
    value: "QR",
    title: "Billets numériques",
    text: "Chaque place réservée génère un billet avec un QR code unique, validé à l'entrée par l'organisateur.",
  },
  {
    value: "XOF",
    title: "Paiement local",
    text: "Mobile Money (MTN, Moov, Celtiis) et carte bancaire via FedaPay.",
  },
  {
    value: "Live",
    title: "Messagerie",
    text: "Un chat en temps réel par événement avec les participants.",
  },
  {
    value: "J-2",
    title: "Rappels",
    text: "Notifications et rappel automatique deux jours avant l'événement.",
  },
  {
    value: "PWA",
    title: "Installable",
    text: "GetEvent s'installe sur l'écran d'accueil du téléphone, comme une application.",
  },
  {
    value: "HTTPS",
    title: "Sécurisé",
    text: "Connexions chiffrées, comptes protégés et accès contrôlés sur chaque action sensible.",
  },
];

export default function ImpactSection() {
  return (
    <div className={styles.impactSection}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.kicker}>Pourquoi GetEvent ?</p>
          <h2 className={styles.title}>
            Pensé pour
            <br />
            <span className={styles.titleOutline}>le terrain.</span>
          </h2>
          <p className={styles.subtitle}>
            Ce que la plateforme fait concrètement pour vos événements, de la
            réservation jusqu&apos;à l&apos;entrée.
          </p>
        </header>

        <dl className={styles.board}>
          {STRENGTHS.map((item) => (
            <div key={item.value} className={styles.row}>
              <dt className={styles.value}>{item.value}</dt>
              <dd className={styles.detail}>
                <span className={styles.rowTitle}>{item.title}</span>
                <span className={styles.rowText}>{item.text}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
