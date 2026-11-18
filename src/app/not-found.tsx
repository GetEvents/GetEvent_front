import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.scss";

export const metadata: Metadata = {
  title: "Page introuvable - GetEvent",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="not-found-title">
        <p className={styles.code}>404</p>
        <h1 id="not-found-title" className={styles.title}>
          Page introuvable
        </h1>
        <p className={styles.text}>
          Cette page n&apos;existe pas ou a été déplacée. L&apos;événement que
          vous cherchez a peut-être été supprimé par son organisateur.
        </p>
        <div className={styles.actions}>
          <Link href="/events" className={styles.primary}>
            Voir les événements
          </Link>
          <Link href="/" className={styles.secondary}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
